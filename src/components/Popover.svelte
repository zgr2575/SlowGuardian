<script>
  let {
    open = false,
    anchor = null,
    onclose,
    width = 300,
    align = "end",
    placement = "below",
    label = "",
    children,
  } = $props();

  let panel = $state(null);
  let pos = $state({ left: 0, top: null, bottom: null });

  $effect(() => {
    if (!open || !anchor) return;

    const place = () => {
      const r = anchor.getBoundingClientRect();
      const left = align === "end" ? r.right - width : r.left;
      pos = {
        left: Math.max(8, Math.min(left, window.innerWidth - width - 8)),
        top: placement === "below" ? r.bottom + 8 : null,
        bottom: placement === "above" ? window.innerHeight - r.top + 8 : null,
      };
    };
    place();

    const onPointerDown = (e) => {
      if (!panel?.contains(e.target) && !anchor.contains(e.target)) onclose?.();
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") onclose?.();
    };

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeydown);
    };
  });
</script>

{#if open}
  <div
    bind:this={panel}
    class="pop pop-in"
    role="dialog"
    aria-label={label}
    style:left="{pos.left}px"
    style:top={pos.top == null ? null : `${pos.top}px`}
    style:bottom={pos.bottom == null ? null : `${pos.bottom}px`}
    style:width="{width}px"
    style:--pop-origin={placement === "below" ? "top right" : "bottom right"}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  .pop {
    position: fixed;
    z-index: 80;
    border-radius: var(--r-lg);
    background: rgba(30, 30, 33, 0.96);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.55),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    padding: 8px;
    font-size: 13.5px;
  }
</style>
