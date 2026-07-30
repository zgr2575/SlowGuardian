# SlowGuardian V10 — Official Recode Plan

*Status: proposed. Date: 2026-07-04.*

This is the ground-up plan for V10, the LTS release. It is grounded in a full V9 code audit and four research streams. The guiding principle is **boring and reliable over clever and broad**. Every "add" below is matched by a "cut."

---

## 1. What went wrong in V9

V9 is unstable for structural reasons, not because any one library is bad. The audit is blunt:

| Root cause | What it actually is | Severity |
|---|---|---|
| **Proxy-engine sprawl** | 5+ engines wired at once (Ultraviolet, Dynamic, Scramjet, Rammerhead, Epoxy, LibCurl). Rammerhead/Epoxy/LibCurl are **non-functional stubs** that return plaintext `"X proxy registered for: ..."` yet are still selectable in the settings dropdown — picking one silently breaks browsing. | Critical |
| **Duplicate UV config** | Two competing `__uv$config` for the same `/a/` prefix with different asset paths and different codecs (`btoa` fallback vs `Ultraviolet.codec.xor`). Encode-at-registration and decode-in-SW can diverge → broken proxied URLs. | Critical |
| **Service-worker civil war** | The same `/a/` traffic is claimed by two SWs with overlapping scopes, registered from 3+ racing code paths that unregister each other. A 15KB "completely recoded" `sw-new.js` is dead code. Browsers latch onto stale `.backup` SWs. | Critical |
| **The crash bomb** | `server.js` calls `process.exit(1)` on **any** `unhandledRejection`/`uncaughtException`. One transient error in any half-wired subsystem kills the whole proxy. This is the single most direct cause of the reported "unstable." | Critical |
| **Legacy transport, no Wisp** | Everything rides the deprecated TompHTTP bare-server v3 at `/o/`. `epoxy`/`libcurl` are installed but **require a Wisp endpoint that does not exist**, so they cannot function. Bare version drifts (v3 vs v2) across configs. | High |
| **Auth sprawl** | Four+ auth mechanisms layered together (startup gate, `express-basic-auth`, Mongo enhanced auth, KeyAuth, plus Spotify OAuth), mostly half-wired behind env flags. AdSense admin check is a plaintext Basic-auth compare. | High |
| **Feature bloat / dead deps** | AdSense returns **hardcoded mock** revenue; Spotify has full OAuth + 3 Mongo collections; KeyAuth calls out to `keyauth.win`; Mongo silently degrades to "fallback mode"; `connect-mongo`, `@replit/database`, `puppeteer` are dependencies with no real runtime use. | High |
| **Zero tests, monolith UI** | `npm test` runs `node --test` against **zero test files**. UI is single-file HTML with inline scripts (`settings.html` 94KB, `music.html` 61KB) and mismatched engine dropdowns — hence ~15 consecutive "Fix UI bug" commits. | High |
| **Neutered security** | CSP allows `unsafe-inline`/`unsafe-eval`/`https:`; CORS reflects any origin with credentials; `/e/*` proxies arbitrary paths from hardcoded third-party GitHub raw repos. | High |
| **Committed junk** | `sw.js.backup/backup2/backup3`, `index-v8.html`, `settings.js.backup`, **2.7MB of source maps**, a 1.2MB wallpaper — all in git. | Medium |

**One-line diagnosis:** V9 tried to be five proxies, five auth systems, and four SaaS integrations at once, with no tests and a hair-trigger `process.exit`. Instability is the arithmetic sum of that surface area.

---

## 2. V10 vision

> **V10 is the boring, stable, long-term SlowGuardian: one proxy engine, one transport, one service worker, one auth path, a real test suite, and honest stealth. It is designed to be maintained by a solo/small team for 12+ months without the wheels coming off.**

**Explicitly rejected** (this is not a wish list — the same instinct that half-wired Spotify/KeyAuth/AdSense into V9 lives in `FUTURE_ROADMAP_V10.md`):

- ❌ AI assistant / ML pipeline
- ❌ Blockchain / DAO / "web3" anything
- ❌ "Quantum" / "zero-trust" / "enterprise suite" branding
- ❌ Running multiple proxy engines "for compatibility"
- ❌ Any feature that needs a new database schema to ship the core proxy

The V10 roadmap is a **cut list, not a feature list**. Scope creep is treated as a bug.

---

## 3. Target architecture

### 3.1 Proxy pipeline (the heart)

The web-unblocker ecosystem consolidated in 2025–26 around exactly one shape, shipped identically by the official Scramjet-App, Interstellar, and Holy Unblocker LTS. V10 mirrors it verbatim:

```
Browser
  └─ ONE service worker  (/sw.js, scope "/")
        └─ Scramjet engine  (Rust/WASM rewriter)
              └─ bare-mux  (transport broker, SharedWorker)
                    └─ epoxy-transport  (default)  / libcurl-transport (Firefox fallback)
                          └─ Wisp  (one multiplexed WebSocket, /wisp/)
                                └─ wisp-js/server  (mounted on Node http "upgrade")
```

**Chosen engine: Scramjet.** TitaniumNetwork's own repo now marks Ultraviolet "succeeded by Scramjet… not really maintained anymore." Scramjet's WASM rewriter is far faster than UV's JS rewriting and handles Google/YouTube/Discord/Reddit/now.gg. One engine = one code path = bisectable bug reports.

**Chosen transport: Wisp via `wisp-js/server`**, replacing bare-server v3 entirely. Many sockets over one WebSocket → fewer connections, more stable on heavy pages. We do **not** use `wisp-server-node` (deprecated for security/stability).

**Pinned, version-matched LTS set** (treat as one unit; bump together, never individually):

| Package | Pin | Role |
|---|---|---|
| `@mercuryworkshop/scramjet` | `^1.1.0` | Proxy engine |
| `@mercuryworkshop/wisp-js` | `^0.4.1` | Wisp server |
| `@mercuryworkshop/bare-mux` | `2.1.9` (exact, frozen) | Transport broker |
| `@mercuryworkshop/epoxy-transport` | `^2.1.28` | Default transport |
| `@mercuryworkshop/libcurl-transport` | `^1.5.2` | Firefox fallback |

`bare-mux` is frozen at 2.1.9 (superseded by `proxy-transports`) but that is exactly what the reference apps ship and it is version-matched to Scramjet 1.x. **Do not** early-adopt `proxy-transports` in the LTS baseline; track it for a future minor.

Server must set **COOP + COEP** headers — Scramjet's WASM + SharedWorker path silently fails to initialize without them.

### 3.2 Frontend stack

**Astro 5.x in static (MPA) mode**, Vite-powered.

Why Astro over the alternatives, for *this* project specifically:
- Ships **zero JS by default** — right for low-end Chromebooks.
- Outputs **plain multi-page HTML** with no framework router and no framework-generated SW, so it coexists cleanly with the root-scoped proxy SW. (This is precisely why **SvelteKit and Next are rejected** — their client routers fight the URL-rewriting proxy SW, and their PWA/SW conventions try to claim the `/` scope.)
- Real component/layout model kills the 94KB-god-page problem.
- **Content Collections + Zod** give a build-validated home for the games/apps catalog.

Interactive widgets only (settings panel, catalog search/filter, tab-cloak controls, music player) become **islands** via `@astrojs/preact` (3KB runtime) hydrated `client:visible`/`client:idle`. Everything else stays static HTML. Preact over React for the runtime-size win on the target hardware.

The proxy SW and all proxy runtime dirs live in Astro's `public/` (copied verbatim, **un-fingerprinted, stable URLs**). App CSS/JS gets hashed; the SW and runtime never do.

### 3.3 Backend stack

**Stay on Express.** In this architecture the framework is nearly irrelevant to proxy stability — Wisp traffic is handled at the raw `node:http` `upgrade` event *before Express ever sees it*. Express only serves static files and small JSON APIs. Rewriting to Fastify/Hono churns every battle-tested middleware for zero proxy benefit.

- Ship V10.0 on **Express 4.21.x (pinned)**.
- Migrate to **Express 5.1+** in a later V10.x minor **only after the smoke suite is green** (Express 5 gives native async-error handling; migrating without tests is how LTS projects break).
- Config: **`envalid`** — typed, fail-fast, validated at import. Feature flags derive from env presence (`SPOTIFY_CLIENT_ID` set → plugin loads; nothing set → memory adapter + core proxy still works). Delete `global.config`.
- Storage: a **`StorageAdapter` interface** with three impls — `memory` (default, zero-config), **`better-sqlite3`** (recommended persistent single-node), `mongodb` (optional). Replaces the env-sniffing "fallback mode."
- Logging: **`pino` + `pino-http`**, JSON to stdout, redaction on (`authorization`, `cookie`, `*.password`, `*.token`), `pino-pretty` dev-only.
- Runtime: **Node 22** (`.nvmrc`, `engines: >=20`; Node 18 is EOL). Single canonical **Docker image** (`node:22-bookworm-slim`, multi-stage, non-root, `tini`, `HEALTHCHECK`).

### 3.4 What gets CUT (non-negotiable)

| Cut | Replaced by / reason |
|---|---|
| Ultraviolet, Dynamic, Rammerhead, Epoxy-as-engine, LibCurl-as-engine | **Scramjet only** |
| Bare-server v3 + all bare configs | **Wisp / wisp-js** |
| Duplicate `a/config.js` + `m/config.js`, both codecs | one config, one codec |
| All SW/backup files (`sw-new.js`, `sw.js.backup*`, `a/sw-fixed.js`, `a/sw.js.backup*`, per-engine SW trees `dy/ rh/ m/ ep/ lc/`) | **one `sw.js`** |
| `express-basic-auth`, KeyAuth, Mongo enhanced auth, plaintext `isAuthorizedUser` | **one first-party session auth** |
| Spotify, AdSense (incl. mock revenue endpoints), KeyAuth, Mongo fallback plumbing | Spotify → optional plugin; AdSense → deleted; the rest → gone |
| `connect-mongo`, `@replit/database`, `spotify-web-api-node`, `puppeteer`, `setup-scramjet.cjs` | deleted deps / serve package `dist` directly |
| 2.7MB `.map`, `index-v8.html`, `settings.js.backup`, 1.2MB wallpaper | removed / WebP-optimized |
| `process.exit(1)` on every rejection | crash-only **at the process level only**, subsystem errors isolated |
| `replit.nix` | dropped (Replit DB dep already dead) |
| ~~`vercel.json`~~ | **KEPT** — via split-deploy (see §6.1): Vercel serves the static Astro frontend, the Wisp proxy backend runs on a persistent host |
| `"upd": "git pull --force --allow-unrelated-histories"`, `npm audit fix` in build | deleted (non-reproducible / destructive) |

---

## 4. Phased roadmap

Sequenced so a **working proxy exists at the end of Phase 1**, then stability compounds. Each phase has hard exit criteria.

### Phase 0 — Foundations & demolition *(the recode scaffold)*
**Deliverables**
- Fresh V10 branch. New repo skeleton (§6). Node 22, `.nvmrc`, pinned Express 4.21.x.
- Delete all dead engines, backup SWs, source maps, `index-v8.html`, Spotify/KeyAuth/AdSense/Mongo-fallback code, dead deps.
- `envalid` config module; `global.config` removed. `pino` logging in.
- Single version source of truth: `package.json` (collapse `config.js version`, `version.txt`).
- CI shell: eslint + prettier + `astro check` + build gate on PRs.

**Exit criteria:** repo builds; `git ls-files` contains zero `.backup*`/`.map`/dead-engine files; `npm ci` pulls no `puppeteer`/`@replit/database`; config fails fast with a clear message on bad env.

### Phase 1 — The single proxy path *(prove the core)*
**Deliverables**
- `wisp-js/server` mounted on the `upgrade` event at `/wisp/`; everything else on upgrade → socket destroyed.
- Scramjet bundle served at `/scram/`, bare-mux at `/baremux/`, epoxy at `/epoxy/`.
- **One `sw.js`** at scope `/` using the canonical Scramjet-App pattern (`importScripts('/scram/scramjet.all.js')` → `scramjet.route/fetch` else passthrough).
- COOP/COEP headers set. Client boot: register one SW, `BareMux.SetTransport(epoxy → /wisp/)`, navigate via Scramjet prefix.

**Exit criteria:** from a clean profile, you can proxy `wikipedia.org` and `youtube.com`; SW registers exactly once; hard-refresh does not break it; no `process.exit` on a bad proxied URL.

### Phase 2 — Frontend rebuild *(kill the god-pages)*
**Deliverables**
- Astro MPA: `Base.astro` layout + `pages/*.astro` (one file per route) + small components.
- Catalog as **Content Collections** (`games`, `apps`) with Zod schema; slim generated JSON for the search island.
- Theming as attribute-switched CSS custom properties + pre-paint inline script (no FOUC, no stylesheet swapping).
- Settings/catalog/music/cloak as Preact islands. Express serves Astro `dist/`.
- Wallpaper → WebP + optional; icons through `astro:assets`.

**Exit criteria:** no HTML file > ~15KB of inline logic; catalog build fails if a Zod entry is malformed; theme switch has zero flash; Lighthouse perf acceptable on a throttled low-end profile.

### Phase 3 — Stealth & cloaking *(§5)*
**Deliverables:** single source-of-truth cloak profile; tab cloak default-on and flash-free; fixed panic key/button; opt-in about:blank + blob fallback; referrer hygiene; app-shell caching. **Exit criteria** in §5.

### Phase 4 — Stability hardening *(the LTS keystone)*
**Deliverables**
- Three-layer test pyramid, including the **Playwright proxy-a-fixture smoke test** (§6).
- Full CI: lint + unit + integration + Playwright smoke + Docker build, all required on protected branches.
- `/healthz` + `/readyz` split; degraded-mode contract; ServiceRegistry; `/api/features`.
- Correct shutdown ordering with drain timeout. `asyncHandler` wrapper for routes.
- Renovate with proxy deps pinned-exact and grouped; gitleaks; report-only `npm audit`.

**Exit criteria:** smoke test green on every PR in < 2 min; server boots and proxies the fixture with **zero optional env vars**; branch protection blocks merges on red.

### 1.0 LTS release
**Deliverables:** cut `v10.0.0` from a long-lived `v10.x` branch; `main` becomes v11-dev. `release-please` + Conventional Commits live. `RELEASES.md` support-window policy. Docker image → GHCR (`:sha`, `:v10.0.0`, rolling `:v10-lts`). Deployed to Render.

**Exit criteria:** a fresh operator can `docker run` the image and proxy a site with no config; CHANGELOG is auto-generated; a tagged release exists.

### Post-1.0 (only if telemetry/issues justify — never speculatively)
- Optional **Ultraviolet fallback** engine as a *navigation-time user choice sharing the same Wisp transport* (never concurrent workers).
- Express 4 → 5 migration behind the green smoke suite.
- `bare-mux` → `proxy-transports` migration once Scramjet officially adopts it.
- Signed mirror-manifest "get latest link" feature (§5).

---

## 5. Stealth & Cloaking

Honest framing first: "stealth" is two separable jobs. (1) Defeating **over-the-shoulder / browser-history review** — a client-side UX problem we *can* solve. (2) Surviving **network-level filtering** — GoGuardian proactive proxy detection and Securly work at the DNS/SNI layer, and **no client-side cloak beats them**. V10 markets stealth around (1) only. We do not oversell.

**Single source of truth:** one cloak profile consumed everywhere, ending V9's contradictory identities (tab said "Google Classroom" while the popout said "My Drive"):
```
cloakProfile = { title, faviconDataUri, decoyUrl, panicKeys, mode }
```

### Ships by default (on)

| Feature | Implementation notes (fixing the V9 bugs) |
|---|---|
| **Tab cloak** (favicon + title) | Write title/favicon **inline in `<head>` before first paint** from localStorage (V9 applied it late → real title flashed). Re-assert via `MutationObserver` on `<title>` + `visibilitychange` (proxied pages overwrite `document.title`). Favicon **data-URI embedded** so a blocked CDN can't strip it. Keep V9's preset list (Classroom/Docs/Drive/Clever/Canvas/Schoology/i-Ready) + custom. |
| **Panic key + always-on-top panic button** | Use `top.location.replace(decoy)` — **not** `location.href` (V9 left the proxy in back-button history). Register keydown **inside the proxied frame** and `postMessage` to parent (V9's top-window-only listener never fired while browsing). Ship a **working, tested default chord** (V9's `['Ctrl','E']` never matched — `event.key` is `'Control'`, and it compared a sequence not a chord). Default decoy = **Google Classroom**, user-configurable, one consistent decoy everywhere. |
| **Referrer hygiene** | `<meta name="referrer" content="no-referrer">` on all app pages; `rel="noreferrer noopener"` on outbound links; real destination never in address/query. Engine already sets referrer. **No** canvas/WebGL/UA fingerprint spoofing — it breaks proxied sites and is out of scope. |

### Ships optional (off by default)

| Feature | Notes |
|---|---|
| **about:blank cloak** | Opt-in, **gesture-triggered, single-shot, Firefox-gated**. V9's `h.js` had to be disabled for auto-spawning an infinite loop of popups — never auto-on. Uses the same tab-cloak identity. |
| **blob: cloak (fallback)** | When about:blank fails. One "Open cloaked" control tries about:blank → falls back to blob. **`data:` dropped entirely** (Chrome blocks top-level `data:` navigation since 2018). |
| **App-shell caching** | Cache API precache of HTML/CSS/JS/icons, stale-while-revalidate. **Honesty in code + UI:** once the domain is DNS/SNI-blocked, only the shell + already-cached assets survive; live proxying stops. Never cache proxied third-party responses. |
| **Signed mirror manifest** (post-1.0) | Tiny hashed/signed JSON of live mirrors on a swappable host (GitHub/Cloudflare Pages); fetch-with-fallback shows freshest reachable mirror. Kept out of core UX. |

### Explicitly NOT shipped
- ❌ **Anti-close (`beforeunload`)** — browsers neuter it, it traps the user's own navigation, and the abnormal behavior is itself a fingerprint on monitored networks. (For accidental-close, persist last-URL to localStorage + offer restore.)
- ❌ **History flooding** (`pushState` back-button traps) — throttled and user-hostile.
- ❌ **`data:` URL cloaking** — dead method.

**Phase 3 exit criteria:** tab cloak set before first paint with no flash and re-asserts after a proxied page overwrites the title; panic button *and* the default hotkey both fire while actively viewing a cross-origin proxied site and leave **no** back-button history entry; one decoy identity everywhere.

---

## 6. Stability & LTS engineering

### Test pyramid (the reason V10 can be called LTS)

| Layer | Tooling | Covers |
|---|---|---|
| **Unit** | `node:test` (already wired, zero new deps) | config validation, blocking/pause enforcers, plugin manager, storage adapters |
| **Integration** | `supertest` + exported `createSlowGuardianServer()` | `/healthz`, static assets, auth flow, **degraded-mode contract (boots + proxies with NO env vars)** |
| **E2E smoke (release gate)** | **Playwright (chromium)** | starts V10 + a **local fixture target server** (HTML rewrite, inline JS, cookies, a 302, a POST form, a WS echo), `page.goto('/')`, waits for `serviceWorker.ready`, submits the fixture URL through the real search flow, asserts inside the proxied frame that JS ran, cookies round-tripped, WS echoed |

- Fixture is **local** → smoke runs in < 2 min with no flaky internet, on every PR.
- **Nightly, non-blocking** job proxies 3–5 live sites (example.com, wikipedia.org, duckduckgo.com) and files an issue on regression — catches upstream site changes without making PRs flaky.
- This replaces V9's CI, which merely `curl`ed for 200s and proved nothing about actual proxying.

### CI pipeline (one GitHub Actions workflow, all required on `main` + `v10.x`)
1. eslint + `prettier --check`
2. `node:test` unit+integration on Node 20/22 matrix
3. Playwright smoke (chromium)
4. Docker build (no push on PR; push to GHCR on tag)
5. `npm audit --omit=dev` **report-only**; `gitleaks` for committed secrets
- **Renovate**: proxy-engine deps (`scramjet`, `wisp-js`, `bare-mux`, `epoxy`, `libcurl`) **pinned exact and grouped into one PR that must pass the smoke test** — they move fast and are the highest-risk updates.

### Versioning / LTS policy (`RELEASES.md`)
- SemVer. `v10.x` = LTS branch; `main` = v11-dev.
- v10.x gets **bug + security fixes only** for **12 months active + 6 months maintenance** (security-only).
- Fixes land on `main`, backported by cherry-pick (`backport-v10.x` label + `korthout/backport-action`).
- **Conventional Commits** enforced on squash-merge PR titles (`amannn/action-semantic-pull-request`).
- **`release-please`** auto-maintains `CHANGELOG.md`, bumps version, cuts releases. This is the direct fix for V9's changelog ending in *"I DONT UPDATE THIS"* — discipline must be automated or it won't happen.

### Observability & resilience
- **`/healthz`** (liveness, no dependency checks — for Docker `HEALTHCHECK`/Render) + **`/readyz`** (readiness, JSON per-subsystem: `{proxy:'ok', storage:'memory-fallback', plugins:{spotify:'disabled'}}`) + `/api/features` so the frontend hides UI for absent services instead of showing broken buttons.
- **Crash-only, but at the right level:** keep `uncaughtException`/`unhandledRejection` → `pino.fatal` → `exit(1)`, and make **restart the supervisor's job** (Docker `restart: unless-stopped` / Render auto-restart). Until Express 5, a 5-line `asyncHandler` wraps routes so rejections reach the error middleware — **not** the `express-async-errors` monkey-patch.
- **Fixed shutdown ordering** (V9 closed Mongo *before* the server): (1) `server.close()`, (2) close Wisp WebSockets, (3) drain in-flight HTTP with a 10s deadline then `closeAllConnections()`, (4) close storage, (5) exit 0.
- **Deploy:** see §6.1 — Vercel-hosted static frontend + persistent-host proxy backend (split-deploy), keeping Vercel support as required.

### 6.1 Deploy topology — keeping Vercel (split-deploy)

Vercel serverless/edge functions **cannot hold a long-lived WebSocket** (the Wisp transport is one persistent `wss://` connection), and they impose execution-time/streaming limits. Running the proxy engine *on* Vercel is exactly the class of flakiness that made V9 unstable. But Vercel is *excellent* at what the frontend needs. So we split the two concerns instead of dropping Vercel:

| Piece | Host | Why |
|---|---|---|
| **Static frontend** (Astro `dist/` — home, catalog, settings, `sw.js`, Scramjet/bare-mux runtime) | **Vercel** (or Cloudflare Pages) | It's pure static output — Vercel's CDN, previews, and DX are ideal, and it's free/fast. |
| **Wisp proxy backend** (persistent Node process: `/wisp/` WebSocket endpoint) | **Render / Railway / Fly / self-host Docker** | A WebSocket proxy needs an always-on process; serverless can't do it. |

The frontend points `bare-mux` at the remote Wisp endpoint (`wss://proxy.<domain>/wisp/`) via `BareMux.SetTransport`. The backend enables CORS for the frontend origin and sets COOP/COEP. This is a clean, well-supported topology — the frontend can even be **all-Vercel with zero backend** if you ever host the Wisp endpoint on a subdomain you already run.

- **Single-host alternative** (simplest ops): run the whole Express+Wisp app as one Docker image on Render, and *also* deploy the same static frontend to Vercel as a mirror/fallback. Same image, two front doors.
- **What we do NOT do:** try to run Wisp/bare *as* Vercel functions. That path can't hold WebSockets and will generate a permanent stream of "proxy broken on my deploy" issues.

---

## 7. Proposed repo / module structure

```
slowguardian/
├─ src/                         # backend (Express)
│  ├─ server.js                 # http server, upgrade→wisp routing, COOP/COEP, shutdown
│  ├─ config.js                 # envalid, fail-fast, single source of truth
│  ├─ app.js                    # express app: static dist/, /api, auth
│  ├─ proxy/
│  │  └─ wisp.js                # wisp-js/server mount
│  ├─ routes/                   # /api, auth, features
│  ├─ middleware/               # helmet, rate-limit, asyncHandler, admin
│  ├─ storage/
│  │  ├─ adapter.js             # StorageAdapter interface
│  │  ├─ memory.js  sqlite.js  mongo.js
│  ├─ plugins/                  # PluginManager; spotify/ lives here (opt-in)
│  ├─ health/                   # healthz, readyz, ServiceRegistry
│  └─ utils/logger.js           # pino
├─ web/                         # Astro frontend
│  ├─ src/
│  │  ├─ layouts/Base.astro     # head, pre-paint theme+cloak script, nav, footer
│  │  ├─ pages/*.astro          # one file per route (MPA)
│  │  ├─ components/            # Nav, Footer, GameCard + islands (SettingsPanel, CatalogGrid, MusicPlayer)
│  │  ├─ content/               # games + apps collections (Zod schemas)
│  │  ├─ lib/cloak.ts           # single cloakProfile source of truth
│  │  └─ styles/                # tokens.css, themes.css, base.css
│  └─ public/                   # VERBATIM, stable URLs:
│     ├─ sw.js                  # the ONE service worker
│     ├─ scram/  baremux/  epoxy/   # proxy runtime (served from package dist)
│     └─ media/                 # optimized wallpaper, icons
├─ test/
│  ├─ unit/  integration/       # node:test + supertest
│  └─ e2e/                      # Playwright smoke + fixture target server
├─ .github/workflows/ci.yml
├─ Dockerfile  .dockerignore  render.yaml  .nvmrc
├─ RELEASES.md  CHANGELOG.md (release-please)  CLAUDE.md
```

Frontend (`web/`, Astro static build) and backend (`src/`, Express) are **decoupled**: `astro build` emits `dist/`, Express serves it. No SSR adapter to maintain.

---

## 8. Risks & tradeoffs (honest)

- **Scramjet is young and fast-moving.** Betting the LTS on a `^1.1.0` engine whose transport (`bare-mux`) is already frozen is a real risk. Mitigation: pin the whole set exact, gate every bump on the smoke test, keep UV fallback as a *documented escape hatch* for post-1.0.
- **Single engine = some sites won't proxy.** Dropping four engines will surface a few compatibility gaps. This is a deliberate trade: bisectable stability now over "maybe more sites work" chaos. The nightly live-site job tells us when it matters.
- **`wisp-js/server` vs `wisp-server-node` conflict in the research.** The two streams disagree; I've chosen `wisp-js` (the newer stream flags `wisp-server-node` as deprecated). Needs one validation spike in Phase 1.
- **Rewrite cost is front-loaded.** Astro migration + test harness is real work for a solo maintainer before users see benefit. Mitigation: Phase 1 delivers a working proxy on the *old* UI shell if needed; the frontend rebuild (Phase 2) can lag.
- **Stealth honesty may disappoint users** who expect "undetectable." Better to under-promise: we defeat shoulder-surfing and history review, not network filters.
- **Cutting features breaks V9 users** relying on Spotify/music/KeyAuth. LTS is the right moment to break compatibility once, then freeze. Spotify survives as an opt-in plugin.

---

## 9. Decisions needed before build

> **Update:** all resolved — see `v10/BUILD_STATUS.md` for the locked set. Summary: Scramjet-only · public proxy + simple env-password admin gate (ZADMIN auth deferred — no work on it yet) · better-sqlite3 · Vercel frontend + Render backend · music slot reserved for a future project · mirrors post-1.0 · LTS 6+6 months · leave git history. Original recommendations below for reference.

1. **Engine posture at 1.0:** ✅ **RESOLVED — Scramjet-only.** UV kept as a documented post-1.0 escape hatch, added only if the nightly live-site test proves a real compatibility gap.
2. **Wisp server choice:** confirm `wisp-js/server` (pick) vs `wisp-server-node`. The research streams conflict; sign-off wanted before the Phase 1 spike.
3. **Persistent storage default:** ship `better-sqlite3` as the recommended persistent adapter, or keep `memory` as the documented default and treat SQLite as opt-in?
4. **Spotify/music:** keep as an opt-in plugin (recommended), or cut entirely for 1.0 and reconsider later?
5. **Auth scope for 1.0:** do we even need user accounts at launch, or is the core a **public unauth proxy** with an admin gate only? Simpler is more stable.
6. **Frontend framework sign-off:** Astro MPA + Preact islands — approve, or prefer vanilla-TS + Vite (the runner-up, less structure for contributors)?
7. **Deploy target:** ~~drop Vercel~~ **RESOLVED — Vercel kept** via split-deploy (§6.1: static frontend on Vercel, Wisp backend on a persistent host). Remaining choice: which persistent host for the proxy backend — Render, Railway, Fly, or self-host Docker?
8. **LTS support window:** approve 12 months active + 6 months security-only, or a different window?
9. **Domain/mirror strategy:** is the signed mirror-manifest feature in scope post-1.0, or handled entirely outside the app (Discord announcements)?
10. **Git history:** rewrite to purge the 2.7MB maps + 1.2MB wallpaper (smaller clones, rewritten history) or leave history and just stop tracking them going forward?
