# Changelog

## 11.0.0

A rebuild on top of v8. v9 and v10 are set aside as `legacy/v9` and `legacy/v10`.

### Proxy

- Ultraviolet 3 as the default engine, Scramjet selectable per site from the toolbar.
- Relays are bare (default) and wisp, switchable at any time, both served by the same
  module in dev, in the standalone server and on Vercel.
- Fixed the bare relay rate limit: its default of 10 requests per IP per minute meant
  any real page failed with "Too Many Connections" once it loaded more than ten files.
- Fixed Scramjet never starting: its worker class opens its database at version 1 with
  no upgrade step, so building it at worker startup created an empty database that the
  page's controller could never write to.
- The service worker claims its clients, so the first page load is proxied rather than
  falling through to the host.

### Interface

- New design: search-first home over photo wallpapers, four themes, one navbar
  everywhere, motion that respects "reduce motion".
- Real tabs that keep running while you move around the site, and come back after a
  reload.
- Games and Apps share a layout: featured band, categories, chart and full grid, with
  search and a My List shelf.
- Search suggestions from the catalog, favorites and history, plus engine autocomplete
  fetched through the relay rather than directly.

### Catalog

- Every link checked: 78 were dead and 7 pointed at files that were never in the repo.
  14 were found on a working mirror and repointed; the rest are gone.
- YouTube, Spotify, Instagram, Snapchat, ChatGPT and Gemini are back with real URLs.
- Categories rebuilt from v8's inconsistent tags. 221 games, 47 apps.

### Privacy

- Tab disguise presets carried over from v8, plus a custom title and icon.
- about:blank cloak, on demand or automatic.
- Panic key is configurable and also works inside proxied pages.
- History is local, capped, and can be switched off. Bookmarks live on Home.

### Removed

- Accounts, premium tiers, MongoDB, Rammerhead, Dynamic and the ad code.
- The auto-updater that pulled `main` over a running install.
- `/d/data`, the splash text and the summer countdown.

---

## 8

1. Added ZeroProxy
2. New UI
3. Made SlowGuardian anticlose more powerful, it is uncloseable again
4. Fixed a few games.
