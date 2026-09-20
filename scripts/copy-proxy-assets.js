// Copies the proxy engine bundles out of node_modules and into public/, so a static
// host serves them from the same origin as the app. Runs before dev and build.
import { cp, mkdir, rm, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { uvPath } = require("@titaniumnetwork-dev/ultraviolet");
const { scramjetPath } = require("@mercuryworkshop/scramjet/path");
const { baremuxPath } = require("@mercuryworkshop/bare-mux/node");
const { bareModulePath } = require("@mercuryworkshop/bare-as-module3");
const epoxyPath = fileURLToPath(
  new URL(
    "../node_modules/@mercuryworkshop/epoxy-transport/dist/",
    import.meta.url,
  ),
);

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));

const JOBS = [
  // Our own uv.config.js is written afterwards, so it is not copied here.
  ["uv", uvPath, ["uv.bundle.js", "uv.client.js", "uv.handler.js", "uv.sw.js"]],
  [
    "scram",
    scramjetPath,
    ["scramjet.all.js", "scramjet.sync.js", "scramjet.wasm.wasm"],
  ],
  ["baremux", baremuxPath, ["index.js", "index.mjs", "worker.js"]],
  ["baremod", bareModulePath, ["index.mjs"]],
  ["epoxy", epoxyPath, ["index.mjs"]],
];

for (const [dir, src, files] of JOBS) {
  const dest = join(publicDir, dir);
  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
  for (const file of files) await cp(join(src, file), join(dest, file));
}

await cp(
  fileURLToPath(new URL("./uv.config.js", import.meta.url)),
  join(publicDir, "uv", "uv.config.js"),
);

const counts = await Promise.all(
  JOBS.map(
    async ([dir]) => `${dir}/${(await readdir(join(publicDir, dir))).length}`,
  ),
);
console.log(`vendor: ${counts.join(" ")} files`);
