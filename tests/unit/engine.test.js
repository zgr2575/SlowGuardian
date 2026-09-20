import { describe, it, expect } from "vitest";
import {
  proxiedUrl,
  decodeProxied,
  ENGINES,
} from "../../src/lib/proxy/engine.js";

describe("engine URLs", () => {
  it("prefixes are the ones the service worker routes", () => {
    expect(ENGINES.uv.prefix).toBe("/uv/service/");
    expect(ENGINES.scramjet.prefix).toBe("/scram/service/");
  });

  it("builds an Ultraviolet URL", async () => {
    expect(await proxiedUrl("https://example.com/", "uv")).toBe(
      "/uv/service/hvtrs8%2F-ezaopne%2Ccmm-",
    );
  });

  it("decodes an Ultraviolet URL", () => {
    expect(
      decodeProxied("http://localhost/uv/service/hvtrs8%2F-ezaopne%2Ccmm-"),
    ).toEqual({
      engine: "uv",
      url: "https://example.com/",
    });
  });

  it("decodes a Scramjet URL", () => {
    expect(
      decodeProxied(
        "http://localhost/scram/service/https%3A%2F%2Fexample.com%2F",
      ),
    ).toEqual({
      engine: "scramjet",
      url: "https://example.com/",
    });
  });

  it("returns null for pages that are not proxied", () => {
    expect(decodeProxied("http://localhost/games")).toBeNull();
    expect(decodeProxied("about:blank")).toBeNull();
  });
});
