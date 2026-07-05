import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the V10 proxy smoke test.
 *
 * webServer starts the real Express server and waits on /readyz — so the suite
 * only runs once the proxy bundles AND the built frontend actually resolve
 * (build web first: `npm run build:web`). Set PW_CHROME to a chromium binary to
 * skip `playwright install` (used in the sandbox / when a browser is pinned).
 */
const PORT = Number(process.env.PORT || 8080);
const exe = process.env.PW_CHROME;

export default defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.mjs",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: process.env.CI ? "on-first-retry" : "off",
    ...(exe ? { launchOptions: { executablePath: exe } } : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node src/server.js",
    url: `http://127.0.0.1:${PORT}/readyz`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: { NODE_ENV: "test", PORT: String(PORT), HOST: "127.0.0.1" },
  },
});
