import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  server: { port: Number(process.env.PORT) || 5173 },
  build: { target: "es2022" },
});
