// A visitor's own wallpaper, kept in IndexedDB because images are far too big for
// localStorage. Nothing leaves the browser.
const DB = "sg-media";
const STORE = "files";
const KEY = "wallpaper";

function withStore(mode, run) {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return resolve(null);
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE))
        request.result.createObjectStore(STORE);
    };
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE, mode);
      const op = run(tx.objectStore(STORE));
      tx.oncomplete = () => {
        db.close();
        resolve(op?.result ?? null);
      };
      tx.onerror = () => {
        db.close();
        resolve(null);
      };
    };
  });
}

export const saveWallpaper = (blob) =>
  withStore("readwrite", (store) => store.put(blob, KEY));
export const loadWallpaper = () =>
  withStore("readonly", (store) => store.get(KEY));
export const clearWallpaper = () =>
  withStore("readwrite", (store) => store.delete(KEY));

let objectUrl = null;

/** Applies the stored wallpaper over the theme's, or undoes it. Returns true if applied. */
export async function applyCustomWallpaper(
  enabled,
  root = document.documentElement,
) {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  if (!enabled) {
    root.style.removeProperty("--wallpaper");
    return false;
  }

  const blob = await loadWallpaper();
  if (!blob) return false;

  objectUrl = URL.createObjectURL(blob);
  root.style.setProperty("--wallpaper", `url("${objectUrl}")`);
  return true;
}
