<script>
  import { Check } from "@lucide/svelte";
  import Popover from "./Popover.svelte";
  import { ENGINES } from "../lib/proxy/index.js";
  import { settings, updateSettings } from "../lib/stores/settings.js";
  import { domainOf } from "../lib/url.js";

  let { open = false, anchor = null, tab, onclose, onchange } = $props();

  let domain = $derived(domainOf(tab?.url ?? ""));
  let remember = $state(false);

  function pickEngine(engine) {
    if (remember) {
      updateSettings({ siteEngines: { ...$settings.siteEngines, [domain]: engine } });
    }
    onchange?.({ engine });
    onclose?.();
  }

  function pickRelay(relay) {
    updateSettings({ relay });
    onchange?.({ relay });
    onclose?.();
  }
</script>

<Popover {open} {anchor} {onclose} width={300} label="Engine and relay">
  <div class="head">Engine for this site</div>
  {#each Object.values(ENGINES) as engine (engine.id)}
    <button
      class="row"
      class:sel={tab?.engine === engine.id}
      role="menuitemradio"
      aria-checked={tab?.engine === engine.id}
      onclick={() => pickEngine(engine.id)}
    >
      {engine.label}
      <span>{engine.id === "uv" ? "Default" : "Try if a site breaks"}</span>
      {#if tab?.engine === engine.id}<Check size={16} strokeWidth={2} class="check" />{/if}
    </button>
  {/each}

  <hr />

  <div class="head">Relay <small>applies to all tabs</small></div>
  {#each [["bare", "Bare", "Default"], ["wisp", "Wisp", "Faster on heavy sites"]] as [id, label, note] (id)}
    <button
      class="row"
      class:sel={$settings.relay === id}
      role="menuitemradio"
      aria-checked={$settings.relay === id}
      onclick={() => pickRelay(id)}
    >
      {label}
      <span>{note}</span>
      {#if $settings.relay === id}<Check size={16} strokeWidth={2} class="check" />{/if}
    </button>
  {/each}

  <hr />

  <label class="row remember">
    <input type="checkbox" bind:checked={remember} />
    Remember for {domain}
  </label>
</Popover>

<style>
  .head {
    padding: 8px 10px 6px;
    font-size: 13px;
    color: var(--t3);
    font-weight: 600;
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  .head small {
    font-size: 11.5px;
    font-weight: 500;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border-radius: var(--r-sm);
    width: 100%;
    text-align: left;
    font-size: 13.5px;
  }

  .row:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .row.sel {
    background: rgba(255, 255, 255, 0.07);
  }

  .row span {
    color: var(--t3);
    font-size: 12.5px;
    margin-left: auto;
  }

  .row :global(.check) {
    color: var(--accent);
    flex-shrink: 0;
  }

  .remember {
    color: var(--t3);
    cursor: pointer;
  }

  .remember input {
    accent-color: var(--accent);
  }

  hr {
    border: 0;
    height: 1px;
    background: var(--line);
    margin: 4px 6px;
  }
</style>
