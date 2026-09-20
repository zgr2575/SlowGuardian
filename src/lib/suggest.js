import { get } from "svelte/store";
import { BareClient } from "@mercuryworkshop/bare-mux";
import { CATALOG } from "./catalog.js";
import { domainOf, isLikelyUrl } from "./url.js";
import { initProxy } from "./proxy/index.js";
import { settings } from "./stores/settings.js";

export const SUGGEST_LIMIT = 7;

/**
 * Builds the list under the search box. Pure so it can be tested: callers pass in the
 * current favorites, history and any remote autocomplete terms.
 */
export function buildSuggestions(
  query,
  { favorites = [], history = [], remote = [] } = {},
) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const out = [];
  const seen = new Set();

  const push = (item) => {
    const key = `${item.type}:${item.id}`;
    if (seen.has(key) || out.length >= SUGGEST_LIMIT) return;
    seen.add(key);
    out.push(item);
  };

  // Something that is obviously an address goes straight to the top.
  if (isLikelyUrl(query.trim())) {
    push({
      type: "url",
      id: query.trim(),
      label: query.trim(),
      detail: "Open site",
      value: query.trim(),
    });
  }

  for (const fav of favorites) {
    const entry = fav.entry;
    if (!entry?.name?.toLowerCase().includes(needle)) continue;
    push({
      type: "favorite",
      id: entry.url,
      label: entry.name,
      detail: "Favorite",
      value: entry.url,
      icon: entry.icon,
    });
  }

  for (const kind of ["games", "apps"]) {
    for (const entry of CATALOG[kind]) {
      if (!entry.name.toLowerCase().includes(needle)) continue;
      push({
        type: kind === "games" ? "game" : "app",
        id: entry.id,
        label: entry.name,
        detail: kind === "games" ? "Game" : "App",
        value: entry,
        icon: entry.icon,
      });
    }
  }

  for (const visit of history) {
    const haystack = `${visit.title} ${visit.url}`.toLowerCase();
    if (!haystack.includes(needle)) continue;
    push({
      type: "history",
      id: visit.url,
      label: visit.title || domainOf(visit.url),
      detail: domainOf(visit.url),
      value: visit.url,
      icon: visit.favicon,
    });
  }

  for (const term of remote) {
    if (term.toLowerCase() === needle) continue;
    push({
      type: "search",
      id: term,
      label: term,
      detail: "Search",
      value: term,
    });
  }

  // Always offer the plain search as the last resort.
  push({
    type: "search",
    id: query.trim(),
    label: query.trim(),
    detail: "Search",
    value: query.trim(),
  });

  return out.slice(0, SUGGEST_LIMIT);
}

/**
 * Search-engine autocomplete, fetched through the proxy so the visitor's browser never
 * talks to the search engine directly. Returns [] on any failure.
 */
export async function fetchRemoteSuggestions(query, { signal } = {}) {
  try {
    // Only once a tab has set the proxy up: typing should never be what registers the
    // service worker.
    if (!navigator.serviceWorker?.controller) return [];
    await initProxy(get(settings).relay);

    // BareClient sends the request over the same relay the proxy uses, so the
    // visitor's browser never talks to the search engine directly.
    const client = new BareClient();
    const response = await client.fetch(
      `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
      {
        signal,
      },
    );
    if (!response.ok) return [];

    const data = JSON.parse(await response.text());
    return Array.isArray(data?.[1]) ? data[1].slice(0, 4) : [];
  } catch {
    return [];
  }
}
