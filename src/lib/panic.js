import { get } from "svelte/store";
import { settings } from "./stores/settings.js";

// A combo is stored as "Control+e" / "Alt+Shift+q" / "`".
export function comboFromEvent(event) {
  const parts = [];
  if (event.ctrlKey) parts.push("Control");
  if (event.metaKey) parts.push("Meta");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");

  const key = event.key;
  if (["Control", "Meta", "Alt", "Shift"].includes(key)) return null;
  parts.push(key.length === 1 ? key.toLowerCase() : key);
  return parts.join("+");
}

export function describeCombo(combo) {
  return (combo || "")
    .split("+")
    .map((part) =>
      part === "Control"
        ? "Ctrl"
        : part === "Meta"
          ? "⌘"
          : part.length === 1
            ? part.toUpperCase()
            : part,
    )
    .join(" + ");
}

export function matches(event, combo) {
  if (!combo) return false;
  const pressed = comboFromEvent(event);
  return pressed !== null && pressed.toLowerCase() === combo.toLowerCase();
}

function escape(url) {
  const target = url || "https://classroom.google.com/";
  window.location.replace(target);
}

function handler(event) {
  const { panic } = get(settings);
  if (!panic?.keys) return;
  if (!matches(event, panic.keys)) return;
  event.preventDefault();
  escape(panic.url);
}

export function startPanicKey() {
  window.addEventListener("keydown", handler, true);
  return () => window.removeEventListener("keydown", handler, true);
}

// Proxied pages live in their own document, so key events never reach us. Every frame
// gets the same listener once it has loaded.
export function attachPanicKeyToFrame(frame) {
  try {
    const win = frame?.contentWindow;
    if (!win || win.__sgPanic) return;
    win.__sgPanic = true;
    win.addEventListener(
      "keydown",
      (event) => {
        const { panic } = get(settings);
        if (!panic?.keys || !matches(event, panic.keys)) return;
        event.preventDefault();
        escape(panic.url);
      },
      true,
    );
  } catch {
    // A frame we cannot reach into; nothing to do.
  }
}
