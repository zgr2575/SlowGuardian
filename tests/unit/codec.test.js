import { describe, it, expect } from "vitest";
import { xorEncode, xorDecode } from "../../src/lib/proxy/codec.js";

// Verified against Ultraviolet.codec.xor from @titaniumnetwork-dev/ultraviolet 3.2.10,
// so our encoder and the service worker's decoder agree.
const VECTORS = [
  ["https://example.com/", "hvtrs8%2F-ezaopne%2Ccmm-"],
  [
    "https://www.youtube.com/watch?v=jfKfPfyJRdk&t=10",
    "hvtrs8%2F-wuw%2Cymuvu%60e%2Ccmm-wctah%3Dv%3FjdKdPdyHRfk%24t%3F12",
  ],
  ["http://127.0.0.1:4599/", "hvtr%3A-%2F325.2.2.3%3A65%3B9-"],
];

describe("UV xor codec", () => {
  it.each(VECTORS)("encodes %s", (plain, encoded) =>
    expect(xorEncode(plain)).toBe(encoded),
  );
  it.each(VECTORS)("decodes back to %s", (plain, encoded) =>
    expect(xorDecode(encoded)).toBe(plain),
  );
  it("passes empty values through", () => {
    expect(xorEncode("")).toBe("");
    expect(xorDecode("")).toBe("");
  });
});
