/**
 * SlowGuardian V10 — shared catalog helpers.
 *
 * Pure, DOM-free, framework-free. Imported by BOTH:
 *   • the server (Tile.astro / Billboard.astro / Library.astro frontmatter), and
 *   • the client search <script> in Library.astro
 * so a tile rendered at build time and a tile rendered from a search result are
 * byte-for-byte identical markup. No `astro:content` import here — it operates on
 * plain data objects (`CatalogItem`), which decouples it from the collection types.
 */

export type CatalogKind = "games" | "apps";

export interface CatalogItem {
  id: string;
  name: string;
  url?: string;
  image: string;
  categories: string[];
  blank?: boolean;
  custom?: boolean;
  note?: string;
}

/** Short labels for a tile's category chip / palette row tag. */
export const GAME_CATEGORY_LABELS: Record<string, string> = {
  "2p": "2-Player",
  local: "Offline",
  emu: "Retro",
  android: "Android",
  sports: "Sports",
  flash: "Flash",
};

export const APP_CATEGORY_LABELS: Record<string, string> = {
  stream: "Streaming",
  media: "Media",
  social: "Social",
  message: "Chat",
  game: "Games",
  ai: "AI",
  android: "Android",
  emu: "Emulated",
  tool: "Tools",
  mail: "Mail",
  cloud: "Cloud",
};

/** First meaningful category → friendly label; falls back to Game/App. */
export function primaryLabel(item: CatalogItem, kind: CatalogKind): string {
  const labels = kind === "apps" ? APP_CATEGORY_LABELS : GAME_CATEGORY_LABELS;
  for (const c of item.categories) {
    if (c !== "all" && labels[c]) return labels[c];
  }
  return kind === "apps" ? "App" : "Game";
}

export function isBlank(item: CatalogItem): boolean {
  return item.blank === true;
}

/**
 * Where a tile/row points. Matches the Phase-1 wiring convention:
 *   • no url            → undefined (rendered as a non-navigating tile)
 *   • blank flag        → the raw url, opened in a new tab (bypasses the launch bay)
 *   • root-relative "/" → same-origin asset, opened directly (already full-screen)
 *   • everything else   → /go?url=<encoded>&app=1 → the proxy in IMMERSIVE mode:
 *                         a full-viewport view of just the game/app, no tab chrome.
 */
export function entryHref(item: CatalogItem): string | undefined {
  if (!item.url) return undefined;
  if (isBlank(item)) return item.url;
  if (item.url.startsWith("/")) return item.url;
  return "/go?url=" + encodeURIComponent(item.url) + "&app=1";
}

/* ---------- html escaping (text + attribute contexts) ---------- */
export function esc(s: unknown = ""): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export function escAttr(s: unknown = ""): string {
  return esc(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * One source of truth for a tile's markup (mockup classes: .tile/.art/.label/.tt/.cc).
 * Returns a full <a> element string so SSR shelves and client search results match.
 */
export function tileHTML(item: CatalogItem, kind: CatalogKind): string {
  const href = entryHref(item);
  const blank = isBlank(item);
  const disabled = !item.url;
  const label = primaryLabel(item, kind);
  const attrs = [
    'class="tile"',
    href ? `href="${escAttr(href)}"` : "",
    blank ? 'target="_blank" rel="noopener noreferrer"' : "",
    disabled ? "data-disabled" : "",
    item.note ? `data-note="${escAttr(item.note)}"` : "",
    `data-id="${escAttr(item.id)}"`,
    `data-name="${escAttr(item.name.toLowerCase())}"`,
    `data-cats="${escAttr(item.categories.join(" "))}"`,
    'tabindex="0"',
    `aria-label="${escAttr(item.name)}"`,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    `<a ${attrs}>` +
    `<span class="art"><img class="tile-img" src="${escAttr(item.image)}" alt="" loading="lazy" decoding="async" /></span>` +
    `<span class="label"><span class="tt">${esc(item.name)}</span><span class="cc">${esc(label)}</span></span>` +
    `</a>`
  );
}

/** A ⌘K command-palette result row for a catalog entry (mockup classes: .row/.rk/.rd). */
export function rowHTML(item: CatalogItem, kind: CatalogKind): string {
  return (
    `<div class="row" data-game="${escAttr(item.name)}" data-id="${escAttr(item.id)}">` +
    `<span class="rk">${esc(item.name)}</span>` +
    `<span class="rd">${esc(kind === "apps" ? "App" : "Game")}</span>` +
    `</div>`
  );
}

/**
 * Substring name search, ranked: prefix matches first, then earliest match
 * position, then alphabetical. Mirrors the mockup's simple filter, but ordered.
 */
export function search(items: CatalogItem[], q: string): CatalogItem[] {
  const s = (q || "").trim().toLowerCase();
  if (!s) return [];
  const scored: Array<[CatalogItem, number, string]> = [];
  for (const it of items) {
    const n = it.name.toLowerCase();
    const i = n.indexOf(s);
    if (i === -1) continue;
    scored.push([it, (n.startsWith(s) ? 0 : 1000) + i, it.name]);
  }
  scored.sort((a, b) => a[1] - b[1] || a[2].localeCompare(b[2]));
  return scored.map((x) => x[0]);
}
