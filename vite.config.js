import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createRelays } from "./server/relays.js";

// Mount the same relays the production server uses onto the dev/preview server,
// so proxying works with `npm run dev`.
function relays() {
  const attach = (server) => {
    const r = createRelays();
    server.middlewares.use((req, res, next) =>
      r.handleRequest(req, res) ? undefined : next(),
    );
    server.httpServer?.on("upgrade", (req, socket, head) => {
      r.handleUpgrade(req, socket, head);
    });
  };
  return {
    name: "sg-relays",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig({
  plugins: [svelte(), relays()],
  server: { port: Number(process.env.PORT) || 5173 },
  build: { target: "es2022" },
});
