import { readable, derived } from "svelte/store";
import { cubicOut } from "svelte/easing";
import { settings } from "./stores/settings.js";

const systemReduced = readable(false, (set) => {
  if (typeof matchMedia !== "function") return;
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  set(mq.matches);
  const onChange = () => set(mq.matches);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
});

export const reducedMotion = derived([systemReduced, settings], ([sys, s]) => sys || s.reduceMotion);

let reduced = false;
reducedMotion.subscribe((v) => {
  reduced = v;
  if (typeof document !== "undefined") document.documentElement.dataset.motion = v ? "reduced" : "full";
});

// Fade in with a small rise. Collapses to a plain fade when motion is reduced.
export function rise(node, { delay = 0, duration = 240, y = 8 } = {}) {
  return {
    delay,
    duration: reduced ? 120 : duration,
    easing: cubicOut,
    css: (t) => (reduced ? `opacity:${t}` : `opacity:${t};transform:translateY(${(1 - t) * y}px)`),
  };
}

// Width + fade, used when tab chips open and close.
export function grow(node, { duration = 200 } = {}) {
  const width = node.offsetWidth;
  return {
    duration: reduced ? 1 : duration,
    easing: cubicOut,
    css: (t) => `opacity:${t};max-width:${t * width}px;overflow:hidden`,
  };
}
