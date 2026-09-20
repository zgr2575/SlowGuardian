import "@fontsource-variable/instrument-sans/wdth.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/motion.css";
import { mount } from "svelte";
import { get } from "svelte/store";
import App from "./App.svelte";
import { settings, updateSettings } from "./lib/stores/settings.js";
import { THEMES, themeById, applyTheme } from "./lib/stores/themes.js";
import { applyCloak, openInAboutBlank } from "./lib/cloak.js";
import { applyCustomWallpaper } from "./lib/wallpaper.js";
import { startPanicKey } from "./lib/panic.js";
import "./lib/motion.js";

const current = get(settings);

// "Rotate themes" picks the next one on each visit.
if (current.rotateThemes) {
  const index = THEMES.findIndex((t) => t.id === current.theme);
  updateSettings({ theme: THEMES[(index + 1) % THEMES.length].id });
}

settings.subscribe((s) => {
  applyTheme(themeById(s.theme));
  // A visitor's own wallpaper wins over the theme's, so re-apply it after the theme.
  if (s.customWallpaper) applyCustomWallpaper(true);
});
applyCloak(current.cloak);
startPanicKey();

// Opt-in: move into a blank window on arrival, unless we are already inside one.
if (current.aboutBlank?.auto && window.top === window.self) {
  openInAboutBlank({ cloak: current.cloak, decoy: current.aboutBlank.decoy });
}

mount(App, { target: document.getElementById("app") });
