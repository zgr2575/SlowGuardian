// public/boot.js — client bootstrap.
// Requires /scram/scramjet.all.js and /baremux/index.js loaded first (see index.html).
"use strict";

const statusEl = document.getElementById("status");
const setStatus = (m) => {
  statusEl.textContent = m;
  console.log("[boot]", m);
};

// 1) Scramjet controller — prefix must match sw.js scramjet.route() (default "/scramjet/").
const { ScramjetController } = $scramjetLoadController();
const scramjet = new ScramjetController({
  prefix: "/scramjet/",
  files: {
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js",
    wasm: "/scram/scramjet.wasm.wasm",
  },
});
scramjet.init(); // publishes the shared config the SW reads via loadConfig()

// 2) bare-mux connection (SharedWorker transport multiplexer).
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

async function registerSW() {
  if (!navigator.serviceWorker) {
    const local = ["localhost", "127.0.0.1"].includes(location.hostname);
    if (location.protocol !== "https:" && !local) {
      throw new Error("Service workers require https (or localhost).");
    }
    throw new Error("Service workers unsupported in this browser.");
  }
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
}

// 3) Point bare-mux at the epoxy transport over the same-origin /wisp/ endpoint.
//    Epoxy's option key is { wisp } (libcurl would be { websocket }).
async function setEpoxyTransport() {
  const wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
  if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
    await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
  }
}

// 4) Encode + navigate inside a child iframe (keeps the SW controlling the view).
let frame;
async function open(url) {
  setStatus("registering service worker…");
  await registerSW();
  setStatus("setting epoxy transport…");
  await setEpoxyTransport();
  if (!frame) {
    frame = scramjet.createFrame();
    frame.frame.id = "sj-frame";
    document.getElementById("frame-container").appendChild(frame.frame);
  }
  setStatus("navigating: " + url);
  frame.go(url); // internally scramjet.encodeUrl(url) + points the iframe at the prefix
}

document.getElementById("f").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = document.getElementById("url").value.trim();
  if (!raw) return;
  let url;
  try {
    url = new URL(raw).toString();
  } catch {
    url = "https://" + raw;
  }
  open(url).catch((err) => setStatus("error: " + ((err && err.message) || String(err))));
});

// Eagerly register the SW + set the transport on load, so the service worker is
// already active and controlling before the first navigation (and so registration
// isn't blocked behind a user gesture). registerSW()/setEpoxyTransport() are idempotent.
registerSW()
  .then(setEpoxyTransport)
  .then(() => setStatus("ready — enter a URL and press Go"))
  .catch((err) => setStatus("init error: " + ((err && err.message) || String(err))));
