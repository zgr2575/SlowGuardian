import { test, expect } from "@playwright/test";

test("games page shows the featured band, the chart and the full grid", async ({
  page,
}) => {
  await page.goto("/games");

  await expect(page.getByRole("heading", { name: "Top Games" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /All games/ })).toBeVisible();
  // The real catalog, not a handful of samples.
  expect(await page.locator(".grid .cell").count()).toBeGreaterThan(30);
});

test("searching narrows the catalog", async ({ page }) => {
  await page.goto("/games");
  await page.getByRole("searchbox", { name: "Search games" }).fill("retro");

  await expect(page.getByRole("heading", { name: /result/ })).toBeVisible();
  await expect(page.getByTitle("Retro Bowl")).toBeVisible();
  expect(await page.locator(".grid .cell").count()).toBeLessThan(10);
});

test("a search with no matches says so", async ({ page }) => {
  await page.goto("/games");
  await page.getByRole("searchbox", { name: "Search games" }).fill("zzzzqqqq");
  await expect(page.getByText("Nothing matched")).toBeVisible();
});

test("category chips filter the grid", async ({ page }) => {
  await page.goto("/games");
  const all = await page.locator(".grid .cell").count();

  await page.getByRole("tab", { name: "Emulators" }).click();
  await expect(page.getByRole("heading", { name: /Emulators/ })).toBeVisible();
  expect(await page.locator(".grid .cell").count()).toBeLessThan(all);
});

test("opening a game creates a tab", async ({ page }) => {
  await page.goto("/games");
  await page.getByRole("searchbox", { name: "Search games" }).fill("slope");
  await page.getByTitle("Slope").click();

  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.getByRole("navigation").getByText("Slope")).toBeVisible();
});

test("My List keeps what you save", async ({ page }) => {
  await page.goto("/games");
  await page.getByRole("searchbox", { name: "Search games" }).fill("slope");
  await page.getByRole("button", { name: /Add Slope to My List/ }).click();

  await page.getByRole("searchbox", { name: "Search games" }).fill("");
  await expect(page.getByRole("heading", { name: "My List" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "My List" })).toBeVisible();
});

test("apps page works the same way", async ({ page }) => {
  await page.goto("/apps");
  await expect(page.getByRole("heading", { name: "Popular" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search apps" }).fill("youtube");
  await expect(page.getByTitle("YouTube")).toBeVisible();
});
