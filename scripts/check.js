"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { attrs, walk } = require("./build");
function check(root = path.resolve(__dirname, "../dist"), options = {}) {
  const origin = options.origin || "https://www.skyguardrs.com";
  const files = walk(root).filter((f) => f.endsWith(".html"));
  const errors = [];
  const titles = new Set(),
    descriptions = new Set();
  const pages = new Map();
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
      if (!Object.hasOwn(tag, "alt")) fail("image missing alt");
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
  };
}
if (require.main === module) console.log(JSON.stringify(check(), null, 2));
module.exports = { check };
