/*global Ultraviolet*/
self.__uv$config = {
  prefix: "/a/",
  bare: "/o/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/m/handler.js",
  client: "/m/client.js",
  bundle: "/m/bundle.js",
  config: "/m/config.js",
  sw: "/m/sw.js",
};
