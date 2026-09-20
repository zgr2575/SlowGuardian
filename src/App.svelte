<script>
  import { route } from "./lib/router.js";
  import { rise } from "./lib/motion.js";
  import Navbar from "./components/Navbar.svelte";
  import Home from "./routes/Home.svelte";
  import Games from "./routes/Games.svelte";
  import Apps from "./routes/Apps.svelte";
  import Browse from "./routes/Browse.svelte";
  import Settings from "./routes/Settings.svelte";

  const PAGES = { home: Home, games: Games, apps: Apps, browse: Browse, settings: Settings };
  let Page = $derived(PAGES[$route.name] ?? Home);
</script>

<Navbar solid={$route.name === "browse"} />

{#key $route.name}
  <main class="page" in:rise>
    <Page />
  </main>
{/key}
