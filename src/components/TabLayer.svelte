<script module>
  import { writable } from "svelte/store";
  // id -> iframe element, so the toolbar can drive the active frame.
  export const frames = writable({});
</script>

<script>
  import { route } from "../lib/router.js";
  import { settings, updateSettings } from "../lib/stores/settings.js";
  import { tabs, updateTab } from "../lib/stores/tabs.js";
  import { domainOf } from "../lib/url.js";
  import { initProxy, proxiedUrl, decodeProxied } from "../lib/proxy/index.js";

  let elements = $state({});
  const loadedKeys = new Map();
  let relayInUse = $state($settings.relay);

  const keyFor = (tab, relay) => `${tab.url}|${tab.engine}|${relay}|${tab.nonce ?? 0}`;

  async function load(tab, relay) {
    const frame = elements[tab.id];
    if (!frame) return;

    try {
      await initProxy(relay);
      relayInUse = relay;
    } catch (error) {
      console.error("[SlowGuardian] relay failed", { relay }, error);
      updateTab(tab.id, {
        status: "error",
        error: error?.name === "ProxyUnsupportedError" ? "unsupported" : "relay",
      });
      return;
    }

    try {
      frame.src = await proxiedUrl(tab.url, tab.engine);
    } catch (error) {
      console.error("[SlowGuardian] engine failed", { url: tab.url, engine: tab.engine }, error);
      updateTab(tab.id, { status: "error", error: "engine" });
    }
  }

  $effect(() => {
    const relay = $settings.relay;
    for (const tab of $tabs.list) {
      const isActive = tab.id === $tabs.activeId;
      if (tab.status === "idle" && !isActive) continue;
      const key = keyFor(tab, relay);
      if (loadedKeys.get(tab.id) === key) continue;
      loadedKeys.set(tab.id, key);
      if (tab.status !== "loading") updateTab(tab.id, { status: "loading", error: null });
      load(tab, relay);
    }
    for (const id of [...loadedKeys.keys()]) {
      if (!$tabs.list.some((t) => t.id === id)) loadedKeys.delete(id);
    }
    frames.set(elements);
  });

  // The frame navigated: mirror where it ended up back into the tab.
  function onFrameLoad(tab) {
    const frame = elements[tab.id];
    if (!frame) return;

    let href = null;
    try {
      href = frame.contentWindow?.location?.href ?? null;
    } catch {
      href = null;
    }
    if (!href || href === "about:blank") return;

    const patch = { status: "ready", error: null };
    const decoded = decodeProxied(href);

    if (decoded) {
      patch.url = decoded.url;
      patch.engine = decoded.engine;
      // Record the new key so mirroring the URL does not trigger another load.
      loadedKeys.set(tab.id, keyFor({ ...tab, url: decoded.url, engine: decoded.engine }, relayInUse));
      try {
        const doc = frame.contentDocument;
        patch.title = (doc?.title || domainOf(decoded.url)).slice(0, 120);
        patch.favicon = doc?.querySelector("link[rel~='icon' i]")?.href || null;
      } catch {
        patch.title = domainOf(decoded.url);
      }
    }

    updateTab(tab.id, patch);
  }

  function retry(tab) {
    loadedKeys.delete(tab.id);
    updateTab(tab.id, { status: "loading", error: null, nonce: (tab.nonce ?? 0) + 1 });
  }

  function switchRelay(tab) {
    const next = $settings.relay === "bare" ? "wisp" : "bare";
    loadedKeys.delete(tab.id);
    updateSettings({ relay: next });
    updateTab(tab.id, { status: "loading", error: null, nonce: (tab.nonce ?? 0) + 1 });
  }

  function switchEngine(tab) {
    const next = tab.engine === "uv" ? "scramjet" : "uv";
    loadedKeys.delete(tab.id);
    updateTab(tab.id, { engine: next, status: "loading", error: null, nonce: (tab.nonce ?? 0) + 1 });
  }
</script>

<div class="layer" class:shown={$route.name === "browse"} aria-hidden={$route.name !== "browse"}>
  {#each $tabs.list as tab (tab.id)}
    <div class="slot" class:active={tab.id === $tabs.activeId}>
      <iframe
        bind:this={elements[tab.id]}
        title={tab.title}
        onload={() => onFrameLoad(tab)}
        allow="fullscreen; autoplay; clipboard-read; clipboard-write; gamepad"
      ></iframe>

      {#if tab.status === "error"}
        <div class="error">
          {#if tab.error === "unsupported"}
            <h2>This browser won't run the proxy</h2>
            <p>
              SlowGuardian needs a service worker, which this browser blocks here — most often a private or
              incognito window. Try a normal window.
            </p>
          {:else if tab.error === "engine"}
            <h2>{tab.engine === "uv" ? "Ultraviolet" : "Scramjet"} didn't start</h2>
            <p>The proxy engine failed to set itself up for this tab. The other engine usually works.</p>
            <div class="actions">
              <button class="btn-primary" onclick={() => retry(tab)}>Retry</button>
              <button class="pill-btn" onclick={() => switchEngine(tab)}>
                Switch to {tab.engine === "uv" ? "Scramjet" : "Ultraviolet"}
              </button>
            </div>
          {:else}
            <h2>Couldn't reach the relay</h2>
            <p>The proxy relay didn't answer. It may be waking up, or blocked on this network.</p>
            <div class="actions">
              <button class="btn-primary" onclick={() => retry(tab)}>Retry</button>
              <button class="pill-btn" onclick={() => switchRelay(tab)}>
                Switch to {$settings.relay === "bare" ? "wisp" : "bare"}
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .layer {
    position: fixed;
    top: calc(var(--nav-h) + var(--bar-h));
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    background: var(--bg);
    visibility: hidden;
    pointer-events: none;
  }

  /* Hidden, never unmounted: tabs keep running while you browse the rest of the site. */
  .layer.shown {
    visibility: visible;
    pointer-events: auto;
  }

  .slot {
    position: absolute;
    inset: 0;
    visibility: hidden;
  }

  .slot.active {
    visibility: visible;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
    background: #fff;
    color-scheme: normal;
  }

  .error {
    position: absolute;
    inset: 0;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 24px;
  }

  .error h2 {
    font-size: 26px;
    font-weight: 650;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .error p {
    color: var(--t3);
    max-width: 46ch;
    margin: 10px 0 0;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 22px;
    align-items: center;
  }
</style>
