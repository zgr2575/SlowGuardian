# SlowGuardian V10 — Build Status

Ground-up recode. Built under `v10/` alongside V9 until cutover, so `main` stays shippable during the rebuild. Plan: `../V10_RECODE_PLAN.md` · Design: `../DESIGN_V10.md` + `../docs/design/v10-mockup.html`.

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
- [ ] **Phase 3 — Privacy** (tab disguise, **about:blank cloak**, quick exit, clear traces, mirror rotation)
- [ ] **Phase 4 — Stability** (Playwright proxy smoke test, CI, health/readyz, Docker)
- [ ] **1.0 LTS** (v10.x branch, release-please, GHCR image)

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
- ✅ **Settings / Privacy** — theme (dark/light) + accent swatches + performance mode, honest privacy copy.
- Catalog: `src/content.config.ts` (Astro 5 file() loader, Zod schema), data in `src/content/{games,apps}.json` (284 / 55, converted from V9's g.json/a.json). Icons synced from committed `static/` at build (`scripts/sync-icons.mjs`, prebuild) — not duplicated in git.

### Known follow-ups (not blocking)
- `astro check` (strict TS) flags implicit-any/null in a few bundled `<script>` blocks — type-only, does not affect `astro build`. Fix in Phase 4 (CI) or loosen tsconfig for script blocks.
- Duplicate ⌘K palette wiring (Base + Library both bind `#cmdList`) — minor last-writer-wins; reconcile via a `data-managed` gate.
- `/settings` has no Dynamic Island nav link (reachable via privacy cross-link) — add if wanted.
- Icon optimization: several catalog icons are >1MB; route through `astro:assets` / resize to tile size.
- Fix applied: `index.astro` rendered a `<!-- LIBRARY -->` placeholder from the shell part; replaced with `<Library collection="games" />`.
