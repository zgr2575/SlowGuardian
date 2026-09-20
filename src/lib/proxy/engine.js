import { xorEncode, xorDecode } from "./codec.js";

export const ENGINES = {
  uv: { id: "uv", label: "Ultraviolet", prefix: "/uv/service/" },
  scramjet: { id: "scramjet", label: "Scramjet", prefix: "/scram/service/" },
};

let scramjetPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing)
      return existing.dataset.loaded
        ? resolve()
        : existing.addEventListener("load", resolve);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(script);
  });
}

// An older SlowGuardian (or anything else) may have created the "$scramjet" database at
// version 1 with no object stores. Scramjet opens that same version, so its upgrade
// never runs again and every write fails. Drop the broken database so it is rebuilt.
async function repairScramjetDatabase() {
  if (!globalThis.indexedDB?.databases) return;
  try {
    const exists = (await indexedDB.databases()).some(
      (db) => db.name === "$scramjet",
    );
    if (!exists) return;

    const healthy = await new Promise((resolve) => {
      const request = indexedDB.open("$scramjet");
      request.onsuccess = () => {
        const ok = request.result.objectStoreNames.contains("config");
        request.result.close();
        resolve(ok);
      };
      request.onerror = () => resolve(true);
      request.onblocked = () => resolve(true);
    });
    if (healthy) return;

    await new Promise((resolve) => {
      const remove = indexedDB.deleteDatabase("$scramjet");
      remove.onsuccess = remove.onerror = remove.onblocked = resolve;
    });
  } catch {
    // Storage is unavailable here; Scramjet will surface its own failure.
  }
}

// Scramjet is only pulled in when a tab actually asks for it.
export function getScramjet() {
  scramjetPromise ??= (async () => {
    await repairScramjetDatabase();
    if (!globalThis.$scramjetLoadController)
      await loadScript("/scram/scramjet.all.js");
    const { ScramjetController } = globalThis.$scramjetLoadController();
    const controller = new ScramjetController({
      prefix: ENGINES.scramjet.prefix,
      files: {
        all: "/scram/scramjet.all.js",
        sync: "/scram/scramjet.sync.js",
        wasm: "/scram/scramjet.wasm.wasm",
      },
    });
    await controller.init();
    return controller;
  })();
  return scramjetPromise;
}

export async function proxiedUrl(target, engine) {
  if (engine === "scramjet") return (await getScramjet()).encodeUrl(target);
  return ENGINES.uv.prefix + xorEncode(target);
}

// Turn a proxied frame location back into the site the visitor is actually on.
export function decodeProxied(href) {
  let path;
  try {
    const url = new URL(href);
    path = url.pathname + url.search;
  } catch {
    return null;
  }
  for (const { id, prefix } of Object.values(ENGINES)) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    try {
      return {
        engine: id,
        url: id === "uv" ? xorDecode(rest) : decodeURIComponent(rest),
      };
    } catch {
      return null;
    }
  }
  return null;
}
