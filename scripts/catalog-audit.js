// Checks every catalog entry: does its icon exist, and does its link still answer?
//   node scripts/catalog-audit.js            check everything
//   node scripts/catalog-audit.js games      just the games
// Writes the full result to .superpowers/catalog-audit.json (gitignored).
import { readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const only = process.argv[2];
const CONCURRENCY = 12;
const TIMEOUT = 12_000;

const load = async (name) =>
  JSON.parse(
    await readFile(
      new URL(`../src/data/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const iconPath = (icon) =>
  fileURLToPath(new URL(`../public${icon}`, import.meta.url));

async function iconExists(icon) {
  if (!icon) return false;
  try {
    await access(iconPath(icon));
    return true;
  } catch {
    return false;
  }
}

async function checkUrl(url) {
  if (!url.startsWith("http"))
    return { state: "local", detail: "not hosted in this repo" };

  for (const method of ["HEAD", "GET"]) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SlowGuardian catalog audit)",
        },
      });
      clearTimeout(timer);
      if (res.status === 405 && method === "HEAD") continue;
      if (res.ok) return { state: "ok", detail: `${res.status}` };
      return {
        state: res.status === 403 || res.status === 429 ? "blocked" : "dead",
        detail: `${res.status}`,
      };
    } catch (error) {
      clearTimeout(timer);
      if (method === "GET")
        return {
          state: "dead",
          detail: error.name === "AbortError" ? "timeout" : error.message,
        };
    }
  }
  return { state: "dead", detail: "no response" };
}

async function audit(kind) {
  const entries = await load(kind);
  const results = [];
  let index = 0;

  async function worker() {
    while (index < entries.length) {
      const entry = entries[index++];
      const [link, icon] = await Promise.all([
        checkUrl(entry.url),
        iconExists(entry.icon),
      ]);
      results.push({
        kind,
        id: entry.id,
        name: entry.name,
        url: entry.url,
        ...link,
        icon,
      });
      process.stdout.write(".");
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");
  return results;
}

const results = [];
for (const kind of ["games", "apps"]) {
  if (only && only !== kind) continue;
  results.push(...(await audit(kind)));
}

const by = (state) => results.filter((r) => r.state === state);
console.log(
  `\n${results.length} entries — ok ${by("ok").length}, dead ${by("dead").length}, blocked ${by("blocked").length}, local ${by("local").length}, missing icons ${results.filter((r) => !r.icon).length}`,
);

for (const r of [...by("dead"), ...by("local")])
  console.log(
    `  ${r.state.toUpperCase()} ${r.kind}/${r.id} — ${r.detail} — ${r.url}`,
  );
for (const r of results.filter((r) => !r.icon))
  console.log(`  NO ICON ${r.kind}/${r.id}`);

await writeFile(
  fileURLToPath(new URL("../.superpowers/catalog-audit.json", import.meta.url)),
  JSON.stringify(results, null, 2),
);
console.log("\nfull report: .superpowers/catalog-audit.json");
