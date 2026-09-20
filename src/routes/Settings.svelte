<script>
  import { settings, updateSettings } from "../lib/stores/settings.js";
  import { THEMES } from "../lib/stores/themes.js";
  import Chips from "../components/Chips.svelte";
  import ThemeCard from "../components/ThemeCard.svelte";
  import Toggle from "../components/Toggle.svelte";

  const SECTIONS = [
    { id: "appearance", label: "Appearance" },
    { id: "privacy", label: "Privacy & Cloaking" },
    { id: "proxy", label: "Proxy" },
    { id: "search", label: "Search" },
    { id: "keyboard", label: "Keyboard" },
    { id: "about", label: "About" },
  ];

  let section = $state("appearance");
</script>

<div class="glow"></div>
<div class="glow-fade"></div>

<div class="wrap">
  <h1 class="h1">Settings</h1>
  <div class="sections">
    <Chips items={SECTIONS} value={section} onchange={(v) => (section = v)} label="Settings sections" />
  </div>

  {#if section === "appearance"}
    <h2 class="label">Theme</h2>
    <div class="themes">
      {#each THEMES as theme (theme.id)}
        <ThemeCard {theme} selected={$settings.theme === theme.id} onselect={() => updateSettings({ theme: theme.id })} />
      {/each}
    </div>

    <h2 class="label">Options</h2>
    <div class="group">
      <Toggle
        label="Rotate themes"
        hint="Use a different theme each time you open SlowGuardian"
        checked={$settings.rotateThemes}
        onchange={(v) => updateSettings({ rotateThemes: v })}
      />
      <Toggle
        label="Reduce motion"
        hint="Turns off wallpaper fades and card animations"
        checked={$settings.reduceMotion}
        onchange={(v) => updateSettings({ reduceMotion: v })}
      />
      <Toggle
        label="Show favorites on Home"
        checked={$settings.showFavorites}
        onchange={(v) => updateSettings({ showFavorites: v })}
      />
    </div>
  {:else}
    <div class="group">
      <div class="soon">This section arrives later in the v11 update.</div>
    </div>
  {/if}
</div>

<style>
  .glow {
    position: absolute;
    left: -10%;
    right: -10%;
    top: -260px;
    height: 700px;
    background-image: var(--wallpaper);
    background-size: cover;
    background-position: center;
    filter: blur(110px) saturate(1.25);
    opacity: 0.38;
    transition: opacity var(--dur-slow) var(--ease);
  }

  .glow-fade {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 760px;
    background: linear-gradient(180deg, rgba(10, 10, 11, 0.15) 0%, rgba(10, 10, 11, 0.6) 45%, var(--bg) 85%);
  }

  .wrap {
    position: relative;
    padding: calc(var(--nav-h) + 44px) var(--gutter) 60px;
    max-width: 1180px;
  }

  .sections {
    margin-top: 22px;
  }

  .label {
    font-size: 13px;
    color: var(--t3);
    font-weight: 600;
    margin: 26px 0 10px;
  }

  .themes {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .group {
    background: var(--s1);
    border-radius: var(--r-lg);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .soon {
    padding: 18px;
    color: var(--t3);
    font-size: 14.5px;
  }

  @media (max-width: 900px) {
    .themes {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
