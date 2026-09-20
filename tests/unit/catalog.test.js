import { describe, it, expect } from "vitest";
import {
  slugify,
  categorizeGame,
  categorizeApp,
  normalize,
} from "../../scripts/catalog/normalize.js";

describe("slugify", () => {
  it.each([
    ["Retro Bowl", "retro-bowl"],
    ["1v1.LOL", "1v1-lol"],
    ["Papa's Burgeria", "papas-burgeria"],
    ["Minecraft 1.5.2 (Eaglercraft)", "minecraft-1-5-2-eaglercraft"],
    ["  Spaced   Out  ", "spaced-out"],
  ])("%s → %s", (name, slug) => expect(slugify(name)).toBe(slug));
});

describe("categorizeGame", () => {
  it("keeps the v8 tags, trailing commas and all", () => {
    expect(categorizeGame("Some Game", ["all,", "2P,"])).toBe("multiplayer");
    expect(categorizeGame("Some Game", ["emu,"])).toBe("emulator");
    expect(categorizeGame("Some Game", ["sports,"])).toBe("sports");
    expect(categorizeGame("Some Game", ["flash"])).toBe("classic");
  });

  it("falls back to reading the title", () => {
    expect(categorizeGame("Drift Hunters", ["all"])).toBe("racing");
    expect(categorizeGame("Basketball Stars", ["all"])).toBe("sports");
    expect(categorizeGame("Shell Shockers", ["all"])).toBe("shooter");
    expect(categorizeGame("Cookie Clicker", ["all"])).toBe("idle");
    expect(categorizeGame("Papa's Freezeria", ["all"])).toBe("simulation");
    expect(categorizeGame("Fireboy and Watergirl", ["all"])).toBe("platformer");
    expect(categorizeGame("2048", ["all"])).toBe("puzzle");
    expect(categorizeGame("Agar.io", ["all"])).toBe("multiplayer");
    expect(categorizeGame("GBA Emulator", ["all"])).toBe("emulator");
  });

  it("uses arcade when nothing else fits", () => {
    expect(categorizeGame("Blorptron", ["all"])).toBe("arcade");
  });

  it("prefers an explicit tag over the title", () => {
    expect(categorizeGame("Drift Hunters", ["emu"])).toBe("emulator");
  });
});

describe("categorizeApp", () => {
  it.each([
    ["Discord", ["social"], "social"],
    ["Netflix", ["stream"], "video"],
    ["Spotify", ["media"], "music"],
    ["ChatGPT Clone", ["AI"], "ai"],
    ["GBA Emulator", ["emu"], "emulators"],
    ["Geforce NOW", ["cloud"], "cloud-gaming"],
    ["Messenger", ["message"], "messaging"],
    ["Gmail", ["mail"], "mail"],
    ["Some Tool", ["tool"], "tools"],
  ])("%s → %s", (name, cats, expected) =>
    expect(categorizeApp(name, cats)).toBe(expected),
  );
});

describe("normalize", () => {
  const raw = {
    name: "Retro Bowl",
    link: "https://example.com/retro",
    image: "/assets/media/icons/retro.webp",
    categories: ["all,", "sports"],
  };

  it("produces the v11 shape", () => {
    expect(normalize(raw, "game")).toEqual({
      id: "retro-bowl",
      name: "Retro Bowl",
      url: "https://example.com/retro",
      icon: "/catalog/icons/retro.webp",
      category: "sports",
      external: false,
    });
  });

  it("marks entries that refuse to be framed as external", () => {
    expect(normalize({ ...raw, blank: "true" }, "game").external).toBe(true);
  });

  it("keeps v8's local paths so the audit can flag them", () => {
    const local = normalize(
      { ...raw, link: "/y/retro/index.html", local: "true" },
      "game",
    );
    expect(local.url).toBe("/y/retro/index.html");
    expect(local.local).toBe(true);
  });

  it("returns null for entries with no link at all", () => {
    expect(normalize({ ...raw, link: undefined }, "app")).toBeNull();
    expect(normalize({ ...raw, link: null, error: true }, "app")).toBeNull();
  });
});
