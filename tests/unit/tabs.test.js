import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import {
  tabs,
  activeTab,
  openTab,
  closeTab,
  activateTab,
  updateTab,
  engineFor,
  restoreTabs,
} from "../../src/lib/stores/tabs.js";

beforeEach(() => tabs.set({ list: [], activeId: null }));

describe("tabs", () => {
  it("opens and activates a tab", () => {
    const id = openTab("https://example.com", { engine: "uv" });
    expect(get(tabs).list).toHaveLength(1);
    expect(get(activeTab).id).toBe(id);
    expect(get(activeTab)).toMatchObject({
      url: "https://example.com",
      engine: "uv",
      status: "loading",
      title: "example.com",
    });
  });

  it("closing the active tab activates its right neighbour, else left", () => {
    const a = openTab("https://a.com", { engine: "uv" });
    const b = openTab("https://b.com", { engine: "uv" });
    const c = openTab("https://c.com", { engine: "uv" });
    activateTab(b);
    closeTab(b);
    expect(get(tabs).activeId).toBe(c);
    closeTab(c);
    expect(get(tabs).activeId).toBe(a);
    closeTab(a);
    expect(get(tabs).activeId).toBeNull();
  });

  it("closing a background tab keeps the active one", () => {
    const a = openTab("https://a.com", { engine: "uv" });
    const b = openTab("https://b.com", { engine: "uv" });
    closeTab(a);
    expect(get(tabs).activeId).toBe(b);
  });

  it("updates a tab", () => {
    const id = openTab("https://a.com", { engine: "uv" });
    updateTab(id, { title: "A", status: "ready" });
    expect(get(activeTab)).toMatchObject({ title: "A", status: "ready" });
  });

  it("background open does not change the active tab", () => {
    const a = openTab("https://a.com", { engine: "uv" });
    openTab("https://b.com", { engine: "uv", activate: false });
    expect(get(tabs).activeId).toBe(a);
  });

  it("restored tabs come back idle so they load lazily", () => {
    const restored = restoreTabs({
      list: [
        {
          id: "x",
          url: "https://a.com",
          title: "A",
          favicon: null,
          engine: "uv",
          status: "ready",
          error: null,
        },
      ],
      activeId: "x",
    });
    expect(restored.list[0].status).toBe("idle");
    expect(restored.activeId).toBe("x");
  });

  it("restoreTabs tolerates garbage", () => {
    expect(restoreTabs(null)).toEqual({ list: [], activeId: null });
    expect(restoreTabs({ list: "nope" })).toEqual({ list: [], activeId: null });
  });

  it("engineFor honours site overrides", () => {
    const s = { engine: "uv", siteEngines: { "youtube.com": "scramjet" } };
    expect(engineFor("https://www.youtube.com/watch", s)).toBe("scramjet");
    expect(engineFor("https://example.com", s)).toBe("uv");
  });
});
