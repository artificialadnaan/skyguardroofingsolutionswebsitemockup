"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const BASE = path.resolve(__dirname, "..");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))
    out[m[1].toLowerCase()] = decode(m[2] ?? m[3]);
  return out;
}
function dateOnly(value) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value || "") ||
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) !== value
  )
    throw new Error("Invalid publication date: " + value);
  return value;
}
function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith(".")) return [];
    const file = path.join(dir, e.name);
    if (e.isSymbolicLink())
      throw new Error("Public symlinks are not allowed: " + file);
    return e.isDirectory() ? walk(file) : [file];
  });
}
function jsonFile(file, fallback) {
  return fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, "utf8"))
    : fallback;
}
function scheduled(html, date) {
  const re =
    /<([a-z][\w-]*)\b[^>]*\bdata-publish-date\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    dateOnly(m[2]);
    if (m[2] <= date) {
      const replacement = m[0].replace(
        /\bclass=(["'])(.*?)\1/,
        (_, q, c) => `class=${q}${c} published${q}`,
      );
      html = html.slice(0, m.index) + replacement + html.slice(re.lastIndex);
      re.lastIndex = m.index + replacement.length;
      continue;
    }
    const close = new RegExp(`<\\/?${m[1]}\\b[^>]*>`, "gi");
    close.lastIndex = re.lastIndex;
    let depth = 1,
      token;
    while (depth && (token = close.exec(html)))
      depth += token[0].startsWith("</") ? -1 : 1;
    if (depth) throw new Error("Unclosed scheduled element");
    html = html.slice(0, m.index) + html.slice(close.lastIndex);
    re.lastIndex = m.index;
  }
  return html;
}
function build(options = {}) {
  const root = path.resolve(options.root || BASE);
  const output = path.resolve(options.output || path.join(root, "dist"));
  if (output === root || !output.startsWith(root + path.sep))
    throw new Error("Output must be inside source root");
  const date = dateOnly(options.date || process.env.BUILD_DATE || today());
  const business = jsonFile(
    path.join(root, "data/business.json"),
    jsonFile(path.join(BASE, "data/business.json")),
  );
  const origin = business.origin;
  const files = [
    path.join(root, "index.html"),
    ...walk(path.join(root, "pages")).filter((f) => f.endsWith(".html")),
  ].filter(fs.existsSync);
  const publication = jsonFile(path.join(root, "data/publication.json"), {});
  const overrides = jsonFile(path.join(root, "data/page-metadata.json"), {});
  const images = jsonFile(path.join(root, "data/image-manifest.json"), {});
  const pages = files.map((file) => {
    const source = fs.readFileSync(file, "utf8");
    const route =
      file === path.join(root, "index.html")
        ? "/"
        : "/" + path.relative(root, file).split(path.sep).join("/");
    const title = decode(
      source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "",
    ).trim();
    const meta = [...source.matchAll(/<meta\b[^>]*>/gi)].map((m) =>
      attrs(m[0]),
    );
    const description =
      meta.find((x) => x.name === "description")?.content || "";
    const graph = [
      ...source.matchAll(
        /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ].flatMap((m) => {
      try {
        const j = JSON.parse(m[1]);
        return j["@graph"] || [j];
      } catch {
        throw new Error("Invalid source JSON-LD: " + route);
      }
    });
    const article = graph.find((j) => j["@type"] === "Article");
    const isArticle = route.startsWith("/pages/blog/");
    const published = isArticle
      ? dateOnly(publication[route]?.datePublished || article?.datePublished)
      : undefined;
    const modified = isArticle
      ? dateOnly(
          article?.dateModified ||
            publication[route]?.dateModified ||
            published,
        )
      : overrides[route]?.dateModified;
    if (modified && published && modified < published)
      throw new Error("Modification precedes publication: " + route);
    if (modified && modified > date && published <= date)
      throw new Error("Future modification date: " + route);
    return {
      route,
      file,
      source,
      title,
      description,
      published,
      modified,
      ...overrides[route],
    };
  });
  const withheld = pages.filter((p) => p.published && p.published > date);
  const active = pages.filter((p) => !p.published || p.published <= date);
  const routes = new Set(active.map((p) => p.route));
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  for (const dir of ["images", "css", "js"]) {
    for (const file of walk(path.join(root, dir))) {
      const rel = path.relative(root, file);
      if (
        !/\.(?:png|jpe?g|gif|svg|webp|avif|ico|css|js|woff2?|ttf)$/i.test(
          file,
        ) &&
        !/-LICENSE\.txt$/.test(file)
      )
        continue;
      const target = path.join(output, rel);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(file, target);
    }
  }
  const assetVersion = (url) => {
    const [pathname] = url.split("?");
    const file = path.join(output, pathname);
    return fs.existsSync(file)
      ? pathname +
          "?v=" +
          crypto
            .createHash("sha256")
            .update(fs.readFileSync(file))
            .digest("hex")
            .slice(0, 12)
      : url;
  };
  const links = (items) =>
    items
      .filter(([url]) => routes.has(url))
      .map(([url, label]) => `<li><a href="${url}">${escape(label)}</a></li>`)
      .join("\n");
  const services = [
    ["/pages/roof-repair.html", "Roof Repair"],
    ["/pages/roof-replacement.html", "Roof Replacement"],
    ["/pages/storm-damage.html", "Storm Damage"],
    ["/pages/residential-roofing.html", "Residential Roofing"],
    ["/pages/commercial-roofing.html", "Commercial Roofing"],
    ["/pages/siding.html", "Siding"],
    ["/pages/windows-doors.html", "Windows & Doors"],
    ["/pages/painting.html", "Painting"],
    ["/pages/fencing.html", "Fencing"],
    ["/pages/drywall.html", "Drywall"],
    ["/pages/framing.html", "Framing"],
  ];
  const company = [
    ["/pages/about.html", "About"],
    ["/pages/service-areas.html", "DFW Service Areas"],
    ["/pages/roofing-fort-worth.html", "Fort Worth Roofing"],
    ["/pages/roofing-dallas.html", "Dallas Roofing"],
    ["/pages/gallery.html", "Gallery"],
    ["/pages/blog.html", "Roofing Guides"],
    ["/pages/roofing-resources.html", "Homeowner Resources"],
    ["/pages/resources.html", "Homeowner Resources"],
    ["/pages/careers.html", "Careers"],
    ["/pages/contact.html", "Contact"],
  ];
  const template = (name) =>
    fs.readFileSync(
      path.join(
        fs.existsSync(path.join(root, "templates/partials", name))
          ? root
          : BASE,
        "templates/partials",
        name,
      ),
      "utf8",
    );
  const fill = (text, data) =>
    text.replace(/{{(\w+)}}/g, (_, key) => data[key] ?? "");
  const navigation =
    links([
      ["/", "Home"],
      ["/pages/about.html", "About"],
    ]) +
    `<li class="has-dropdown"><a href="${routes.has("/pages/services.html") ? "/pages/services.html" : "/pages/residential-roofing.html"}">Services &#9662;</a><ul class="dropdown-menu">${links(services)}</ul></li>` +
    links([
      ["/pages/inspections.html", "Inspections"],
      ["/pages/financing.html", "Financing"],
      ["/pages/gallery.html", "Gallery"],
      ["/pages/blog.html", "Guides"],
      ["/pages/contact.html", "Contact"],
    ]);
  let header = fill(template("header.html"), { navigation });
  let footer = fill(template("footer.html"), {
    ...Object.fromEntries(
      Object.entries(business)
        .filter(([, v]) => typeof v === "string")
        .map(([k, v]) => [k, escape(v)]),
    ),
    services: links(
      services.slice(0, 5).concat([
        ["/pages/inspections.html", "Roof Inspections"],
        ["/pages/services.html", "All Services"],
      ]),
    ),
    company: links(company),
    year: date.slice(0, 4),
    social: business.socialProfiles
      .map(
        (p) =>
          `<a href="${escape(p.url)}" aria-label="${escape(p.label)}" rel="noopener" target="_blank"><i data-lucide="${escape(p.icon)}"></i></a>`,
      )
      .join(""),
  });
  const logo = images["/images/logo-horizontal.png"];
  if (logo?.variants?.length) {
    const small =
      logo.variants.find((v) => v.width >= 480) || logo.variants.at(-1);
    header = header.replaceAll(
      'src="/images/logo-horizontal.png"',
      `src="${small.src}"`,
    );
    footer = footer.replaceAll(
      'src="/images/logo-horizontal.png"',
      `src="${small.src}"`,
    );
  }
  const organization = {
    "@type": "RoofingContractor",
    "@id": origin + "/#organization",
    name: business.name,
    url: origin + "/",
    telephone: business.phone,
    email: business.email,
    logo: origin + "/images/logo-horizontal.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.streetAddress,
      addressLocality: business.city,
      addressRegion: business.region,
      postalCode: business.postalCode,
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "Fort Worth" },
      { "@type": "City", name: "Dallas" },
      { "@type": "Place", name: "Dallas–Fort Worth" },
    ],
    openingHoursSpecification: business.openingHoursSpecification,
    sameAs: business.socialProfiles.map((p) => p.url),
  };
  const sitemapImages = new Map();
  for (const page of active) {
    let main = page.source.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];
    if (!main) throw new Error("Missing main: " + page.route);
    main = main.replace(/<main\b[^>]*>/i, '<main id="main">');
    main = scheduled(main, date);
    main = main.replace(/<form\b[^>]*>/gi, (tag) => {
      const fields = attrs(tag);
      if (!["contact-form", "careers-form"].includes(fields.id)) return tag;
      const safe = tag
        .replace(/\s(?:method|action)\s*=\s*(["']).*?\1/gi, "")
        .replace(/>$/, ' method="post" action="/api/lead">');
      return `<noscript><p>To request service or ask about careers, call <a href="tel:${escape(business.phone)}">${escape(business.phoneDisplay)}</a> or email <a href="mailto:${escape(business.email)}">${escape(business.email)}</a>.</p></noscript>${safe}`;
    });
    main = main.replace(
      /\b(href|src|action)\s*=\s*(["'])(.*?)\2/gi,
      (all, key, q, url) => {
        if (!url || /^(?:#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return all;
        const resolved = new URL(url, origin + page.route);
        let pathname = resolved.pathname;
        if (pathname === "/index.html") pathname = "/";
        if (
          pathname === "/pages/insurance-claims.html" &&
          !routes.has(pathname)
        )
          pathname = "/pages/storm-damage.html";
        return `${key}=${q}${pathname}${resolved.search}${resolved.hash}${q}`;
      },
    );
    for (const hidden of withheld) {
      const escaped = hidden.route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      main = main.replace(
        new RegExp(
          `<a\\b[^>]*href=["']${escaped}(?:[?#][^"']*)?["'][^>]*>([\\s\\S]*?)<\\/a>`,
          "gi",
        ),
        "$1",
      );
    }
    let htmlMain = main;
    let firstContentImage = true;
    htmlMain = htmlMain.replace(/<img\b[^>]*>/gi, (tag, offset) => {
      const at = attrs(tag);
      const original = at.src?.split("?")[0];
      if (!original) return tag;
      const record = images[original];
      const card =
        /(?:service-card|blog-list-item|blog-list-img|gallery-item|feature-card)/.test(
          main.slice(Math.max(0, offset - 1200), offset),
        );
      const hero = firstContentImage && /hero-bg/.test(main.slice(0, offset));
      firstContentImage = false;
      let updated = tag;
      const set = (key, value) => {
        const re = new RegExp("\\s" + key + "\\s*=\\s*([\"']).*?\\1", "i");
        updated = updated.replace(re, "");
        updated = updated.replace(/\s*\/?>$/, ` ${key}="${escape(value)}">`);
      };
      if (record?.variants?.length) {
        const variants = record.variants;
        const fallback =
          variants.find((v) => v.width >= 768) || variants.at(-1);
        set("src", fallback.src);
        if (page.route === "/pages/gallery.html")
          set("data-full-src", variants.at(-1).src);
        set("srcset", variants.map((v) => `${v.src} ${v.width}w`).join(", "));
        set(
          "sizes",
          hero
            ? "100vw"
            : card
              ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              : "(max-width: 840px) 100vw, 800px",
        );
        set("width", record.width);
        set("height", record.height);
      }
      set("loading", hero ? "eager" : "lazy");
      set("decoding", "async");
      if (hero) set("fetchpriority", "high");
      return updated;
    });
    // Index informative content images, using the largest available rendition.
    // Decorative backgrounds and the repeated header/footer logos are excluded.
    const pageImages = new Set();
    for (const match of htmlMain.matchAll(/<img\b[^>]*>/gi)) {
      const image = attrs(match[0]);
      if (!image.alt?.trim() || !image.src || image.src.startsWith("data:")) continue;
      const variants = (image.srcset || "").split(",").map((entry) => {
        const [src, width] = entry.trim().split(/\s+/);
        return { src, width: parseInt(width, 10) || 0 };
      }).filter((entry) => entry.src).sort((a, b) => b.width - a.width);
      const imageUrl = new URL(variants[0]?.src || image.src, origin + page.route);
      if (imageUrl.origin === origin) pageImages.add(imageUrl.href);
    }
    sitemapImages.set(page.route, [...pageImages]);
    const canonical = origin + page.route;
    const h1 = decode(
      htmlMain
        .match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
        ?.replace(/<[^>]*>/g, "") || page.title,
    );
    const sourceImage =
      attrs(htmlMain.match(/<img\b[^>]*>/i)?.[0] || "").src ||
      "/images/hero-residential.png";
    const graph = [
      organization,
      {
        "@type": "WebSite",
        "@id": origin + "/#website",
        url: origin + "/",
        name: business.name,
        publisher: { "@id": origin + "/#organization" },
      },
      {
        "@type": "WebPage",
        "@id": canonical + "#webpage",
        url: canonical,
        name: page.title,
        description: page.description,
        isPartOf: { "@id": origin + "/#website" },
        about: { "@id": origin + "/#organization" },
      },
    ];
    if (page.route !== "/") {
      const crumbs = [{ name: "Home", item: origin + "/" }];
      if (page.published)
        crumbs.push({
          name: "Roofing Guides",
          item: origin + "/pages/blog.html",
        });
      crumbs.push({ name: h1, item: canonical });
      graph.push({
        "@type": "BreadcrumbList",
        "@id": canonical + "#breadcrumbs",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          ...c,
        })),
      });
      graph[2].breadcrumb = { "@id": canonical + "#breadcrumbs" };
    }
    if (page.published)
      graph.push({
        "@type": "Article",
        "@id": canonical + "#article",
        headline: h1,
        description: page.description,
        datePublished: page.published,
        dateModified: page.modified,
        author: { "@id": origin + "/#organization" },
        publisher: { "@id": origin + "/#organization" },
        mainEntityOfPage: { "@id": canonical + "#webpage" },
        image: new URL(sourceImage, origin).href,
      });
    else if (
      services.some(([url]) => url === page.route) ||
      page.route === "/pages/inspections.html"
    )
      graph.push({
        "@type": "Service",
        "@id": canonical + "#service",
        name: h1,
        url: canonical,
        description: page.description,
        provider: { "@id": origin + "/#organization" },
        areaServed: "Dallas–Fort Worth, Texas",
      });
    const sourceHead =
      page.source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
    const styles = [...sourceHead.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)]
      .map((m) => m[0])
      .join("\n");
    const measurementId = process.env.ANALYTICS_MEASUREMENT_ID || "";
    if (measurementId && !/^G-[A-Z0-9]{5,20}$/.test(measurementId))
      throw new Error("Invalid ANALYTICS_MEASUREMENT_ID");
    const analyticsConfig = `<script>window.SKYGUARD_ANALYTICS=${JSON.stringify({ measurementId, manualMeasurementVerified: process.env.ANALYTICS_MANUAL_MEASUREMENT_VERIFIED === "true" })};</script>`;
    const scripts = ["icons.js", "analytics.js", "main.js"]
      .filter((name) => fs.existsSync(path.join(output, "js", name)))
      .map(
        (name) =>
          `<script src="${assetVersion("/js/" + name)}" defer></script>`,
      )
      .join("\n");
    const head = `<meta charset="UTF-8"><noscript><style>#contact-form,#careers-form{display:none}</style></noscript><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="${page.published ? "article" : "website"}"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:image" content="${escape(new URL(sourceImage, origin).href)}"><meta property="og:site_name" content="${escape(business.name)}"><meta property="og:locale" content="en_US"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(page.title)}"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${escape(new URL(sourceImage, origin).href)}"><link rel="icon" href="/images/logo-horizontal.png" type="image/png"><link rel="apple-touch-icon" href="/images/logo-horizontal.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Poppins:wght@600;700;800&amp;display=swap" rel="stylesheet"><link rel="stylesheet" href="${assetVersion("/css/styles.css")}">${styles}<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
    const html = `<!DOCTYPE html>\n<html lang="en"><head>${head}</head><body>${header}${htmlMain}${footer}${analyticsConfig}${scripts}</body></html>\n`;
    const target = path.join(
      output,
      page.route === "/" ? "index.html" : page.route,
    );
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
  }
  fs.writeFileSync(
    path.join(output, "robots.txt"),
    robotsText(origin),
  );
  fs.writeFileSync(
    path.join(output, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      active
        .map(
          (p) =>
            `<url><loc>${escape(origin + p.route)}</loc>${p.modified ? `<lastmod>${p.modified}</lastmod>` : ""}${sitemapImages.get(p.route).map((url) => `<image:image><image:loc>${escape(url)}</image:loc></image:image>`).join("")}</url>`,
        )
        .join("\n") +
      "\n</urlset>\n",
  );
  const report = {
    buildDate: date,
    timeZone: "America/Chicago",
    publishedPages: active.map(
      ({ route, title, description, published, modified }) => ({
        route,
        title,
        description,
        datePublished: published,
        dateModified: modified,
      }),
    ),
    withheldPages: withheld.map((p) => ({
      route: p.route,
      datePublished: p.published,
      reason: "Declared future publication; explicitly withdrawn until release",
    })),
  };
  fs.mkdirSync(path.join(root, ".build"), { recursive: true });
  fs.writeFileSync(
    path.join(root, ".build/report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  if (options.check !== false) require("./check").check(output, { origin });
  return report;
}
function robotsText(origin) {
  return `# Public pages and images are available to search and AI crawlers.\n# The wildcard includes OAI-SearchBot, ChatGPT-User, GPTBot,\n# Claude-SearchBot, Claude-User, ClaudeBot, PerplexityBot,\n# Perplexity-User, Googlebot, Google-Extended and Bingbot.\n# Crawler permission does not guarantee indexing, citations or rankings.\nUser-agent: *\nDisallow: /api/\nDisallow: /healthz\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
}
module.exports = { build, attrs, dateOnly, scheduled, walk, robotsText };
if (require.main === module) {
  const report = build();
  console.log(
    `Built ${report.publishedPages.length} pages; ${report.withheldPages.length} scheduled pages withheld (${report.buildDate}, ${report.timeZone}).`,
  );
}
