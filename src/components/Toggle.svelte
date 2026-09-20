<script>
  let { checked = false, label, hint = "", onchange } = $props();
</script>

<button class="row" role="switch" aria-checked={checked} onclick={() => onchange?.(!checked)}>
  <span class="text">
    <span>{label}</span>
    {#if hint}<small>{hint}</small>{/if}
  </span>
  <span class="tg" class:on={checked} aria-hidden="true"></span>
</button>

<style>
  .row {
    display: flex;
    align-items: center;
    padding: 14px 18px;
    font-size: 14.5px;
    border-bottom: 1px solid #222225;
    gap: 16px;
    width: 100%;
    text-align: left;
  }

  .row:last-child {
    border-bottom: 0;
  }

  .row:hover {
    background: rgba(255, 255, 255, 0.03);
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
</style>
