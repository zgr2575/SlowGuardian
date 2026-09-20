<script>
  import { Pencil } from "@lucide/svelte";
  import { fade } from "svelte/transition";
  import { settings, updateSettings } from "../lib/stores/settings.js";
  import { THEMES, themeById } from "../lib/stores/themes.js";
  import { reducedMotion } from "../lib/motion.js";
  import { favoriteEntries } from "../lib/stores/favorites.js";
  import { openInput, openEntry } from "../lib/open.js";
  import SearchField from "../components/SearchField.svelte";
  import Popover from "../components/Popover.svelte";
  import ThemeCard from "../components/ThemeCard.svelte";

  let theme = $derived(themeById($settings.theme));

  // Two stacked layers so a theme change crossfades instead of popping.
  let layers = $state([{ key: 0, src: themeById($settings.theme).wallpaper }]);
  let nextKey = 1;

  $effect(() => {
    const src = theme.wallpaper;
    if (layers[layers.length - 1].src === src) return;
    const img = new Image();
    img.src = src;
    const show = () => {
      layers = [...layers, { key: nextKey++, src }];
      setTimeout(() => (layers = layers.slice(-1)), $reducedMotion ? 20 : 950);
    };
    img.decode ? img.decode().then(show).catch(show) : (img.onload = show);
  });

  let customizeBtn = $state(null);
  let customizing = $state(false);
</script>

<div class="home">
  {#each layers as layer (layer.key)}
    <div
      class="wall"
      style:background-image="url({layer.src})"
      in:fade={{ duration: $reducedMotion ? 1 : 900 }}
    ></div>
  {/each}
  <div class="veil"></div>

  <div class="middle">
    <h1 class="wordmark"><span>Slow</span>Guardian</h1>

    <div class="field">
      <SearchField autofocus onsubmit={openInput} />
    </div>
    <p class="hint">Try <b>retro bowl</b>, <b>lofi</b>, or paste a link</p>

    {#if $settings.showFavorites}
      <div class="favs">
        {#each $favoriteEntries as fav (fav.kind + fav.id)}
          <button class="fav" onclick={() => openEntry(fav.entry)}>
            {#if fav.entry.icon}
              <span class="icon lift" style:background-image="url({fav.entry.icon})"></span>
            {:else}
              <span class="icon plate lift">{fav.entry.name.slice(0, 1)}</span>
            {/if}
            {fav.entry.name}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="credit">
    <b>{theme.sub}</b>
    {theme.name} theme
  </div>

  <button class="customize" bind:this={customizeBtn} onclick={() => (customizing = !customizing)}>
    <Pencil size={16} strokeWidth={1.75} />
    Customize
  </button>

  <Popover
    open={customizing}
    anchor={customizeBtn}
    onclose={() => (customizing = false)}
    placement="above"
    width={340}
    label="Choose a theme"
  >
    <div class="picker">
      {#each THEMES as t (t.id)}
        <ThemeCard theme={t} selected={$settings.theme === t.id} onselect={() => updateSettings({ theme: t.id })} />
      {/each}
    </div>
  </Popover>
</div>

<style>
  .home {
    position: relative;
    height: 100vh;
    overflow: hidden;
  }

  .wall {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
  }

  .veil {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 18%),
      radial-gradient(ellipse 60% 45% at 50% 42%, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0) 70%),
      linear-gradient(0deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 26%);
  }

  .middle {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: min(24vh, 190px);
    width: min(700px, calc(100% - 48px));
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .wordmark {
    font-size: 66px;
    font-weight: 650;
    letter-spacing: -0.035em;
    font-stretch: 88%;
    text-shadow: 0 2px 30px rgba(0, 0, 0, 0.35);
    margin: 0;
  }

  .wordmark span {
    color: var(--accent);
    transition: color var(--dur-slow) var(--ease);
  }

  .field {
    width: min(680px, 100%);
    margin-top: 30px;
  }

  .hint {
    font-size: 13.5px;
    color: rgba(245, 245, 247, 0.6);
    margin: 12px 0 0;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
  }

  .hint b {
    color: rgba(245, 245, 247, 0.9);
    font-weight: 500;
  }

  .favs {
    display: flex;
    gap: 24px;
    margin-top: 46px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .fav {
    width: 76px;
    font-size: 12.5px;
    color: rgba(245, 245, 247, 0.88);
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
    text-align: center;
  }

  .fav .plate {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: 650;
    color: var(--bg);
    background: var(--accent);
  }

  .fav .icon {
    display: block;
    width: 76px;
    height: 76px;
    border-radius: var(--r-fav);
    background-size: cover;
    background-position: center;
    margin-bottom: 8px;
    box-shadow:
      0 10px 24px rgba(0, 0, 0, 0.4),
      inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .credit {
    position: absolute;
    left: var(--gutter);
    bottom: 24px;
    font-size: 13px;
    color: rgba(245, 245, 247, 0.75);
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
  }

  .credit b {
    display: block;
    font-weight: 600;
    color: var(--t1);
    font-size: 14px;
  }

  .customize {
    position: absolute;
    right: var(--gutter);
    bottom: 22px;
    height: 38px;
    padding: 0 14px;
    border-radius: var(--r-md);
    background: rgba(22, 22, 24, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    font-weight: 500;
    transition: background var(--dur-fast);
  }

  .customize:hover {
    background: rgba(32, 32, 36, 0.75);
  }

  .picker {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  @media (max-width: 720px) {
    .wordmark {
      font-size: 46px;
    }
    .middle {
      top: 120px;
    }
    .favs {
      gap: 14px;
    }
  }
</style>
