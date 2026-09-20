<script>
  import { X, Globe, Trash2 } from "@lucide/svelte";
  import { fade, fly } from "svelte/transition";
  import { history, removeVisit, clearHistory } from "../lib/stores/history.js";
  import { settings } from "../lib/stores/settings.js";
  import { domainOf } from "../lib/url.js";
  import { reducedMotion } from "../lib/motion.js";

  let { open = false, onclose, onopen } = $props();

  let query = $state("");
  let items = $derived(
    ($history || []).filter((item) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return (item.title || "").toLowerCase().includes(needle) || item.url.toLowerCase().includes(needle);
    }),
  );

  function when(at) {
    const mins = Math.round((Date.now() - at) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(at).toLocaleDateString();
  }

  $effect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && onclose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
</script>

{#if open}
  <div
    class="scrim"
    role="button"
    tabindex="-1"
    aria-label="Close history"
    onclick={onclose}
    onkeydown={(e) => e.key === "Enter" && onclose?.()}
    transition:fade={{ duration: $reducedMotion ? 1 : 160 }}
  ></div>

  <aside
    class="sheet"
    role="dialog"
    aria-label="History"
    transition:fly={{ x: $reducedMotion ? 0 : 340, duration: $reducedMotion ? 1 : 260 }}
  >
    <header>
      <h2>History</h2>
      <button class="icon" aria-label="Close history" onclick={onclose}><X size={18} strokeWidth={1.9} /></button>
    </header>

    <input bind:value={query} type="search" placeholder="Search history" aria-label="Search history" />

    {#if !$settings.saveHistory}
      <p class="note">History is switched off in Settings, so nothing new is being saved.</p>
    {/if}

    <div class="list">
      {#each items as item (item.url)}
        <div class="item">
          <button class="go" onclick={() => onopen?.(item)}>
            {#if item.favicon}
              <img src={item.favicon} alt="" />
            {:else}
              <Globe size={15} strokeWidth={1.75} />
            {/if}
            <span class="meta">
              <b>{item.title}</b>
              <small>{domainOf(item.url)} · {when(item.at)}</small>
            </span>
          </button>
          <button class="icon" aria-label="Forget {item.title}" onclick={() => removeVisit(item.url)}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      {:else}
        <p class="note">{query ? "Nothing matches." : "Nothing here yet."}</p>
      {/each}
    </div>

    {#if $history.length}
      <footer>
        <button class="pill-btn" onclick={clearHistory}><Trash2 size={14} strokeWidth={1.9} /> Clear all</button>
      </footer>
    {/if}
  </aside>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 90;
    border: 0;
  }

  .sheet {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(380px, 92vw);
    background: var(--s1);
    box-shadow: -20px 0 60px rgba(0, 0, 0, 0.5);
    z-index: 91;
    display: flex;
    flex-direction: column;
    padding: 18px;
    gap: 12px;
  }

  header {
    display: flex;
    align-items: center;
  }

  h2 {
    font-size: 20px;
    font-weight: 650;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .icon {
    margin-left: auto;
    width: 30px;
    height: 30px;
    border-radius: var(--r-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--t3);
    flex-shrink: 0;
  }

  .icon:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--t1);
  }

  input {
    height: 34px;
    border-radius: var(--r-sm);
    border: 0;
    outline: 0;
    background: var(--s3);
    padding: 0 12px;
    font-size: 14px;
  }

  input:focus-visible {
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  .list {
    flex: 1;
    overflow-y: auto;
    margin: 0 -6px;
  }

  .item {
    display: flex;
    align-items: center;
    border-radius: var(--r-sm);
    padding-right: 4px;
  }

  .item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .go {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 8px;
    text-align: left;
    color: var(--t3);
  }

  .go img {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .meta {
    min-width: 0;
  }

  .meta b {
    display: block;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--t1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta small {
    font-size: 12px;
  }

  .note {
    color: var(--t3);
    font-size: 13.5px;
    padding: 8px;
    margin: 0;
  }

  footer {
    border-top: 1px solid var(--line);
    padding-top: 12px;
  }
</style>
