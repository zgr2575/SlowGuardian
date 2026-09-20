<script>
  import { Search, X } from "@lucide/svelte";
  import { fade } from "svelte/transition";
  import { categoriesFor, featuredFor, topFor, filterCatalog, byId } from "../lib/catalog.js";
  import { openEntry } from "../lib/open.js";
  import { mylist } from "../lib/stores/mylist.js";
  import FeatureBand from "./FeatureBand.svelte";
  import Chips from "./Chips.svelte";
  import ChartRow from "./ChartRow.svelte";
  import CatalogGrid from "./CatalogGrid.svelte";

  let { kind, bandHeight, chartTitle, allTitle, action } = $props();

  const categories = categoriesFor(kind);
  const slides = featuredFor(kind);
  const top = topFor(kind);

  let category = $state("all");
  let query = $state("");
  let searchInput = $state(null);

  let results = $derived(filterCatalog(kind, { category, query }));
  let searching = $derived(query.trim().length > 0);
  let saved = $derived($mylist.map((id) => byId(kind, id)).filter(Boolean));
  let chartRows = $derived(Math.max(1, Math.ceil(top.length / 3)));

  $effect(() => {
    const focus = () => searchInput?.focus();
    window.addEventListener("sg:catalog-search", focus);
    return () => window.removeEventListener("sg:catalog-search", focus);
  });
</script>

{#if !searching && category === "all"}
  <FeatureBand {slides} height={bandHeight} onaction={(slide) => openEntry(byId(kind, slide.id))} />
{:else}
  <div class="spacer"></div>
{/if}

<div class="content">
  <div class="filters">
    <Chips items={categories} value={category} onchange={(v) => (category = v)} label="{kind} categories" />
    <div class="search">
      <Search size={17} strokeWidth={1.75} />
      <input
        bind:this={searchInput}
        bind:value={query}
        type="search"
        placeholder="Search {kind}"
        aria-label="Search {kind}"
        autocomplete="off"
        spellcheck="false"
      />
      {#if searching}
        <button aria-label="Clear search" onclick={() => (query = "")}><X size={15} strokeWidth={2} /></button>
      {/if}
    </div>
  </div>

  {#if searching}
    <section in:fade={{ duration: 160 }}>
      <h2 class="sect">{results.length} result{results.length === 1 ? "" : "s"} for “{query.trim()}”</h2>
      {#if results.length}
        <CatalogGrid entries={results} onopen={openEntry} limit={120} />
      {:else}
        <p class="empty">Nothing matched. Try a different word, or search the web from Home.</p>
      {/if}
    </section>
  {:else}
    {#if saved.length}
      <section class="shelf">
        <h2 class="sect">My List</h2>
        <CatalogGrid entries={saved} onopen={openEntry} limit={12} />
      </section>
    {/if}

    {#if category === "all"}
      <section class="shelf">
        <h2 class="sect">{chartTitle}</h2>
        <div class="chart" style:grid-template-rows="repeat({chartRows}, auto)">
          {#each top as entry, i (entry.id)}
            <ChartRow
              rank={i + 1}
              icon={entry.icon}
              title={entry.name}
              subtitle={entry.category}
              {action}
              onaction={() => openEntry(entry)}
            />
          {/each}
        </div>
      </section>
    {/if}

    <section class="shelf">
      <h2 class="sect">
        {category === "all" ? allTitle : categories.find((c) => c.id === category)?.label}
        <small>{results.length}</small>
      </h2>
      <CatalogGrid entries={results} onopen={openEntry} limit={72} />
    </section>
  {/if}
</div>

<style>
  .spacer {
    height: var(--nav-h);
  }

  .content {
    padding: 14px var(--gutter) 70px;
  }

  .filters {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  .search {
    margin-left: auto;
    height: 34px;
    min-width: 220px;
    border-radius: 9px;
    background: var(--s2);
    box-shadow: inset 0 0 0 1px var(--line);
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    color: var(--t3);
    transition: box-shadow var(--dur-fast) var(--ease);
  }

  .search:focus-within {
    box-shadow: inset 0 0 0 1px var(--accent);
    color: var(--t1);
  }

  .search input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 14px;
  }

  .search input::-webkit-search-cancel-button {
    display: none;
  }

  .shelf {
    margin-top: 34px;
  }

  .sect small {
    margin-left: 10px;
    font-size: 14px;
    color: var(--t3);
    font-weight: 500;
  }

  .chart {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-flow: column;
    column-gap: 36px;
    margin-top: 12px;
  }

  .empty {
    color: var(--t3);
    margin-top: 16px;
  }

  @media (max-width: 1100px) {
    .chart {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 720px) {
    .chart {
      grid-template-columns: 1fr;
      grid-auto-flow: row;
      grid-template-rows: none !important;
    }
    .search {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
