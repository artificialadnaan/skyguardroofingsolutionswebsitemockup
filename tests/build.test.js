"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { build, dateOnly, scheduled } = require("../scripts/build");
function source(title, main, extra = "") {
  return `<!doctype html><html><head><title>${title}</title><meta name="description" content="Useful description for ${title}">${extra}</head><body><main id="main"><h1>${title}</h1>${main}</main></body></html>`;
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skyguard-build-test-"));
  for (const dir of ["pages/blog", "images", "css", "js"])
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(path.join(root, "images/logo-horizontal.png"), "fixture");
  fs.writeFileSync(path.join(root, "css/styles.css"), "body{}");
  fs.writeFileSync(
    path.join(root, "pages/residential-roofing.html"),
    source("Residential", "Useful service content"),
  );
  fs.writeFileSync(
    path.join(root, "index.html"),
    source("Home", '<a href="/pages/blog.html">Guides</a>'),
  );
  fs.writeFileSync(
    path.join(root, "pages/blog.html"),
    source(
      "Guides",
      '<article class="blog-list-item" data-publish-date="2026-09-14"><div><a href="/pages/blog/future.html">Future guide</a></div></article>',
    ),
  );
  fs.writeFileSync(
    path.join(root, "pages/blog/future.html"),
    source(
      "Future guide",
      "Authentic unique body copy",
      '<script type="application/ld+json">{"@type":"Article","datePublished":"2026-09-14","dateModified":"2026-09-14"}</script>',
    ),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
test("publication before/on/after release removes stale output and is deterministic", (t) => {
  const root = fixture(t);
  const read = (file) => fs.readFileSync(path.join(root, "dist", file), "utf8");
  const before = build({ root, date: "2026-09-13" });
  assert.equal(before.withheldPages.length, 1);
  assert.equal(
    fs.existsSync(path.join(root, "dist/pages/blog/future.html")),
    false,
  );
  assert.doesNotMatch(read("pages/blog.html"), /future\.html|Future guide/);
  assert.doesNotMatch(read("sitemap.xml"), /future\.html/);
  const first = read("index.html");
  build({ root, date: "2026-09-13" });
  assert.equal(first, read("index.html"));
  build({ root, date: "2026-09-14" });
  assert.match(read("pages/blog.html"), /class="blog-list-item published"/);
  assert.match(read("pages/blog/future.html"), /Authentic unique body copy/);
  assert.match(read("sitemap.xml"), /future\.html/);
  build({ root, date: "2026-09-15" });
  assert.equal(
    fs.existsSync(path.join(root, "dist/pages/blog/future.html")),
    true,
  );
  build({ root, date: "2026-09-13" });
  assert.equal(
    fs.existsSync(path.join(root, "dist/pages/blog/future.html")),
    false,
  );
});
test("bad dates and missing article metadata fail instead of guessing", (t) => {
  assert.throws(() => dateOnly("2026-02-30"));
  assert.throws(() => dateOnly("invalid"));
  const root = fixture(t);
  fs.writeFileSync(
    path.join(root, "pages/blog/future.html"),
    source("Future guide", "Body"),
  );
  assert.throws(
    () => build({ root, date: "2026-09-13" }),
    /Invalid publication date/,
  );
});
test("build preserves new body edits and rejects broken links and duplicate metadata", (t) => {
  const root = fixture(t);
  const page = path.join(root, "index.html");
  fs.writeFileSync(page, source("Home", "Latest editor content"));
  build({ root, date: "2026-09-13" });
  assert.match(
    fs.readFileSync(path.join(root, "dist/index.html"), "utf8"),
    /Latest editor content/,
  );
  fs.writeFileSync(
    page,
    source("Home", '<a href="/missing.html">Broken link</a>'),
  );
  assert.throws(() => build({ root, date: "2026-09-13" }), /broken local URL/);
  fs.writeFileSync(page, source("Guides", "Duplicate title"));
  assert.throws(() => build({ root, date: "2026-09-13" }), /duplicate title/);
});
test("scheduled nested cards removed completely; published content visible without JS", () => {
  const html =
    '<div data-publish-date="2026-09-14"><div>Future</div></div><article class="card" data-publish-date="2026-09-01">Current</article>';
  const result = scheduled(html, "2026-09-08");
  assert.doesNotMatch(result, /Future/);
  assert.match(result, /card published/);
});
test("lead forms cannot submit personal data through native GET", (t) => {
  const root = fixture(t);
  fs.writeFileSync(
    path.join(root, "index.html"),
    source("Home", '<form id="contact-form"><input name="email"></form>'),
  );
  build({ root, date: "2026-09-13" });
  const html = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
  assert.match(
    html,
    /<form id="contact-form" method="post" action="\/api\/lead">/,
  );
  assert.match(
    html,
    /<noscript><style>#contact-form,#careers-form\{display:none\}/,
  );
  assert.match(html, /To request service or ask about careers/);
});

test("visible contact fields and organization schema share the business source", t => {
  const root = fixture(t);
  const business = { ...require("../data/business.json"), streetAddress: "100 Test & Example Street", postalCode: "76164", hours: "Monday–Saturday 7am–7pm", openingHoursSpecification: [{"@type":"OpeningHoursSpecification", dayOfWeek:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens:"07:00", closes:"19:00"}] };
  fs.mkdirSync(path.join(root, "data"));
  fs.writeFileSync(path.join(root, "data/business.json"), JSON.stringify(business));
  fs.writeFileSync(path.join(root, "index.html"), source("Contact identity", "<p>{{businessAddress}}</p><p>{{businessHours}}</p>"));
  build({ root, date: "2026-09-13" });
  const html = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
  assert.match(html, /100 Test &amp; Example Street, Fort Worth, TX 76164/);
  assert.match(html, /Monday–Saturday 7am–7pm/);
  assert.doesNotMatch(html, /\{\{business(?:Address|Hours)\}\}/);
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  const businesses = graph.filter(item => item["@type"] === "RoofingContractor");
  assert.equal(businesses.length, 1);
  assert.equal(businesses[0].address.streetAddress, business.streetAddress);
  assert.equal(businesses[0].address.postalCode, business.postalCode);
  assert.deepEqual(businesses[0].openingHoursSpecification, business.openingHoursSpecification);
});
