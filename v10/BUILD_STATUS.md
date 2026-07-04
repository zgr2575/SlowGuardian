# SlowGuardian V10 — Build Status

Ground-up recode. Built under `v10/` alongside V9 until cutover, so `main` stays shippable during the rebuild. Plan: `../V10_RECODE_PLAN.md` · Design: `../DESIGN_V10.md` + `../docs/design/v10-mockup.html`.

## Locked decisions
- **Proxy:** **Scramjet-only** over Wisp (`wisp-js/server`), single service worker, bare-mux transport. Drop UV/Rammerhead/Dynamic/bare v3. (UV = documented post-1.0 escape hatch, added only if the nightly live-site test proves a real gap.)
- **Frontend:** Astro static MPA + Preact islands. **UI: Liquid Glass, dark-first** (Apple), Dynamic Island nav (per-tab icons, icon-only collapse), light toggle, perf-gated blur.
- **Backend:** Express + envalid config + pino logging. **Storage: better-sqlite3** (embedded file DB) for the small admin/global state. No MongoDB.
- **Accounts:** **Public proxy** — no user sign-ups; user settings live client-side. Single **admin gate** for global controls (pause, blocklist).
- **Admin auth:** pluggable behind an adapter interface; will use the maintainer's forthcoming **ZADMIN Auth system**. 1.0 interim = env-password gate implementing the same interface, hot-swapped for ZADMIN when ready.
- **Deploy:** **Vercel** (static frontend) + **Render** (persistent Wisp backend) — split-deploy. Replit removed; one Docker image = canonical artifact.
- **Kept in 1.0:** multi-tab in-app browser (rebuilt clean), **about:blank cloak** (opt-in, gesture-triggered — port of V8's working `static/assets/scripts/h.js` `createAboutBlank`, minus the V9 auto-run bug), tab disguise, quick-exit.
- **Reserved slot:** the old music/Spotify position → held for a **future project integration (TBD by maintainer)**. Not building music.
- **Reachability:** in-app signed "get latest link" mirror manifest → **post-1.0**.
- **LTS window:** **6 months active + 6 months security-only** for v10.x.
- **Git history:** leave history intact; stop tracking the big files (2.7MB maps, 1.2MB wallpaper) from here on (no force-push).
- **Privacy scope:** shoulder-surf/history defense + reachability only. No monitoring-evasion / anti-screenshot / anti-close. (Settled.)

## Phases
- [ ] **Phase 0 — Foundations** *(in progress)*
  - [x] Design tokens extracted → `web/src/styles/tokens.css`
  - [ ] Astro project init (`web/`), base layout with pre-paint theme/cloak script
  - [ ] Backend skeleton (`src/`): envalid config, pino logger, structure
  - [ ] Remove dead V9 artifacts at cutover
- [ ] **Phase 1 — Single proxy path** (wisp-js + Scramjet + one SW, COOP/COEP)
- [ ] **Phase 2 — Frontend** (pages, catalog Content Collections, islands, **multi-tab browser**)
- [ ] **Phase 3 — Privacy** (tab disguise, **about:blank cloak**, quick exit, clear traces, mirror rotation)
- [ ] **Phase 4 — Stability** (Playwright proxy smoke test, CI, health/readyz, Docker)
- [ ] **1.0 LTS** (v10.x branch, release-please, GHCR image)
