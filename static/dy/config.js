// See documentation for more information

self.__dynamic$config = {
  prefix: "/dy/",
  encoding: "xor",
  mode: "production",
  logLevel: 0,
  bare: {
    version: 2,
    path: "/bare/",
  },
  tab: {
    title: "Service",
    icon: null,
    ua: null,
  },
  assets: {
    prefix: "/dy/",
    files: {
      handler: "handler.js",
      client: "client.js",
      worker: "worker.js",
      config: "config.js",
      inject: null,
    },
  },
  block: [],
};
