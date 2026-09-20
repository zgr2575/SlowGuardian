import { describe, it, expect } from "vitest";
import { buildSuggestions, SUGGEST_LIMIT } from "../../src/lib/suggest.js";

const favorites = [
  {
    entry: {
      name: "YouTube",
      url: "https://www.youtube.com",
      icon: "/catalog/icons/youtube.webp",
    },
  },
];
const history = [
  {
    url: "https://news.ycombinator.com/",
    title: "Hacker News",
    favicon: null,
    at: Date.now(),
  },
];

describe("buildSuggestions", () => {
  it("is empty for an empty query", () => {
    expect(buildSuggestions("   ", { favorites, history })).toEqual([]);
  });

  it("puts an address first", () => {
    const [first] = buildSuggestions("example.com", { favorites, history });
    expect(first).toMatchObject({
      type: "url",
      value: "example.com",
      detail: "Open site",
    });
  });

  it("finds catalog games and apps", () => {
    const types = buildSuggestions("retro", {}).map((s) => s.type);
    expect(types).toContain("game");

    const labels = buildSuggestions("retro", {}).map((s) => s.label);
    expect(labels).toContain("Retro Bowl");
  });

  it("finds favorites and history", () => {
    expect(
      buildSuggestions("youtube", { favorites }).some(
        (s) => s.type === "favorite",
      ),
    ).toBe(true);
    expect(
      buildSuggestions("hacker", { history }).some((s) => s.type === "history"),
    ).toBe(true);
  });

  it("includes remote autocomplete terms", () => {
    const suggestions = buildSuggestions("weath", {
      remote: ["weather today", "weather radar"],
    });
    expect(
      suggestions.filter((s) => s.type === "search").map((s) => s.label),
    ).toContain("weather today");
  });

  it("always ends with a plain search", () => {
    const suggestions = buildSuggestions("something unlikely zzz", {});
    expect(suggestions.at(-1)).toMatchObject({
      type: "search",
      value: "something unlikely zzz",
    });
  });

  it("never returns more than the limit and never repeats", () => {
    const suggestions = buildSuggestions("a", {
      favorites,
      history,
      remote: ["a1", "a2", "a3", "a4"],
    });
    expect(suggestions.length).toBeLessThanOrEqual(SUGGEST_LIMIT);
    const ids = suggestions.map((s) => `${s.type}:${s.id}`);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
