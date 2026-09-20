// Temporary: loads real websites through the local build. Not part of the test suite,
// because it depends on the internet.
import { chromium } from "@playwright/test";

const APP = process.env.APP || "http://localhost:43173";
const SITES = [
  "https://example.com/",
  "https://en.wikipedia.org/wiki/Web_proxy",
  "https://duckduckgo.com/?q=hello",
];

const browser = await chromium.launch();

async function check(url, { engine = "uv", relay = "bare" } = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on(
    "console",
    (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)),
  );

  await page.goto(APP + "/");
  await page.evaluate(
    ([e, r]) => {
      const s = JSON.parse(localStorage.getItem("sg:settings") || "{}");
      localStorage.setItem(
        "sg:settings",
        JSON.stringify({ ...s, v: 1, engine: e, relay: r }),
      );
      localStorage.removeItem("sg:tabs");
    },
    [engine, relay],
  );
  await page.goto(APP + "/");

  await page.getByRole("searchbox").fill(url);
  await page.getByRole("searchbox").press("Enter");

  let ok = false;
  let title = "";
  let text = "";
  try {
    await page.waitForFunction(
      () => {
        const f = document.querySelector("iframe");
        try {
          return (
            f &&
            f.contentDocument &&
            f.contentDocument.body &&
            f.contentDocument.body.innerText.length > 30
          );
        } catch {
          return true; // cross-origin means it loaded something real
        }
      },
      { timeout: 45000 },
    );
    const info = await page.evaluate(() => {
      const f = document.querySelector("iframe");
      try {
        return {
          title: f.contentDocument.title,
          text: f.contentDocument.body.innerText.slice(0, 90),
        };
      } catch (e) {
        return { title: "(cross-origin)", text: "" };
      }
    });
    title = info.title;
    text = info.text.replace(/\s+/g, " ");
    ok = true;
  } catch {
    ok = false;
  }

  const overlay = await page
    .locator(".error h2")
    .first()
    .textContent()
    .catch(() => null);
  const src = await page.locator("iframe").first().getAttribute("src");
  await page.close();
  return {
    url,
    engine,
    relay,
    ok,
    title,
    text,
    overlay,
    src: src?.slice(0, 48),
    errors: errors.slice(0, 2),
  };
}

const results = [];
for (const site of SITES) results.push(await check(site));
results.push(await check(SITES[0], { engine: "scramjet" }));
results.push(await check(SITES[0], { relay: "wisp" }));
results.push(await check(SITES[1], { engine: "scramjet", relay: "wisp" }));

for (const r of results) {
  console.log(
    `${r.ok ? "PASS" : "FAIL"} ${r.engine}/${r.relay} ${r.url}\n   title: ${JSON.stringify(r.title)}  text: ${JSON.stringify(r.text)}` +
      (r.overlay ? `\n   overlay: ${r.overlay}` : "") +
      (r.errors.length ? `\n   errors: ${r.errors.join(" | ")}` : ""),
  );
}

await browser.close();
