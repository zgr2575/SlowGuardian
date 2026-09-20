import { persisted } from "./persist.js";

export const DEFAULT_SETTINGS = {
  v: 1,
  theme: "alpine",
  reduceMotion: false,
  engine: "uv",
  relay: "bare",
  siteEngines: {},
  searchEngine: "google",
  showFavorites: true,
  rotateThemes: false,
  saveHistory: true,
  cloak: { preset: "none", title: "", icon: "" },
  aboutBlank: { auto: false, decoy: "https://classroom.google.com/" },
  panic: { keys: "Control+e", url: "https://classroom.google.com/" },
};

export const settings = persisted("sg:settings", DEFAULT_SETTINGS, {
  version: 1,
  migrate: (old) => ({
    ...DEFAULT_SETTINGS,
    ...(old && typeof old === "object" ? old : {}),
    v: 1,
  }),
});

export function updateSettings(patch) {
  settings.update((s) => ({ ...s, ...patch }));
}
