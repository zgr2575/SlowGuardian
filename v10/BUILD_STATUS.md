# SlowGuardian V10 — Build Status

Ground-up recode. Built under `v10/` alongside V9 until cutover, so `main` stays shippable during the rebuild. Plan: `../V10_RECODE_PLAN.md` · Design: `../DESIGN_V10.md` + `../docs/design/v10-mockup.html`.

## Locked decisions
- **Proxy:** Scramjet over Wisp (`wisp-js/server`), single service worker, bare-mux transport. Drop UV/Rammerhead/Dynamic/bare v3.
- **Frontend:** Astro static MPA + Preact islands. **UI: Liquid Glass, dark-first** (Apple), light toggle, perf-gated blur.
- **Backend:** Express kept; envalid config; storage adapter (memory/sqlite/mongo). Cut Spotify(→plugin)/KeyAuth/AdSense/Replit DB.
- **Deploy:** Vercel (static frontend) + persistent host (Wisp backend) — split-deploy.
- **Privacy scope:** shoulder-surf/history defense + reachability only. No monitoring-evasion / anti-screenshot / anti-close. (Settled.)

## Phases
- [ ] **Phase 0 — Foundations** *(in progress)*
  - [x] Design tokens extracted → `web/src/styles/tokens.css`
  - [ ] Astro project init (`web/`), base layout with pre-paint theme/cloak script
  - [ ] Backend skeleton (`src/`): envalid config, pino logger, structure
  - [ ] Remove dead V9 artifacts at cutover
- [ ] **Phase 1 — Single proxy path** (wisp-js + Scramjet + one SW, COOP/COEP)
- [ ] **Phase 2 — Frontend** (pages, catalog Content Collections, islands)
- [ ] **Phase 3 — Privacy** (tab disguise, quick exit, clear traces, mirror rotation)
- [ ] **Phase 4 — Stability** (Playwright proxy smoke test, CI, health/readyz, Docker)
- [ ] **1.0 LTS** (v10.x branch, release-please, GHCR image)
