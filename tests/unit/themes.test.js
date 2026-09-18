import { describe, it, expect } from "vitest";
import { THEMES, themeById, applyTheme } from "../../src/lib/stores/themes.js";

describe("themes", () => {
  it("has the four approved themes with exact accents", () => {
    expect(THEMES.map((t) => [t.id, t.name, t.accent])).toEqual([
      ["alpine", "Alpine", "#9AA2FF"],
      ["city", "Night Grid", "#FFB35C"],
      ["dunes", "Last Light", "#FF8A5B"],
      ["iceland", "Black Sand", "#5FD4C4"],
    ]);
  });

  it("points every theme at its wallpaper and thumbnail", () => {
    for (const t of THEMES) {
      expect(t.wallpaper).toBe(`/wallpapers/${t.id}.webp`);
      expect(t.thumb).toBe(`/wallpapers/${t.id}-thumb.webp`);
    }
  });

  it("falls back to alpine for unknown ids", () => expect(themeById("nope").id).toBe("alpine"));

  it("applies accent and wallpaper as CSS variables", () => {
    const root = document.createElement("div");
    applyTheme(themeById("dunes"), root);
    expect(root.style.getPropertyValue("--accent")).toBe("#FF8A5B");
    expect(root.style.getPropertyValue("--wallpaper")).toBe('url("/wallpapers/dunes.webp")');
    expect(root.dataset.theme).toBe("dunes");
  });
});
