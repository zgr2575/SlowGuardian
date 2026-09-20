import { get } from "svelte/store";
import { settings } from "./stores/settings.js";
import { openTab, engineFor } from "./stores/tabs.js";
import { navigate } from "./router.js";
import { toTarget, SEARCH_ENGINES } from "./url.js";

// Open a URL in a new tab and switch to the browser view.
export function openTarget(url) {
  openTab(url, { engine: engineFor(url, get(settings)) });
  navigate("/browse");
}

// Whatever the user typed: a URL, a domain, or a search.
export function openInput(value) {
  const s = get(settings);
  if (!value?.trim()) return;
  openTarget(
    toTarget(value, SEARCH_ENGINES[s.searchEngine] || SEARCH_ENGINES.google),
  );
}
