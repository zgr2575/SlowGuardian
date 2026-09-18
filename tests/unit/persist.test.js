import { describe, it, expect, beforeEach, vi } from "vitest";
import { get } from "svelte/store";
import { persisted } from "../../src/lib/stores/persist.js";

beforeEach(() => localStorage.clear());

describe("persisted", () => {
  it("returns the initial value when nothing is stored", () => {
    const s = persisted("sg:test", { a: 1 });
    expect(get(s)).toEqual({ a: 1 });
  });

  it("writes through to localStorage", () => {
    const s = persisted("sg:test", { a: 1 });
    s.set({ a: 2 });
    expect(JSON.parse(localStorage.getItem("sg:test"))).toEqual({ a: 2 });
  });

  it("reads an existing value", () => {
    localStorage.setItem("sg:test", JSON.stringify({ a: 5 }));
    expect(get(persisted("sg:test", { a: 1 }))).toEqual({ a: 5 });
  });

  it("falls back to initial on corrupt JSON", () => {
    localStorage.setItem("sg:test", "{nope");
    expect(get(persisted("sg:test", { a: 1 }))).toEqual({ a: 1 });
  });

  it("never throws when storage is blocked", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const s = persisted("sg:test", { a: 1 });
    expect(() => s.set({ a: 3 })).not.toThrow();
    expect(get(s)).toEqual({ a: 3 });
    expect(s.available).toBe(false);
    spy.mockRestore();
  });

  it("runs migrate on version mismatch", () => {
    localStorage.setItem("sg:test", JSON.stringify({ v: 0, old: true }));
    const s = persisted("sg:test", { v: 1 }, { version: 1, migrate: (old) => ({ v: 1, migrated: old.old }) });
    expect(get(s)).toEqual({ v: 1, migrated: true });
  });

  it("update() persists the new value", () => {
    const s = persisted("sg:test", { n: 1 });
    s.update((x) => ({ n: x.n + 1 }));
    expect(get(s)).toEqual({ n: 2 });
    expect(JSON.parse(localStorage.getItem("sg:test"))).toEqual({ n: 2 });
  });
});
