import { derived } from "svelte/store";
import { persisted } from "./persist.js";
import { byId } from "../catalog.js";
import { domainOf } from "../url.js";

// What Home shows under the search box: catalog entries plus anything bookmarked
// with the star in the browser toolbar.
export const DEFAULT_FAVORITES = [
  { kind: "apps", id: "youtube" },
  { kind: "apps", id: "discord" },
  { kind: "apps", id: "spotify" },
  { kind: "apps", id: "tiktok" },
  { kind: "apps", id: "twitch" },
  { kind: "games", id: "retro-bowl" },
];

export const favorites = persisted("sg:favorites", DEFAULT_FAVORITES);

// Resolves each favorite to something renderable, dropping catalog entries that
// have since disappeared.
export const favoriteEntries = derived(favorites, ($favorites) =>
  ($favorites || [])
    .map((ref) => {
      if (ref.kind === "url") {
        return {
          ...ref,
          entry: {
            id: ref.url,
            name: ref.title || domainOf(ref.url),
            url: ref.url,
            icon: ref.favicon || null,
          },
        };
      }
      return { ...ref, entry: byId(ref.kind, ref.id) };
    })
    .filter((fav) => fav.entry),
);

export function isFavorite(list, kind, id) {
  return (list || []).some((f) => f.kind === kind && f.id === id);
}

export function isUrlFavorite(list, url) {
  return (list || []).some((f) => f.kind === "url" && f.url === url);
}

export function toggleFavorite(kind, id) {
  favorites.update((list) =>
    isFavorite(list, kind, id)
      ? list.filter((f) => !(f.kind === kind && f.id === id))
      : [...(list || []), { kind, id }],
  );
}

export function toggleUrlFavorite({ url, title, favicon = null }) {
  if (!url) return;
  favorites.update((list) =>
    isUrlFavorite(list, url)
      ? list.filter((f) => !(f.kind === "url" && f.url === url))
      : [
          ...(list || []),
          { kind: "url", url, title: title || domainOf(url), favicon },
        ],
  );
}

export function removeFavorite(favorite) {
  favorites.update((list) =>
    (list || []).filter((f) =>
      favorite.kind === "url"
        ? !(f.kind === "url" && f.url === favorite.url)
        : !(f.kind === favorite.kind && f.id === favorite.id),
    ),
  );
}
