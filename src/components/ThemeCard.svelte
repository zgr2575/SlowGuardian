<script>
  let { theme, selected = false, onselect } = $props();
</script>

<button class="th" class:on={selected} aria-pressed={selected} onclick={onselect}>
  <span class="img" style="background-image:url({theme.thumb})">
    <span class="wm"><span style="color:{theme.accent}">Slow</span>Guardian</span>
    <span class="bar"></span>
  </span>
  <span class="meta">
    <i style="background:{theme.accent}"></i>
    {theme.name}
    {#if theme.id === "alpine"}<span class="tag">Default</span>{/if}
  </span>
</button>

<style>
  .th {
    border-radius: var(--r-lg);
    overflow: hidden;
    background: var(--s1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
    text-align: left;
    display: block;
    width: 100%;
    transition:
      box-shadow var(--dur) var(--ease),
      transform var(--dur) var(--ease);
  }

  .th:hover {
    transform: translateY(-2px);
  }

  .th.on {
    box-shadow: 0 0 0 2px var(--accent);
  }

  .img {
    display: block;
    height: 116px;
    background-size: cover;
    background-position: center;
    position: relative;
  }

  .wm {
    position: absolute;
    left: 0;
    right: 0;
    top: 38px;
    text-align: center;
    font-size: 18px;
    font-weight: 650;
    letter-spacing: -0.02em;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
  }

  .bar {
    position: absolute;
    left: 30%;
    right: 30%;
    top: 66px;
    height: 12px;
    border-radius: 4px;
    background: rgba(22, 22, 24, 0.65);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .meta i {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .tag {
    margin-left: auto;
    font-size: 12px;
    color: var(--t3);
    font-weight: 500;
  }
</style>
