<script>
  import { Check, Trash2, ExternalLink } from "@lucide/svelte";
  import { settings, updateSettings, DEFAULT_SETTINGS } from "../lib/stores/settings.js";
  import { THEMES } from "../lib/stores/themes.js";
  import { history, clearHistory } from "../lib/stores/history.js";
  import { favorites, DEFAULT_FAVORITES } from "../lib/stores/favorites.js";
  import { mylist } from "../lib/stores/mylist.js";
  import { tabs } from "../lib/stores/tabs.js";
  import { CLOAKS, applyCloak, openInAboutBlank } from "../lib/cloak.js";
  import { comboFromEvent, describeCombo } from "../lib/panic.js";
  import { SEARCH_ENGINES } from "../lib/url.js";
  import Chips from "../components/Chips.svelte";
  import ThemeCard from "../components/ThemeCard.svelte";
  import Toggle from "../components/Toggle.svelte";
  import Segmented from "../components/Segmented.svelte";

  const SECTIONS = [
    { id: "appearance", label: "Appearance" },
    { id: "privacy", label: "Privacy & Cloaking" },
    { id: "proxy", label: "Proxy" },
    { id: "search", label: "Search" },
    { id: "keyboard", label: "Keyboard" },
    { id: "about", label: "About" },
  ];

  let section = $state("appearance");
  let recording = $state(false);
  let blankError = $state(null);

  const cloak = $derived($settings.cloak ?? DEFAULT_SETTINGS.cloak);
  const aboutBlank = $derived($settings.aboutBlank ?? DEFAULT_SETTINGS.aboutBlank);
  const panic = $derived($settings.panic ?? DEFAULT_SETTINGS.panic);
  const siteEngines = $derived(Object.entries($settings.siteEngines ?? {}));

  function setCloak(patch) {
    const next = { ...cloak, ...patch };
    updateSettings({ cloak: next });
    applyCloak(next);
  }

  function recordCombo(event) {
    if (!recording) return;
    event.preventDefault();
    const combo = comboFromEvent(event);
    if (!combo) return;
    updateSettings({ panic: { ...panic, keys: combo } });
    recording = false;
  }

  function forgetSite(domain) {
    const next = { ...$settings.siteEngines };
    delete next[domain];
    updateSettings({ siteEngines: next });
  }

  function resetEverything() {
    settings.set({ ...DEFAULT_SETTINGS });
    favorites.set(DEFAULT_FAVORITES);
    history.set([]);
    mylist.set([]);
    tabs.set({ list: [], activeId: null });
    applyCloak(DEFAULT_SETTINGS.cloak);
  }
</script>

<svelte:window onkeydown={recordCombo} />

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
  {:else if section === "privacy"}
    <h2 class="label">Tab disguise</h2>
    <p class="note">What this tab calls itself and which icon it shows.</p>
    <div class="cloaks">
      <button class="cloak" class:on={cloak.preset === "none"} onclick={() => setCloak({ preset: "none" })}>
        <span class="ic none">SG</span>
        None
        {#if cloak.preset === "none"}<Check class="tick" size={15} strokeWidth={2.4} />{/if}
      </button>
      {#each CLOAKS as preset (preset.id)}
        <button class="cloak" class:on={cloak.preset === preset.id} onclick={() => setCloak({ preset: preset.id })}>
          <img class="ic" src={preset.icon} alt="" />
          {preset.label}
          {#if cloak.preset === preset.id}<Check class="tick" size={15} strokeWidth={2.4} />{/if}
        </button>
      {/each}
      <button class="cloak" class:on={cloak.preset === "custom"} onclick={() => setCloak({ preset: "custom" })}>
        <span class="ic none">+</span>
        Custom
        {#if cloak.preset === "custom"}<Check class="tick" size={15} strokeWidth={2.4} />{/if}
      </button>
    </div>

    {#if cloak.preset === "custom"}
      <div class="group">
        <label class="row">
          <span class="text">Tab title</span>
          <input value={cloak.title} placeholder="Home" oninput={(e) => setCloak({ title: e.currentTarget.value })} />
        </label>
        <label class="row">
          <span class="text">Icon URL</span>
          <input value={cloak.icon} placeholder="https://…/favicon.ico" oninput={(e) => setCloak({ icon: e.currentTarget.value })} />
        </label>
      </div>
    {/if}

    <h2 class="label">about:blank</h2>
    <p class="note">
      Runs SlowGuardian inside a blank window wearing the disguise above, then sends this tab to the decoy. Firefox
      blocks this.
    </p>
    <div class="group">
      <div class="row">
        <span class="text">
          Open in about:blank now
          {#if blankError === "firefox"}<small>Firefox won't allow it.</small>
          {:else if blankError === "blocked"}<small>Your browser blocked the popup. Allow popups and try again.</small>{/if}
        </span>
        <button
          class="pill-btn"
          onclick={() => (blankError = openInAboutBlank({ cloak, decoy: aboutBlank.decoy }))}
        >
          Open
        </button>
      </div>
      <Toggle
        label="Do it automatically"
        hint="Every time SlowGuardian is opened in a normal tab"
        checked={aboutBlank.auto}
        onchange={(v) => updateSettings({ aboutBlank: { ...aboutBlank, auto: v } })}
      />
      <label class="row">
        <span class="text">Decoy page<small>Where this tab goes afterwards</small></span>
        <input
          value={aboutBlank.decoy}
          oninput={(e) => updateSettings({ aboutBlank: { ...aboutBlank, decoy: e.currentTarget.value } })}
        />
      </label>
    </div>

    <h2 class="label">History</h2>
    <div class="group">
      <Toggle
        label="Save history"
        hint="Pages you open are remembered in this browser only"
        checked={$settings.saveHistory}
        onchange={(v) => updateSettings({ saveHistory: v })}
      />
      <div class="row">
        <span class="text">Clear history<small>{$history.length} page{$history.length === 1 ? "" : "s"} saved</small></span>
        <button class="pill-btn" onclick={clearHistory}><Trash2 size={14} strokeWidth={1.9} /> Clear</button>
      </div>
    </div>
  {:else if section === "proxy"}
    <h2 class="label">Engine</h2>
    <p class="note">Ultraviolet handles most sites. Scramjet is the fallback when one misbehaves.</p>
    <div class="group">
      <div class="row">
        <span class="text">Default engine</span>
        <Segmented
          label="Default engine"
          options={[
            { id: "uv", label: "Ultraviolet" },
            { id: "scramjet", label: "Scramjet" },
          ]}
          value={$settings.engine}
          onchange={(v) => updateSettings({ engine: v })}
        />
      </div>
      <div class="row">
        <span class="text">Relay<small>Bare is plain HTTP; wisp keeps one connection open</small></span>
        <Segmented
          label="Relay"
          options={[
            { id: "bare", label: "Bare" },
            { id: "wisp", label: "Wisp" },
          ]}
          value={$settings.relay}
          onchange={(v) => updateSettings({ relay: v })}
        />
      </div>
    </div>

    <h2 class="label">Sites you set by hand</h2>
    <div class="group">
      {#if siteEngines.length}
        {#each siteEngines as [domain, engine] (domain)}
          <div class="row">
            <span class="text">{domain}<small>{engine === "uv" ? "Ultraviolet" : "Scramjet"}</small></span>
            <button class="pill-btn" onclick={() => forgetSite(domain)}>Forget</button>
          </div>
        {/each}
      {:else}
        <div class="row empty">Nothing yet. Use the engine chip in the browser toolbar to set one.</div>
      {/if}
    </div>
  {:else if section === "search"}
    <h2 class="label">Search engine</h2>
    <p class="note">Used by the Home search box and the browser address bar.</p>
    <div class="group">
      {#each Object.keys(SEARCH_ENGINES) as engine (engine)}
        <button class="row pick" onclick={() => updateSettings({ searchEngine: engine })}>
          <span class="text name">{engine}</span>
          {#if $settings.searchEngine === engine}<Check class="tick" size={16} strokeWidth={2.4} />{/if}
        </button>
      {/each}
    </div>
  {:else if section === "keyboard"}
    <h2 class="label">Panic key</h2>
    <p class="note">Leaves for the page below straight away. It works inside proxied pages too.</p>
    <div class="group">
      <div class="row">
        <span class="text">Shortcut</span>
        <button class="pill-btn wide" onclick={() => (recording = !recording)}>
          {recording ? "Press any combination…" : describeCombo(panic.keys) || "Set a shortcut"}
        </button>
      </div>
      <label class="row">
        <span class="text">Panic page</span>
        <input value={panic.url} oninput={(e) => updateSettings({ panic: { ...panic, url: e.currentTarget.value } })} />
      </label>
    </div>

    <h2 class="label">Built in</h2>
    <div class="group">
      <div class="row"><span class="text">New tab</span><kbd>Ctrl + T</kbd></div>
      <div class="row"><span class="text">Focus search</span><kbd>/</kbd></div>
    </div>
  {:else}
    <h2 class="label">About</h2>
    <div class="group">
      <div class="row"><span class="text">Version</span><span class="val">SlowGuardian 11</span></div>
      <div class="row"><span class="text">Engines</span><span class="val">Ultraviolet 3.2.10 · Scramjet 1.1.0</span></div>
      <div class="row"><span class="text">Relays</span><span class="val">bare-server-node 2.0.6 · wisp-js 0.5.0</span></div>
      <div class="row">
        <span class="text">Catalog</span><span class="val">Links checked when this build was made</span>
      </div>
      <a class="row pick" href="https://github.com/zgr2575/SlowGuardian" target="_blank" rel="noreferrer">
        <span class="text name">Source</span><ExternalLink size={15} strokeWidth={1.75} />
      </a>
    </div>

    <h2 class="label">Reset</h2>
    <div class="group">
      <div class="row">
        <span class="text">Clear everything<small>Settings, favorites, history, My List and open tabs</small></span>
        <button class="pill-btn" onclick={resetEverything}><Trash2 size={14} strokeWidth={1.9} /> Reset</button>
      </div>
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
    padding: calc(var(--nav-h) + 44px) var(--gutter) 80px;
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

  .note {
    color: var(--t3);
    font-size: 13.5px;
    margin: -4px 0 12px;
    max-width: 70ch;
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

  .row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    font-size: 14.5px;
    border-bottom: 1px solid #222225;
    width: 100%;
    text-align: left;
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

  .row input {
    margin-left: auto;
    width: min(360px, 55%);
    height: 32px;
    border-radius: var(--r-sm);
    border: 0;
    background: var(--s3);
    padding: 0 12px;
    font-size: 13.5px;
    outline: 0;
  }

  .row input:focus-visible {
    box-shadow: inset 0 0 0 1px var(--accent);
  }

  .row .val {
    margin-left: auto;
    color: var(--t3);
    font-size: 13.5px;
  }

  .row.empty {
    color: var(--t3);
    font-size: 13.5px;
  }

  .pick {
    cursor: pointer;
  }

  .pick:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .pick .name {
    text-transform: capitalize;
  }

  .pick :global(.tick),
  .cloak :global(.tick) {
    margin-left: auto;
    color: var(--accent);
  }

  kbd {
    margin-left: auto;
    font: inherit;
    font-size: 12.5px;
    color: var(--t2);
    background: var(--s3);
    border-radius: 6px;
    padding: 4px 9px;
  }

  .pill-btn {
    margin-left: auto;
    gap: 7px;
  }

  .pill-btn.wide {
    min-width: 190px;
    justify-content: center;
  }

  .cloaks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 10px;
  }

  .cloak {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: var(--r-md);
    background: var(--s1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    font-size: 14px;
    transition: box-shadow var(--dur-fast) var(--ease);
  }

  .cloak:hover {
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
  }

  .cloak.on {
    box-shadow: inset 0 0 0 2px var(--accent);
  }

  .ic {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .ic.none {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--s3);
    font-size: 11px;
    font-weight: 650;
    color: var(--t2);
  }

  @media (max-width: 900px) {
    .themes {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
