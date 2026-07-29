# SlowGuardian V10 — Build Status

Ground-up recode. Built under `v10/` alongside V9 until cutover, so `main` stays shippable during the rebuild. Plan: `../V10_RECODE_PLAN.md` · Design: `../DESIGN_V10.md` + `../docs/design/v10-mockup.html`.

## 🟢 LIVE (2026-07-08)
First real deployment is up and **verified end-to-end**: **https://slowguardian-v10.onrender.com** (Render Web Service, one Node service serving frontend + proxy, deployed from `claude/slowguardian-v10-recode-ji8x55`, Root Directory `v10`, build `npm ci && npm run build:web`, start `node src/server.js`, health check `/readyz`). Confirmed on the live host: `/healthz` + `/readyz` all 5 checks green, lander + onboarding render, and **the proxy loaded a live HTTPS site (example.com) end-to-end through Wisp/Scramjet** — closing the Phase 1 "re-confirm HTTPS on a real egress" caveat. Note: Free tier spins down after ~15 min idle (~30 s cold start); bump to Starter for always-warm.

## Locked decisions
- **Proxy:** **Scramjet-only** over Wisp (`wisp-js/server`), single service worker, bare-mux transport. Drop UV/Rammerhead/Dynamic/bare v3. (UV = documented post-1.0 escape hatch, added only if the nightly live-site test proves a real gap.)
- **Frontend:** Astro static MPA + Preact islands. **UI: Liquid Glass, dark-first** (Apple), Dynamic Island nav (per-tab icons, icon-only collapse), light toggle, perf-gated blur.
- **Backend:** Express + envalid config + pino logging. **Storage: better-sqlite3** (embedded file DB) for the small admin/global state. No MongoDB.
- **Accounts:** **Public proxy** — no user sign-ups; user settings live client-side. Single **admin gate** for global controls (pause, blocklist).
- **Admin auth:** 1.0 ships a **simple env-password admin gate** — that's it. ZADMIN Auth is a separate future maintainer project; **no ZADMIN work (not even an adapter) until the maintainer says so.**
- **Deploy:** **Vercel** (static frontend) + **Render** (persistent Wisp backend) — split-deploy. Replit removed; one Docker image = canonical artifact.
- **Kept in 1.0:** multi-tab in-app browser (rebuilt clean), **about:blank cloak** (opt-in, gesture-triggered — port of V8's working `static/assets/scripts/h.js` `createAboutBlank`, minus the V9 auto-run bug), tab disguise, quick-exit.
- **Reserved slot:** the old music/Spotify position → held for a **future project integration (TBD by maintainer)**. Not building music.
- **Reachability:** in-app signed "get latest link" mirror manifest → **post-1.0**.
- **LTS window:** **6 months active + 6 months security-only** for v10.x.
- **Git history:** leave history intact; stop tracking the big files (2.7MB maps, 1.2MB wallpaper) from here on (no force-push).
- **Privacy scope:** shoulder-surf/history defense + reachability only. No monitoring-evasion / anti-screenshot / anti-close. (Settled.)

## Phases
- [~] **Phase 0 — Foundations**
  - [x] Design tokens extracted → `web/src/styles/tokens.css`
  - [x] Backend skeleton (`src/`): envalid config, pino logger, structure
  - [x] Astro project init (`web/`), base layout with pre-paint theme/cloak script
  - [ ] Remove dead V9 artifacts at cutover
- [x] **Phase 1 — Single proxy path** ✅ **VERIFIED** — wisp-js + Scramjet + one SW + bare-mux/epoxy, COOP/COEP. Details below.
- [x] **Phase 2 — Frontend** ✅ **VERIFIED** — Astro 5 MPA, Liquid Glass + Dynamic Island, Netflix library over the real 284-game/55-app catalog, proxy-integrated multi-tab go page. Details below.
- [x] **Phase 2.1 — Design sync** ✅ **VERIFIED** — real app brought in line with the approved mockup (`docs/design/v10-mockup.html`, artifact 950d7919). `/` = Google-style search **lander**; the games library moved to `/games` (nav + ⌘K updated). Games/Apps gained a dense full-width **"All" grid** (283/55 tiles, real icons) below the shelves; the in-library search field was dropped (unified into ⌘K). The `/go` proxy was reskinned to **look like Google Chrome** (tab strip, pill omnibox, menu/avatar, Chrome new-tab page with shortcut tiles) — the verified multi-tab Scramjet wiring is untouched. `/settings` became the three-card grid (Performance/Privacy&exit/About). Sticky-footer full-height layout across all pages. `npm run build` green (6 routes); every page rendered against `src/server.js` with zero console errors and the proxy engine reaching "ready".
- [x] **Phase 3 — Privacy** ✅ **VERIFIED** — tab-disguise configurator (live preview, presets, custom title/favicon → `sg:cloak`), quick exit (decoy `sg:panicUrl` + rebindable `sg:panicKey`, double-Esc global), clear-traces, and the **opt-in about:blank cloak**. Mirror rotation stays **post-1.0** (locked decision). Details below.
- [x] **Phase 4 — Stability** ✅ **VERIFIED** — Playwright proxy smoke test (local fixture, no live internet), `/healthz` + `/readyz`, GitHub Actions CI, and the canonical Docker image. Details below.
- [x] **Feature parity + legacy backups** ✅ — V8/V9 preserved on `legacy/v8` (`a91599b`, Version8.9a) and `legacy/v9` (`main`). V9 features audited; gaps closed (onboarding, search-engine choice, expanded cloak presets, proxy fullscreen/pop-out). README rewritten with a full carried-over / superseded / dropped map. Details below.
- [ ] **1.0 LTS** (flip `10.0.0-rc.1` → `10.0.0`, GHCR image push, cutover)

## Phase 1 verification (2026-07-04)
Ran locally against `node src/server.js` + headless Chromium:
- ✅ Server boots; `/healthz` 200; **COOP `same-origin` + COEP `require-corp`** on every response.
- ✅ Bundles served straight from node_modules: `/scram/scramjet.all.js` (+ `scramjet.wasm.wasm`), `/baremux/{index.js,worker.js}`, `/epoxy/index.mjs`.
- ✅ Wisp upgrade: `/wisp/` → `101 UPGRADED`; non-wisp upgrade → socket dropped. (`test/wisp-handshake.mjs`, zero-dep.)
- ✅ End-to-end: SW registers + activates + controls; bare-mux sets the epoxy transport; wisp opens the target TCP stream; **a live HTTP site (httpforever.com) rendered fully-styled inside the Scramjet frame.**
- ⚠️ HTTPS targets fail **in this dev sandbox ONLY**: outbound TLS is MITM-intercepted (cert issued by "Anthropic Egress Gateway CA"), which epoxy's bundled Mozilla root store correctly rejects. Not a wiring bug — a normal deploy (Render / real egress, no TLS MITM) validates real public certs. Re-confirm HTTPS on the first Render deploy.

**Pinned co-released version set (bump together, one smoke-tested PR):** scramjet `1.1.0` · wisp-js `0.4.1` · bare-mux `2.1.9` · epoxy-transport `2.1.28`. epoxy stays on 2.x deliberately — its `node` conditional export exposes the `epoxyPath` helper the server imports; epoxy 3.x dropped that helper.

## Fix applied during Phase 1
- `public/boot.js`: register the service worker + set the transport **eagerly on load** (not on first form-submit), so the SW is active/controlling before the first navigation.

## Phase 2 verification (2026-07-05)
Astro 5 static MPA under `v10/web/`, served by the Phase 1 Express server (which now serves `web/dist/`, falling back to `public/` if unbuilt). `npm run build` green — 5 pages.
- ✅ **Home** — Dynamic Island (per-tab icons + collapse), hero + omnibox → `/go?url=`, and the **Netflix library over the real catalog**: featured billboard + shelves (Popular / 2-Player / Runs Offline / …), 838 tiles from the 284-game collection with real icons.
- ✅ **Apps** — same Library over the 55-app collection.
- ✅ **Go (proxy)** — Liquid Glass **multi-tab browser** (tab strip + new/close, address bar with back/forward/reload, always-visible **Exit**/quick-exit); reuses the verified Phase 1 wiring; **proxied a live site (httpforever.com) end-to-end through the new UI.**
- ✅ **Settings / Privacy** — theme (dark/light) + accent swatches + performance mode, plain privacy copy.
- Catalog: `src/content.config.ts` (Astro 5 file() loader, Zod schema), data in `src/content/{games,apps}.json` (284 / 55, converted from V9's g.json/a.json). Icons synced from committed `static/` at build (`scripts/sync-icons.mjs`, prebuild) — not duplicated in git.

## Phase 3 verification (2026-07-05)
Privacy features live on `/privacy` (configurators) with the actions exposed on `window.SG` from the Base shell. `npm run build` green — 6 routes.
- ✅ **Tab disguise** — presets (Classroom/Docs/Drive/Clever) + custom title/favicon with a live tab-chip preview → `sg:cloak`; the Base pre-paint boot applies it before first paint on every tab.
- ✅ **Quick exit** — decoy URL (`sg:panicUrl`) + rebindable single key (`sg:panicKey`) via `location.replace` (no history); global double-Esc owned by Base.
- ✅ **about:blank cloak** — opt-in (`sg:aboutblank`), **gesture-triggered** port of V8's `createAboutBlank` (`static/assets/scripts/h.js`) minus the V9 auto-run bug: opens an about:blank popup, loads SlowGuardian in a full-page iframe wearing the `sg:cloak` title/favicon, adds a `beforeunload` guard, then **redirects the origin tab to the decoy**. Firefox is guarded (it blocks the pattern). **Driven end-to-end in headless Chromium:** popup opened with the disguise title, iframe `src` = origin, `beforeunload` set, origin tab redirected to the decoy — no console errors.
- ✅ **Clear traces** — wipes `sg:*` localStorage, sessionStorage, and Cache Storage (Base `SG.clearTraces`).
- ⏭ **Mirror rotation** — deferred to post-1.0 (locked decision).

## Phase 4 verification (2026-07-05)
Stability + release plumbing. `npm run build:web` green; both test suites pass locally.
- ✅ **Health/readiness** — `/healthz` (liveness: `{ok, version, uptime}`) and `/readyz` (readiness: 200/503 with a per-asset check list — proxy bundles + built frontend must actually resolve). Load balancers gate on `/readyz`.
- ✅ **Proxy smoke test** — `test/e2e.spec.mjs` (Playwright). Boots the real server (webServer waits on `/readyz`), asserts the lander/games render, health + COOP/COEP headers, and — the key test — **proxies a local fixture end-to-end** (SW → bare-mux → epoxy → wisp TCP → Scramjet rewrite → fixture DOM), so it never depends on live internet. **5/5 pass** in headless Chromium.
  - Needed one server change: wisp-js blocks loopback/private IPs by default (SSRF hygiene). Enabled `allow_loopback_ips` **only under `NODE_ENV=test`** so the fixture is reachable; dev/prod stay locked (`allow_private_ips:false` always).
- ✅ **Wisp handshake** — `test/wisp-handshake.mjs` still green (`/wisp/` → 101, non-wisp upgrade dropped).
- ✅ **CI** — `.github/workflows/v10-ci.yml` (scoped to `v10/**`, independent of the legacy `test-sw.yml`): build frontend → install Chromium → wisp handshake → Playwright e2e; plus a parallel **docker-build** job that builds the image (no push) so the Dockerfile is validated on every change.
- ✅ **Docker** — `v10/Dockerfile` (multi-stage: build Astro frontend → prod-only server deps [drops the test browser] → slim runtime; `HEALTHCHECK` hits `/readyz`; runs as `node`). Build **from the repo root** (`docker build -f v10/Dockerfile .`) because the web build sources the catalog icons from repo-root `static/`. `.dockerignore` added at the root. Not built in-sandbox (no daemon) — validated by the CI docker-build job and by verifying every constituent step locally.
- Version bumped `10.0.0-phase1` → **`10.0.0-rc.1`**.

## Feature parity + legacy backups (2026-07-05)
- ✅ **Legacy preserved** — `legacy/v8` → `a91599b` (Version8.9a, last V8 commit before the V9 transition); `legacy/v9` → `main` (V9 `9.0.0`). Both pushed.
- ✅ **V9 audited** against V10; gaps closed with clean rebuilds:
  - **Onboarding** — first-run modal (`web/src/components/Onboarding.astro`, rendered from Base): welcome → appearance (theme+accent, live) → privacy (disguise / about:blank opt-in) → done; guard `sg:onboarded`. Playwright-tested.
  - **Search-engine choice** — Settings picker (Google/Bing/DuckDuckGo/Startpage/Brave/Ecosia/custom) → `sg:engine` template; both the lander and proxy omniboxes honor it.
  - **Cloak presets** — expanded 4 → 12 (Classroom/Docs/Slides/Drive/Gmail/Meet/Canvas/Schoology/Khan/Clever/Wikipedia/PowerSchool) + custom.
  - **Proxy utilities** — added **Fullscreen** + **Open-in-new-window** (Ctrl+T/W/L intentionally skipped — they collide with the host browser).
- 📄 **README** rewritten (`v10/README.md`) with a transparent "carried over / intentionally not carried over / deferred" map so nothing is silently lost. Intentional drops (all previously agreed): multi-engine proxy/Rammerhead, accounts/premium/ads/KeyAuth, MongoDB, monitoring-evasion, music/Spotify, theme-zoo/particles/plugins/movable-buttons/features-manager, home widgets.

### Known follow-ups (not blocking)
- `astro check` (strict TS) flags implicit-any/null in a few bundled `<script>` blocks — type-only, does not affect `astro build`. Fix at 1.0 (CI) or loosen tsconfig for script blocks.
- Some cloak-preset favicons are cross-origin; under COEP they may fall back to the globe glyph (the tab **title** still disguises). Cosmetic.
- Duplicate ⌘K palette wiring (Base + Library both bind `#cmdList`) — minor last-writer-wins; reconcile via a `data-managed` gate.
- `/settings` has no Dynamic Island nav link (reachable via privacy cross-link) — add if wanted.
- Icon optimization: several catalog icons are >1MB; route through `astro:assets` / resize to tile size.
- Fix applied: `index.astro` rendered a `<!-- LIBRARY -->` placeholder from the shell part; replaced with `<Library collection="games" />`.
