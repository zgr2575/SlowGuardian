<script>
  let { items, value, onchange, label = "Filter" } = $props();
</script>

<div class="cats" role="tablist" aria-label={label}>
  {#each items as item (item.id)}
    <button role="tab" aria-selected={value === item.id} class:on={value === item.id} onclick={() => onchange?.(item.id)}>
      {item.label}
    </button>
  {/each}
</div>

<style>
  .cats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  button {
    height: 34px;
    padding: 0 15px;
    border-radius: 9px;
    background: var(--s2);
    color: #c7c7cc;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    transition:
      background var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease),
      transform var(--dur-fast) var(--ease);
  }

  button:hover {
    background: #26262a;
    color: var(--t1);
  }

  button:active {
    transform: scale(0.97);
  }

  button.on {
    background: var(--t1);
    color: var(--bg);
  }
</style>
