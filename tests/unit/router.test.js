import { describe, it, expect } from "vitest";
import { resolve } from "../../src/lib/router.js";

describe("resolve", () => {
  it.each([
    ["/", "home"],
    ["/games", "games"],
    ["/apps", "apps"],
    ["/browse", "browse"],
    ["/settings", "settings"],
    ["/games/", "games"],
    ["/games?x=1", "games"],
    ["/nope", "home"],
  ])("%s → %s", (path, name) => expect(resolve(path).name).toBe(name));

  it.each([
    ["/g", "/games"],
    ["/ap", "/apps"],
    ["/s", "/settings"],
    ["/p", "/browse"],
  ])("legacy %s redirects to %s", (path, to) => {
    const r = resolve(path);
    expect(r.path).toBe(to);
    expect(r.redirected).toBe(true);
  });

  it("unknown paths redirect home", () =>
    expect(resolve("/nope")).toEqual({
      name: "home",
      path: "/",
      redirected: true,
    }));
});
