// A theme is a wallpaper plus the accent colour that goes with it.
export const THEMES = [
  { id: "alpine", name: "Alpine", sub: "Above the Clouds", accent: "#9AA2FF" },
  {
    id: "city",
    name: "Night Grid",
    sub: "Coastal city after rain",
    accent: "#FFB35C",
  },
  {
    id: "dunes",
    name: "Last Light",
    sub: "Desert dunes after sunset",
    accent: "#FF8A5B",
  },
  {
    id: "iceland",
    name: "Black Sand",
    sub: "Icelandic coast in fog",
    accent: "#5FD4C4",
  },
].map((t) => ({
  ...t,
  wallpaper: `/wallpapers/${t.id}.webp`,
  thumb: `/wallpapers/${t.id}-thumb.webp`,
}));

export function themeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(theme, root = document.documentElement) {
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--wallpaper", `url("${theme.wallpaper}")`);
  root.dataset.theme = theme.id;
}
