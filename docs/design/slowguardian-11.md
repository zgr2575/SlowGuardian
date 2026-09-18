# SlowGuardian 11 — Design

**Status:** approved · **Date:** 2026-09-18 · **Base:** `legacy/v8` (8.9a, `a91599b`) · **Branch:** `v11`

SlowGuardian 11 is a rebuild on top of v8. v9 and v10 are set aside: the proxy stopped
working reliably, the project picked up a lot of weight (accounts, MongoDB, premium
tiers, four proxy engines), and it stopped looking and feeling like SlowGuardian.
v11 keeps v8's spirit: a fast, search-first launchpad with games, apps and privacy tools. It gets
a modern proxy stack, a single-page app with real tabs, and an entirely new design language.

## Goals

- Sites load. One well-tested proxy path by default, plus one alternative for sites that break.
- Home stays a search.
- A premium, Apple TV–inspired look that does **not** read as AI-generated: color comes from
  imagery, not brand gradients; hierarchy comes from type, not badges; one real icon set.
- Tabs that keep running while you move around the site.
- Everything stored locally in the browser. No accounts, no database.
- Hosted entirely on Vercel (project `algebra`), with a plain Node server for local dev and self-hosting.

## Non-goals

- Accounts, sign-in, premium tiers, cloud sync, analytics.
- Ads (v8's ad code was already inert; none is carried over).
- Rammerhead, Dynamic, or any third proxy engine.
- Particles, splash text, the summer countdown, `/d/data`, and the git-pull auto-updater.

## What carries over from v8

| v8 feature | v11 |
| --- | --- |
| Search home page | Home: wordmark, search, favorites over a photo wallpaper |
| Games / Apps lists (`g.json`, `a.json`, 357 icons) | Cleaned, re-categorized catalog; Games and Apps pages |
| `/p` single-page viewer | Browser view with tabs, toolbar and per-site engine choice |
| Tab cloak presets (40+ school sites) | Settings → Privacy & Cloaking |
| about:blank cloak | Settings → Privacy & Cloaking (opt-in, auto or on demand) |
| Panic key (default Ctrl+E) | Settings → Keyboard; works inside proxied pages too |
| Search engine choice | Settings → Search |
| Custom background image | "Use my own wallpaper" (stored in IndexedDB) |
| Catppuccin themes | Replaced by the four photo themes |
| Eruda inspect | Dev tools button in the browser toolbar |
| Password protection (`config.challenge`) | Optional `SG_PASSWORD` env var (basic auth in middleware) |

## Architecture

```
Browser (the visitor)
 ├─ SlowGuardian SPA (Svelte 5 + Vite, static files on Vercel)
 │    ├─ app shell: navbar, routes (/, /games, /apps, /browse, /settings)
 │    └─ persistent tab layer: one iframe per tab, kept alive across routes
 ├─ Service worker /sw.js (scope "/")
 │    ├─ /uv/service/*    → Ultraviolet 3  (default engine)
 │    └─ /scram/service/* → Scramjet 1.1   (per-site alternative)
 └─ bare-mux SharedWorker → transport
       ├─ bare-as-module3  → /api/bare/   (default relay, plain HTTP)
       └─ epoxy (wisp)     → /api/wisp/   (optional relay, WebSocket)

Vercel
 ├─ static: dist/ (app + vendored proxy bundles)
 ├─ function api/bare.js  — @tomphttp/bare-server-node (HTTP + WS upgrade)
 └─ function api/wisp.js  — @mercuryworkshop/wisp-js server (WebSocket beta)
```

- **One relay module** (`server/relays.js`) builds the bare server and the wisp upgrade
  handler. It is used by the Vercel functions, the standalone server (`server/index.js`)
  and the Vite dev server, so all three behave the same.
- **Relays are addressed by path** (`/api/bare/`, `/api/wisp/`) and read from one config
  value, so the relay can move off Vercel by changing a single setting.
- **Engines vs relays.** Both engines share one bare-mux transport. The engine is chosen
  **per tab/site** (UV and Scramjet use different URL prefixes, so they coexist). The relay is
  **global** (Settings → Proxy, also reachable from the toolbar popover), because bare-mux
  has a single active transport for all tabs.
- **Service worker control.** The SW calls `skipWaiting()` + `clients.claim()`, and the app
  waits for `navigator.serviceWorker.controller` before loading any tab. Otherwise a
  first-visit request falls through to Vercel and returns `index.html` inside the tab.
- **Private network blocking** stays on in both relays (bare `blockLocal`, wisp private/loopback
  IPs off). Loopback is allowed only when `NODE_ENV=test`, for the e2e fixture.

### Pinned versions (at design time)

svelte 5.57 · vite 8.3 · @sveltejs/vite-plugin-svelte 7.3 · @titaniumnetwork-dev/ultraviolet 3.2.10 ·
@mercuryworkshop/scramjet 1.1.0 · @mercuryworkshop/bare-mux 2.1.9 · bare-as-module3 2.2.5 ·
epoxy-transport (3.0.1 if compatible, else 2.1.28 as v10 used) · @mercuryworkshop/wisp-js 0.5.0 ·
@tomphttp/bare-server-node 2.0.6 · @lucide/svelte · @fontsource-variable/instrument-sans ·
vitest 5 · @playwright/test 1.63.

## App structure

```
src/
  App.svelte               shell: Navbar + route outlet + TabLayer
  routes/                  Home, Games, Apps, Browse, Settings (+ settings sections)
  components/              Navbar, TabChip, SearchField, Chip, ChartRow, FeatureBand,
                           Toggle, ThemeCard, Popover, Sheet, Fav
  lib/proxy/               sw.js registration, engine.js (encode per engine), transport.js
  lib/stores/              settings, tabs, favorites, mylist, history, theme
  lib/                     url.js (URL vs search), cloak.js, panic.js, catalog.js, suggest.js
  data/                    games.json, apps.json, featured.json
  styles/                  tokens.css, base.css, motion.css
public/                    sw.js, wallpapers/, catalog/icons/, cloak/ favicons
server/                    relays.js, index.js (standalone server)
api/                       bare.js, wisp.js (Vercel functions)
scripts/                   copy-proxy-assets.js, catalog-audit.js
tests/unit, tests/e2e
```

Routing uses the History API; `vercel.json` rewrites non-asset paths to `index.html`. The v8
short routes (`/g`, `/ap`, `/s`, `/p`) redirect to their v11 equivalents.

## Design system

- **Type:** Instrument Sans (variable, self-hosted). Titles 650 weight at 86–92% width, tight tracking.
- **Surfaces:** `#0A0A0B` page, `#151517` / `#1C1C1F` / `#2A2A2D` raised; hairlines `rgba(255,255,255,.08)`.
- **Text:** `#F5F5F7`, 62% for inactive nav, `#8E8E93` secondary.
- **Radii:** 8 / 10 / 14 px; favorites use 19 px squircles.
- **Icons:** Lucide, 1.75 stroke, everywhere. No emoji or text glyphs as icons.
- **Accent:** one per theme; used on "Slow", focus rings, toggles, loading bar, active tab underline.
- **Glass** only over imagery (search field and buttons on the wallpaper), never on plain surfaces.
- **No brand gradients.** Ambient color comes from the current wallpaper or featured art (blurred).

### Themes

A theme is a wallpaper plus an accent. Alpine is the default.

| Theme | Wallpaper | Accent |
| --- | --- | --- |
| Alpine | alpine ridge above clouds, blue hour | `#9AA2FF` (v8 periwinkle) |
| Night Grid | coastal city at night | `#FFB35C` |
| Last Light | desert dunes after sunset | `#FF8A5B` |
| Black Sand | Icelandic black-sand coast | `#5FD4C4` |

Settings also offers "Use my own wallpaper" (stored in IndexedDB, the accent stays the theme's)
and "Rotate themes" (a different theme on each visit).

### Motion

Tokens: `--dur-fast 160ms`, `--dur 240ms`, `--dur-slow 420ms`, `--ease cubic-bezier(.2,.8,.2,1)`.

- Wallpaper and theme change: 900 ms crossfade.
- Route change: content fades in with an 8 px rise (240 ms); the navbar never moves.
- Featured band: auto-advances every 7 s with a crossfade and a slow 1.00→1.04 zoom on the art.
- Cards and chart rows: on hover/focus they lift (scale 1.04, −3 px, deeper shadow) with a soft light sheen.
- Tab chips: expand in on open, collapse out on close (200 ms).
- Popovers and sheets: scale .96→1 plus fade from their anchor (160 ms).
- Search field: accent focus ring with a 1 px lift.
- `prefers-reduced-motion` and the "Reduce motion" setting turn all of this into plain fades or nothing.

## Pages

- **Navbar (every page):** wordmark · Home · Games · Apps · divider · open-tab chips · "+" · (search on
  Games/Apps) · Settings. Chips show favicon and title; the active tab gets an accent underline.
  It is transparent over wallpapers and art, and solid `#0E0E10` in the browser view.
- **Home:** the wallpaper with the wordmark, search field (typed-URL detection, suggestions from favorites,
  history, catalog and the search engine's autocomplete through the proxy), a hint line, and a favorites row
  (editable, seeded with YouTube, Discord, Spotify, TikTok, Twitch). Bottom corners: wallpaper name and Customize.
- **Games:** a featured band (rotating, curated), category chips, a "Top Games" chart (curated, 3 columns,
  numbered column-first), then category shelves. "+" adds to My List, which gets its own shelf when non-empty.
- **Apps:** the same components as Games, with a shorter band and Open buttons.
- **Browse:** the navbar's tab chips act as the tab strip. The toolbar row has back/forward/reload, the
  address bar (domain until focused) with the engine chip, then bookmark, fullscreen, pop-out, dev tools
  and a ⋯ menu (History, Open in about:blank, Copy link, Close tab). The engine popover sets
  Ultraviolet/Scramjet for this site (with "Remember for <domain>") and shows the global relay.
- **Settings:** title plus section chips: Appearance, Privacy & Cloaking, Proxy, Search, Keyboard, About.
  Grouped rows with toggles, in the same components as the rest of the site.
- **History:** a sheet opened from the ⋯ menu or Ctrl+H: searchable, delete per item, Clear all.

## Data

**Catalog** (`src/data/*.json`), one schema for games and apps:

```json
{ "id": "retro-bowl", "name": "Retro Bowl", "url": "https://…", "icon": "/catalog/icons/retro.webp",
  "art": "/catalog/icons/retro.webp", "category": "sports", "tags": ["2p"], "external": false }
```

- Game categories: multiplayer, sports, racing, platformer, arcade, shooter, puzzle, emulator, classic.
- App categories: social, video, music, ai, cloud-gaming, tools, emulators.
- `external: true` replaces v8's `"blank": "true"` (the site refuses to be framed, so it opens in a pop-out).
- `featured.json` lists the band slides and the Top Games / Popular ordering.
- `scripts/catalog-audit.js` validates the schema, checks that every icon exists, and HEAD-checks every URL.
  Dead entries are fixed or removed. v8's `/e/*` local-asset entries are rehosted or removed.

**Browser storage** (versioned, with in-memory fallback when storage is unavailable):
`sg:settings`, `sg:tabs` (session restore, lazy-loaded), `sg:favorites`, `sg:mylist`,
`sg:history` (cap 500; off switch), IndexedDB `sg-wallpaper` for a custom wallpaper.

## Privacy & cloaking

- **Tab cloak:** preset or custom title and favicon (the v8 preset list, same assets).
- **about:blank:** opens SlowGuardian inside an about:blank window with the cloak applied, then sends the
  original tab to the decoy URL. Auto-on-launch is opt-in. On Firefox, where this is blocked, it explains why.
- **Panic key:** a configurable combo that sends the page to the panic URL. The listener is also attached to
  every proxied frame on load, so it works while you're inside a site.
- **History:** can be switched off. Clear-all also clears tabs and suggestions.

## Error handling

- No service-worker support (e.g. Firefox private windows): the tab shows an explanation, not a blank frame.
- Relay unreachable: the tab shows "Couldn't reach the relay" with Retry and "Switch to wisp/bare".
- Site fails under Ultraviolet: the error page offers "Try Scramjet for this site".
- Missing catalog image: a fallback plate with the name's initial on an accent-tinted square.
- Storage blocked: settings work for the session and a quiet notice says they won't persist.

## Testing

- **Unit (Vitest):** URL/search parsing, engine URL encoding, stores (tabs, favorites, history cap,
  settings migration), catalog schema.
- **E2E (Playwright, against the built app + standalone server):** navbar on every route; opening a URL
  creates a tab and loads a local fixture through UV+bare, then Scramjet, then wisp; tabs survive route
  changes; panic key; theme switch updates the accent; error page when the relay is down.
- **Preview checks on Vercel:** real sites (example.com, wikipedia.org, a catalog game) through bare and
  wisp; WebSocket reconnect after the function's max duration.
- **CI:** a GitHub Actions workflow runs build, unit and e2e on pushes and PRs.

## Deployment

- `vercel.json`: `npm run build` → `dist/`; functions `api/bare.js` (maxDuration 300) and
  `api/wisp.js` (maxDuration 800, WebSocket beta); SPA rewrites that exclude asset and API paths;
  `Cache-Control: no-cache` + `Service-Worker-Allowed: /` on `sw.js`.
- Pushes to `v11` produce preview deployments on `algebra`. Production changes only when `main` changes.
- Release: `main` gets a merge commit whose tree is exactly `v11` (no force-push); v10's branch is
  kept as `legacy/v10`; tag `11.0.0` with a GitHub release.
- `npm start` runs the standalone server for self-hosting (VPS, Replit, Raspberry Pi).

## Risks

- **Vercel fair use lists proxies as never-fair-use.** Accepted by the owner. Mitigation: the relay URL is one
  config value, so it can move to another host quickly.
- **WebSocket functions are in beta** and close at max duration. Bare is the default relay partly for this
  reason. Wisp is verified on a preview before shipping.
- **Ultraviolet hasn't had a release since Oct 2024.** Scramjet per-site is the fallback.
- **Catalog link rot** is handled by the audit script, re-run before each release.

## Open items

- `pilepickerslcc.com` and `www.pilepickerslcc.com` are attached to the `algebra` project and currently
  serve SlowGuardian. The owner needs to confirm whether that is intended before production.
