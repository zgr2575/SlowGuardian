import { defineConfig } from "@playwright/test";

// Deliberately unusual ports: the defaults (4173, 4599) collide with other dev
// servers, and a reused stranger's server silently breaks the proxy tests.
const APP_PORT = 43173;
const FIXTURE_PORT = 44599;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    viewport: { width: 1280, height: 800 },
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: [
    {
      command: "node server/index.js",
      port: APP_PORT,
      env: { PORT: String(APP_PORT), NODE_ENV: "test" },
      reuseExistingServer: false,
      stdout: "ignore",
    },
    {
      command: "node tests/e2e/fixture-server.js",
      port: FIXTURE_PORT,
      env: { FIXTURE_PORT: String(FIXTURE_PORT) },
      reuseExistingServer: false,
      stdout: "ignore",
    },
  ],
});

export { FIXTURE_PORT };
