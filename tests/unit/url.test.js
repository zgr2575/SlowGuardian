import { describe, it, expect } from "vitest";
import {
  isLikelyUrl,
  toTarget,
  domainOf,
  SEARCH_ENGINES,
} from "../../src/lib/url.js";

describe("isLikelyUrl", () => {
  it.each([
    ["https://example.com", true],
    ["http://127.0.0.1:4599/", true],
    ["example.com", true],
    ["sub.example.co.uk/path?q=1", true],
    ["localhost:3000", true],
    ["retro bowl", false],
    ["what is 2.5 + 2", false],
    ["lofi", false],
    ["2.5", false],
    ["", false],
  ])("%s → %s", (input, expected) => expect(isLikelyUrl(input)).toBe(expected));
});

describe("toTarget", () => {
  it("keeps full URLs", () =>
    expect(toTarget("https://example.com/a")).toBe("https://example.com/a"));
  it("adds https to bare domains", () =>
    expect(toTarget("example.com")).toBe("https://example.com"));
  it("searches everything else with the default engine", () =>
    expect(toTarget("retro bowl")).toBe(
      "https://www.google.com/search?q=retro%20bowl",
    ));
  it("uses the given template", () =>
    expect(toTarget("lofi", SEARCH_ENGINES.duckduckgo)).toBe(
      "https://duckduckgo.com/?q=lofi",
    ));
  it("trims input", () =>
    expect(toTarget("  example.com  ")).toBe("https://example.com"));
});

describe("domainOf", () => {
  it("strips www", () =>
    expect(domainOf("https://www.youtube.com/watch?v=1")).toBe("youtube.com"));
  it("returns input on garbage", () =>
    expect(domainOf("not a url")).toBe("not a url"));
});
