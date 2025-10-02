// Scramjet configuration for premium users
// Based on https://github.com/MercuryWorkshop/scramjet

self.__scramjet$config = {
  prefix: "/scram/",
  codec: self.ScramjetCodec || ((e) => e),
  
  // Don't share workers between different proxy instances
  SharedWorker: false,
  
  // Use regular Worker instead
  files: {
    worker: "/scram/scramjet.worker.js",
    client: "/scram/scramjet.client.js",
    codecs: "/scram/scramjet.codecs.js",
    bundle: "/scram/scramjet.bundle.js"
  }
};
