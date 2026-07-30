/**
 * SlowGuardian V10 — Astro 5 content collections.
 *
 * Two catalogs, both loaded at BUILD TIME from local JSON via the file() loader:
 *   games → src/content/games.json  (284 entries)
 *   apps  → src/content/apps.json   (55 entries)
 *
 * The JSON is pre-converted from static/assets/json/{g,a}.json:
 *   link → url · categories split/normalised · "true" flags → real booleans · say → note.
 * See scripts note in the PR description; the schema below is defensive so it also
 * accepts the *raw* shape (string "true" flags, missing url) without a rebuild.
 */
import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

/** Coerce the string "true"/"false" flags (raw catalog shape) into real booleans. */
const boolish = z
  .preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean())
  .optional();

/**
 * url: absolute http(s) URL *or* a root-relative path ("/y/retro/index.html" for
 * the locally-hosted games). Optional — a few entries (Spotify, YouTube, …) ship
 * with no link because they're marked broken upstream.
 */
const url = z
  .union([z.string().url(), z.string().regex(/^\//, "must be an absolute URL or a root-relative path")])
  .optional();

const catalogSchema = z.object({
  // id is the file() loader's unique key; keep it so entry.data.id survives.
  id: z.string().optional(),
  name: z.string(),
  url,
  image: z.string(),
  categories: z.array(z.string()).default([]),
  blank: boolish,
  custom: boolish,
  note: z.string().optional(),
});

const games = defineCollection({
  loader: file("src/content/games.json"),
  schema: catalogSchema,
});

const apps = defineCollection({
  loader: file("src/content/apps.json"),
  schema: catalogSchema,
});

export const collections = { games, apps };
