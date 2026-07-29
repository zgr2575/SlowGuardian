# SlowGuardian V10

A fast, private gateway for the school Chromebook — open any site, launch a
game or an app, all in a blink even on the slow machines. V10 is a ground-up,
LTS-focused rebuild of V9: one proxy engine, one service worker, an Astro
static frontend, and a clean set of privacy controls.

- **Design:** Apple-style **Liquid Glass**, dark-first, with a **Dynamic Island**
  nav. Runs on 2016–2019 Chromebooks (blur steps down to solid glass).
- **Proxy:** **Scramjet** over **Wisp** (`wisp-js`), a single service worker,
  `bare-mux` + `epoxy-transport` transport, COOP/COEP cross-origin isolation.
- **Backend:** Express on a raw `node:http` server (crash-only), envalid config,
  pino logging.

> Interactive design showcase: `docs/design/v10-mockup.html`.

## Layout

```
v10/
  src/                 # the proxy server
    server.js          #   express + http upgrade → wisp-js, COOP/COEP, /healthz + /readyz
    config.js          #   envalid, fail-fast (PORT / HOST / NODE_ENV)
    logger.js          #   pino (pretty in dev)
  public/              # Phase-1 fallback page + the Scramjet service worker (sw.js)
  web/                 # the Astro static frontend (built to web/dist, served by src/server.js)
    src/pages/         #   index (lander) · games · apps · go (proxy) · privacy · settings
    src/components/    #   Library, Tile, Billboard, Onboarding
    src/layouts/Base.astro   #   shell: Dynamic Island, ⌘K palette, theme/accent/cloak/panic
    src/content/       #   games.json (284) + apps.json (55) catalogs
  test/                # wisp-handshake.mjs (zero-dep) + e2e.spec.mjs (Playwright)
  Dockerfile           # canonical image (build from the repo root)
  playwright.config.mjs
```

The Scramjet / bare-mux / epoxy browser bundles are **not** copied into the
repo — `server.js` serves them straight out of `node_modules` (`/scram/`,
`/baremux/`, `/epoxy/`), so the served bytes always match the installed version.

## Features

- **Home** — a Google-style search lander: one omnibox (→ the proxy) and quick
  links to Games / Apps / Surprise me.
- **Games / Apps** — a Netflix-style library over the real catalog: a featured
  billboard, category shelves, and a dense full-width "All" grid. Search lives
  in the **⌘K** palette.
- **Proxy (`/go`)** — a Chrome-style multi-tab in-app browser: tab strip, pill
  omnibox, back/forward/reload, **fullscreen**, **open-in-new-window**, an
  always-there **Quick Exit**, and a Chrome-style new-tab page.
- **Privacy** — tab disguise (a dozen school-app presets + custom title/favicon,
  live preview), one-key **Quick Exit** (decoy URL + rebindable key; double-Esc
  is global), the opt-in **about:blank cloak**, and one-tap **clear traces**.
- **Settings** — dark/light theme, four accents, a performance dial (Auto / Full
  glass / Lite for old Chromebooks), and a **search-engine** picker (Google,
  Bing, DuckDuckGo, Startpage, Brave, Ecosia, or custom).
- **Onboarding** — a one-time first-run flow (welcome → appearance → privacy →
  done) that persists its choices.

Everything is client-side and remembered per device (`sg:*` localStorage keys);
there are no accounts. See `src/layouts/Base.astro` for the storage contract.

## Install & run

```bash
cd v10
npm install
npm run build:web        # build the Astro frontend into web/dist
npm run dev              # or: npm start   (serves web/dist + the proxy)
```

Open <http://localhost:8080>. Config via env (all optional): `PORT` (8080),
`HOST` (0.0.0.0), `NODE_ENV` (`development` | `production` | `test`). Invalid
values fail fast at boot.

> **Secure-context note:** service workers / WASM require a secure context.
> `http://localhost` and `http://127.0.0.1` count as secure, so local dev needs
> no HTTPS. Any non-loopback host must be served over real HTTPS.

### Docker

Build from the **repo root** (the frontend build sources the catalog icon set
from the repo-root `static/` tree):

```bash
docker build -f v10/Dockerfile -t slowguardian:10 .
docker run --rm -p 8080:8080 slowguardian:10
```

The image is multi-stage (build frontend → prod-only deps → slim runtime), runs
as a non-root user, and has a `HEALTHCHECK` on `/readyz`.

## Health & deploy

- `GET /healthz` → `{ ok, version, uptime }` (liveness).
- `GET /readyz` → `200`/`503` with a per-asset check list — the proxy bundles
  **and** the built frontend must actually resolve (gate a load balancer here).

Intended deploy is a **split**: the static frontend on **Vercel**, the
persistent Wisp backend on **Render** (one Docker image is the canonical
artifact). Re-confirm HTTPS proxying on the first real deploy — a dev sandbox
with a TLS-intercepting egress will (correctly) fail epoxy's cert validation.

## Testing

```bash
npm run build:web        # required — /readyz gates the test server on a built frontend
npm run test:e2e         # Playwright: lander, library, health, COOP/COEP, and a
                         #   full proxy round-trip against a LOCAL fixture (no live net)
npm run test:wisp        # zero-dep: /wisp/ upgrades (101), non-wisp upgrades are dropped
```

CI (`.github/workflows/v10-ci.yml`) runs both suites plus a Docker build on
every change to `v10/**`.

## What changed from V9 (nothing silently dropped)

**Carried over (rebuilt clean):** tab disguise, quick exit / panic key,
about:blank cloak (a faithful port of V8's `createAboutBlank`), clear-traces,
onboarding, the multi-tab proxy browser, search-engine choice, the games/apps
catalogs, and the Dynamic Island nav (replacing V9's hover sidebar).

**Intentionally not carried over** (scope decisions for a stable LTS):

- **One proxy engine.** Scramjet-only over Wisp. Dropped Ultraviolet, Dynamic,
  Rammerhead, and the multi-engine failover — they were the main source of V9's
  instability. (UV is a documented post-1.0 escape hatch, added only if a live
  test proves a real gap.)
- **No accounts / monetization.** Dropped the KeyAuth/premium system, ads &
  AdSense, the cookie-consent vendor, and the elaborate admin panel. 1.0 ships a
  **public proxy** with a single **env-password admin gate**; user settings are
  client-side. (ZADMIN Auth is a separate future maintainer project.)
- **No MongoDB.** Small global/admin state uses embedded SQLite.
- **No monitoring-evasion.** No anti-screenshot / anti-screen-record /
  anti-close. The privacy surface is tab disguise, quick exit, the about:blank
  launcher, and local cleanup.
- **Music/Spotify** — the old player slot is reserved for a future project
  integration (TBD by the maintainer); not building music in 1.0.
- **Superseded by the new design:** the theme zoo (Cyberpunk/Ocean/Sunset/
  Catppuccin), background-image + particles, the 100-toggle "features manager,"
  the movable floating-button widgets, the plugin system, and the home
  quotes/quick-access widgets — all replaced by the approved Liquid-Glass system
  (dark/light + accents + a performance dial) and the minimal lander.
- **Reachability** (signed "get the latest link" mirror manifest) → **post-1.0**.

**Deferred (post-1.0):** proxy session save/restore & bookmarks, URL-bar search
autocomplete, and reachability mirrors.

## LTS

v10.x support window: **6 months active + 6 months security-only.** History is
left intact; the big binary assets (maps, wallpaper) are no longer tracked going
forward. The V8 and V9 code is preserved on the `legacy/v8` and `legacy/v9`
branches.
