"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const LEGACY_REDIRECTS = require("./data/legacy-redirects.json");
const DEFAULT_ORIGIN = "https://www.skyguardrs.com";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
const FIELDS = {
  contact: {
    name: 160,
    phone: 40,
    email: 254,
    preferredContact: 5,
    address: 300,
    city: 100,
    state_zip: 100,
    message: 8000,
    company: 200,
  },
  careers: {
    name: 160,
    phone: 40,
    email: 254,
    position: 200,
    citizen: 100,
    license: 100,
    info: 8000,
    company: 200,
  },
};
function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(data),
  });
  res.end(data);
}
function attribution(input, root) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const output = {};
  for (const key of [
    "landingPath",
    "landingPage",
    "landing_path",
    "referrerHost",
    "referrer",
    "referring_hostname",
    "source",
    "medium",
    "campaign",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "service",
    "city",
  ]) {
    const value = input[key];
    if (typeof value !== "string" || value.length > 120) continue;
    if (/landing/i.test(key)) {
      if (
        value !== "/" &&
        !/^\/pages\/(?:blog\/)?[a-z0-9-]+\.html$/.test(value)
      )
        continue;
      const candidate = path.join(root, value === "/" ? "index.html" : value);
      if (!fs.existsSync(candidate)) continue;
    } else if (/referr/i.test(key)) {
      if (!/^(?:[a-z0-9-]+\.)+[a-z]{2,24}$/i.test(value)) continue;
    } else if (key === "city") {
      if (!/^[a-z][a-z .'-]{0,79}$/i.test(value)) continue;
    } else if (!/^[a-z][a-z0-9_-]{0,49}$/i.test(value) || /\d{5,}/.test(value))
      continue;
    output[key] = value;
  }
  return output;
}
function createServer(options = {}) {
  const root = path.resolve(options.root || path.join(__dirname, "dist"));
  const origin = new URL(
    options.origin || process.env.SITE_ORIGIN || DEFAULT_ORIGIN,
  );
  if (
    origin.protocol !== "https:" ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash ||
    origin.username ||
    origin.password
  )
    throw new Error("SITE_ORIGIN must be an HTTPS origin");
  const redirectHosts =
    options.redirectHosts !== undefined
      ? options.redirectHosts
      : process.env.CANONICAL_REDIRECTS === "true";
  const token =
    options.token !== undefined ? options.token : process.env.LEAD_API_TOKEN;
  const upstreamUrl =
    options.upstreamUrl ||
    process.env.LEAD_API_URL ||
    "https://diligent-optimism-production-efa0.up.railway.app/api/public/website-lead";
  const timeout = options.timeout || 15000;
  const fetchUpstream = options.fetch || fetch;
  async function lead(req, res) {
    if (req.method !== "POST") {
      res.writeHead(405, { Allow: "POST", "Cache-Control": "no-store" });
      return res.end("Method Not Allowed");
    }
    if (
      !/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"] || "")
    )
      return json(res, 415, { error: "JSON content type required" });
    const chunks = [];
    let bytes = 0;
    try {
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 65536) {
          json(res, 413, { error: "Request too large" });
          return;
        }
        chunks.push(chunk);
      }
    } catch {
      return;
    }
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return json(res, 400, { error: "Invalid request" });
    }
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !Object.hasOwn(FIELDS, body.formType) ||
      !body.payload ||
      typeof body.payload !== "object" ||
      Array.isArray(body.payload)
    )
      return json(res, 400, { error: "Invalid request" });
    if (body.submissionId !== undefined &&
      (typeof body.submissionId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.submissionId)))
      return json(res, 400, { error: "Invalid submission identifier" });
    const input = body.payload;
    const payload = {};
    for (const [key, max] of Object.entries(FIELDS[body.formType])) {
      if (input[key] !== undefined) {
        if (typeof input[key] !== "string" || input[key].length > max)
          return json(res, 400, { error: "Invalid form fields" });
        payload[key] = input[key].trim();
      }
    }
    if (payload.company) return json(res, 422, { error: "Reload the form and try again" });
    if (
      !payload.name ||
      (!payload.phone && !payload.email) ||
      (body.formType === "careers" && (!payload.phone || !payload.email)) ||
      (payload.phone && (!/^\+?[\d\s().-]{7,40}$/.test(payload.phone) ||
        payload.phone.replace(/\D/g, "").length < 7 ||
        payload.phone.replace(/\D/g, "").length > 15)) ||
      (payload.email && !/^\S+@[^\s@]+\.[^\s@]+$/.test(payload.email)) ||
      (payload.preferredContact && !["phone", "email"].includes(payload.preferredContact)) ||
      (payload.preferredContact === "phone" && !payload.phone) ||
      (payload.preferredContact === "email" && !payload.email)
    )
      return json(res, 400, { error: "Provide your name and a valid contact method" });
    if (!token)
      return json(res, 503, { error: "Form is temporarily unavailable" });
    const messageField = body.formType === "contact" ? "message" : "info";
    const details = attribution(input.attribution, root);
    if (body.formType === "contact") payload.attribution = details;
    payload[messageField] = (payload[messageField] || "") +
      (Object.keys(details).length ? "\n\nWebsite referral context:\n" + Object.entries(details).map(([key,value])=>`${key}: ${value}`).join("\n") : "");
    try {
      const upstream = await fetchUpstream(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-website-token": token,
        },
        body: JSON.stringify({ formType: body.formType, payload, ...(body.formType === "contact" && body.submissionId ? {submissionId:body.submissionId} : {}) }),
        signal: AbortSignal.timeout(timeout),
      });
      if (upstream.status !== 202)
        return json(res, 502, { error: "Could not send your message" });
      await upstream.body?.cancel();
      return json(res, 202, { ok: true });
    } catch {
      return json(res, 502, { error: "Could not send your message" });
    }
  }
  return http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    const rawPath = (req.url || "/").split("?")[0];
    const query = (req.url || "").includes("?")
      ? "?" + req.url.split("?").slice(1).join("?")
      : "";
    let pathname;
    try {
      pathname = decodeURIComponent(rawPath);
    } catch {
      res.writeHead(400);
      return res.end("Invalid URL");
    }
    if (
      !pathname.startsWith("/") ||
      /[\\\x00-\x1f\x7f]/.test(pathname) ||
      pathname.split("/").some((part) => part === ".." || part.startsWith("."))
    ) {
      res.writeHead(404);
      return res.end("Not Found");
    }
    if (pathname === "/api/lead") return lead(req, res);
    if (pathname === "/healthz") {
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405, { Allow: "GET, HEAD" });
        return res.end();
      }
      return json(
        res,
        fs.existsSync(path.join(root, "index.html")) ? 200 : 503,
        { ok: fs.existsSync(path.join(root, "index.html")) },
      );
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      return res.end("Method Not Allowed");
    }
    let canonicalPath = pathname === "/index.html" ? "/" : pathname;
    // Only verified old paths with a published successor receive a redirect.
    const legacyTarget = Object.hasOwn(LEGACY_REDIRECTS, pathname)
      ? LEGACY_REDIRECTS[pathname] : undefined;
    if (legacyTarget && fs.existsSync(path.join(root, legacyTarget)))
      canonicalPath = legacyTarget;
    if (
      pathname === "/pages/insurance-claims.html" &&
      !fs.existsSync(path.join(root, pathname))
    )
      canonicalPath = "/pages/storm-damage.html";
    let file = path.resolve(
      root,
      "." + (canonicalPath === "/" ? "/index.html" : canonicalPath),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(404);
      return res.end("Not Found");
    }
    if (
      !path.extname(canonicalPath) &&
      canonicalPath !== "/" &&
      fs.existsSync(file + ".html")
    ) {
      canonicalPath += ".html";
      file += ".html";
    }
    if (
      (redirectHosts && req.headers.host !== origin.host) ||
      canonicalPath !== pathname
    ) {
      res.writeHead(308, {
        Location:
          (redirectHosts && req.headers.host !== origin.host
            ? origin.origin
            : "") +
          canonicalPath +
          query,
        "Cache-Control": "public, max-age=300",
      });
      return res.end();
    }
    let data;
    try {
      if (!fs.statSync(file).isFile()) throw new Error("not file");
      data = fs.readFileSync(file);
    } catch {
      res.writeHead(404, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      return res.end(
        req.method === "HEAD"
          ? ""
          : '<!doctype html><html lang="en"><title>Page not found | SkyGuard</title><h1>Page not found</h1><p><a href="/">Go to SkyGuard home</a></p></html>',
      );
    }
    const ext = path.extname(file).toLowerCase();
    const headers = {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": [".html", ".xml", ".txt", ".json"].includes(ext)
        ? "public, max-age=0, must-revalidate"
        : "public, max-age=3600, must-revalidate",
    };
    if (/[.-][a-f0-9]{12}\./.test(path.basename(file)))
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    if (
      /^(?:text\/|application\/(?:javascript|json|xml))/.test(
        headers["Content-Type"],
      )
    ) {
      headers.Vary = "Accept-Encoding";
      const encoding = req.headers["accept-encoding"] || "";
      if (
        data.length > 512 &&
        /(?:^|,)\s*gzip(?:\s*;\s*q=(?!0(?:\.0*)?(?:\s|,|$))[0-9.]+)?(?:\s*,|\s*$)/i.test(
          encoding,
        )
      ) {
        data = zlib.gzipSync(data);
        headers["Content-Encoding"] = "gzip";
      }
    }
    headers["Content-Length"] = data.length;
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : data);
  });
}
if (require.main === module) {
  if (!fs.existsSync(path.join(__dirname, "dist/index.html"))) {
    require("./scripts/build").build();
  }
  createServer().listen(process.env.PORT || 3000, () =>
    console.log("SkyGuard website server ready"),
  );
}
module.exports = { createServer, attribution };
