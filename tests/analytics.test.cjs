const test = require("node:test");
const assert = require("node:assert/strict");
const { slug, attribution, safeEvent, install } = require("../js/analytics.js");
test("attribution excludes PII, arbitrary query parameters and fragments", () => {
  const v = attribution(
    "https://www.skyguardrs.com/pages/roof-repair.html?utm_source=google&utm_medium=cpc&utm_campaign=storm2026&utm_term=Jane+Doe&email=jane@example.com#phone",
    "https://search.example/results?q=jane@example.com",
    "https://www.skyguardrs.com/pages/roof-repair.html",
  );
  assert.deepEqual(v, {
    landingPath: "/pages/roof-repair.html",
    referrerHost: "search.example",
    source: "google",
    medium: "cpc",
    campaign: "storm2026",
  });
  for (const s of [
    "jane@example.com",
    "6823305088",
    "phone6823305088",
    "https://example.com",
    "Jane Doe",
    "abc\nxyz",
  ])
    assert.equal(slug(s), "");
});
test("unknown/mismatched page paths and authenticated referrer are omitted", () => {
  assert.deepEqual(
    attribution(
      "https://www.skyguardrs.com/customer/jane",
      "https://me:secret@example.com/path",
      "https://www.skyguardrs.com/",
    ),
    {},
  );
});
test("events allow only fixed nonpersonal dimensions; careers excluded", () => {
  assert.equal(
    safeEvent("generate_lead", {
      pagePath: "/",
      form: "careers",
      name: "Jane",
      email: "private@example.com",
      message: "secret",
      city: "Fort Worth",
    }),
    null,
  );
  assert.equal(safeEvent("form_payload", {}), null);
});
test("disabled analytics never loads provider or reads/writes storage", () => {
  let calls = 0;
  const doc = {
    querySelector: () => ({ href: "https://www.skyguardrs.com/" }),
    referrer: "",
    readyState: "complete",
    getElementById: () => null,
    createElement: () => {
      calls++;
      throw Error("unexpected provider/UI");
    },
    head: { appendChild: () => calls++ },
  };
  const win = {
    document: doc,
    location: { href: "https://www.skyguardrs.com/?email=secret" },
    get localStorage() {
      throw Error("storage");
    },
    get sessionStorage() {
      throw Error("storage");
    },
  };
  install(win);
  win.SkyGuardMetrics.event("generate_lead", { name: "private" });
  win.SkyGuardMetrics.setConsent(true);
  assert.equal(calls, 0);
  assert.equal(win.dataLayer, undefined);
});
function configuredBrowser(
  config = { measurementId: "G-TEST12345", manualMeasurementVerified: true },
) {
  const appended = [],
    elements = new Map();
  function element(tag) {
    const node = {
      tagName: tag.toUpperCase(),
      children: [],
      listeners: {},
      setAttribute(k, v) {
        this[k] = v;
      },
      appendChild(child) {
        this.children.push(child);
        if (child.id) elements.set(child.id, child);
        return child;
      },
      addEventListener(name, fn) {
        this.listeners[name] = fn;
      },
      remove() {
        if (this.id) elements.delete(this.id);
      },
    };
    return node;
  }
  const body = element("body");
  const doc = {
    querySelector: (selector) =>
      selector.includes("canonical")
        ? {
            href: "https://www.skyguardrs.com/pages/roof-repair.html?email=private@example.com#phone",
          }
        : null,
    referrer: "https://search.example/results?q=private@example.com",
    readyState: "complete",
    getElementById: (id) => elements.get(id) || null,
    createElement: element,
    head: { appendChild: (node) => appended.push(node) },
    body,
  };
  const win = {
    document: doc,
    SKYGUARD_ANALYTICS: config,
    location: {
      href: "https://www.skyguardrs.com/pages/roof-repair.html?utm_campaign=private@example.com#phone",
    },
    get localStorage() {
      throw Error("Unexpected storage");
    },
    get sessionStorage() {
      throw Error("Unexpected storage");
    },
  };
  install(win);
  return { win, appended, elements };
}
test("provider requires verified manual measurement and affirmative consent", () => {
  const unverified = configuredBrowser({ measurementId: "G-TEST12345" });
  unverified.win.SkyGuardMetrics.setConsent(true);
  assert.equal(unverified.appended.length, 0);
  assert.equal(unverified.win.dataLayer, undefined);
  const { win, appended, elements } = configuredBrowser();
  assert.equal(appended.length, 0);
  assert.equal(win.dataLayer, undefined);
  assert.ok(elements.has("analytics-choice"));
  assert.ok(elements.has("analytics-preferences"));
  win.SkyGuardMetrics.setConsent(false);
  assert.equal(appended.length, 0);
  win.SkyGuardMetrics.setConsent(true);
  assert.equal(appended.length, 1);
  assert.equal(
    appended[0].src,
    "https://www.googletagmanager.com/gtag/js?id=G-TEST12345",
  );
  assert.equal(win["ga-disable-G-TEST12345"], false);
  const commands = win.dataLayer.map((args) => Array.from(args));
  const config = commands.find((c) => c[0] === "config")[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.cookie_expires, 86400);
  assert.equal(config.cookie_update, false);
  assert.equal(
    config.page_location,
    "https://www.skyguardrs.com/pages/roof-repair.html",
  );
  assert.doesNotMatch(
    JSON.stringify(commands),
    /private@example|#phone|results\?q|utm_campaign/,
  );
  win.SkyGuardMetrics.event("generate_lead", {
    form: "careers",
    email: "private@example.com",
  });
  assert.equal(
    win.dataLayer.filter((c) => c[0] === "event" && c[1] === "generate_lead")
      .length,
    0,
  );
  win.SkyGuardMetrics.event("generate_lead", {
    form: "inspection",
    name: "Private",
    email: "private@example.com",
    phone: "6825551234",
    message: "Private",
  });
  const lead = Array.from(win.dataLayer.at(-1));
  assert.equal(lead[1], "generate_lead");
  assert.deepEqual(lead[2], {
    page_path: "/pages/roof-repair.html",
    form_name: "inspection",
    page_location: "https://www.skyguardrs.com/pages/roof-repair.html",
    page_referrer: "https://search.example/",
    send_to: "G-TEST12345",
  });
});
test("revocation stops events and regrant restores consent without duplicate provider loading", () => {
  const { win, appended } = configuredBrowser();
  win.SkyGuardMetrics.setConsent(true);
  win.SkyGuardMetrics.setConsent(false);
  assert.equal(win["ga-disable-G-TEST12345"], true);
  const length = win.dataLayer.length;
  win.SkyGuardMetrics.event("click_to_call");
  assert.equal(win.dataLayer.length, length);
  win.SkyGuardMetrics.setConsent(true);
  assert.equal(win["ga-disable-G-TEST12345"], false);
  assert.equal(appended.length, 1);
  const updates = win.dataLayer.filter(
    (args) => args[0] === "consent" && args[1] === "update",
  );
  assert.equal(updates.at(-1)[2].analytics_storage, "granted");
  const pages = win.dataLayer.filter(
    (args) => args[0] === "event" && args[1] === "page_view",
  ).length;
  win.SkyGuardMetrics.setConsent(true);
  assert.equal(
    win.dataLayer.filter(
      (args) => args[0] === "event" && args[1] === "page_view",
    ).length,
    pages,
  );
});
