/* Optional consent-gated measurement. No provider or analytics storage by default. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) api.install(root);
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";
  function slug(value) {
    return typeof value === "string" &&
      /^[a-z][a-z0-9_-]{0,49}$/i.test(value) &&
      !/\d{5,}/.test(value)
      ? value
      : "";
  }
  function knownPath(value) {
    return value === "/" || /^\/pages\/(?:blog\/)?[a-z0-9-]+\.html$/.test(value)
      ? value
      : "";
  }
  function hostname(value) {
    try {
      const url = new URL(value);
      return /^https?:$/.test(url.protocol) &&
        !url.username &&
        !url.password &&
        /^[a-z0-9.-]{1,253}$/i.test(url.hostname)
        ? url.hostname
        : "";
    } catch {
      return "";
    }
  }
  function attribution(href, referrer, canonical) {
    try {
      const url = new URL(href),
        canon = new URL(canonical),
        result = {};
      if (url.pathname === canon.pathname && knownPath(canon.pathname))
        result.landingPath = canon.pathname;
      const host = hostname(referrer);
      if (host && host !== canon.hostname) result.referrerHost = host;
      for (const key of ["source", "medium", "campaign"]) {
        const value = slug(url.searchParams.get("utm_" + key));
        if (value) result[key] = value;
      }
      return result;
    } catch {
      return {};
    }
  }
  function safeEvent(name, details = {}) {
    if (
      !["page_view", "generate_lead", "click_to_call", "form_error"].includes(
        name,
      ) ||
      !details ||
      typeof details !== "object"
    )
      return null;
    if (
      ["generate_lead", "form_error"].includes(name) &&
      (!["contact", "inspection"].includes(details.form) ||
        details.pagePath === "/pages/careers.html")
    )
      return null;
    const result = {};
    if (knownPath(details.pagePath)) result.page_path = details.pagePath;
    if (["contact", "inspection"].includes(details.form))
      result.form_name = details.form;
    if (["submission_failed", "validation_failed"].includes(details.reason))
      result.error_type = details.reason;
    return result;
  }
  function install(win) {
    const doc = win.document;
    let canon = doc.querySelector('link[rel="canonical"]')?.href || "";
    try {
      const url = new URL(canon);
      canon =
        url.origin === "https://www.skyguardrs.com" && knownPath(url.pathname)
          ? url.origin + url.pathname
          : "";
    } catch {
      canon = "";
    }
    const context = attribution(win.location.href, doc.referrer, canon),
      config = win.SKYGUARD_ANALYTICS || {};
    // send_page_view:false alone does not disable Enhanced Measurement. Activation
    // requires the property review documented in .env.example, plus visitor consent.
    const id =
      canon &&
      config.manualMeasurementVerified === true &&
      typeof config.measurementId === "string" &&
      /^G-[A-Z0-9]{5,20}$/.test(config.measurementId)
        ? config.measurementId
        : "";
    let consent = false,
      initialized = false;
    const disabledKey = "ga-disable-" + id;
    if (id) win[disabledKey] = true;
    function event(name, details = {}) {
      if (!id || !consent || !initialized) return;
      const clean = safeEvent(name, {
        pagePath: context.landingPath,
        ...details,
      });
      if (!clean) return;
      win.gtag("event", name, {
        ...clean,
        page_location: canon,
        page_referrer: context.referrerHost
          ? "https://" + context.referrerHost + "/"
          : "",
        send_to: id,
      });
    }
    function setConsent(allowed) {
      const previous = consent;
      consent = allowed === true;
      if (!id) return;
      // Official Google opt-out switch prevents subsequent collection after revocation:
      // https://developers.google.com/tag-platform/security/guides/privacy
      win[disabledKey] = !consent;
      if (initialized) {
        win.gtag("consent", "update", {
          analytics_storage: consent ? "granted" : "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        if (consent && !previous) event("page_view");
        return;
      }
      if (!consent) return;
      win.dataLayer = win.dataLayer || [];
      win.gtag = function () {
        win.dataLayer.push(arguments);
      };
      win.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      win.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      win.gtag("js", new Date());
      win.gtag("config", id, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        ignore_referrer: true,
        page_location: canon,
        page_referrer: "",
        cookie_expires: 86400,
        cookie_update: false,
      });
      const script = doc.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
      doc.head.appendChild(script);
      initialized = true;
      event("page_view");
    }
    function preferences() {
      if (!id || doc.getElementById("analytics-choice")) return;
      const box = doc.createElement("aside");
      box.id = "analytics-choice";
      box.className = "analytics-choice";
      box.setAttribute("aria-label", "Optional analytics");
      const text = doc.createElement("p");
      text.textContent =
        "Allow optional analytics to help us understand which pages are useful? Your form details are excluded. Your choice applies to this page visit.";
      box.appendChild(text);
      for (const [label, allowed] of [
        ["Allow analytics", true],
        ["Continue without", false],
      ]) {
        const button = doc.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", () => {
          setConsent(allowed);
          box.remove();
        });
        box.appendChild(button);
      }
      doc.body.appendChild(box);
    }
    function ready() {
      if (!id) return;
      preferences();
      if (!doc.getElementById("analytics-preferences")) {
        const button = doc.createElement("button");
        button.id = "analytics-preferences";
        button.className = "analytics-preferences";
        button.type = "button";
        button.textContent = "Analytics preferences";
        button.addEventListener("click", preferences);
        (doc.querySelector(".footer-bottom") || doc.body).appendChild(button);
      }
    }
    win.SkyGuardMetrics = {
      event,
      setConsent,
      preferences,
      attribution: () => ({ ...context }),
    };
    if (doc.readyState === "loading")
      doc.addEventListener("DOMContentLoaded", ready);
    else ready();
  }
  return { slug, knownPath, hostname, attribution, safeEvent, install };
});
