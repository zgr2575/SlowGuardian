<script>
  import { Plus, Settings } from "@lucide/svelte";
  import { route, link, navigate } from "../lib/router.js";
  import { tabs, activateTab, closeTab } from "../lib/stores/tabs.js";
  import TabChip from "./TabChip.svelte";

  let { solid = false } = $props();

  const LINKS = [
    ["/", "home", "Home"],
    ["/games", "games", "Games"],
    ["/apps", "apps", "Apps"],
  ];

  let scrolled = $state(false);
  $effect(() => {
    const onScroll = () => (scrolled = window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });

  function newTab() {
    navigate("/");
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("sg:focus-search")));
  }

  function select(id) {
    activateTab(id);
    navigate("/browse");
  }
</script>

<nav class="nav" class:solid class:scrolled aria-label="Main">
  <a class="wm" href="/" use:link aria-label="SlowGuardian home"><span>Slow</span>Guardian</a>

  {#each LINKS as [href, name, label] (name)}
    <a class="nl" class:on={$route.name === name} {href} use:link aria-current={$route.name === name ? "page" : undefined}>
      {label}
    </a>
  {/each}

  <span class="div" aria-hidden="true"></span>

  <div class="tabs" role="tablist" aria-label="Open tabs">
    {#each $tabs.list as tab (tab.id)}
      <TabChip
        {tab}
        active={$route.name === "browse" && tab.id === $tabs.activeId}
        onselect={() => select(tab.id)}
        onclose={() => closeTab(tab.id)}
      />
    {/each}
    <button class="newt" aria-label="New tab" title="New tab" onclick={newTab}>
      <Plus size={18} strokeWidth={1.75} />
    </button>
  </div>

  <div class="nr">
    <a class="ib" class:on={$route.name === "settings"} href="/settings" use:link aria-label="Settings" title="Settings">
      <Settings size={18} strokeWidth={1.75} />
    </a>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-h);
    display: flex;
    align-items: center;
    gap: 26px;
    padding: 0 var(--gutter);
    z-index: 50;
    transition:
      background var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease);
  }

  .nav.scrolled {
    background: rgba(10, 10, 11, 0.72);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    box-shadow: inset 0 -1px 0 var(--line);
  }

  .nav.solid {
    background: var(--nav-solid);
    box-shadow: inset 0 -1px 0 var(--line);
    backdrop-filter: none;
  }

  .wm {
    font-weight: 650;
    font-size: 19px;
    letter-spacing: -0.015em;
    font-stretch: 92%;
    margin-right: 6px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .wm span {
    color: var(--accent);
    transition: color var(--dur-slow) var(--ease);
  }

  .nl {
    font-size: 15px;
    color: var(--t2);
    font-weight: 500;
    flex-shrink: 0;
    transition: color var(--dur-fast) var(--ease);
  }

  .nl:hover,
  .nl.on {
    color: var(--t1);
  }

  .div {
    width: 1px;
    height: 18px;
    background: rgba(255, 255, 255, 0.16);
    margin: 0 -8px;
    flex-shrink: 0;
  }

  .tabs {
    flex: 1;
    min-width: 0;
    display: flex;
    gap: 6px;
    align-items: center;
    margin-left: -6px;
    overflow: hidden;
  }

  .newt {
    width: 30px;
    height: 30px;
    border-radius: var(--r-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--t2);
    flex-shrink: 0;
    transition:
      background var(--dur-fast),
      color var(--dur-fast);
  }

  .newt:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--t1);
  }

  .nr {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(245, 245, 247, 0.85);
    flex-shrink: 0;
  }

  .ib {
    width: 34px;
    height: 34px;
    border-radius: var(--r-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--dur-fast);
  }

  .ib:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .ib.on {
    background: rgba(255, 255, 255, 0.14);
    color: var(--t1);
  }

  @media (max-width: 720px) {
    .nav {
      gap: 16px;
      padding: 0 14px;
    }
    .wm {
      font-size: 17px;
    }
    .nl {
      font-size: 14px;
    }
  }
</style>
