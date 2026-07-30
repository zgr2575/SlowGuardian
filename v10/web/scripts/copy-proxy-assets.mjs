/**
 * postbuild: copy the Scramjet / bare-mux / epoxy browser bundles into dist/
 * so a STATIC host (Vercel, Netlify, GH Pages) can serve /scram/, /baremux/
 * and /epoxy/ — the same three paths the Express server (v10/src/server.js)
 * mounts straight out of node_modules.
 *
 * Node resolution walks up from web/ -> v10/node_modules, so this works with
 * the packages declared once in v10/package.json.
 */
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));

const JOBS = [
  ["scram", scramjetPath, ["scramjet.all.js", "scramjet.sync.js", "scramjet.wasm.wasm"]],
  ["baremux", baremuxPath, ["index.js", "index.mjs", "worker.js"]],
  ["epoxy", epoxyPath, ["index.mjs"]],
];

for (const [outDir, srcDir, files] of JOBS) {
  const dest = join(dist, outDir);
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
  for (const f of files) {
    await cp(join(srcDir, f), join(dest, f));
  }
  console.log(`[copy-proxy-assets] ${srcDir} -> dist/${outDir}/ (${files.join(", ")})`);
}
