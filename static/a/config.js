/*global Ultraviolet*/
self.__uv$config = {
  prefix: "/a/",
  bare: "/o/",
  encodeUrl: function(url) {
    if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) {
      return Ultraviolet.codec.xor.encode(url);
    }
    // Fallback encoding
    return btoa(url).replace(/[+/=]/g, c => ({'+': '-', '/': '_', '=': ''}[c] || c));
  },
  decodeUrl: function(url) {
    if (typeof Ultraviolet !== 'undefined' && Ultraviolet.codec && Ultraviolet.codec.xor) {
      return Ultraviolet.codec.xor.decode(url);
    }
    // Fallback decoding
    try {
      const restored = url.replace(/[-_]/g, c => ({'-': '+', '_': '/'}[c] || c));
      return atob(restored);
    } catch (e) {
      return url;
    }
  },
  handler: "/a/handler.js",
  client: "/a/client.js",
  bundle: "/a/bundle.js",
  config: "/a/config.js",
  sw: "/a/sw.js",
};
