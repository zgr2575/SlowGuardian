<script>
  import { Search, Globe, Clock, Star, Gamepad2, LayoutGrid } from "@lucide/svelte";
  import { buildSuggestions, fetchRemoteSuggestions } from "../lib/suggest.js";
  import { favoriteEntries } from "../lib/stores/favorites.js";
  import { history } from "../lib/stores/history.js";
  import { settings } from "../lib/stores/settings.js";

  let {
    placeholder = "Search or enter a website",
    variant = "glass",
    autofocus = false,
    suggest = true,
    onsubmit,
    onpick,
  } = $props();

  let value = $state("");
  let input = $state(null);
  let open = $state(false);
  let active = $state(-1);
  let remote = $state([]);

  let items = $derived(
    suggest && open ? buildSuggestions(value, { favorites: $favoriteEntries, history: $history, remote }) : [],
  );

  const ICONS = { url: Globe, favorite: Star, game: Gamepad2, app: LayoutGrid, history: Clock, search: Search };

  // Ask the search engine for completions, debounced, and only if the visitor left it on.
  $effect(() => {
    const query = value.trim();
    if (!suggest || !query || !$settings.searchSuggestions) {
      remote = [];
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const terms = await fetchRemoteSuggestions(query, { signal: controller.signal });
      if (!controller.signal.aborted) remote = terms;
    }, 220);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  });

  function choose(item) {
    open = false;
    active = -1;
    const submitted = value;
    value = "";
    input?.blur();
    if (item && onpick) return onpick(item);
    onsubmit?.(item ? item.value : submitted);
  }

  function submit(event) {
    event.preventDefault();
    if (active >= 0 && items[active]) return choose(items[active]);
    if (!value.trim()) return;
    choose(null);
  }

  function onKeydown(event) {
    if (!items.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      active = (active + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      active = active <= 0 ? items.length - 1 : active - 1;
    } else if (event.key === "Escape") {
      open = false;
      active = -1;
    }
  }

  $effect(() => {
    const focus = () => input?.focus();
    window.addEventListener("sg:focus-search", focus);
    if (autofocus && !matchMedia("(pointer: coarse)").matches) focus();
    return () => window.removeEventListener("sg:focus-search", focus);
  });
</script>

<div class="wrap">
  <form class="search {variant}" role="search" onsubmit={submit}>
    <Search size={22} strokeWidth={1.75} />
    <input
      bind:this={input}
      bind:value
      type="search"
      {placeholder}
      aria-label={placeholder}
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      enterkeyhint="go"
      aria-autocomplete="list"
      oninput={() => {
        open = true;
        active = -1;
      }}
      onfocus={() => (open = true)}
      onblur={() => setTimeout(() => (open = false), 120)}
      onkeydown={onKeydown}
    />
  </form>

  {#if items.length}
    <ul class="suggestions" role="listbox" aria-label="Suggestions">
      {#each items as item, i (item.type + item.id)}
        {@const Icon = ICONS[item.type] ?? Search}
        <li>
          <button
            role="option"
            aria-selected={i === active}
            class:active={i === active}
            onmouseenter={() => (active = i)}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => choose(item)}
          >
            {#if item.icon}
              <img src={item.icon} alt="" />
            {:else}
              <Icon size={16} strokeWidth={1.75} />
            {/if}
            <span class="label">{item.label}</span>
            <span class="detail">{item.detail}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .wrap {
    position: relative;
    width: 100%;
  }

  .search {
    width: 100%;
    height: 60px;
    border-radius: var(--r-lg);
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 20px;
    color: rgba(245, 245, 247, 0.6);
    transition:
      transform var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease),
      background var(--dur) var(--ease);
  }

  .glass {
    background: rgba(22, 22, 24, 0.62);
    backdrop-filter: blur(22px) saturate(1.4);
    -webkit-backdrop-filter: blur(22px) saturate(1.4);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 20px 60px rgba(0, 0, 0, 0.35);
  }

  .solid {
    background: var(--s2);
    box-shadow: inset 0 0 0 1px var(--line);
  }

  .search:focus-within {
    transform: translateY(-1px);
    color: var(--t1);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 0 0 2px var(--accent),
      0 24px 64px rgba(0, 0, 0, 0.4);
  }

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 18px;
    color: var(--t1);
  }

  input::placeholder {
    color: rgba(245, 245, 247, 0.6);
  }

  input::-webkit-search-cancel-button {
    display: none;
  }

  .suggestions {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    margin: 0;
    padding: 6px;
    list-style: none;
    border-radius: var(--r-lg);
    background: rgba(24, 24, 27, 0.94);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.5),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    z-index: 30;
    animation: sg-pop var(--dur-fast) var(--ease) both;
    transform-origin: top center;
  }

  .suggestions button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 12px;
    border-radius: var(--r-sm);
    font-size: 14.5px;
    color: var(--t1);
    text-align: left;
  }

  .suggestions button.active {
    background: rgba(255, 255, 255, 0.09);
  }

  .suggestions img {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .suggestions :global(svg) {
    color: var(--t3);
    flex-shrink: 0;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .detail {
    margin-left: auto;
    color: var(--t3);
    font-size: 12.5px;
    flex-shrink: 0;
  }
</style>
