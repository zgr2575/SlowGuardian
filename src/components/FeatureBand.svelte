<script>
  import { Play, Plus, Check } from "@lucide/svelte";
  import { rise } from "../lib/motion.js";
  import { mylist, toggleMyList, inMyList } from "../lib/stores/mylist.js";

  let { slides, height = 460, interval = 7000, onaction } = $props();

  let index = $state(0);
  let paused = $state(false);

  $effect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      if (!paused && !document.hidden) index = (index + 1) % slides.length;
    }, interval);
    return () => clearInterval(id);
  });

  let slide = $derived(slides[index]);
  let saved = $derived(inMyList($mylist, slide.id));
</script>

<section
  class="band"
  style="height:{height}px"
  onmouseenter={() => (paused = true)}
  onmouseleave={() => (paused = false)}
  aria-roledescription="carousel"
  aria-label="Featured"
>
  {#each slides as s, i (s.id)}
    <div class="slide" class:active={i === index} aria-hidden={i !== index}>
      <div class="blur" style="background-image:url({s.art})"></div>
      <div class="art" style="background-image:url({s.art})"></div>
    </div>
  {/each}
  <div class="shade"></div>

  {#key index}
    <div class="text" in:rise={{ duration: 420, y: 12 }}>
      <h1 class="h1">{slide.title}</h1>
      <div class="sub">{slide.sub}</div>
      {#if slide.desc}<p class="desc">{slide.desc}</p>{/if}
      <div class="buttons">
        <button class="btn-primary" onclick={() => onaction?.(slide)}>
          {#if slide.action === "Play"}<Play size={14} fill="currentColor" strokeWidth={0} />{/if}
          {slide.action}
          <span class="sr-only">{slide.title}</span>
        </button>
        <button
          class="btn-square"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${slide.title} from My List` : `Add ${slide.title} to My List`}
          onclick={() => toggleMyList(slide.id)}
        >
          {#if saved}<Check size={18} strokeWidth={1.75} />{:else}<Plus size={18} strokeWidth={1.75} />{/if}
        </button>
      </div>
    </div>
  {/key}

  {#if slides.length > 1}
    <div class="pager">
      {#each slides as s, i (s.id)}
        <button class:on={i === index} aria-label="Show {s.title}" onclick={() => (index = i)}></button>
      {/each}
    </div>
  {/if}
</section>

<style>
  .band {
    position: relative;
    overflow: hidden;
  }

  .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 900ms var(--ease);
  }

  .slide.active {
    opacity: 1;
  }

  .blur {
    position: absolute;
    inset: -80px;
    background-size: cover;
    background-position: center;
    filter: blur(70px) saturate(1.3) brightness(0.62);
  }

  .art {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 64%;
    background-size: cover;
    background-position: center 34%;
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 38%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 38%);
  }

  .slide.active .art {
    animation: sg-kenburns 7s linear both;
  }

  .shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(0deg, var(--bg) 0%, rgba(10, 10, 11, 0) 34%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 22%);
  }

  .text {
    position: absolute;
    left: var(--gutter);
    bottom: 76px;
    width: min(480px, 60%);
    z-index: 3;
  }

  .desc {
    font-size: 16.5px;
    color: rgba(245, 245, 247, 0.86);
    margin: 10px 0 0;
    line-height: 1.45;
  }

  .buttons {
    display: flex;
    gap: 10px;
    margin-top: 22px;
  }

  .pager {
    position: absolute;
    right: var(--gutter);
    bottom: 26px;
    display: flex;
    gap: 6px;
    z-index: 3;
  }

  .pager button {
    width: 6px;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.35);
    transition:
      background var(--dur) var(--ease),
      width var(--dur) var(--ease);
  }

  .pager button.on {
    background: #fff;
    width: 18px;
  }

  @media (max-width: 860px) {
    .art {
      width: 100%;
      -webkit-mask-image: linear-gradient(0deg, transparent 12%, #000 70%);
      mask-image: linear-gradient(0deg, transparent 12%, #000 70%);
    }
    .text {
      width: calc(100% - var(--gutter) * 2);
    }
  }
</style>
