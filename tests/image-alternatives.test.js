"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { imageAlternatives } = require("../scripts/check");
const { walk } = require("../scripts/build");

test("decorative images keep empty alt while informative photos retain descriptions", () => {
  const result = imageAlternatives('<img src="hero.webp" alt=""><img src="roof.webp" alt="Roofing underlayment during installation">');
  assert.deepEqual(result, { images: 2, descriptiveAlt: 1, emptyAlt: 1, imageLinks: 0, galleryImages: 0, errors: [] });
});

test("missing and whitespace-only alternatives fail", () => {
  assert.match(imageAlternatives('<img src="roof.webp">').errors.join(), /image missing alt/);
  assert.match(imageAlternatives('<img src="roof.webp" alt="   ">').errors.join(), /not whitespace/);
});

test("image-only links need a name independent of decorative alt", () => {
  assert.match(imageAlternatives('<a href="/repair"><img src="roof.webp" alt=""></a>').errors.join(), /link missing accessible name/);
  assert.deepEqual(imageAlternatives('<a href="/repair" aria-label="Roof repair"><img src="roof.webp" alt=""></a>').errors, []);
  assert.deepEqual(imageAlternatives('<a href="/"><img src="logo.webp" alt="SkyGuard Roofing Solutions"></a>').errors, []);
  assert.deepEqual(imageAlternatives('<a href="/repair"><img src="roof.webp" alt=""><span>Roof repair</span></a>').errors, []);
});

test("referenced labels work but missing or blank label targets cannot hide an unnamed image link", () => {
  assert.deepEqual(imageAlternatives('<h2 id="repair-title">Roof repair</h2><a href="/repair" aria-labelledby="repair-title"><img src="roof.webp" alt=""></a>').errors, []);
  assert.match(imageAlternatives('<a href="/repair" aria-labelledby="missing"><img src="roof.webp" alt=""></a>').errors.join(), /link missing accessible name/);
  assert.match(imageAlternatives('<a href="/repair"><img src="roof.webp" alt="">&nbsp;</a>').errors.join(), /link missing accessible name/);
});

test("gallery photos require the description used by their enlarged view", () => {
  assert.match(imageAlternatives('<div class="gallery-item"><img src="roof.webp" alt=""></div>').errors.join(), /gallery image needs descriptive alt/);
  const result = imageAlternatives('<figure><div class="gallery-item"><img src="roof.webp" alt="Dormer above a shingle roof"></div><figcaption>Dormer above a shingle roof</figcaption></figure>');
  assert.equal(result.galleryImages, 1);
  assert.deepEqual(result.errors, []);
  // The empty, hidden dialog image receives its description when a photo opens.
  assert.deepEqual(imageAlternatives('<div class="lightbox" aria-hidden="true"><img src="" alt=""></div>').errors, []);
});

test("every source image including scheduled articles has an appropriate alt attribute and named links", () => {
  const root = path.resolve(__dirname, "..");
  const files = [path.join(root, "index.html"), ...walk(path.join(root, "pages")).filter((file) => file.endsWith(".html"))];
  let count = 0;
  for (const file of files) {
    const result = imageAlternatives(fs.readFileSync(file, "utf8"));
    assert.deepEqual(result.errors, [], path.relative(root, file));
    count += result.images;
  }
  assert.ok(count > 0, "source audit actually inspected images");
});
