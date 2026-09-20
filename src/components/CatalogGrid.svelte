<script>
  import { flip } from "svelte/animate";
  import { Check, Plus } from "@lucide/svelte";
  import { reducedMotion } from "../lib/motion.js";
  import { mylist, toggleMyList, inMyList } from "../lib/stores/mylist.js";

  let { entries, onopen, limit = 60 } = $props();

  let shown = $derived(entries.slice(0, limit));
</script>

<div class="grid">
  {#each shown as entry (entry.id)}
    <div class="cell" animate:flip={{ duration: $reducedMotion ? 0 : 240 }}>
      <button class="tile" onclick={() => onopen?.(entry)} title={entry.name}>
        {#if entry.icon}
          <img class="art lift" src={entry.icon} alt="" loading="lazy" decoding="async" />
        {:else}
          <span class="art plate lift">{entry.name.slice(0, 1)}</span>
        {/if}
        <b>{entry.name}</b>
        <span>{entry.category}</span>
      </button>
      <button
        class="save"
        aria-label={inMyList($mylist, entry.id) ? `Remove ${entry.name} from My List` : `Add ${entry.name} to My List`}
        aria-pressed={inMyList($mylist, entry.id)}
        onclick={() => toggleMyList(entry.id)}
      >
        {#if inMyList($mylist, entry.id)}<Check size={14} strokeWidth={2.2} />{:else}<Plus size={14} strokeWidth={2.2} />{/if}
      </button>
    </div>
  {/each}
</div>

{#if entries.length > shown.length}
  <p class="more">Showing {shown.length} of {entries.length}. Keep typing to narrow it down.</p>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    gap: 22px 18px;
    margin-top: 16px;
  }

  .cell {
    position: relative;
  }

  .tile {
    display: block;
    width: 100%;
    text-align: left;
  }

  .art {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 16px;
    object-fit: cover;
    background: var(--s2);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  .plate {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: 650;
    color: var(--bg);
    background: var(--accent);
  }

  .tile b {
    display: block;
    font-size: 13.5px;
    font-weight: 600;
    margin-top: 9px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tile span {
    font-size: 12px;
    color: var(--t3);
    text-transform: capitalize;
  }

  .save {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: rgba(10, 10, 11, 0.6);
    backdrop-filter: blur(10px);
    color: var(--t1);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--dur-fast);
  }

  .cell:hover .save,
  .save:focus-visible,
  .save[aria-pressed="true"] {
    opacity: 1;
  }

  .more {
    color: var(--t3);
    font-size: 13.5px;
    margin-top: 20px;
  }
</style>
