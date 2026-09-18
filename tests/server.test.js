"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { createServer } = require("../server");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "skyguard-server-test-"));
fs.mkdirSync(path.join(root, "pages"));
fs.writeFileSync(
  path.join(root, "index.html"),
  "<h1>Fixture home</h1>".repeat(50),
);
fs.writeFileSync(path.join(root, "pages/roof-repair.html"), "<h1>Repair</h1>");
fs.writeFileSync(path.join(root, "sitemap.xml"), "<urlset/>");
fs.writeFileSync(path.join(root, "robots.txt"), "User-agent: *");
fs.writeFileSync(path.join(root, "asset.webp"), "fixture");
async function server(t, options = {}) {
  const s = createServer({ root, ...options });
  await new Promise((resolve) => s.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => s.close(resolve)));
  return `http://127.0.0.1:${s.address().port}`;
}
function raw(base, url, headers = {}) {
  return new Promise((resolve, reject) => {
    http
      .get(base + url, { headers }, (res) => {
        let body = "";
        res.on("data", (x) => (body += x));
        res.on("end", () =>
          resolve({ status: res.statusCode, headers: res.headers, body }),
        );
      })
      .on("error", reject);
  });
}
const valid = {
  formType: "contact",
  payload: {
    name: "Test Contact",
    phone: "682-555-0100",
    email: "test@example.com",
    message: "Mock submission",
  },
};
async function post(base, body = valid) {
  return fetch(base + "/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
test("routing, MIME, HEAD, compression and query-preserving aliases", async (t) => {
  const base = await server(t);
  assert.equal((await fetch(base)).status, 200);
  const alias = await fetch(base + "/pages/roof-repair?utm_source=test", {
    redirect: "manual",
  });
  assert.equal(alias.status, 308);
  assert.equal(
    alias.headers.get("location"),
    "/pages/roof-repair.html?utm_source=test",
  );
  assert.equal(
    (await fetch(base + "/index.html", { redirect: "manual" })).headers.get(
      "location",
    ),
    "/",
  );
  assert.equal((await fetch(base + "/no-such-page")).status, 404);
  assert.match(
    (await fetch(base + "/sitemap.xml")).headers.get("content-type"),
    /^application\/xml/,
  );
  assert.match(
    (await fetch(base + "/robots.txt")).headers.get("content-type"),
    /^text\/plain/,
  );
  assert.equal(
    (await fetch(base + "/asset.webp")).headers.get("content-type"),
    "image/webp",
  );
  const head = await fetch(base, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.match(head.headers.get("cache-control"), /must-revalidate/);
  const gzip = await raw(base, "/", { "Accept-Encoding": "gzip" });
  assert.equal(gzip.headers["content-encoding"], "gzip");
  const identity = await raw(base, "/", { "Accept-Encoding": "gzip;q=0" });
  assert.equal(identity.headers["content-encoding"], undefined);
});
test("source exposure, malformed paths and traversal are rejected", async (t) => {
  const base = await server(t);
  for (const route of [
    "/server.js",
    "/package.json",
    "/.env",
    "/.git/config",
    "/tests/server.test.js",
    "/data/business.json",
    "/%2e%2e/server.js",
    "/%2e%2e%2fserver.js",
    "/%5c..%5cserver.js",
  ])
    assert.equal((await raw(base, route)).status, 404, route);
  assert.equal((await raw(base, "/%zz")).status, 400);
});
test("canonical redirects ignore forwarded headers and exempt health/API", async (t) => {
  const base = await server(t, { redirectHosts: true });
  const redirected = await fetch(base + "/pages/roof-repair?utm_source=test", {
    redirect: "manual",
    headers: {
      "X-Forwarded-Host": "attacker.invalid",
      "X-Forwarded-Proto": "http",
    },
  });
  assert.equal(
    redirected.headers.get("location"),
    "https://www.skyguardrs.com/pages/roof-repair.html?utm_source=test",
  );
  assert.equal((await fetch(base + "/healthz")).status, 200);
  assert.equal((await fetch(base + "/api/lead")).status, 405);
  assert.equal((await post(base)).status, 503);
});
test("contact and careers remain compatible; token stays upstream; attribution sanitized", async (t) => {
  const seen = [];
  const base = await server(t, {
    token: "test-only-secret",
    fetch: async (url, opts) => {
      seen.push({ url, opts });
      return new Response("{}", { status: 202 });
    },
  });
  const body = structuredClone(valid);
  body.payload.attribution = {
    landingPath: "/pages/roof-repair.html",
    referrerHost: "www.google.com",
    source: "google",
    campaign: "person@example.com",
    city: "Fort Worth",
    term: "secret",
  };
  const response = await post(base, body);
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true });
  const forwarded = JSON.parse(seen[0].opts.body);
  assert.match(forwarded.payload.message, /source: google/);
  assert.match(forwarded.payload.message, /landingPath:/);
  assert.equal(forwarded.payload.attribution.source, "google");
  assert.equal(forwarded.payload.attribution.campaign, undefined);
  assert.doesNotMatch(forwarded.payload.message, /person@example|secret/);
  assert.equal(seen[0].opts.headers["x-website-token"], "test-only-secret");
  const career = await post(base, {
    formType: "careers",
    payload: {
      name: "Test Applicant",
      phone: "6825550100",
      email: "test@example.com",
      position: "Roofer",
      citizen: "Yes",
      license: "Yes",
      info: "Test only",
    },
  });
  assert.equal(career.status, 202);
  assert.equal(JSON.parse(seen[1].opts.body).formType, "careers");
});
test("honeypot discarded; invalid input never forwarded", async (t) => {
  let requests = 0;
  const base = await server(t, {
    token: "test",
    fetch: async () => {
      requests++;
      return new Response("{}", { status: 202 });
    },
  });
  assert.equal(
    (await post(base, { formType: "contact", payload: { company: "Bot" } }))
      .status,
    202,
  );
  for (const body of [
    "{bad",
    null,
    { formType: "inspection", payload: valid.payload },
    { formType: "contact", payload: { ...valid.payload, email: "" } },
    { formType: "contact", payload: { ...valid.payload, name: [] } },
  ])
    assert.equal((await post(base, body)).status, 400);
  assert.equal(requests, 0);
  assert.equal(
    (
      await post(base, {
        ...valid,
        payload: { ...valid.payload, message: "x".repeat(66000) },
      })
    ).status,
    413,
  );
});
test("upstream failures, timeouts, and missing config never report success or leak details", async (t) => {
  for (const scenario of [
    async () => new Response("secret private upstream", { status: 500 }),
    async () => {
      throw new Error("secret network");
    },
    async (url, options) =>
      new Promise((resolve, reject) =>
        options.signal.addEventListener("abort", () =>
          reject(new Error("secret timeout")),
        ),
      ),
  ]) {
    const base = await server(t, {
      token: "test",
      fetch: scenario,
      timeout: 15,
    });
    const response = await post(base);
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /secret/);
  }
  const unconfigured = await server(t, { token: "" });
  assert.equal((await post(unconfigured)).status, 503);
});
test.after(() => fs.rmSync(root, { recursive: true, force: true }));

test("evidenced legacy URLs redirect once to published successors; unknown paths stay 404", async t => {
  const legacy = require("../data/legacy-redirects.json");
  const legacyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "skyguard-legacy-test-"));
  t.after(() => fs.rmSync(legacyRoot, { recursive: true, force: true }));
  for (const target of new Set(Object.values(legacy))) {
    const file = path.join(legacyRoot, target);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "<h1>Published successor</h1>");
  }
  const base = await server(t, { root: legacyRoot, redirectHosts: true });
  for (const [oldPath, target] of Object.entries(legacy)) {
    for (const method of ["GET", "HEAD"]) {
      const response = await fetch(base + oldPath + "?utm_source=legacy&start=3", {method, redirect: "manual"});
      assert.equal(response.status, 308, oldPath);
      assert.equal(response.headers.get("location"), "https://www.skyguardrs.com" + target + "?utm_source=legacy&start=3");
      assert.equal(await response.text(), "");
    }
  }
  const canonicalHost = {Host: "www.skyguardrs.com"};
  assert.equal((await raw(base, "/index.php/blog/roofing-dfw/unknown", canonicalHost)).status, 404);
  const [oldPath, target] = Object.entries(legacy)[0];
  fs.rmSync(path.join(legacyRoot, target));
  assert.equal((await raw(base, oldPath, canonicalHost)).status, 404, "Missing successor must not redirect");
});
