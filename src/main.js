import "@fontsource-variable/instrument-sans";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/motion.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { settings } from "./lib/stores/settings.js";
import { themeById, applyTheme } from "./lib/stores/themes.js";
import "./lib/motion.js";

settings.subscribe((s) => applyTheme(themeById(s.theme)));

mount(App, { target: document.getElementById("app") });
