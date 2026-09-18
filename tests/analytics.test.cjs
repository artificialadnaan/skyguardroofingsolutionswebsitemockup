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
  options = {},
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
    referrer: options.referrer ?? "https://search.example/results?q=private@example.com",
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
      href: options.href ?? "https://www.skyguardrs.com/pages/roof-repair.html?utm_campaign=private@example.com#phone",
    },
    get localStorage() {
      throw Error("Unexpected storage");
    },
    get sessionStorage() {
      if (options.storage) return options.storage;
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
  assert.equal(config.ignore_referrer, false);
  assert.equal(config.page_referrer, "https://search.example/");
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

test("organic referrer survives configuration without its search query", () => {
  const { win } = configuredBrowser(undefined, {
    referrer: "https://www.google.com/search?q=roof+repair&email=private@example.com",
  });
  win.SkyGuardMetrics.setConsent(true);
  const config = win.dataLayer.find((c) => c[0] === "config")[2];
  assert.equal(config.ignore_referrer, false);
  assert.equal(config.page_referrer, "https://www.google.com/");
  assert.equal(config.campaign_medium, undefined);
  assert.doesNotMatch(JSON.stringify(win.dataLayer), /private@example|search\?q/);
});
test("sanitized campaigns reach GA4 while paid click identifiers stay private", () => {
  for (const [query, source] of [
    ["gclid=secret-google-click", "google"],
    ["gbraid=secret-google-click", "google"],
    ["wbraid=secret-google-click", "google"],
    ["msclkid=secret-bing-click", "bing"],
  ]) {
    const { win } = configuredBrowser(undefined, {
      href: "https://www.skyguardrs.com/pages/roof-repair.html?" + query,
      referrer: "https://www.google.com/",
    });
    win.SkyGuardMetrics.setConsent(true);
    const config = win.dataLayer.find((c) => c[0] === "config")[2];
    assert.equal(config.campaign_source, source);
    assert.equal(config.campaign_medium, "cpc");
    assert.doesNotMatch(JSON.stringify(win.dataLayer), /secret-|gclid|gbraid|wbraid|msclkid/);
  }
  const { win } = configuredBrowser(undefined, {
    href: "https://www.skyguardrs.com/pages/roof-repair.html?utm_source=chamber&utm_medium=referral&utm_campaign=membership&utm_term=private@example.com",
  });
  win.SkyGuardMetrics.setConsent(true);
  const config = win.dataLayer.find((c) => c[0] === "config")[2];
  assert.equal(config.campaign_source, "chamber");
  assert.equal(config.campaign_medium, "referral");
  assert.equal(config.campaign_name, "membership");
  assert.doesNotMatch(JSON.stringify(win.dataLayer), /private@example|utm_term/);
  assert.equal(attribution("https://www.skyguardrs.com/?fbclid=abc", "https://facebook.com/", "https://www.skyguardrs.com/").medium, undefined);
});
test("internal links do not replace session acquisition with self-referrals", () => {
  for (const referrer of ["https://www.skyguardrs.com/", "https://skyguardrs.com/"]) {
    const { win } = configuredBrowser(undefined, { referrer });
    win.SkyGuardMetrics.setConsent(true);
    const config = win.dataLayer.find((c) => c[0] === "config")[2];
    assert.equal(config.page_referrer, "");
    assert.equal(config.campaign_source, undefined);
    assert.equal(config.campaign_medium, undefined);
  }
});
test("consented inquiry attribution survives internal navigation, expires and clears on revocation", () => {
  const values = new Map();
  const storage = {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const first = configuredBrowser(undefined,{storage,referrer:'https://www.google.com/search?q=private'});
  assert.equal(values.has('skyguard-inquiry-source-v1'),false);
  first.win.SkyGuardMetrics.setConsent(true);
  const next = configuredBrowser(undefined,{storage,referrer:'https://www.skyguardrs.com/'});
  assert.equal(next.win.SkyGuardMetrics.attribution().referrerHost,'www.google.com');
  assert.doesNotMatch(values.get('skyguard-inquiry-source-v1'),/private|search\?q/);
  next.win.SkyGuardMetrics.setConsent(false);
  assert.equal(values.has('skyguard-inquiry-source-v1'),false);
  assert.equal(next.win.SkyGuardMetrics.attribution().referrerHost,undefined);
  values.set('skyguard-inquiry-source-v1',JSON.stringify({context:{source:'google',medium:'organic'},expires:Date.now()-1}));
  next.win.SkyGuardMetrics.setConsent(true);
  assert.equal(next.win.SkyGuardMetrics.attribution().source,undefined);
});
test("consent survives navigation, expires within a day, and revocation persists", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const first = configuredBrowser(undefined, { storage });
  assert.equal(values.size, 0);
  first.win.SkyGuardMetrics.setConsent(true);
  const saved = JSON.parse(values.get("skyguard-analytics-choice-v1"));
  assert.equal(saved.allowed, true);
  assert.ok(saved.expires > Date.now());
  assert.ok(saved.expires <= Date.now() + 86400000);
  assert.deepEqual(Object.keys(saved).sort(), ["allowed", "expires"]);
  const next = configuredBrowser(undefined, { storage });
  assert.equal(next.appended.length, 1);
  assert.equal(next.elements.has("analytics-choice"), false);
  assert.ok(next.elements.has("analytics-preferences"));
  assert.equal(JSON.parse(values.get("skyguard-analytics-choice-v1")).expires, saved.expires);
  next.win.SkyGuardMetrics.setConsent(false);
  const denied = configuredBrowser(undefined, { storage });
  assert.equal(denied.appended.length, 0);
  assert.equal(denied.elements.has("analytics-choice"), false);
  denied.win.SkyGuardMetrics.preferences();
  assert.ok(denied.elements.has("analytics-choice"));
  for (const value of ["broken", JSON.stringify({allowed:true, expires:Date.now()-1}), JSON.stringify({allowed:true, expires:Date.now()+172800000})]) {
    values.set("skyguard-analytics-choice-v1", value);
    const expired = configuredBrowser(undefined, { storage });
    assert.equal(expired.appended.length, 0);
    assert.ok(expired.elements.has("analytics-choice"));
  }
});
test("preview origins cannot send production analytics", () => {
  const preview = configuredBrowser(undefined, { href: "https://preview.example/pages/roof-repair.html" });
  preview.win.SkyGuardMetrics.setConsent(true);
  assert.equal(preview.appended.length, 0);
  assert.equal(preview.win.dataLayer, undefined);
});
