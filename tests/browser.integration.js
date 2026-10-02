import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const { chromium } = await import(
  process.env.BRASILIA_PLAYWRIGHT_MODULE || "playwright-core"
);
const root = resolve("."),
  out = resolve("test-results/browser");
await mkdir(out, { recursive: true });
let browser;
try {
  browser = await chromium.launch({
    executablePath:
      process.env.BRASILIA_BROWSER_PATH || "/opt/helium-browser-bin/chrome",
    headless: true,
  });
  const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    }),
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("http://brasilia.local/**", async (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname),
      file = resolve(root, "." + (path === "/" ? "/index.html" : path));
    if (!file.startsWith(root + sep)) return route.fulfill({ status: 403 });
    try {
      await route.fulfill({
        body: await readFile(file),
        contentType:
          {
            ".js": "text/javascript",
            ".html": "text/html",
            ".css": "text/css",
            ".json": "application/json",
            ".wav": "audio/wav",
          }[extname(file)] || "application/octet-stream",
      });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
  await page.goto("http://brasilia.local/?test=1&debug=1");
  await page.waitForFunction(() => window.__game);
  assert.equal(await page.locator("#menu").isVisible(), true);
  await page.screenshot({ path: `${out}/menu-720.png` });
  await page.locator("#training-start").click();
  await page.keyboard.down("KeyW");
  await page.waitForFunction(
    () => window.__game.state.position.z < 3,
    {},
    { timeout: 10000 },
  );
  await page.keyboard.up("KeyW");
  const render = await page.evaluate(() => ({
    calls: window.__game.world.renderer.info.render.calls,
    triangles: window.__game.world.renderer.info.render.triangles,
    position: { ...window.__game.state.position },
  }));
  assert.ok(
    render.calls > 0 && render.triangles > 0,
    "Must use actual WebGL renderer",
  );
  await page.keyboard.press("KeyF");
  await page.keyboard.press("Space");
  await page.screenshot({ path: `${out}/training-720.png` });
  await page.keyboard.press("Escape");
  await page.locator("#pause-settings").click();
  await page.locator('[data-setting="textScale"]').fill("140");
  await page.screenshot({ path: `${out}/settings-140.png` });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: `${out}/settings-1080.png` });
  await page.goto("http://brasilia.local/assets/pack/gallery.html");
  await page.waitForSelector("#asset option");
  assert.equal(await page.locator("#asset option").count(), 29);
  await page.locator("#asset").selectOption("character:luli");
  await page.locator("#clip").selectOption({ label: "attack" });
  await page.screenshot({ path: `${out}/rig.png` });
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/report.json`,
    JSON.stringify(
      {
        renderer: render,
        errors,
        note: "Real browser smoke and screenshots; does not approve visual quality or physical GPU budget.",
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: WebGL, keyboard movement, settings at 720/1080 and animated pack gallery",
  );
} catch (error) {
  await writeFile(`${out}/failure.txt`, error.stack || String(error));
  throw error;
} finally {
  await browser?.close();
}
