/**
 * prebuild: copy the catalog icon set into public/ so `astro build` includes it.
 * Source is the committed static/assets/media/icons tree (kept out of web/ to
 * avoid an ~18MB duplicate in git). Runs automatically before `npm run build`.
 * TODO(perf): optimize/resize these to tile size via astro:assets — several are >1MB.
 */
import { cp, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../../../static/assets/media/icons/", import.meta.url));
const dest = fileURLToPath(new URL("../public/assets/media/icons/", import.meta.url));

try {
  await access(src);
  await mkdir(dest, { recursive: true });
  await cp(src, dest, { recursive: true });
  console.log("[sync-icons] copied catalog icons -> public/assets/media/icons/");
} catch (err) {
  console.warn("[sync-icons] source icons not found (" + src + ") — skipping; tiles will 404 until synced.");
}
