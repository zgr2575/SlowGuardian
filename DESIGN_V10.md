# SlowGuardian V10 Design Direction — Verdict & Design-System Spec

## 1. Verdict

**Primary direction: NEON DECK (neo-arcade), with two elements absorbed from the losers** — Graphite's command palette + keyboard layer (as the power feature and the second layer of camouflage), and Halcyon's film-grain trick (a ~1.5KB tiled noise PNG to kill gradient banding on 6-bit TN panels). NEON DECK's own "Paper" theme covers classroom stealth.

**Why NEON DECK wins:**

1. **The decisive technical argument: it survives its own performance budget on the target device.** Halcyon's identity is the drifting aurora — a persistent compositor animation. But the budget's auto-perf heuristic (`deviceMemory <= 4 || hardwareConcurrency <= 4`) puts *every actual target Chromebook* in low mode, where ambient loops are banned. On the exact hardware this product is for, Halcyon degrades to "dark navy site with static blobs" — its signature move amputated. NEON DECK's identity (vignette + 24px grid + 2px scanlines, the accent power-light, terminal eyebrows, mono HUD) is **100% static CSS painted once**. It looks identical in low mode and high mode. The wow does not depend on anything the budget takes away.
2. **Audience-fit wow.** For 13–17-year-olds launching games, "my own console" (PRESS START boot splash, GAME OVER 404s, roving controller focus, five glowing accent coins) is more memorable than another Vercel-glass dashboard — a look that is now everywhere and reads "startup," not "mine." NEON DECK is the direction students screenshot and share, which is how an open-source unblocker actually grows.
3. **Cheapest flashy direction.** Steady-state cost after first paint: zero animations running, zero images in the chrome, one 17KB font, three cached gradient layers. Halcyon is close but strictly more expensive (persistent drift layer + grain + colored glows everywhere).

**Why the others lose:** **Halcyon (aurora-glass)** — beautiful, but its centerpiece animation is exactly what low mode disables on the target hardware, and its "premium SaaS" aesthetic is generic in 2026. It loses on identity-survivability, not on craft. **Graphite (clean-os)** — the best-engineered and stealthiest of the three, but it fails criterion (a) by design: its stated goal is to be *unmemorable*. You cannot "blow the water out" with a direction whose success metric is being ignored. It donates its two best organs (command palette, hairline/tabular discipline) and exits.

---

## 2. Design Principles

1. **The console, not a website.** Every page is a screen in one firmware: Lobby (home), Library (catalog), Launch Bay (go), System (settings). Shared chrome never changes between pages.
2. **Static identity, kinetic feedback.** Everything that gives NEON DECK its look is painted once and cached (gradients, scanlines, borders, pre-rendered glows). Motion exists only as short (<300ms) transform/opacity responses to user input. Nothing animates while the user isn't touching anything.
3. **One accent rules everything.** Every interactive element expresses state through the same 2–3px `--acc` "power light." Swapping one attribute reskins the whole console. Consistency is the polish; it's also why theming is one style-recalc, zero JS re-render.
4. **Low mode is the base stylesheet.** The cheap version is authored first; effects layer *up* under `html[data-perf="high"]`. Failure modes (old Chrome, JS off, localStorage blocked) fall back to the fast version, never the slow one.
5. **Stealth is a first-class mode, not a hack.** Paper theme + tab cloak + panic key are designed together and reachable in ≤2 interactions from anywhere.
6. **Type does the arcade, not pixels.** Uppercase tracked eyebrows (`// GAME LIBRARY`), tabular mono numerals, and tight display headings deliver the console tone at 0 bytes of imagery.

---

## 3. Theming Architecture

### 3.1 Attribute model

Three orthogonal attributes on `<html>`, all set before first paint:

| Attribute | Values | Controls |
|---|---|---|
| `data-theme` | `arcade` (default) · `paper` · `midnight` · `carbon` | Surface/ink token block (~22 tokens) |
| `data-accent` | `cyan` (default) · `magenta` · `lime` · `violet` · `gold` | `--acc`, `--acc-deep`, `--acc-ink`, `--glow` (4 tokens) |
| `data-perf` | `low` (base) · `high` | Effect layers (grain, sheen, boot splash, view transitions) |

Components reference **tokens only** — never raw colors. A theme/accent switch is one attribute write: one style recalc + repaint, no layout, no network, no Preact render. This is why live theming is effectively free even on a Celeron.

### 3.2 Pre-paint inline script (the ONLY inline JS, ~0.6KB, in `<head>` of the base layout)

```html
<script>
(function () {
  var d = document.documentElement, s;
  try { s = localStorage; } catch (e) { s = {}; }
  d.dataset.theme  = s.sgTheme  || "arcade";
  d.dataset.accent = s.sgAccent || "cyan";
  var p = s.sgPerf || "auto";
  if (p === "auto") {
    p = ((navigator.deviceMemory || 8) <= 4
      || (navigator.hardwareConcurrency || 8) <= 4
      || (navigator.connection && navigator.connection.saveData)
      || matchMedia("(prefers-reduced-motion: reduce)").matches)
      ? "low" : "high";
  }
  d.dataset.perf = p;
  try {
    var c = s.sgCloak && JSON.parse(s.sgCloak);
    if (c) {
      document.title = c.title;
      var l = document.querySelector("link[rel~=icon]");
      if (l) l.href = c.icon;
    }
  } catch (e) {}
})();
</script>
```

Runs before any CSS applies → zero theme FOUC, zero flash of the wrong cloak title, and perf mode is decided before the first style resolution. Note the auto heuristic means **target Chromebooks boot in low mode by default** — and per Principle 4, low mode still looks like NEON DECK.

### 3.3 Built-in themes

Four themes ship. Arcade and Paper are fully specified below (§4); the other two are ~10-token deltas, so each extra theme costs <400 bytes of CSS:

| Theme | Intent | Key deltas from Arcade |
|---|---|---|
| **Arcade** (default) | The console. Dark indigo cabinet. | — |
| **Paper** | Classroom stealth. Reads like a school portal. | Light surfaces, accent darkened for contrast, **scanlines/grid/grain forced off**, glow shadows replaced by `--sh-1` |
| **Midnight** | Halcyon homage: softer, deep navy, for students who want calm over arcade. | `--bg #0B0E16`, `--surface #141A28`, `--line rgba(255,255,255,.08)`, default accent violet, scanlines off (grid stays) |
| **Carbon** | True-black OLED/AMOLED + battery saver vibe. | `--bg #000`, `--bg-deep #000`, `--surface #101014`, `--line #22242c`, grid off, scanlines on |

---

## 4. Color Tokens

All tokens live on `:root` (Arcade values) with `[data-theme="…"]` override blocks. Shipped as one hand-written `tokens.css` (~3KB gz).

### 4.1 Core tokens — Arcade (default) and Paper

```css
:root {
  /* surfaces */
  --bg:           #0b0d14;   /* cabinet base */
  --bg-deep:      #07080d;   /* vignette edges, hero floor */
  --surface:      #141826;   /* cards, panels */
  --surface-2:    #1b2136;   /* hover / raised */
  --surface-sunken:#0e111c;  /* input wells, code */
  --scrim:        rgba(7, 8, 13, 0.78);   /* overlays (warp, palette) */

  /* lines & ink */
  --line:         #262d45;
  --line-strong:  #34405f;
  --ink:          #eef1fb;
  --ink-dim:      #98a1c0;
  --ink-faint:    #626b8a;

  /* accent system (overridden by data-accent, §4.2) */
  --acc:          #00e5ff;
  --acc-deep:     #00b7cc;                 /* pressed / active */
  --acc-ink:      #04121a;                 /* text ON accent fills */
  --acc-weak:     rgba(0, 229, 255, 0.10); /* tinted fills, active nav bg */
  --glow:         rgba(0, 229, 255, 0.35); /* pre-painted shadow color */

  /* fixed semantics (do not shift with accent) */
  --coin:  #ffcf3f;   /* favorites, badges */
  --ok:    #3ddc84;
  --warn:  #ffb020;
  --err:   #ff5d6c;
  --focus: var(--acc);

  /* backdrop layers (Paper/Carbon zero these out) */
  --grid-line:  rgba(238, 241, 251, 0.04);
  --scan-line:  rgba(238, 241, 251, 0.03);
}

[data-theme="paper"] {
  --bg: #f4f6fb;       --bg-deep: #e9edf5;
  --surface: #ffffff;  --surface-2: #eef1f8;  --surface-sunken: #e8ebf3;
  --scrim: rgba(16, 19, 31, 0.45);
  --line: #dde3ef;     --line-strong: #c3cce0;
  --ink: #10131f;      --ink-dim: #4d5673;    --ink-faint: #8d95ad;
  --acc: #0b7d92;      --acc-deep: #086477;   --acc-ink: #ffffff;
  --acc-weak: rgba(11, 125, 146, 0.10);
  --glow: rgba(11, 125, 146, 0.18);
  --grid-line: transparent;  --scan-line: transparent;  /* textures off */
}
```

Contrast floors (enforced in review): `--ink` on `--surface` ≥ 12:1; `--ink-dim` on `--surface` ≥ 4.5:1; `--acc` on `--bg` ≥ 3:1 (non-text UI) and every accent preset's `--acc-ink` on `--acc` ≥ 4.5:1.

### 4.2 Accent presets ("coins")

Each preset redefines exactly four tokens. Dark-theme values shown; Paper darkens `--acc` per-preset for contrast (second column):

| `data-accent` | `--acc` (dark) | `--acc` (paper) | `--acc-ink` | `--glow` (dark) |
|---|---|---|---|---|
| `cyan` (default) | `#00e5ff` | `#0b7d92` | `#04121a` | `rgba(0,229,255,.35)` |
| `magenta` | `#ff3e8f` | `#c2185b` | `#1a040d` | `rgba(255,62,143,.35)` |
| `lime` | `#a3ff3e` | `#4f8a10` | `#0d1a04` | `rgba(163,255,62,.35)` |
| `violet` | `#8b5cff` | `#5b34c2` | `#f4f0ff` | `rgba(139,92,255,.35)` |
| `gold` | `#ffcf3f` | `#8a6d00` | `#1a1504` | `rgba(255,207,63,.35)` |

Why this is cheap: the "power light" on every button, input, nav link, and card hover reads `var(--acc)`; the glow shadows read `var(--glow)`. One attribute write retints ~everything with a single recalc — no gradient re-generation, no JS, no repaint storm (only elements using the tokens repaint, once).

---

## 5. Typography

### 5.1 Stacks

```css
--font-display: "Space Grotesk", var(--font-sans);   /* headings, wordmark, tiles */
--font-sans: system-ui, -apple-system, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;    /* body, UI — 0KB */
--font-mono: ui-monospace, "Cascadia Mono", "SF Mono", Consolas,
             "Roboto Mono", monospace;               /* go bar, HUD, eyebrows — 0KB */
```

**One web font total:** Space Grotesk variable, self-hosted, Latin subset, single wght-axis file (~17KB woff2), `<link rel="preload" as="font" crossorigin>`, `font-display: swap` **with an `@font-face` size-adjust'd Arial fallback** (metrics-matched via `size-adjust`/`ascent-override`) so the swap causes zero CLS. Body and mono are pure system stack: no fetch, no shaping cost beyond native, instant first text paint. On a Celeron over school Wi-Fi, first paint = HTML + one CSS file + (maybe) one 17KB font.

### 5.2 Scale

| Token | Value | Use | Weight / treatment |
|---|---|---|---|
| `--fs-hero` | `clamp(2.25rem, 6vw, 4rem)` | Wordmark, Lobby hero | Display 700, `letter-spacing:-0.02em`, static gradient fill via `background-clip:text` (one-time paint) |
| `--fs-title` | `clamp(1.25rem, 2.5vw, 1.75rem)` | Section titles, channel tiles | Display 700, `-0.01em` |
| `--fs-lg` | `1.125rem` | Card group headers, settings section heads | Display 600 |
| `--fs-base` | `1rem / 1.5` | Body | Sans 400 |
| `--fs-ui` | `0.875rem` | Buttons, nav, inputs, card titles | Sans 600 |
| `--fs-meta` | `0.8125rem` | Tags, counts, descriptions | Sans 400, `--ink-dim` |
| `--fs-eyebrow` | `0.75rem` | `// EYEBROW LABELS` | Mono 400, uppercase, `letter-spacing:+0.1em`, `--acc` |

Global: `font-variant-numeric: tabular-nums` on the HUD clock, counts, timers, status line — pixel-stable numerals with zero cost. The entire "arcade firmware" voice is these treatments, not imagery.

---

## 6. Spacing, Radius, Elevation

```css
/* 8px grid */
--sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
--sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;

/* radius */
--r-sm: 6px;    /* chips, tags, small buttons */
--r-md: 10px;   /* cards, inputs, panels */
--r-lg: 16px;   /* channel tiles, hero omnibox, modals */
--r-pill: 999px;/* capsule inputs, coin swatches */

/* layout */
--topbar-h: 56px;  --maxw: 1200px;  --settings-rail: 220px;

/* elevation — STATIC only; never transitioned directly */
--sh-1: 0 1px 2px rgba(0,0,0,.35);                       /* resting cards */
--sh-2: 0 8px 24px rgba(0,0,0,.45);                      /* raised: modals, palette */
--sh-glow: 0 0 0 1px var(--acc), 0 4px 20px var(--glow); /* hover/focus glow */
```

**Elevation rule (lintable):** `box-shadow` never appears in a `transition` or `@keyframes`. Hover/focus glow lives on a `::after` pseudo-element that already has `--sh-glow` painted and animates **opacity only** — the shadow rasterizes once into a cached tile; the "animation" is a compositor cross-fade. Same look as animated glow, ~0 paint cost.

---

## 7. The Backdrop (global chrome)

One fixed, never-animated layer on `body::before`, three stacked gradients, zero images:

```css
body::before {
  content: ""; position: fixed; inset: 0; z-index: -1;
  background:
    repeating-linear-gradient(0deg, var(--scan-line) 0 1px, transparent 1px 2px), /* scanlines */
    linear-gradient(var(--grid-line) 1px, transparent 1px) 0 0 / 100% 24px,       /* grid rows */
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px) 0 0 / 24px 100%,/* grid cols */
    radial-gradient(120% 90% at 50% 0%, var(--bg) 40%, var(--bg-deep) 100%);      /* vignette */
}
/* high mode only: Halcyon's grain trick — kills banding on 6-bit TN panels */
html[data-perf="high"] body::after {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: url("data:image/png;base64,…") repeat;  /* ~1.5KB tiled noise */
  opacity: .04;
}
```

Why it's cheap: `position:fixed` + never animated → the compositor rasterizes it once and re-uses the tile on every scroll frame. This is the anti-pattern-inverse of V9 (16MB wallpaper resampled through 12 backdrop-filters per scroll frame). Cost: ~0 bytes network, one first-paint raster, then free forever. Toggleable in Settings ("Cabinet texture"); auto-off in Paper.

---

## 8. Component Inventory

### 8.1 Top bar (all pages, static Astro)

- 56px, `position: sticky; top: 0`, background `var(--bg)` at 96% opacity (solid enough to not need blur — **no backdrop-filter, ever**), bottom `1px solid var(--line)`.
- Left: coin-mark logo (inline SVG, `currentColor`) + wordmark (Display 700).
- Center: `Home · Games · Apps · Go`. Active link gets a 2px `--acc` underline — a single absolutely-positioned element that `transform: translateX/scaleX`es between links on hover (compositor-only), plus `--acc-weak` tint.
- Right, mono HUD cluster: tabular-nums clock (one ~1KB Preact island, `client:idle`, updates 1/min — not per-second; no reason to wake the main thread 60×/min), cloak quick-toggle chip, settings gear, and a hairline **panic button** (`Esc Esc` or user-bound key → location.replace to quick-exit URL; keydown listener lives in the same 1KB island).
- DOM cost: ~25 nodes, zero images.

### 8.2 Quick Launch omnibox (Lobby hero + Go page; one shared Preact island, ≤6KB)

- Oversized capsule (`--r-pill`), `--font-mono` input, `--surface-sunken` fill, 1px `--line-strong` border, 3px `--acc` power-light on the left edge.
- Focus: border → `--acc`; the pre-painted `::after` glow fades in (opacity); the power light pulses via **opacity keyframes only** (high mode; low mode = static bright).
- Accepts URL or search terms; segmented engine control beneath (radio inputs styled as console buttons); submit → Go flow (§9.3).
- Progressive: it's a real `<form>` that posts to `/go` — works before hydration and with JS disabled.

### 8.3 Game / App card (≤9 DOM nodes, a11y-complete)

```
<a.card href> <img> <span.title> <span.tag> </a>   + ::before edge, ::after glow
```

- Cover: `aspect-ratio: 3/2` locked box, `width`/`height` attributes, `loading="lazy" decoding="async"` below the fold, AVIF/WebP ≤15KB at 192px (2 sizes; srcset capped at 2x — the target screen is 1x, don't ship retina bytes to it).
- `contain: layout paint style` + `content-visibility: auto; contain-intrinsic-size: 180px 220px` — offscreen cards skip style/layout/paint entirely; a 300+ card grid costs only what's on screen. Guard with `@supports (content-visibility: auto)`; fallback (pre-85 Chrome on expired Chromebooks) = paginate at 200 cards.
- Hover/focus ("cabinet tilt"): `transform: translateY(-4px) scale(1.03)`, 150ms `cubic-bezier(.2,.8,.2,1)`; left power-edge (`::before`, 3px `--acc`) and glow (`::after`, `--sh-glow`) fade in via opacity. Zero layout, zero paint, pure compositor.
- Keyboard: cards participate in a roving-tabindex grid; arrow keys move a console-style highlight (same visual as hover). This *is* the Big Picture feel and it's just focus management.

### 8.4 Catalog grid + search (the Library)

- Sticky sub-header (below top bar): search input + category chips (`All / Action / IO / Puzzle / Emulator / Apps`) + result count in mono ("312 TITLES").
- Grid: `grid-template-columns: repeat(auto-fill, minmax(148px, 1fr))` → ~7 columns at 1366×768, 2 on phones. Full grid is **rendered in the static HTML at build time** from Content Collections.
- Search island (≤8KB, `client:idle`): fetches a build-time slug/title/tags JSON index (≤60KB gz) **on first input focus**, filters in memory, and toggles `hidden` on existing card nodes. Never rebuilds DOM, never innerHTML, no VDOM list churn — combined with `content-visibility`, filtering 500 items is a style-only operation that a Celeron does in single-digit ms. Filtered-out cards get an 80ms opacity fade (opacity only; no position tweening — reflow happens once, after the fade).
- Featured row: 4–6 wide cards in a native `scroll-snap-type: x mandatory` strip. Browser-native momentum, zero JS carousel.
- `/` focuses search from anywhere (global 30-line keydown handler in the HUD island).

### 8.5 Command palette (adopted from Graphite; ≤5KB island, `client:idle`, lazy-mounted on first invoke)

- `Ctrl/Cmd+K`: `--scrim` overlay (opacity 0→1) + panel (`translateY(-6px)→0`, 140ms). Fuzzy-matches the same catalog index plus a hardcoded action list ("Go to Settings", "Toggle cloak", "Panic exit", "Theme: Paper").
- Pure DOM text list, no images, max 8 results rendered. Doubles as camouflage: a kid hitting Ctrl+K in a docs-looking Paper theme reads as using Notion.

### 8.6 Go / proxy bar (the Launch Bay)

- Pre-launch: centered eyebrow `// DESTINATION`, the omnibox (§8.2), engine segmented control, recent-destination chips from localStorage (rendered by the island; absent pre-hydration — no CLS because the chip row has a fixed `min-height`).
- On submit, the **WARP overlay**: fullscreen `--scrim` fixed element; a center horizontal rule scales `scaleY(0→1)` + opacity, mono label "CONNECTING…", 250ms. It exists to mask iframe-load white-flash; it is one element, transform/opacity only, removed on `load`.
- In-session toolbar: slim 40px bar (back · forward · refresh · copy URL · cloak · **EJECT**) above the full-viewport iframe. Auto-hides via `transform: translateY(-100%)` after 3s idle; returns when cursor enters the top 8px of the viewport (single `pointermove` check against `clientY`, passive listener, throttled). Progress: a single 2px bar animating `transform: scaleX(0→.9)` on submit, `→1` on load — GPU-only, indeterminate-feeling, honest.
- EJECT restores app chrome and (if "clear on exit" is on) wipes session history entries for the frame.

### 8.7 Settings panel (System)

Two-pane on desktop: left rail (`--settings-rail`) with sections `Appearance / Tab Cloak / Search / Data / About`; a single 2px `--acc` indicator `translateY`s between rail items (one element moving — never restyling each tab). Right pane: cards of rows (label + description left, control right). Accordion on mobile. Each control group is an independent tiny island (`client:visible`) on a static page — a student who never opens Data never downloads its JS.

- **Appearance:** theme select (Arcade / Paper / Midnight / Carbon / System), five accent **coins** (styled radio inputs, 32px circles filled `--acc` with static `--glow` ring; picking one writes `data-accent` + localStorage — live, instant, no reload), Cabinet texture toggle, Motion toggle, **Performance mode** (Auto / High / Low with live preview — §11).
- **Theme switcher mechanics:** radios write `localStorage.sgTheme` + set the attribute synchronously. "System" stores `system` and the pre-paint script resolves it via `prefers-color-scheme` each boot.

### 8.8 Tab-cloak UI

- Preset list: Google Docs, Google Drive, Google Classroom, Schoology, Clever, Canvas — each row shows favicon + fake title.
- **Live mock browser-tab preview**: a 240×36px chrome-tab-shaped card showing the exact favicon + truncated title currently applied. Selecting a preset updates the preview *and* the real `document.title` + `<link rel=icon>` href in the same handler — the preview can't lie because it renders from the same `sgCloak` object the pre-paint script applies on every page load. Zero rendering cost: a title string and one `href` swap.
- Custom fields: title text + icon URL (data-URI'd on save so the cloak works offline and leaks no request).
- Panic key binding: a "press a key" capture row; binding stored in localStorage, consumed by the HUD island on every page.

---

## 9. Page Layouts (designed at 1366×768 first; nothing scrolls horizontally, ever)

### 9.1 Home — the Lobby
Full-viewport hero: eyebrow `// PLAYER ONE READY`, wordmark with static two-stop gradient fill (`--acc → --acc-deep`, `background-clip: text` — one-time paint), Quick Launch omnibox. Below: four **channel tiles** (GAMES / APPS / GO / SETTINGS) — icon (inline SVG), Display label, mono count ("312 TITLES"), left accent edge; 4-up desktop, 2×2 fully above the fold at 1366×768, stacked on phones. Bottom: single-line "NOW LOADED" ticker of new titles — CSS `transform: translateX` marquee, pauses on hover, **high mode only** (it's the site's single permitted ambient loop; low mode shows a static "NEW:" row). Total page: ~60 DOM nodes, 0 images above the fold, 0 JS besides the HUD + omnibox islands.

### 9.2 Catalog — the Library
Eyebrow `// GAME LIBRARY`, sticky search sub-header, featured snap-strip, main auto-fill grid (§8.4). GAMES and APPS are the same Astro template with different collections.

### 9.3 Go — the Launch Bay
Pre-launch and in-session states per §8.6. The iframe gets the full viewport minus the 40px toolbar; app backdrop layers are `display: none`d during a session (no reason to keep composited layers alive behind an opaque iframe — saves ~4MB of GPU texture on a 4GB machine).

### 9.4 Settings — System
Per §8.7. Max-width 900px content column so rows stay scannable.

### 9.5 404 / empty states — GAME OVER
`GAME OVER` in Display 700 gradient text, mono `CONTINUE? 9…8…` (CSS-only countdown via 10 spans + `animation-delay` opacity steps, high mode; static in low), link back to the Library. Free HTML/CSS; disproportionately memorable — this is the screenshot that markets the project.

---

## 10. Signature Motion Set

Global rules: **transform/opacity only** (stylelint rule bans keyframes/transitions touching `top/left/width/height/box-shadow/filter/background-*`), everything ≤300ms, ≤3 concurrent, entrance sequences ≤500ms total, zero rAF loops in steady state, all of it inside `@media (prefers-reduced-motion: no-preference)` with instant-state fallbacks (reduced mode keeps 1-frame opacity changes so state remains perceivable). `will-change` appears nowhere at rest; the transitions themselves promote layers transiently.

| # | Name | Trigger | Animates | Timing | Why it's cheap on a Celeron | Mode |
|---|---|---|---|---|---|---|
| 1 | COIN-DROP page enter | MPA load | opacity 0→1 + translateY 8px→0 on `<main>`'s direct children | 180ms each, 40ms CSS `animation-delay` stagger, ≤500ms total | One-shot; finishes and costs nothing forever after (V9's sin was loops that never stop). Pure CSS, no JS orchestration | both |
| 2 | CABINET TILT | card hover/focus | transform translateY(-4px) scale(1.03); `::after` glow opacity 0→1 | 150ms `cubic-bezier(.2,.8,.2,1)` | Compositor-only; the glow shadow was painted once at style time — the fade is a texture cross-fade, box-shadow itself never animates | both |
| 3 | POWER-LIGHT pulse | input focus | opacity keyframes on the 3px accent edge | 1.2s loop while focused | A ~3×48px layer pulsing opacity — trivially small texture; stops the instant focus leaves | high (static bright in low) |
| 4 | MARQUEE SHEEN | button/wordmark hover | skewed gradient strip `::before`, translateX(-120%→120%), once | 400ms | One small pre-painted gradient element translating — no paint, runs once, done | high |
| 5 | WARP LAUNCH | Go submit | overlay opacity + center line scaleY(0→1) | 250ms | Masks iframe load (perceived perf win); 2 elements, transform/opacity | both |
| 6 | GO progress sweep | proxy loading | scaleX(0→.9), →1 on load | — | Single 2px bar, GPU transform; removed from DOM on load | both |
| 7 | Rail/nav indicator slide | nav or settings-tab change | translateY/translateX + scaleX of ONE indicator element | 140ms | Moving one element beats restyling N tabs (no recalc cascade) | both |
| 8 | Toolbar auto-hide | 3s idle in proxy session | translateY(-100%) | 200ms | Compositor slide; the listener is passive and throttled | both |
| 9 | PRESS START boot splash | first visit per session (sessionStorage-gated) | staggered per-letter opacity fade, "SLOWGUARDIAN // PRESS ANY KEY" | 600ms total, skippable on any key | One div, pure CSS delays, runs once per session; gated so returning navigation is instant | high |
| 10 | NOW LOADED ticker | ambient (Lobby only) | translateX marquee | slow loop, pauses on hover & `visibilitychange` | The **single** permitted ambient loop: one narrow text layer translating on the compositor; paused when tab hidden | high |
| — | Cross-page crossfade | navigation | cross-document View Transitions | default | Progressive enhancement via `@view-transition`; expired-update Chromebooks just get instant MPA swaps (which is fine — documents are ≤25KB) | high |

---

## 11. Performance Mode

### 11.1 Model

Three-state setting `sgPerf: auto | high | low`, resolved to `data-perf="high|low"` by the pre-paint script (§3.2). **Auto** applies the budget heuristic — which classifies every target Chromebook as `low`. **The base stylesheet IS low mode**; `html[data-perf="high"]` selectors layer effects up. There is no "remove the heavy stuff" override to forget — the failure direction is always toward fast.

### 11.2 What each mode gets

| Feature | Low (base, = target Chromebooks) | High |
|---|---|---|
| Backdrop (vignette + grid + scanlines) | ✔ full — it's static, it's the identity | ✔ |
| Film grain overlay | — | ✔ (~1.5KB texture, static) |
| Power-light system, accent coins, live theming | ✔ full | ✔ |
| Card tilt, glow fades, nav slide, page enter, warp | ✔ full (all one-shot compositor work) | ✔ |
| Power-light pulse / marquee sheen | static end-states | ✔ |
| PRESS START splash, ticker, GAME OVER countdown | static equivalents | ✔ |
| View Transitions crossfade | instant MPA swap | ✔ |
| GPU layers steady-state | ~3 | ≤8 |
| `backdrop-filter` | **0 instances — banned in both modes** | **0. Not a high-mode reward. Banned.** |

The point: a student on the actual target device loses only ambience, never identity, layout, theming, or interaction feedback. Exposed in Settings as "Performance: Auto / High / Low" with a live preview card — a feature, not an apology.

### 11.3 Hard bans (both modes, lint/CI-enforced)

`backdrop-filter` anywhere; animated `box-shadow`/`filter`/`background-*`/layout properties; DOM or canvas particle systems; full-viewport canvas; `background-attachment: fixed`; scroll-linked JS effects; `mix-blend-mode` on large regions; resting `will-change` on lists; inline `<script>` beyond the 2KB pre-paint snippet; any committed asset >200KB (CI fails); >1 web-font file.

### 11.4 Budgets this spec is designed inside (from the bundle; CI-asserted via Lighthouse CI at 6× throttle)

JS/page ≤30KB gz (catalog ≤45KB, app-wide ≤75KB; actual island plan: HUD ~1KB + omnibox ~6KB + catalog search ~8KB + palette ~5KB + settings ~6KB + Preact ~4KB ≈ **30KB total**, well under). CSS/page ≤30KB gz (this system: tokens ~3KB + layout/components ~9KB ≈ 12KB). First-load transfer ≤300KB. FCP ≤1.5s, LCP ≤2.5s, CLS <0.1, TBT ≤200ms on-device. Card ≤9 nodes, page ≤1,500 nodes (catalog ≤3,000 with `content-visibility`). Covers ≤15KB AVIF/WebP. Font: one 17KB woff2. Ambient loops: exactly one, high mode only.

---

## 12. Build Order (for the implementing engineer)

1. `tokens.css` (all of §4–§6) + pre-paint snippet + base layout with backdrop and top bar.
2. Card + catalog grid static rendering (Content Collections → HTML), `content-visibility` + containment.
3. Omnibox island + Go flow (form-first, then hydrate).
4. Settings islands: appearance (theme/accent/perf), cloak (with live preview), panic key.
5. Motion layer (§10) + `data-perf` high-mode block + reduced-motion wrap.
6. Command palette, boot splash, GAME OVER pages.
7. CI: Lighthouse budgets.json, asset-size guard, stylelint animated-property ban.

Ship 1–4 and it's already fast and coherent; 5–6 are where it starts blowing the water out — for free, because every impressive thing in this system is either painted once or moved on the compositor.