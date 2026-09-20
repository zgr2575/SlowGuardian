<script>
  import { Globe, X } from "@lucide/svelte";
  import { grow } from "../lib/motion.js";

  let { tab, active = false, onselect, onclose } = $props();
  let broken = $state(false);
</script>

<div class="chip" class:on={active} class:loading={tab.status === "loading"} transition:grow title={tab.title}>
  <button class="hit" role="tab" aria-selected={active} onclick={onselect}>
    {#if tab.favicon && !broken}
      <img src={tab.favicon} alt="" onerror={() => (broken = true)} />
    {:else}
      <Globe size={15} strokeWidth={1.75} />
    {/if}
    <em>{tab.title}</em>
  </button>
  <button class="x" aria-label="Close {tab.title}" onclick={onclose}>
    <X size={13} strokeWidth={2} />
  </button>
</div>

<style>
  .chip {
    position: relative;
    flex: 0 1 176px;
    min-width: 46px;
    height: 30px;
    border-radius: var(--r-sm);
    background: rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    color: var(--t2);
    font-size: 13px;
    font-weight: 500;
    transition:
      background var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }

  .chip:hover {
    background: rgba(255, 255, 255, 0.13);
    color: var(--t1);
  }

  .chip.on {
    background: rgba(255, 255, 255, 0.18);
    color: var(--t1);
    box-shadow: inset 0 -2px 0 var(--accent);
  }

  .hit {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px 0 10px;
    border-radius: var(--r-sm);
  }

  .hit img {
    width: 15px;
    height: 15px;
    border-radius: 4px;
    flex-shrink: 0;
    object-fit: cover;
  }

  .hit :global(svg) {
    flex-shrink: 0;
    color: var(--t3);
  }

  em {
    font-style: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .x {
    width: 22px;
    height: 22px;
    margin-right: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--t3);
    opacity: 0;
    flex-shrink: 0;
    transition:
      opacity var(--dur-fast),
      background var(--dur-fast);
  }

  .chip:hover .x,
  .chip.on .x,
  .x:focus-visible {
    opacity: 1;
  }

  .x:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--t1);
  }

  .loading::after {
    content: "";
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 0;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: chip-load 1.1s var(--ease) infinite;
  }

  @keyframes chip-load {
    from {
      background-position: -40% 0;
    }
    to {
      background-position: 140% 0;
    }
  }
</style>
