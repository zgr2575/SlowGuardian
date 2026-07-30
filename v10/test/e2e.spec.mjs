/**
 * V10 end-to-end smoke test (Playwright).
 *
 * Covers the whole stack the way a browser hits it: the app shell renders, the
 * health/readiness endpoints answer, and — the important one — the proxy path
 * works end to end. The proxy test navigates the in-app browser to a LOCAL
 * fixture server (started here on an ephemeral port), so it exercises the real
 * pipeline (service worker → bare-mux → epoxy → wisp TCP → Scramjet rewrite)
 * without ever depending on the live internet.
 */
import { test, expect } from "@playwright/test";
import http from "node:http";

let fixture;
let fixtureURL;

test.beforeAll(async () => {
  fixture = http.createServer((req, res) => {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(
      '<!doctype html><html><head><title>Fixture OK</title></head>' +
        '<body><h1 id="fx">PROXY FIXTURE OK</h1><p>Served through the SlowGuardian proxy.</p></body></html>',
    );
  });
  await new Promise((r) => fixture.listen(0, "127.0.0.1", r));
  fixtureURL = `http://127.0.0.1:${fixture.address().port}/`;
});

test.afterAll(async () => {
  await new Promise((r) => fixture.close(r));
});

// Most tests don't want the first-run modal in the way — seed the guard.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem("sg:onboarded", "1"); } catch (e) {}
  });
});

test("first-run onboarding shows and completes", async ({ browser }) => {
  // fresh context = no sg:onboarded → the modal appears
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("#obScrim")).toBeVisible();
  await expect(page.locator("#obTitle")).toContainText("Welcome");
  // step through and finish; the guard persists so it won't show again
  for (let i = 0; i < 3; i++) await page.click("#obNext");
  await page.click("#obNext"); // "Get started"
  await expect(page.locator("#obScrim")).toBeHidden();
  await page.reload();
  await expect(page.locator("#obScrim")).toBeHidden();
  await ctx.close();
});

test("home lander renders with the omnibox", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/SlowGuardian/);
  await expect(page.locator("#omniInput")).toBeVisible();
  await expect(page.locator(".home-logo .home-word")).toContainText("Guardian");
});

test("games library renders the dense catalog grid", async ({ page }) => {
  await page.goto("/games/");
  await expect(page.locator(".billboard")).toBeVisible();
  // the dense "All games" grid should hold the bulk of the catalog
  await expect(page.locator("#allsec .tile").first()).toBeVisible();
  expect(await page.locator("#allsec .tile").count()).toBeGreaterThan(50);
});

test("health and readiness endpoints answer", async ({ request }) => {
  const health = await request.get("/healthz");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).ok).toBe(true);

  const ready = await request.get("/readyz");
  expect(ready.ok()).toBeTruthy();
  const body = await ready.json();
  expect(body.ready).toBe(true);
  // every declared asset check must pass
  for (const c of body.checks) expect(c.ok).toBe(true);
});

test("cross-origin isolation headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["cross-origin-opener-policy"]).toBe("same-origin");
  expect(res.headers()["cross-origin-embedder-policy"]).toBe("require-corp");
});

test("proxy loads a site end-to-end through the full stack", async ({ page }) => {
  await page.goto("/go/");

  // the service worker must at least register + activate (proxy frames are
  // served by it); openInTab awaits this before creating the frame
  await page.waitForFunction(() => navigator.serviceWorker?.ready?.then != null, null, {
    timeout: 20_000,
  });

  // drive the omnibox to the local fixture and open it
  await page.fill("#ggUrl", fixtureURL);
  await page.press("#ggUrl", "Enter");

  // the Scramjet frame appears and renders the proxied fixture content —
  // this is the real end-to-end assertion (SW → bare-mux → epoxy → wisp → TCP)
  const frame = page.frameLocator("iframe.gg-frame");
  await expect(frame.locator("#fx")).toHaveText("PROXY FIXTURE OK", { timeout: 30_000 });
});
