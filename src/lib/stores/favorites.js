import { derived } from "svelte/store";
import { persisted } from "./persist.js";
import { byId } from "../catalog.js";

// What Home shows under the search box. Seeded with the obvious ones; editable later.
export const DEFAULT_FAVORITES = [
  { kind: "apps", id: "youtube" },
  { kind: "apps", id: "discord" },
  { kind: "apps", id: "spotify" },
  { kind: "apps", id: "tiktok" },
  { kind: "apps", id: "twitch" },
  { kind: "games", id: "retro-bowl" },
];

export const favorites = persisted("sg:favorites", DEFAULT_FAVORITES);

// Drops anything whose catalog entry has since disappeared.
export const favoriteEntries = derived(favorites, ($favorites) =>
  ($favorites || [])
    .map((ref) => ({ ...ref, entry: byId(ref.kind, ref.id) }))
    .filter((f) => f.entry),
);

export function isFavorite(list, kind, id) {
  return (list || []).some((f) => f.kind === kind && f.id === id);
}

export function toggleFavorite(kind, id) {
  favorites.update((list) =>
    isFavorite(list, kind, id)
      ? list.filter((f) => !(f.kind === kind && f.id === id))
      : [...(list || []), { kind, id }],
  );
}
