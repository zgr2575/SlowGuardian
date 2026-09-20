import { test, expect } from "@playwright/test";

test("suggests catalog games as you type", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("retro");

  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await expect(
    list.getByRole("option", { name: "Retro Bowl Game" }),
  ).toBeVisible();
  await expect(list.getByRole("option", { name: /Search$/ })).toBeVisible();
});

test("picking a game suggestion opens it as a tab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("slope");
  await page.getByRole("option", { name: "Slope Game" }).click();

  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.getByRole("navigation").getByText("Slope")).toBeVisible();
});

test("the keyboard drives the suggestion list", async ({ page }) => {
  await page.goto("/");
  const box = page.getByRole("searchbox");
  await box.fill("retro");
  await box.press("ArrowDown");

  await expect(page.getByRole("option", { selected: true })).toBeVisible();
  await box.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("a typed address is offered as a site", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("example.com");
  await expect(page.getByRole("option", { name: /Open site/ })).toBeVisible();
});

test("favorites can be added and removed", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator(".favs .fav-cell").count();

  await page.getByRole("button", { name: "Add" }).click();
  await page.getByLabel("Site address").fill("example.com");
  await page.getByLabel("Name").fill("Example");
  await page.getByRole("button", { name: "Add", exact: true }).last().click();

  await expect(page.locator(".favs").getByText("Example")).toBeVisible();
  expect(await page.locator(".favs .fav-cell").count()).toBe(before + 1);

  await page
    .getByRole("button", { name: "Remove Example" })
    .click({ force: true });
  await expect(page.locator(".favs").getByText("Example")).toHaveCount(0);
});

test("favorites survive a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByLabel("Site address").fill("wikipedia.org");
  await page.getByRole("button", { name: "Add", exact: true }).last().click();
  await expect(page.locator(".favs").getByText("wikipedia.org")).toBeVisible();

  await page.reload();
  await expect(page.locator(".favs").getByText("wikipedia.org")).toBeVisible();
});
