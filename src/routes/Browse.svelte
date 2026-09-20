<script>
  import {
    ChevronLeft,
    ChevronRight,
    RotateCw,
    Lock,
    Star,
    Maximize,
    ExternalLink,
    Code,
    Ellipsis,
  } from "@lucide/svelte";
  import { tabs, activeTab, updateTab, closeTab } from "../lib/stores/tabs.js";
  import { favorites, isUrlFavorite, toggleUrlFavorite } from "../lib/stores/favorites.js";
  import { history, removeVisit, clearHistory } from "../lib/stores/history.js";
  import { settings } from "../lib/stores/settings.js";
  import { domainOf, toTarget, SEARCH_ENGINES } from "../lib/url.js";
  import { openInput, openSuggestion } from "../lib/open.js";
  import { frames } from "../components/TabLayer.svelte";
  import SearchField from "../components/SearchField.svelte";
  import EnginePopover from "../components/EnginePopover.svelte";
  import Popover from "../components/Popover.svelte";
  import HistorySheet from "../components/HistorySheet.svelte";

  let tab = $derived($activeTab);
  let editing = $state(false);
  let address = $state("");
  let addressInput = $state(null);
  let engineBtn = $state(null);
  let engineOpen = $state(false);
  let moreBtn = $state(null);
  let moreOpen = $state(false);
  let historyOpen = $state(false);

  let bookmarked = $derived(tab ? isUrlFavorite($favorites, tab.url) : false);

  const frame = () => (tab ? $frames[tab.id] : null);

  function reloadTab(patch = {}) {
    if (!tab) return;
    updateTab(tab.id, { status: "loading", error: null, nonce: (tab.nonce ?? 0) + 1, ...patch });
  }

  function go(value) {
    if (!tab) return;
    const target = toTarget(value, SEARCH_ENGINES[$settings.searchEngine] || SEARCH_ENGINES.google);
    editing = false;
    reloadTab({ url: target, title: domainOf(target) });
  }

  function startEditing() {
    address = tab?.url ?? "";
    editing = true;
    queueMicrotask(() => {
      addressInput?.focus();
      addressInput?.select();
    });
  }

  function historyGo(delta) {
    try {
      frame()?.contentWindow?.history?.go(delta);
    } catch {
      /* cross-origin frame states can throw; ignore */
    }
  }

  function fullscreen() {
    frame()?.parentElement?.requestFullscreen?.();
  }

  function popOut() {
    const src = frame()?.src;
    if (!src) return;
    const win = window.open("about:blank", "_blank");
    if (!win) return;
    const doc = win.document;
    doc.title = tab?.title ?? "SlowGuardian";
    doc.body.style.margin = "0";
    const el = doc.createElement("iframe");
    el.src = new URL(src, location.origin).href;
    el.style.cssText = "position:fixed;inset:0;border:0;width:100%;height:100%";
    doc.body.appendChild(el);
  }

  function devTools() {
    const win = frame()?.contentWindow;
    if (!win) return;
    try {
      if (win.eruda) return win.eruda.destroy();
      const script = win.document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.onload = () => win.eruda?.init();
      win.document.body.appendChild(script);
    } catch {
      /* the frame blocked script injection */
    }
  }

  function openFromHistory(item) {
    historyOpen = false;
    if (!tab) return;
    reloadTab({ url: item.url, title: item.title });
  }

  async function copyLink() {
    if (tab?.url) await navigator.clipboard?.writeText(tab.url).catch(() => {});
    moreOpen = false;
  }
</script>

{#if tab}
  <div class="bar">
    <button class="btn" aria-label="Back" onclick={() => historyGo(-1)}>
      <ChevronLeft size={18} strokeWidth={1.75} />
    </button>
    <button class="btn" aria-label="Forward" onclick={() => historyGo(1)}>
      <ChevronRight size={18} strokeWidth={1.75} />
    </button>
    <button class="btn" aria-label="Reload" onclick={() => reloadTab()}>
      <RotateCw size={18} strokeWidth={1.75} />
    </button>

    <div class="addr" class:editing>
      {#if editing}
        <form
          onsubmit={(e) => {
            e.preventDefault();
            go(address);
          }}
        >
          <input
            bind:this={addressInput}
            bind:value={address}
            type="text"
            aria-label="Address"
            spellcheck="false"
            autocomplete="off"
            onblur={() => (editing = false)}
          />
        </form>
      {:else}
        <button class="domain" onclick={startEditing}>
          {#if tab.url.startsWith("https://")}<Lock size={14} strokeWidth={1.75} class="lock" />{/if}
          {domainOf(tab.url)}
        </button>
      {/if}

      <button class="engine" bind:this={engineBtn} onclick={() => (engineOpen = !engineOpen)}>
        <i class:live={tab.status !== "error"}></i>
        {tab.engine === "uv" ? "UV" : "Scramjet"} · {$settings.relay}
      </button>

      {#if tab.status === "loading"}<span class="load"></span>{/if}
    </div>

    <button
      class="btn"
      class:saved={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this site"}
      aria-pressed={bookmarked}
      title={bookmarked ? "Remove bookmark" : "Bookmark this site"}
      onclick={() => toggleUrlFavorite({ url: tab.url, title: tab.title, favicon: tab.favicon })}
    >
      <Star size={18} strokeWidth={1.75} fill={bookmarked ? "currentColor" : "none"} />
    </button>
    <button class="btn" aria-label="Fullscreen" onclick={fullscreen}>
      <Maximize size={18} strokeWidth={1.75} />
    </button>
    <button class="btn" aria-label="Open in a new window" onclick={popOut}>
      <ExternalLink size={18} strokeWidth={1.75} />
    </button>
    <button class="btn" aria-label="Developer tools" onclick={devTools}>
      <Code size={18} strokeWidth={1.75} />
    </button>
    <button class="btn" aria-label="More" bind:this={moreBtn} onclick={() => (moreOpen = !moreOpen)}>
      <Ellipsis size={18} strokeWidth={1.75} />
    </button>
  </div>

  <EnginePopover
    open={engineOpen}
    anchor={engineBtn}
    {tab}
    onclose={() => (engineOpen = false)}
    onchange={({ engine }) => reloadTab(engine ? { engine } : {})}
  />

  <Popover open={moreOpen} anchor={moreBtn} onclose={() => (moreOpen = false)} width={220} label="Tab menu">
    <button
      class="menu"
      onclick={() => {
        historyOpen = true;
        moreOpen = false;
      }}
    >
      History
    </button>
    <button class="menu" onclick={copyLink}>Copy link</button>
    <button
      class="menu"
      onclick={() => {
        closeTab(tab.id);
        moreOpen = false;
      }}
    >
      Close tab
    </button>
  </Popover>
  <HistorySheet
    open={historyOpen}
    onclose={() => (historyOpen = false)}
    onopen={openFromHistory}
  />
{:else}
  <div class="empty">
    <div class="inner">
      <h1 class="title">No tabs open</h1>
      <p class="sub">Search for a site, or open something from Games and Apps.</p>
      <div class="field"><SearchField variant="solid" autofocus onsubmit={openInput} onpick={openSuggestion} /></div>
    </div>
  </div>
{/if}

<style>
  .bar {
    position: fixed;
    top: var(--nav-h);
    left: 0;
    right: 0;
    height: var(--bar-h);
    background: var(--s1);
    box-shadow: inset 0 -1px 0 var(--line);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 20px;
    z-index: 40;
  }

  .btn {
    width: 34px;
    height: 34px;
    border-radius: var(--r-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c7c7cc;
    flex-shrink: 0;
    transition: background var(--dur-fast);
  }

  .btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: var(--t1);
  }

  .btn:disabled {
    color: #4a4a4e;
    cursor: default;
  }

  .btn.saved {
    color: var(--accent);
  }

  .addr {
    position: relative;
    flex: 1;
    margin: 0 8px;
    height: 34px;
    border-radius: var(--r-md);
    background: var(--s2);
    box-shadow: inset 0 0 0 1px var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    overflow: hidden;
  }

  .addr.editing {
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  .addr form {
    width: 100%;
    height: 100%;
  }

  .addr input {
    width: 100%;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 0 14px;
    font-size: 14px;
  }

  .domain {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    padding: 0 120px 0 14px;
    color: var(--t1);
  }

  .domain :global(.lock) {
    color: var(--t3);
  }

  .engine {
    position: absolute;
    right: 5px;
    height: 24px;
    padding: 0 10px;
    border-radius: 7px;
    background: var(--s3);
    font-size: 12px;
    color: #c7c7cc;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  .engine:hover {
    background: #3a3a3e;
    color: var(--t1);
  }

  .engine i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ff453a;
  }

  .engine i.live {
    background: #30d158;
  }

  .load {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
    width: 30%;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
    animation: sg-load 1.1s var(--ease) infinite;
  }

  .menu {
    display: block;
    width: 100%;
    text-align: left;
    padding: 9px 10px;
    border-radius: var(--r-sm);
    font-size: 13.5px;
  }

  .menu:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .empty {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--nav-h) var(--gutter) 0;
  }

  .inner {
    width: min(620px, 100%);
    text-align: center;
  }

  .title {
    font-size: 34px;
    font-weight: 650;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .sub {
    color: var(--t3);
    margin: 10px 0 0;
  }

  .field {
    margin-top: 26px;
    text-align: left;
  }
</style>
