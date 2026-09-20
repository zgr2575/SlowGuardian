import games from "../data/games.json";
import apps from "../data/apps.json";
import featured from "../data/featured.json";
import {
  GAME_CATEGORIES,
  APP_CATEGORIES,
} from "../../scripts/catalog/normalize.js";

export const CATALOG = { games, apps };

const LABELS = {
  multiplayer: "Multiplayer",
  shooter: "Shooters",
  racing: "Racing",
  sports: "Sports",
  platformer: "Platformers",
  puzzle: "Puzzle",
  idle: "Idle",
  simulation: "Simulation",
  emulator: "Emulators",
  classic: "Classics",
  arcade: "Arcade",
  social: "Social",
  video: "Video",
  music: "Music",
  ai: "AI",
  "cloud-gaming": "Cloud gaming",
  games: "Game sites",
  emulators: "Emulators",
  messaging: "Messaging",
  mail: "Mail",
  tools: "Tools",
};

export function categoriesFor(kind) {
  const order = kind === "games" ? GAME_CATEGORIES : APP_CATEGORIES;
  const used = new Set(CATALOG[kind].map((entry) => entry.category));
  return [
    { id: "all", label: "All" },
    ...order
      .filter((id) => used.has(id))
      .map((id) => ({ id, label: LABELS[id] ?? id })),
  ];
}

export function byId(kind, id) {
  return CATALOG[kind].find((entry) => entry.id === id) ?? null;
}

// Featured slides carry their own copy; the artwork comes from the catalog entry.
export function featuredFor(kind) {
  return featured[kind].featured
    .map((slide) => {
      const entry = byId(kind, slide.id);
      if (!entry) return null;
      return {
        ...slide,
        art: entry.icon,
        url: entry.url,
        external: entry.external,
        action: kind === "games" ? "Play" : "Open",
      };
    })
    .filter(Boolean);
}

export function topFor(kind) {
  return featured[kind].top.map((id) => byId(kind, id)).filter(Boolean);
}

export function filterCatalog(kind, { category = "all", query = "" } = {}) {
  const needle = query.trim().toLowerCase();
  return CATALOG[kind].filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (!needle) return true;
    return (
      entry.name.toLowerCase().includes(needle) ||
      entry.category.includes(needle)
    );
  });
}
