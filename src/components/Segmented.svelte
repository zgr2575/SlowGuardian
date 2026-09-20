<script>
  let { options, value, onchange, label } = $props();
</script>

<div class="seg" role="radiogroup" aria-label={label}>
  {#each options as option (option.id)}
    <button
      role="radio"
      aria-checked={value === option.id}
      class:on={value === option.id}
      onclick={() => onchange?.(option.id)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .seg {
    display: inline-flex;
    background: var(--s3);
    border-radius: 9px;
    padding: 2px;
    gap: 2px;
    margin-left: auto;
    flex-shrink: 0;
  }

  button {
    height: 28px;
    padding: 0 13px;
    border-radius: 7px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--t2);
    transition:
      background var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }

  button:hover {
    color: var(--t1);
  }

  button.on {
    background: var(--t1);
    color: var(--bg);
    font-weight: 650;
  }
</style>
