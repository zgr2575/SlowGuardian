// Probes public asset hosts for catalog entries whose links died, and writes the ones
// that answer with a real page to .superpowers/replacements.json.
//   node scripts/find-replacements.js            every dead/local game in the audit
//   node scripts/find-replacements.js slug slug  just these
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const TEMPLATES = [
  (s) =>
    `https://glcdn.githack.com/3kh0/3kh0-assets/-/raw/main/${s}/index.html`,
  (s) => `https://cdn.jsdelivr.net/gh/3kh0/3kh0-assets@main/${s}/index.html`,
  (s) => `https://3kh0.github.io/projects/${s}/index.html`,
  (s) => `https://html-classic.itch.zone/html/${s}/index.html`,
];

// Slug spellings the asset trees use.
const variants = (slug) => [
  ...new Set([
    slug,
    slug.replace(/-/g, ""),
    slug.replace(/-/g, "_"),
    slug.replace(/^the-/, ""),
  ]),
];

async function alive(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const body = (await res.text()).slice(0, 4000);
    if (
      body.length < 300 ||
      /not found|page you were looking|404 error/i.test(body)
    )
      return null;
    return res.url || url;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

let slugs = process.argv.slice(2);
if (!slugs.length) {
  const audit = JSON.parse(
    await readFile(
      new URL("../.superpowers/catalog-audit.json", import.meta.url),
      "utf8",
    ),
  );
  slugs = audit
    .filter(
      (r) => r.kind === "games" && (r.state === "dead" || r.state === "local"),
    )
    .map((r) => r.id);
}

const found = {};
let done = 0;

async function probe(slug) {
  for (const variant of variants(slug)) {
    for (const template of TEMPLATES) {
      const url = await alive(template(variant));
      if (url) {
        found[slug] = url;
        return;
      }
    }
  }
}

const queue = [...slugs];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const slug = queue.shift();
      await probe(slug);
      process.stdout.write(++done % 10 === 0 ? `${done}` : ".");
    }
  }),
);

console.log(
  `\n\nfound replacements for ${Object.keys(found).length} of ${slugs.length}:`,
);
for (const [slug, url] of Object.entries(found))
  console.log(`  ${slug} → ${url}`);

await writeFile(
  fileURLToPath(new URL("../.superpowers/replacements.json", import.meta.url)),
  JSON.stringify(found, null, 2),
);
