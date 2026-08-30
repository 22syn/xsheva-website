import { test, expect } from "playwright/test";

// window.__heroFxFrames (hero-fx.js, behind a window.__testHooks guard) is the ground
// truth here, not a screenshot pixel-diff: a diff of two [data-hero-glow] screenshots
// taken moments apart came back "different" even with zero real GPU frames rendered
// (page-load noise unrelated to the effect), so it can't tell "animating" from "not".

async function enableFrameCounter(page) {
  await page.addInitScript(() => {
    window.__testHooks = true;
  });
}

async function frameCount(page) {
  return page.evaluate(() => window.__heroFxFrames ?? 0);
}

test("animates when WebGPU is supported", async ({ page }) => {
  await enableFrameCounter(page);
  await page.goto("/");
  await page.waitForFunction(() => (window.__heroFxFrames ?? 0) > 0, null, { timeout: 5000 });

  const before = await frameCount(page);
  await page.waitForTimeout(500);
  const after = await frameCount(page);

  expect(after).toBeGreaterThan(before);
});

test("falls back cleanly when WebGPU is unsupported", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.addInitScript(() => {
    Object.defineProperty(window.navigator, "gpu", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await page.waitForTimeout(300);

  const glow = page.locator("[data-hero-glow]");
  await expect(glow.locator("canvas")).toHaveCount(0);
  await expect(glow).toHaveClass(/x-grid-bg/);
  expect(consoleErrors).toHaveLength(0);
});

test("respects prefers-reduced-motion", async ({ page }) => {
  await enableFrameCounter(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForFunction(() => (window.__heroFxFrames ?? 0) > 0, null, { timeout: 5000 });

  const before = await frameCount(page);
  await page.waitForTimeout(500);
  const after = await frameCount(page);

  expect(after).toBe(before);
});

test("pauses rendering when the tab is hidden", async ({ page }) => {
  await enableFrameCounter(page);
  await page.goto("/");
  await page.waitForFunction(() => (window.__heroFxFrames ?? 0) > 0, null, { timeout: 5000 });

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  const framesAtHide = await frameCount(page);
  await page.waitForTimeout(300);
  const framesAfterWait = await frameCount(page);

  expect(framesAfterWait).toBe(framesAtHide);
});
