"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { build, robotsText } = require("../scripts/build");

test("image sitemap discovers the full rendition once and omits decorative images", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skyguard-crawl-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ["images", "css", "data", "pages"]) fs.mkdirSync(path.join(root, dir));
  fs.writeFileSync(path.join(root, "pages/residential-roofing.html"), '<html><head><title>Residential roofing</title><meta name="description" content="Residential roofing services"></head><body><main><h1>Residential roofing</h1></main></body></html>');
  for (const file of ["logo-horizontal.png", "roof.jpg", "roof-800.webp", "roof-1600.webp", "decoration.png"])
    fs.writeFileSync(path.join(root, "images", file), "fixture");
  fs.writeFileSync(path.join(root, "css/styles.css"), "body{}");
  fs.writeFileSync(path.join(root, "data/image-manifest.json"), JSON.stringify({
    "/images/roof.jpg": { width: 1600, height: 1000, variants: [
      { src: "/images/roof-800.webp", width: 800, height: 500 },
      { src: "/images/roof-1600.webp", width: 1600, height: 1000 }
    ] }
  }));
  fs.writeFileSync(path.join(root, "index.html"), `<!doctype html><html><head><title>Roof work</title><meta name="description" content="Documented roof work"></head><body><main><h1>Roof work</h1>
    <img src="/images/roof.jpg" alt="Shingle roof with completed ridge detail">
    <img src="/images/roof.jpg" alt="Another view of the same roof photograph">
    <img src="/images/decoration.png" alt="" width="40" height="40">
    </main></body></html>`);
  build({root, date:"2026-09-09"});
  const sitemap = fs.readFileSync(path.join(root, "dist/sitemap.xml"), "utf8");
  assert.match(sitemap, /xmlns:image="http:\/\/www.google.com\/schemas\/sitemap-image\/1.1"/);
  assert.deepEqual([...sitemap.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map(m=>m[1]),
    ["https://www.skyguardrs.com/images/roof-1600.webp"]);
  assert.doesNotMatch(sitemap, /decoration|logo-horizontal|roof-800/);
});

test("reference robots file matches the generated canonical policy", () => {
  const origin = require("../data/business.json").origin;
  assert.equal(fs.readFileSync(path.join(__dirname, "../robots.txt"), "utf8"), robotsText(origin));
});
