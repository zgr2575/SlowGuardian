import { writable } from "svelte/store";

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// A writable store that mirrors itself into localStorage. When storage is blocked
// (private windows, quota, policy) it keeps working in memory and reports
// `available = false` instead of throwing.
export function persisted(key, initial, { version, migrate } = {}) {
  let value = read(key);
  if (value === undefined) value = initial;
  else if (version !== undefined && value?.v !== version)
    value = migrate ? migrate(value) : initial;

  const store = writable(value);
  const api = {
    subscribe: store.subscribe,
    available: true,
    set(next) {
      store.set(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
        api.available = true;
      } catch {
        api.available = false;
      }
    },
    update(fn) {
      let next;
      store.update((cur) => (next = fn(cur)));
      api.set(next);
    },
  };
  return api;
}
