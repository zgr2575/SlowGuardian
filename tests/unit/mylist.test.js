import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { mylist, toggleMyList, inMyList } from "../../src/lib/stores/mylist.js";

beforeEach(() => mylist.set([]));

describe("My List", () => {
  it("adds and removes items", () => {
    toggleMyList("celeste");
    expect(get(mylist)).toEqual(["celeste"]);
    expect(inMyList(get(mylist), "celeste")).toBe(true);
    toggleMyList("celeste");
    expect(get(mylist)).toEqual([]);
  });

  it("keeps newest first", () => {
    toggleMyList("a");
    toggleMyList("b");
    expect(get(mylist)).toEqual(["b", "a"]);
  });
});
