// Local-only independent regression review. This script never submits forms.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const initial = await page.goto("http://127.0.0.1:4173/", {
      waitUntil: "domcontentloaded",
    });
    assert.equal(initial.status(), 200, "stable preview returns homepage");
    await page.locator("h1").waitFor();
    const toggle = page.locator(".nav-toggle");
    await toggle.click();
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".nav-links > li > a")
        .first()
        .evaluate((e) => e === document.activeElement),
      true,
      "Tab from toggle enters menu",
    );
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(
          () =>
            document.activeElement === document.querySelector(".nav-toggle") ||
            document
              .querySelector(".nav-links")
              .contains(document.activeElement),
        ),
        true,
        "focus stays in open menu",
      );
    }
    await toggle.focus();
    await page.keyboard.press("Shift+Tab");
    assert.equal(
      await page
        .locator(".nav-links > li > a")
        .last()
        .evaluate((e) => e === document.activeElement),
      true,
      "reverse Tab wraps",
    );
    await page.keyboard.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.equal(
      await page.locator(".nav-links").evaluate((e) => e.inert),
      true,
    );
    assert.equal(
      await toggle.evaluate((e) => e === document.activeElement),
      true,
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    assert.equal(
      await page.locator(".nav-links").evaluate((e) => e.inert),
      false,
      "desktop resize restores navigation",
    );
    await page.goto("http://127.0.0.1:4173/pages/gallery.html", {
      waitUntil: "domcontentloaded",
    });
    const tile = page.locator(".gallery-item").first(),
      thumbnail = tile.locator("img");
    const full = await thumbnail.getAttribute("data-full-src");
    assert.ok(full, "full resolution image variant available");
    await tile.press("Enter");
    assert.match(
      await page.locator(".lightbox img").getAttribute("src"),
      new RegExp(full.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".lightbox-close")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await tile.evaluate((e) => e === document.activeElement),
      true,
    );
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const nojs = await context.newPage();
    await nojs.goto("http://127.0.0.1:4173/pages/inspections.html", {
      waitUntil: "domcontentloaded",
    });
    assert.equal(await nojs.locator("#contact-form").isVisible(), false);
    assert.equal(
      await nojs.locator("main noscript p").isVisible(),
      true,
    );
    assert.equal(
      await nojs.locator("#contact-form").getAttribute("method"),
      "post",
    );
    assert.equal(await nojs.locator("main h1").isVisible(), true);
    await nojs.goto("http://127.0.0.1:4173/pages/blog.html", {
      waitUntil: "domcontentloaded",
    });
    assert.ok(
      await nojs.locator(".blog-list-item.published").first().isVisible(),
      "published cards are readable without JS",
    );
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          mobileFocusCycle: true,
          reverseTabWrap: true,
          escapeRestoresFocus: true,
          desktopNavigationRestored: true,
          galleryFullResolution: true,
          galleryFocusRestored: true,
          noJsFormsSafe: true,
          noJsArticlesVisible: true,
          browserErrors: errors,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
