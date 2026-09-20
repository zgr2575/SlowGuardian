import { writable } from "svelte/store";

export const ROUTES = {
  "/": "home",
  "/games": "games",
  "/apps": "apps",
  "/browse": "browse",
  "/settings": "settings",
};

// v8 short links keep working.
export const LEGACY = {
  "/g": "/games",
  "/ap": "/apps",
  "/s": "/settings",
  "/p": "/browse",
};

export function resolve(rawPath) {
  let path = (rawPath || "/").split(/[?#]/)[0];
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (LEGACY[path])
    return { name: ROUTES[LEGACY[path]], path: LEGACY[path], redirected: true };
  if (ROUTES[path]) return { name: ROUTES[path], path, redirected: false };
  return { name: "home", path: "/", redirected: true };
}

const initial =
  typeof location !== "undefined" ? resolve(location.pathname) : resolve("/");
if (
  typeof history !== "undefined" &&
  initial.redirected &&
  location.pathname !== initial.path
) {
  history.replaceState(null, "", initial.path);
}

export const route = writable({ name: initial.name, path: initial.path });

export function navigate(path, { replace = false } = {}) {
  const r = resolve(path);
  if (replace) history.replaceState(null, "", r.path);
  else if (location.pathname !== r.path) history.pushState(null, "", r.path);
  route.set({ name: r.name, path: r.path });
  window.scrollTo(0, 0);
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    const r = resolve(location.pathname);
    route.set({ name: r.name, path: r.path });
  });
}

// `use:link` on an <a href="/games"> turns it into an in-app navigation.
export function link(node) {
  const onClick = (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    e.preventDefault();
    navigate(node.getAttribute("href"));
  };
  node.addEventListener("click", onClick);
  return { destroy: () => node.removeEventListener("click", onClick) };
}
