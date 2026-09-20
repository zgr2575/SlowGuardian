export class ProxyUnsupportedError extends Error {
  constructor() {
    super("unsupported");
    this.name = "ProxyUnsupportedError";
  }
}

/**
 * Registers the service worker and — importantly — waits until it actually controls
 * this page. `ready` only means a worker is active: a freshly installed one does not
 * control the page that registered it, and the first proxied request would then miss
 * the worker and be answered by the host with index.html.
 */
export async function ensureServiceWorker() {
  if (!("serviceWorker" in navigator)) throw new ProxyUnsupportedError();

  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;

  if (!navigator.serviceWorker.controller) {
    await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", resolve, {
        once: true,
      });
    });
  }
}
