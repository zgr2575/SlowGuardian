import { test, expect } from "@playwright/test";

for (const path of ["/", "/games", "/apps", "/browse", "/settings"]) {
  test(`the navbar is on ${path}`, async ({ page }) => {
    await page.goto(path);
    const nav = page.getByRole("navigation");
    await expect(
      nav.getByRole("link", { name: "Home", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Games", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Apps", exact: true }),
    ).toBeVisible();
    await expect(nav.getByRole("link", { name: "Settings" })).toBeVisible();
  });
}

test("v8's short links still work", async ({ page }) => {
  await page.goto("/g");
  await expect(page).toHaveURL(/\/games$/);
});

test("deep links survive a reload", async ({ page }) => {
  await page.goto("/settings");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
});

test("picking a theme changes the accent and sticks", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: /Last Light/ }).click();

  const accent = () =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim()
        .toLowerCase(),
    );

  expect(await accent()).toBe("#ff8a5b");
  await page.reload();
  expect(await accent()).toBe("#ff8a5b");
});

test("home is search-first", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("searchbox", { name: /Search or enter a website/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "SlowGuardian" }),
  ).toBeVisible();
});
