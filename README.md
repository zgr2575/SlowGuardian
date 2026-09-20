# SlowGuardian

A fast, search-first web proxy with games, apps and privacy tools.

Version 11 is a rebuild on top of v8. The proxy stack is current, the catalog links are
checked, and the interface is new from scratch.

## Features

- Search-first home page with suggestions from your catalog, favorites and history
- Real tabs that keep running while you move between Home, Games, Apps and Settings
- **Ultraviolet** by default, **Scramjet** per site when something misbehaves
- **Bare** relay by default, **wisp** as an alternative, switchable from the toolbar
- 221 games and 47 apps, every link checked
- Four photo themes, or your own wallpaper
- Tab disguise, about:blank cloak and a configurable panic key
- Local history and bookmarks, both switchable and clearable
- No accounts, no database, no analytics, no ads

## Running it

```bash
npm install
npm run build
npm start
```

Then open <http://localhost:8080>. `npm run dev` gives you the dev server with hot
reload, and both serve the relays themselves, so proxying works locally.

## Hosting

The site is static and the two relays are serverless functions, so `vercel.json` covers
a Vercel deploy as-is. Anything that runs Node works too: `npm run build && npm start`
serves the built site plus both relays on one port.

To put the relays on a different host from the site, set `VITE_RELAY_ORIGIN` at build
time, e.g. `VITE_RELAY_ORIGIN=https://relay.example.com npm run build`.

> [!NOTE]
> Hosts differ on whether they allow proxies. Check the terms of whichever one you use.

## How it fits together

```
browser ── service worker ── Ultraviolet or Scramjet
                                   │
                              bare-mux transport
                                   │
                     /api/bare/ (HTTP) or /api/wisp/ (WebSocket)
                                   │
                              the site you asked for
```

Everything you save (settings, favorites, history, tabs, My List, your wallpaper) lives
in your own browser. The server keeps nothing.

## The catalog

`src/data/games.json` and `apps.json` are generated, not hand-edited:

```bash
node scripts/build-catalog.js     # rebuild from scripts/legacy + overrides + additions
node scripts/catalog-audit.js     # check every link and icon
node scripts/find-replacements.js # hunt for mirrors of anything that died
```

Edit `scripts/legacy/overrides.json` (repoint or remove an entry) or
`additions.json` (add one), then rebuild.

## Tests

```bash
npm test           # unit tests
npm run test:relays # bare and wisp
npm run test:e2e   # Playwright, including loading a page through the proxy
```

`node scripts/live-check.mjs` loads real sites through a local build across all four
engine and relay combinations.

## Updating a self-hosted copy

```bash
git pull
npm install
npm run build
```

## License

GPL-3.0-or-later. If you fork it, a star on the original repository is appreciated.
