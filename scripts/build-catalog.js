// Converts v8's catalog (scripts/legacy/*.json) into src/data/*.json.
// Run after changing the legacy files, the overrides or the normalizer:
//   node scripts/build-catalog.js
//
// legacy g.json / a.json  →  normalize  →  apply overrides.json  →  add additions.json
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalize } from "./catalog/normalize.js";

const read = async (name) =>
  JSON.parse(
    await readFile(new URL(`./legacy/${name}`, import.meta.url), "utf8"),
  );
const out = (name) =>
  fileURLToPath(new URL(`../src/data/${name}`, import.meta.url));

// What the link audit found: a replacement URL for entries whose host died but that
// still exist elsewhere, and null for entries that are simply gone.
const overrides = await read("overrides.json");
const additions = await read("additions.json");

function build(raw, kind) {
  const plural = kind === "game" ? "games" : "apps";
  const byId = new Map();
  const dropped = [];

  for (const item of raw) {
    const entry = normalize(item, kind);
    if (!entry) {
      dropped.push({ name: item.name, why: "no link" });
      continue;
    }
    if (byId.has(entry.id)) {
      dropped.push({ name: item.name, why: "duplicate id" });
      continue;
    }

    const key = `${plural}/${entry.id}`;
    const override = Object.prototype.hasOwnProperty.call(overrides, key)
      ? overrides[key]
      : undefined;
    if (override === null) {
      dropped.push({ name: item.name, why: "link is dead" });
      continue;
    }
    if (override?.url) {
      entry.url = override.url;
      delete entry.local;
    }
    if (override?.icon) entry.icon = override.icon;

    byId.set(entry.id, entry);
  }

  // Additions are hand-written and win over both the legacy data and the audit.
  for (const item of additions[plural] || []) {
    const entry = normalize(item, kind);
    if (entry) byId.set(entry.id, entry);
  }

  // A few entries name an icon v8 never actually shipped. Null means "draw the
  // fallback plate" rather than requesting a file that will 404.
  for (const entry of byId.values()) {
    if (
      entry.icon &&
      !existsSync(
        fileURLToPath(new URL(`../public${entry.icon}`, import.meta.url)),
      )
    ) {
      entry.icon = null;
    }
  }

  const entries = [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return { entries, dropped };
}

const games = build(await read("g.json"), "game");
const apps = build(await read("a.json"), "app");

await writeFile(
  out("games.json"),
  JSON.stringify(games.entries, null, 2) + "\n",
);
await writeFile(out("apps.json"), JSON.stringify(apps.entries, null, 2) + "\n");

const counts = (entries) =>
  Object.entries(
    entries.reduce(
      (acc, e) => ({ ...acc, [e.category]: (acc[e.category] || 0) + 1 }),
      {},
    ),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([category, n]) => `${category} ${n}`)
    .join(", ");

console.log(`games: ${games.entries.length} (${counts(games.entries)})`);
console.log(`apps:  ${apps.entries.length} (${counts(apps.entries)})`);
console.log(
  `dropped: ${games.dropped.length} games, ${apps.dropped.length} apps`,
);
