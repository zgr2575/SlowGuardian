import { test, expect } from "@playwright/test";

const FIXTURE = "http://127.0.0.1:44599/";

async function openFixture(page) {
  await page.goto("/");
  await page.getByRole("searchbox").fill(FIXTURE);
  await page.getByRole("searchbox").press("Enter");
  await expect(page).toHaveURL(/\/browse$/);

  const frame = page.frameLocator("iframe");
  await expect(frame.locator("#h")).toHaveText("Fixture page", {
    timeout: 40_000,
  });
  return frame;
}

// Guards against a vacuous pass: the frame must point at a proxied URL, not the site
// itself. Read the src we set, because both engines rewrite `location` inside the frame
// so the page believes it is on its own URL.
async function frameUrl(page) {
  return page.locator("iframe").first().getAttribute("src");
}

test("loads a page through Ultraviolet and the bare relay", async ({
  page,
}) => {
  const frame = await openFixture(page);
  // The sub-resource fetch proves the whole chain, not just the first response.
  await expect(frame.locator("#h")).toHaveAttribute("data-fetched", "true", {
    timeout: 20_000,
  });
  await expect(
    page.getByRole("navigation").getByText("SG Fixture"),
  ).toBeVisible();
  expect(await frameUrl(page)).toContain("/uv/service/");
});

test("a tab keeps running while you visit other pages", async ({ page }) => {
  await openFixture(page);

  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Games", exact: true })
    .click();
  await expect(page).toHaveURL(/\/games$/);

  await page.getByRole("navigation").getByText("SG Fixture").click();
  await expect(page).toHaveURL(/\/browse$/);
  // No reload: the same frame is still there with its content.
  await expect(page.frameLocator("iframe").locator("#h")).toHaveText(
    "Fixture page",
    { timeout: 5_000 },
  );
});

test("switches this site to Scramjet", async ({ page }) => {
  await openFixture(page);

  await page.getByRole("button", { name: /UV · bare/ }).click();
  await page.getByRole("menuitemradio", { name: /Scramjet/ }).click();

  await expect(
    page.getByRole("button", { name: /Scramjet · bare/ }),
  ).toBeVisible();
  // Wait for the frame to actually move onto Scramjet: the old page stays rendered
  // until it does, so asserting on text alone could pass without the switch happening.
  await expect
    .poll(() => frameUrl(page), { timeout: 40_000 })
    .toContain("/scram/service/");
  await expect(page.frameLocator("iframe").locator("#h")).toHaveText(
    "Fixture page",
    { timeout: 40_000 },
  );
});

test("switches the relay to wisp", async ({ page }) => {
  await openFixture(page);

  await page.getByRole("button", { name: /UV · bare/ }).click();
  await page.getByRole("menuitemradio", { name: /Wisp/ }).click();

  await expect(page.getByRole("button", { name: /UV · wisp/ })).toBeVisible();
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("#h")).toHaveText("Fixture page", {
    timeout: 40_000,
  });
  await expect(frame.locator("#h")).toHaveAttribute("data-fetched", "true", {
    timeout: 20_000,
  });
});

test("tabs come back after a reload", async ({ page }) => {
  await openFixture(page);
  await page.reload();
  await expect(
    page.getByRole("navigation").getByText("SG Fixture"),
  ).toBeVisible();
  await expect(page.frameLocator("iframe").locator("#h")).toHaveText(
    "Fixture page",
    { timeout: 40_000 },
  );
});
