import "@fontsource-variable/instrument-sans/wdth.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/motion.css";
import { mount } from "svelte";
import { get } from "svelte/store";
import App from "./App.svelte";
import { settings, updateSettings } from "./lib/stores/settings.js";
import { THEMES, themeById, applyTheme } from "./lib/stores/themes.js";
import "./lib/motion.js";

// "Rotate themes" picks the next one on each visit.
const current = get(settings);
if (current.rotateThemes) {
  const index = THEMES.findIndex((t) => t.id === current.theme);
  updateSettings({ theme: THEMES[(index + 1) % THEMES.length].id });
}

settings.subscribe((s) => applyTheme(themeById(s.theme)));

mount(App, { target: document.getElementById("app") });
