// Temporary content for the shell. Replaced by the real catalog (src/data/*.json).
const icon = (file) => `/catalog/icons/${file}`;

export const FEATURED_GAMES = [
  {
    id: "celeste",
    title: "Celeste",
    sub: "Platformer · PICO-8 · 1 player",
    desc: "Climb the mountain in eight-way dashes. It's short, brutal, and very hard to put down.",
    art: icon("celeste.webp"),
    url: "https://exok.com/minigames/celeste.html",
    action: "Play",
  },
  {
    id: "pizza-tower",
    title: "Pizza Tower",
    sub: "Platformer · 1 player",
    desc: "A fast, loud, hand-drawn platformer about a chef having the worst day of his life.",
    art: icon("pizza-tower.webp"),
    url: "https://gamaverse.com/c/f/g/pizza-tower-1678640389/index.html",
    action: "Play",
  },
  {
    id: "jetpack-joyride",
    title: "Jetpack Joyride",
    sub: "Arcade · Endless runner",
    desc: "Grab a machine-gun jetpack, dodge the zappers and see how far you get.",
    art: icon("jetpackjoyride.webp"),
    url: "https://www.google.com/search?q=jetpack+joyride+online",
    action: "Play",
  },
];

export const TOP_GAMES = [
  [
    "retro.webp",
    "Retro Bowl",
    "Sports",
    "https://www.google.com/search?q=retro+bowl",
  ],
  ["1v1-lol.webp", "1v1.LOL", "Shooter", "https://1v1.lol"],
  [
    "jetpackjoyride.webp",
    "Jetpack Joyride",
    "Arcade",
    "https://www.google.com/search?q=jetpack+joyride+online",
  ],
  [
    "slope.webp",
    "Slope",
    "Arcade",
    "https://watchdocumentaries.com/wp-content/uploads/games/slope/",
  ],
  ["smashkarts.webp", "Smash Karts", "Racing", "https://smashkarts.io/"],
  [
    "shell-shockers.webp",
    "Shell Shockers",
    "Shooter",
    "https://shellshock.io/",
  ],
  ["krunker.webp", "Krunker", "Shooter", "https://krunker.io"],
  [
    "basketball-stars.webp",
    "Basketball Stars",
    "Sports",
    "https://html5.gamedistribution.com/69d78d071f704fa183d75b4114ae40ec/",
  ],
  [
    "pizza-tower.webp",
    "Pizza Tower",
    "Platformer",
    "https://gamaverse.com/c/f/g/pizza-tower-1678640389/index.html",
  ],
].map(([file, title, subtitle, url]) => ({
  id: title,
  icon: icon(file),
  title,
  subtitle,
  url,
}));

export const FEATURED_APPS = [
  {
    id: "geforce-now",
    title: "GeForce NOW",
    sub: "Cloud gaming · Runs in the browser",
    desc: "Stream PC games you already own, straight into a tab.",
    art: icon("geforce-now.webp"),
    url: "https://play.geforcenow.com",
    action: "Open",
  },
  {
    id: "discord",
    title: "Discord",
    sub: "Social · Voice and chat",
    desc: "Your servers and DMs, without the app.",
    art: icon("discord.webp"),
    url: "https://discord.com/app",
    action: "Open",
  },
];

export const POPULAR_APPS = [
  ["youtube.webp", "YouTube", "Video", "https://www.youtube.com"],
  ["spotify.webp", "Spotify", "Music", "https://open.spotify.com"],
  ["chatgpt.webp", "ChatGPT", "AI", "https://chatgpt.com"],
  ["discord.webp", "Discord", "Social", "https://discord.com/app"],
  ["twitch.webp", "Twitch", "Video", "https://www.twitch.tv"],
  ["reddit.webp", "Reddit", "Social", "https://www.reddit.com"],
  ["tiktok.webp", "TikTok", "Social", "https://www.tiktok.com"],
  ["google.webp", "Google", "Tools", "https://www.google.com"],
  [
    "gba.webp",
    "GBA Emulator",
    "Emulators",
    "https://www.google.com/search?q=gba+emulator+online",
  ],
].map(([file, title, subtitle, url]) => ({
  id: title,
  icon: icon(file),
  title,
  subtitle,
  url,
}));

export const FAVORITES = [
  ["youtube.webp", "YouTube", "https://www.youtube.com"],
  ["discord.webp", "Discord", "https://discord.com/app"],
  ["spotify.webp", "Spotify", "https://open.spotify.com"],
  ["tiktok.webp", "TikTok", "https://www.tiktok.com"],
  ["twitch.webp", "Twitch", "https://www.twitch.tv"],
  ["retro.webp", "Retro Bowl", "https://www.google.com/search?q=retro+bowl"],
].map(([file, title, url]) => ({ icon: icon(file), title, url }));
