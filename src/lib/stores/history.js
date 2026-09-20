import { get } from "svelte/store";
import { persisted } from "./persist.js";
import { settings } from "./settings.js";
import { domainOf } from "../url.js";

export const HISTORY_LIMIT = 500;

export const history = persisted("sg:history", []);

export function addVisit({ url, title, favicon = null }) {
  if (!url || url.startsWith("about:")) return;
  if (!get(settings).saveHistory) return;

  history.update((list) => {
    const rest = (list || []).filter((item) => item.url !== url);
    return [
      { url, title: title || domainOf(url), favicon, at: Date.now() },
      ...rest,
    ].slice(0, HISTORY_LIMIT);
  });
}

export function removeVisit(url) {
  history.update((list) => (list || []).filter((item) => item.url !== url));
}

export function clearHistory() {
  history.set([]);
}
