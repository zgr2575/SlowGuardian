import { test, expect } from "@playwright/test";

const FIXTURE = "http://127.0.0.1:44599/";

const readSettings = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("sg:settings")));

test("every settings section opens", async ({ page }) => {
  await page.goto("/settings");
  for (const name of [
    "Privacy & Cloaking",
    "Proxy",
    "Search",
    "Keyboard",
    "About",
  ]) {
    await page.getByRole("tab", { name }).click();
    await expect(page.getByRole("tab", { name })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  }
  // No section is a stub any more.
  await expect(page.getByText("arrives later in the v11 update")).toHaveCount(
    0,
  );
});

test("tab disguise changes the title and favicon", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Privacy & Cloaking" }).click();
  await page.getByRole("button", { name: /Classroom/ }).click();

  await expect(page).toHaveTitle("Home");
  expect(await page.locator("#sg-favicon").getAttribute("href")).toBe(
    "/cloak/classroom.png",
  );

  // And it survives a reload.
  await page.reload();
  await expect(page).toHaveTitle("Home");
});

test("the panic key can be recorded and is stored", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Keyboard" }).click();
  await page.getByRole("button", { name: /Ctrl \+ E|Set a shortcut/ }).click();
  await page.keyboard.press("Alt+Shift+KeyQ");

  await expect(
    page.getByRole("button", { name: "Alt + Shift + Q" }),
  ).toBeVisible();
  expect((await readSettings(page)).panic.keys).toBe("Alt+Shift+q");
});

test("the panic key leaves the site", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Keyboard" }).click();
  await page.getByRole("textbox").fill("http://127.0.0.1:44599/");

  await page.keyboard.press("Control+e");
  await expect(page).toHaveURL(/44599/);
});

test("proxy defaults can be changed", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Proxy" }).click();
  await page.getByRole("radio", { name: "Scramjet" }).click();
  await page.getByRole("radio", { name: "Wisp" }).click();

  const stored = await readSettings(page);
  expect(stored.engine).toBe("scramjet");
  expect(stored.relay).toBe("wisp");
});

test("search engine choice is used by the home search box", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Search" }).click();
  await page.getByRole("button", { name: "duckduckgo" }).click();

  await page.goto("/");
  await page.getByRole("searchbox").fill("hello world");
  await page.getByRole("searchbox").press("Enter");

  await expect(
    page.getByRole("navigation").getByText("duckduckgo.com"),
  ).toBeVisible();
});

test("bookmarking a site adds it to Home", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill(FIXTURE);
  await page.getByRole("searchbox").press("Enter");
  await expect(page.frameLocator("iframe").locator("#h")).toHaveText(
    "Fixture page",
    { timeout: 40_000 },
  );

  await page.getByRole("button", { name: "Bookmark this site" }).click();
  await expect(
    page.getByRole("button", { name: "Remove bookmark" }),
  ).toBeVisible();

  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(
    page.locator(".favs").getByRole("button", { name: /SG Fixture/ }),
  ).toBeVisible();
});

test("history records visits and can be cleared", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill(FIXTURE);
  await page.getByRole("searchbox").press("Enter");
  await expect(page.frameLocator("iframe").locator("#h")).toHaveText(
    "Fixture page",
    { timeout: 40_000 },
  );

  await page.getByRole("button", { name: "More" }).click();
  await page.getByRole("button", { name: "History" }).click();

  const sheet = page.getByRole("dialog", { name: "History" });
  await expect(sheet.getByText("SG Fixture")).toBeVisible();

  await sheet.getByRole("button", { name: "Clear all" }).click();
  await expect(sheet.getByText("Nothing here yet.")).toBeVisible();
});

test("history can be switched off", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("tab", { name: "Privacy & Cloaking" }).click();
  await page.getByRole("switch", { name: /Save history/ }).click();

  await page.goto("/");
  await page.getByRole("searchbox").fill(FIXTURE);
  await page.getByRole("searchbox").press("Enter");
  await expect(page.frameLocator("iframe").locator("#h")).toHaveText(
    "Fixture page",
    { timeout: 40_000 },
  );

  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("sg:history") || "[]"),
    ),
  ).toEqual([]);
});
