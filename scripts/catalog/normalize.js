// Turns v8's catalog entries into the v11 shape. v8's tags are inconsistent
// ("all," with a trailing comma, "AI" vs "ai"), and most games only carry "all",
// so the title is used as a fallback signal.

export const GAME_CATEGORIES = [
  "multiplayer",
  "shooter",
  "racing",
  "sports",
  "platformer",
  "puzzle",
  "idle",
  "simulation",
  "emulator",
  "classic",
  "arcade",
];

export const APP_CATEGORIES = [
  "social",
  "video",
  "music",
  "ai",
  "cloud-gaming",
  "games",
  "emulators",
  "messaging",
  "mail",
  "tools",
];

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const clean = (categories = []) =>
  categories.map((c) => String(c).trim().replace(/,$/, "").toLowerCase());

const TITLE_RULES = [
  [
    /emulator|eaglercraft|\bgba\b|\bn64\b|\bnes\b|\bsnes\b|\bps2\b|retroarch|gameboy/i,
    "emulator",
  ],
  // Shooter before multiplayer: plenty of titles are both, and the genre says more.
  [/shoot|shock|gun|sniper|strike|combat|war|zombie|tank|bullet/i, "shooter"],
  [/\.io\b|multiplayer|\b1v1\b|among us|krunker/i, "multiplayer"],
  [
    /drift|kart|race|racing|moto|\bcar\b|traffic|drive|driver|parking|bike/i,
    "racing",
  ],
  [
    /basketball|soccer|football|bowl|golf|pool|8 ?ball|tennis|baseball|hockey|dunk|sport/i,
    "sports",
  ],
  [
    /papa'?s|tycoon|market|mart|simulator|cooking|farm|restaurant|salon|kitchen/i,
    "simulation",
  ],
  [/clicker|idle|cookie|capitalist|incremental/i, "idle"],
  [
    /2048|sudoku|chess|tetris|puzzle|cut the rope|mahjong|solitaire|word|crossword|brain/i,
    "puzzle",
  ],
  [
    /mario|sonic|celeste|fireboy|watergirl|platform|jump|hop|vex|stickman|run \d|super/i,
    "platformer",
  ],
  [/flash|classic|retro(?! bowl)/i, "classic"],
];

export function categorizeGame(name, categories = []) {
  const tags = clean(categories);
  if (tags.includes("emu")) return "emulator";
  if (tags.includes("2p")) return "multiplayer";
  if (tags.includes("sports")) return "sports";
  if (tags.includes("flash")) return "classic";

  for (const [pattern, category] of TITLE_RULES)
    if (pattern.test(name)) return category;
  return "arcade";
}

const APP_TAGS = {
  social: "social",
  stream: "video",
  message: "messaging",
  mail: "mail",
  cloud: "cloud-gaming",
  android: "cloud-gaming",
  game: "games",
  emu: "emulators",
  tool: "tools",
  ai: "ai",
};

export function categorizeApp(name, categories = []) {
  const tags = clean(categories);
  for (const tag of tags) if (APP_TAGS[tag]) return APP_TAGS[tag];

  // v8's "media" lumps music and video together; split them by title.
  if (tags.includes("media")) {
    if (/spotify|music|soundcloud|audio|podcast/i.test(name)) return "music";
    if (/tv|video|stream|movie|watch|tube|flix|anime/i.test(name))
      return "video";
    return "tools";
  }
  return "tools";
}

export function normalize(raw, kind) {
  if (!raw.link || typeof raw.link !== "string") return null;
  // v8 has a few typos like "https:/moomoo.io" with one slash.
  const url = raw.link.replace(/^(https?:)\/(?!\/)/, "$1//");

  const entry = {
    id: slugify(raw.name),
    name: String(raw.name).trim(),
    url,
    icon: String(raw.image || "").replace(
      "/assets/media/icons/",
      "/catalog/icons/",
    ),
    category:
      kind === "game"
        ? categorizeGame(raw.name, raw.categories)
        : categorizeApp(raw.name, raw.categories),
    // Sites that refuse to be framed have to open in their own window.
    external: raw.blank === "true" || raw.blank === true,
  };

  if (raw.local === "true" || raw.local === true) entry.local = true;
  return entry;
}
