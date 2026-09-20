<script>
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { FEATURED_GAMES, TOP_GAMES } from "../lib/sample.js";
  import { openTarget } from "../lib/open.js";
  import { reducedMotion } from "../lib/motion.js";
  import FeatureBand from "../components/FeatureBand.svelte";
  import Chips from "../components/Chips.svelte";
  import ChartRow from "../components/ChartRow.svelte";

  const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "Sports", label: "Sports" },
    { id: "Racing", label: "Racing" },
    { id: "Shooter", label: "Shooters" },
    { id: "Arcade", label: "Arcade" },
    { id: "Platformer", label: "Platformers" },
  ];

  let category = $state("all");
  let shown = $derived(category === "all" ? TOP_GAMES : TOP_GAMES.filter((g) => g.subtitle === category));
  let rows = $derived(Math.max(1, Math.ceil(shown.length / 3)));
</script>

<FeatureBand slides={FEATURED_GAMES} height={460} onaction={(s) => openTarget(s.url)} />

<div class="content">
  <Chips items={CATEGORIES} value={category} onchange={(v) => (category = v)} label="Game categories" />

  <section class="chart">
    <h2 class="sect">Top Games</h2>
    {#if shown.length}
      <div class="grid" style:grid-template-rows="repeat({rows}, auto)">
        {#each shown as game, i (game.id)}
          <div animate:flip={{ duration: $reducedMotion ? 0 : 260 }} in:fade={{ duration: 160 }}>
            <ChartRow
              rank={category === "all" ? i + 1 : null}
              icon={game.icon}
              title={game.title}
              subtitle={game.subtitle}
              action="Play"
              onaction={() => openTarget(game.url)}
            />
          </div>
        {/each}
      </div>
    {:else}
      <p class="empty">Nothing here yet. The full catalog lands in the next update.</p>
    {/if}
  </section>
</div>

<style>
  .content {
    padding: 14px var(--gutter) 60px;
  }

  .chart {
    margin-top: 30px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-flow: column;
    column-gap: 36px;
    margin-top: 12px;
  }

  .empty {
    color: var(--t3);
    margin-top: 16px;
  }

  @media (max-width: 1100px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 720px) {
    .grid {
      grid-template-columns: 1fr;
      grid-auto-flow: row;
      grid-template-rows: none !important;
    }
  }
</style>
