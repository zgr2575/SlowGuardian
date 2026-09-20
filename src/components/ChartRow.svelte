<script>
  let { rank = null, icon, title, subtitle, action = "Play", onaction } = $props();
  let broken = $state(false);
</script>

<div class="ci">
  {#if rank != null}<span class="n">{rank}</span>{/if}
  <button class="art" onclick={onaction} tabindex="-1" aria-hidden="true">
    {#if broken}
      <span class="plate lift">{title.slice(0, 1)}</span>
    {:else}
      <img class="lift" src={icon} alt="" loading="lazy" onerror={() => (broken = true)} />
    {/if}
  </button>
  <div class="meta">
    <b>{title}</b>
    <span>{subtitle}</span>
  </div>
  <button class="pill-btn" onclick={onaction}>{action} <span class="sr-only">{title}</span></button>
</div>

<style>
  .ci {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 11px 0;
    border-bottom: 1px solid var(--line);
  }

  .n {
    width: 18px;
    font-size: 17px;
    font-weight: 650;
    color: var(--t3);
    text-align: right;
    flex-shrink: 0;
  }

  .art {
    flex-shrink: 0;
  }

  .art img,
  .plate {
    width: 56px;
    height: 56px;
    border-radius: 13px;
    object-fit: cover;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  .plate {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 650;
    color: var(--bg);
    background: var(--accent);
  }

  .meta {
    min-width: 0;
  }

  .meta b {
    display: block;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta span {
    font-size: 13px;
    color: var(--t3);
  }

  .pill-btn {
    margin-left: auto;
    flex-shrink: 0;
  }
</style>
