<script>
  let { checked = false, label, hint = "", onchange } = $props();
</script>

<label class="row">
  <span class="text">
    <span>{label}</span>
    {#if hint}<small>{hint}</small>{/if}
  </span>
  <input
    type="checkbox"
    role="switch"
    class="sr-only"
    {checked}
    onchange={(e) => onchange?.(e.currentTarget.checked)}
  />
  <span class="tg" class:on={checked} aria-hidden="true"></span>
</label>

<style>
  .row {
    display: flex;
    align-items: center;
    padding: 14px 18px;
    font-size: 14.5px;
    border-bottom: 1px solid #222225;
    cursor: pointer;
    gap: 16px;
  }

  .row:last-child {
    border-bottom: 0;
  }

  .text small {
    display: block;
    color: var(--t3);
    font-size: 12.5px;
    margin-top: 2px;
  }

  .tg {
    width: 44px;
    height: 26px;
    border-radius: 13px;
    background: #3a3a3c;
    position: relative;
    margin-left: auto;
    flex-shrink: 0;
    transition: background var(--dur) var(--ease);
  }

  .tg::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: transform var(--dur) var(--ease);
  }

  .tg.on {
    background: var(--accent);
  }

  .tg.on::after {
    transform: translateX(18px);
  }

  input:focus-visible + .tg {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>
