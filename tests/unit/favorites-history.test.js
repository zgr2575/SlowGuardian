import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  favorites,
  favoriteEntries,
  isFavorite,
  toggleFavorite,
  toggleUrlFavorite,
  DEFAULT_FAVORITES,
} from "../../src/lib/stores/favorites.js";
import {
  history,
  addVisit,
  removeVisit,
  clearHistory,
  HISTORY_LIMIT,
} from "../../src/lib/stores/history.js";
import { settings, DEFAULT_SETTINGS } from "../../src/lib/stores/settings.js";

beforeEach(() => {
  favorites.set(DEFAULT_FAVORITES);
  history.set([]);
  settings.set({ ...DEFAULT_SETTINGS });
});

describe("favorites", () => {
  it("resolves catalog references to real entries", () => {
    const entries = get(favoriteEntries);
    expect(entries.length).toBe(DEFAULT_FAVORITES.length);
    for (const fav of entries) expect(fav.entry.name.length).toBeGreaterThan(0);
  });

  it("toggles a catalog entry", () => {
    toggleFavorite("games", "slope");
    expect(isFavorite(get(favorites), "games", "slope")).toBe(true);
    toggleFavorite("games", "slope");
    expect(isFavorite(get(favorites), "games", "slope")).toBe(false);
  });

  it("bookmarks a plain URL from the browser", () => {
    toggleUrlFavorite({
      url: "https://news.ycombinator.com/",
      title: "Hacker News",
      favicon: null,
    });
    const saved = get(favorites).find((f) => f.kind === "url");
    expect(saved).toMatchObject({
      kind: "url",
      url: "https://news.ycombinator.com/",
      title: "Hacker News",
    });

    const resolved = get(favoriteEntries).find((f) => f.kind === "url");
    expect(resolved.entry.name).toBe("Hacker News");
    expect(resolved.entry.url).toBe("https://news.ycombinator.com/");

    toggleUrlFavorite({ url: "https://news.ycombinator.com/" });
    expect(get(favorites).some((f) => f.kind === "url")).toBe(false);
  });

  it("drops references to entries that no longer exist", () => {
    favorites.set([{ kind: "games", id: "this-game-is-gone" }]);
    expect(get(favoriteEntries)).toEqual([]);
  });
});

describe("history", () => {
  it("records visits newest first", () => {
    addVisit({ url: "https://a.com/", title: "A" });
    addVisit({ url: "https://b.com/", title: "B" });
    expect(get(history).map((h) => h.url)).toEqual([
      "https://b.com/",
      "https://a.com/",
    ]);
  });

  it("moves a repeat visit to the top instead of duplicating it", () => {
    addVisit({ url: "https://a.com/", title: "A" });
    addVisit({ url: "https://b.com/", title: "B" });
    addVisit({ url: "https://a.com/", title: "A again" });
    expect(get(history).map((h) => h.url)).toEqual([
      "https://a.com/",
      "https://b.com/",
    ]);
    expect(get(history)[0].title).toBe("A again");
  });

  it("stops recording when history is switched off", () => {
    settings.update((s) => ({ ...s, saveHistory: false }));
    addVisit({ url: "https://a.com/", title: "A" });
    expect(get(history)).toEqual([]);
  });

  it("ignores blank pages", () => {
    addVisit({ url: "about:blank", title: "" });
    addVisit({ url: "", title: "" });
    expect(get(history)).toEqual([]);
  });

  it("caps the list", () => {
    for (let i = 0; i < HISTORY_LIMIT + 25; i++)
      addVisit({ url: `https://site${i}.com/`, title: `S${i}` });
    expect(get(history).length).toBe(HISTORY_LIMIT);
    expect(get(history)[0].url).toBe(`https://site${HISTORY_LIMIT + 24}.com/`);
  });

  it("removes one entry and clears everything", () => {
    addVisit({ url: "https://a.com/", title: "A" });
    addVisit({ url: "https://b.com/", title: "B" });
    removeVisit("https://a.com/");
    expect(get(history).map((h) => h.url)).toEqual(["https://b.com/"]);
    clearHistory();
    expect(get(history)).toEqual([]);
  });
});
