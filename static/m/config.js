/*global Ultraviolet*/
self.__uv$config = {
  prefix: "/a/",
  bare: "/o/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/a/handler.js",
  client: "/a/client.js",
  bundle: "/a/bundle.js",
  config: "/a/config.js",
  sw: "/a/sw.js",
};
