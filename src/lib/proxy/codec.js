// Ultraviolet's xor codec, reimplemented so the page can build proxy URLs without
// loading the 1 MB engine bundle. Verified against Ultraviolet.codec.xor 3.2.10.
export function xorEncode(str) {
  if (!str) return str;
  return encodeURIComponent(
    [...str.toString()]
      .map((char, i) =>
        i % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char,
      )
      .join(""),
  );
}

export function xorDecode(str) {
  if (!str) return str;
  const [input, ...search] = str.toString().split("?");
  const decoded = [...decodeURIComponent(input)]
    .map((char, i) =>
      i % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char,
    )
    .join("");
  return search.length ? `${decoded}?${search.join("?")}` : decoded;
}
