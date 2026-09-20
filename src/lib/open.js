import { get } from "svelte/store";
import { settings } from "./stores/settings.js";
import { openTab, engineFor } from "./stores/tabs.js";
import { navigate } from "./router.js";
import { toTarget, SEARCH_ENGINES } from "./url.js";
import { initProxy, proxiedUrl } from "./proxy/index.js";

// Open a URL in a new tab and switch to the browser view.
export function openTarget(url) {
  openTab(url, { engine: engineFor(url, get(settings)) });
  navigate("/browse");
}

// Whatever the user typed: a URL, a domain, or a search.
export function openInput(value) {
  if (!value?.trim()) return;
  const s = get(settings);
  openTarget(
    toTarget(value, SEARCH_ENGINES[s.searchEngine] || SEARCH_ENGINES.google),
  );
}

// Catalog entries marked `external` refuse to be framed, so they get their own window.
export async function openEntry(entry) {
  if (!entry?.url) return;
  if (!entry.external) return openTarget(entry.url);

  const s = get(settings);
  const engine = engineFor(entry.url, s);
  const win = window.open("about:blank", "_blank");
  try {
    await initProxy(s.relay);
    const src = await proxiedUrl(entry.url, engine);
    if (!win) return openTarget(entry.url);
    win.location.replace(new URL(src, location.origin).href);
  } catch {
    win?.close();
    openTarget(entry.url);
  }
}
