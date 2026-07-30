// @ts-check
import { defineConfig } from "astro/config";

// SlowGuardian V10 — static build. No SSR adapter: every page is prerendered
// to plain HTML/CSS/JS and copied to dist/ alongside public/ (sw.js, /scram,
// /baremux, /epoxy assets, and the catalog icon set). The Scramjet proxy and
// the /wisp upgrade are served at runtime by the sibling Express server
// (v10/src/server.js) in front of this static output.
export default defineConfig({
  output: "static",
});
