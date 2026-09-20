import { derived, get } from "svelte/store";
import { persisted } from "./persist.js";
import { domainOf } from "../url.js";

// Restored tabs come back "idle": they only load when they're activated again.
export function restoreTabs(saved) {
  const list = Array.isArray(saved?.list) ? saved.list : [];
  const clean = list
    .filter((t) => t && typeof t.id === "string" && typeof t.url === "string")
    .map((t) => ({ ...t, status: "idle", error: null }));
  const activeId = clean.some((t) => t.id === saved.activeId)
    ? saved.activeId
    : (clean[0]?.id ?? null);
  return { list: clean, activeId };
}

export const tabs = persisted("sg:tabs", { list: [], activeId: null });
tabs.set(restoreTabs(get(tabs)));

export const activeTab = derived(
  tabs,
  ($t) => $t.list.find((t) => t.id === $t.activeId) || null,
);

let counter = 0;
const newId = () => `t${Date.now().toString(36)}${(counter++).toString(36)}`;

export function openTab(url, { engine, activate = true }) {
  const tab = {
    id: newId(),
    url,
    title: domainOf(url),
    favicon: null,
    engine,
    status: "loading",
    error: null,
  };
  tabs.update((s) => ({
    list: [...s.list, tab],
    activeId: activate || !s.activeId ? tab.id : s.activeId,
  }));
  return tab.id;
}

export function closeTab(id) {
  tabs.update((s) => {
    const i = s.list.findIndex((t) => t.id === id);
    if (i < 0) return s;
    const list = s.list.filter((t) => t.id !== id);
    let activeId = s.activeId;
    if (activeId === id)
      activeId = (list[i] || list[i - 1] || null)?.id ?? null;
    return { list, activeId };
  });
}

export function activateTab(id) {
  tabs.update((s) => ({ ...s, activeId: id }));
}

export function updateTab(id, patch) {
  tabs.update((s) => ({
    ...s,
    list: s.list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
  }));
}

export function engineFor(url, settings) {
  return settings.siteEngines?.[domainOf(url)] || settings.engine || "uv";
}
