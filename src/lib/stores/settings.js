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
};

export const settings = persisted("sg:settings", DEFAULT_SETTINGS, {
  version: 1,
  migrate: (old) => ({ ...DEFAULT_SETTINGS, ...(old && typeof old === "object" ? old : {}), v: 1 }),
});

export function updateSettings(patch) {
  settings.update((s) => ({ ...s, ...patch }));
}
