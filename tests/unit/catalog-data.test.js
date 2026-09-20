import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import games from "../../src/data/games.json";
import apps from "../../src/data/apps.json";
import {
  GAME_CATEGORIES,
  APP_CATEGORIES,
} from "../../scripts/catalog/normalize.js";
import {
  categoriesFor,
  featuredFor,
  topFor,
  filterCatalog,
  byId,
} from "../../src/lib/catalog.js";

// Resolved from the project root: under jsdom, `new URL(..., import.meta.url)` does not
// yield a file: URL, so fileURLToPath refuses it. Vitest runs from the root.
const iconPath = (icon) => join(process.cwd(), "public", icon);

describe.each([
  ["games", games, GAME_CATEGORIES],
  ["apps", apps, APP_CATEGORIES],
])("%s data", (kind, entries, categories) => {
  it("is not empty", () => expect(entries.length).toBeGreaterThan(40));

  it("every entry has the required fields", () => {
    for (const entry of entries) {
      expect(entry.id, entry.name).toMatch(/^[a-z0-9-]+$/);
      expect(entry.name.length, entry.id).toBeGreaterThan(0);
      expect(entry.url, entry.id).toMatch(/^https?:\/\//);
      expect(categories, `${entry.id} category`).toContain(entry.category);
      expect(typeof entry.external, entry.id).toBe("boolean");
    }
  });

  it("has no duplicate ids", () => {
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every icon that is named actually exists", () => {
    const missing = entries
      .filter((e) => e.icon && !existsSync(iconPath(e.icon)))
      .map((e) => e.id);
    expect(missing).toEqual([]);
  });

  it("most entries have artwork", () => {
    const withIcon = entries.filter((e) => e.icon).length;
    expect(withIcon / entries.length).toBeGreaterThan(0.8);
  });

  it("no entry still points at v8's unhosted local files", () => {
    expect(entries.filter((e) => e.url.startsWith("/") || e.local)).toEqual([]);
  });
});

describe("catalog helpers", () => {
  it("lists only categories that are actually used", () => {
    const ids = categoriesFor("games").map((c) => c.id);
    expect(ids[0]).toBe("all");
    for (const id of ids.slice(1))
      expect(games.some((g) => g.category === id)).toBe(true);
  });

  it("resolves featured slides to real entries with artwork", () => {
    for (const kind of ["games", "apps"]) {
      const slides = featuredFor(kind);
      expect(slides.length).toBeGreaterThan(1);
      for (const slide of slides) {
        expect(slide.art).toMatch(/^\/catalog\/icons\//);
        expect(slide.url).toMatch(/^https?:\/\//);
        expect(slide.title.length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves every top entry", () => {
    expect(topFor("games").length).toBeGreaterThan(5);
    expect(topFor("apps").length).toBeGreaterThan(5);
  });

  it("filters by category and query", () => {
    const shooters = filterCatalog("games", { category: "shooter" });
    expect(shooters.length).toBeGreaterThan(0);
    for (const entry of shooters) expect(entry.category).toBe("shooter");

    const search = filterCatalog("games", { query: "retro" });
    expect(search.some((e) => e.id === "retro-bowl")).toBe(true);

    expect(filterCatalog("games", { query: "zzzzzz" })).toEqual([]);
  });

  it("looks entries up by id", () => {
    expect(byId("games", "retro-bowl").name).toBe("Retro Bowl");
    expect(byId("games", "nope")).toBeNull();
  });
});
