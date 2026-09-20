# Contributing

Pull requests are welcome. A few things that make them easy to accept:

## Before you open one

```bash
npm install
npm test            # unit tests
npm run test:relays # bare and wisp
npm run test:e2e    # Playwright, including a page loaded through the proxy
```

All three should pass. If you change behaviour, add or update a test for it.

## Working on the catalog

`src/data/games.json` and `apps.json` are generated. Don't edit them by hand:

- to add an entry, put it in `scripts/legacy/additions.json`
- to repoint or remove one, use `scripts/legacy/overrides.json`
- then run `node scripts/build-catalog.js`

`node scripts/catalog-audit.js` checks every link and icon. Anything you add should
answer when it runs.

## Style

- Run `npm run format` before committing.
- Match the surrounding code; there is no build step to learn beyond Vite and Svelte.
- Keep it light. v9 and v10 grew accounts, a database and four proxy engines, and that
  is what this version exists to undo.
