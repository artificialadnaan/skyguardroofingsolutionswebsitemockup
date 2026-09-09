"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { attrs, walk } = require("./build");

// This static regression guard is not a complete computed-accessibility audit;
// keyboard and browser checks still verify the rendered interface.
// Empty alt is appropriate for decorative images. Interactive images still need
// an accessible name, and gallery photos need the description used by the dialog.
function imageAlternatives(html) {
  const errors = [];
  const report = { images: 0, descriptiveAlt: 0, emptyAlt: 0, imageLinks: 0, galleryImages: 0 };
  const text = (value = "") => value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160|#x0*a0);/gi, " ")
    .trim();
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const image = attrs(match[0]);
    report.images++;
    if (!Object.hasOwn(image, "alt")) errors.push("image missing alt: " + (image.src || "dynamic image"));
    else if (image.alt.trim()) report.descriptiveAlt++;
    else {
      report.emptyAlt++;
      if (image.alt !== "") errors.push("decorative image alt must be empty, not whitespace");
    }
  }
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const content = match[2];
    if (!/<img\b/i.test(content)) continue;
    report.imageLinks++;
    const anchor = attrs(match[0].slice(0, match[0].indexOf(">") + 1));
    const labelled = (anchor["aria-labelledby"] || "").split(/\s+/).filter(Boolean).some((id) => {
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const label = html.match(new RegExp(`<([a-z][\\w:-]*)\\b[^>]*\\bid=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/\\1>`, "i"));
      return label && text(label[2]);
    });
    const alternatives = [...content.matchAll(/<img\b[^>]*>/gi)].map((image) => attrs(image[0]).alt || "").join(" ").trim();
    if (!anchor["aria-label"]?.trim() && !labelled && !text(content) && !alternatives)
      errors.push("image link missing accessible name: " + (anchor.href || "unknown destination"));
  }
  for (const match of html.matchAll(/<([a-z][\w:-]*)\b[^>]*class=["'][^"']*\bgallery-item\b[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi)) {
    for (const imageTag of match[2].matchAll(/<img\b[^>]*>/gi)) {
      report.galleryImages++;
      if (!attrs(imageTag[0]).alt?.trim()) errors.push("gallery image needs descriptive alt for enlargement");
    }
  }
  return { ...report, errors };
}
function check(root = path.resolve(__dirname, "../dist"), options = {}) {
  const origin = options.origin || "https://www.skyguardrs.com";
  const files = walk(root).filter((f) => f.endsWith(".html"));
  const errors = [];
  const titles = new Set(),
    descriptions = new Set();
  const pages = new Map();
  const imageCounts = { images: 0, descriptiveAlt: 0, emptyAlt: 0, imageLinks: 0, galleryImages: 0 };
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const route =
      file === path.join(root, "index.html")
        ? "/"
        : "/" + path.relative(root, file).split(path.sep).join("/");
    pages.set(route, {
      html,
      ids: new Set(
        [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]),
      ),
    });
  }
  for (const [route, { html, ids }] of pages) {
    const fail = (message) => errors.push(route + ": " + message);
    const alternatives = imageAlternatives(html);
    alternatives.errors.forEach(fail);
    for (const key of Object.keys(imageCounts)) imageCounts[key] += alternatives[key];
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
    const descriptionsForPage = metas.filter((m) => m.name === "description");
    const description = descriptionsForPage[0]?.content;
    const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
      .map((m) => attrs(m[0]))
      .filter((m) => m.rel === "canonical");
    if (!title || titles.has(title)) fail("missing/duplicate title");
    titles.add(title);
    if (
      !description ||
      descriptions.has(description) ||
      descriptionsForPage.length !== 1
    )
      fail("missing/duplicate description");
    descriptions.add(description);
    if (canonicals.length !== 1 || canonicals[0].href !== origin + route)
      fail("canonical mismatch");
    if ((html.match(/<h1\b/gi) || []).length !== 1) fail("expected one H1");
    if (!/<main\b[^>]*id="main"/i.test(html)) fail("missing main landmark");
    if (metas.some((m) => m.name === "robots" && /noindex/i.test(m.content)))
      fail("unexpected noindex");
    const blocks = [
      ...html.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];
    if (blocks.length !== 1) fail("expected one schema graph");
    for (const block of blocks) {
      try {
        const graph = JSON.parse(block[1]);
        if (!graph["@graph"]?.some((n) => n["@type"] === "RoofingContractor"))
          fail("organization schema missing");
        if (/"aggregateRating"|"GeoCoordinates"/.test(block[1]))
          fail("unverified rating/coordinate schema");
      } catch {
        fail("invalid JSON-LD");
      }
    }
    for (const match of html.matchAll(
      /<(?:a|img|script|link|form|source)\b[^>]*>/gi,
    )) {
      const tag = attrs(match[0]);
      if (
        ["contact-form", "careers-form"].includes(tag.id) &&
        (tag.method?.toLowerCase() !== "post" || tag.action !== "/api/lead")
      )
        fail("lead form must use POST /api/lead without JavaScript");
      const values = [
        tag.href,
        tag.src,
        tag.action,
        ...(tag.srcset || "")
          .split(",")
          .filter(Boolean)
          .map((v) => v.trim().split(/\s+/)[0]),
      ].filter(Boolean);
      for (const value of values) {
        if (/^(?:mailto:|tel:|data:|javascript:)/i.test(value)) continue;
        let url;
        try {
          url = new URL(value, origin + route);
        } catch {
          fail("invalid URL " + value);
          continue;
        }
        if (url.origin !== origin) continue;
        if (url.pathname === "/api/lead") continue;
        const normalized = url.pathname === "/index.html" ? "/" : url.pathname;
        const file = path.join(
          root,
          normalized === "/" ? "index.html" : normalized,
        );
        if (!fs.existsSync(file)) fail("broken local URL " + value);
        else if (
          url.hash &&
          pages.has(normalized) &&
          !pages.get(normalized).ids.has(decodeURIComponent(url.hash.slice(1)))
        )
          fail("missing anchor " + value);
      }
    }
    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = attrs(match[0]);
      if (
        tag.src &&
        !tag.src.startsWith("data:") &&
        (!tag.width || !tag.height)
      )
        fail("image missing dimensions: " + tag.src);
    }
  }
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => m[1],
  );
  if (
    locations.length !== pages.size ||
    new Set(locations).size !== locations.length
  )
    errors.push("Sitemap page count/uniqueness mismatch");
  for (const route of pages.keys())
    if (!locations.includes(origin + route))
      errors.push("Sitemap missing " + route);
  if (errors.length) {
    throw new Error("Site checks failed:\n" + [...new Set(errors)].join("\n"));
  }
  return {
    pages: pages.size,
    canonicals: pages.size,
    uniqueTitles: titles.size,
    uniqueDescriptions: descriptions.size,
    brokenLocalLinks: 0,
    schemaGraphs: pages.size,
    sitemapUrls: locations.length,
    imageAlternatives: imageCounts,
  };
}
if (require.main === module) console.log(JSON.stringify(check(), null, 2));
module.exports = { check, imageAlternatives };
