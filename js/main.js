/* SkyGuard navigation, accessible interactions and CRM-compatible lead forms. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const metrics = window.SkyGuardMetrics;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.querySelector(".nav-wrap");
  if (nav) {
    const update = () => nav.classList.toggle("scrolled", window.scrollY > 60);
    window.addEventListener("scroll", update, { passive: true });
    update();
  }
  const toggle = document.querySelector(".nav-toggle"),
    links = document.querySelector(".nav-links"),
    overlay = document.querySelector(".nav-overlay");
  const mobile = () => window.innerWidth <= 768;
  function menu(open, returnFocus = false) {
    if (!toggle || !links) return;
    toggle.classList.toggle("open", open);
    links.classList.toggle("open", open);
    overlay?.classList.toggle("active", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    links.inert = mobile() && !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (returnFocus) toggle.focus();
  }
  if (toggle && links) {
    if (!links.id) links.id = "primary-navigation";
    toggle.setAttribute("aria-controls", links.id);
    menu(false);
    toggle.addEventListener("click", () =>
      menu(!links.classList.contains("open")),
    );
    overlay?.addEventListener("click", () => menu(false, true));
    window.addEventListener("resize", () => {
      if (!mobile()) menu(false);
      else links.inert = !links.classList.contains("open");
    });
    links
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", () => menu(false)));
    document.addEventListener("keydown", (e) => {
      if (!links.classList.contains("open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        menu(false, true);
      }
      if (e.key === "Tab") {
        const items = [
          toggle,
          ...links.querySelectorAll("a[href],button"),
        ].filter((el) => el.getClientRects().length);
        if (!items.length) return;
        const current = items.indexOf(document.activeElement);
        const next =
          current < 0
            ? 0
            : (current + (e.shiftKey ? -1 : 1) + items.length) % items.length;
        e.preventDefault();
        items[next].focus();
      }
    });
  }
  // Separate disclosure buttons preserve the service-hub links on touch screens.
  document.querySelectorAll(".has-dropdown").forEach((item, i) => {
    const dropdown = item.querySelector(".dropdown-menu"),
      anchor = item.querySelector(":scope > a");
    if (!dropdown || !anchor) return;
    dropdown.id = dropdown.id || "nav-submenu-" + i;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "submenu-toggle";
    button.textContent = "⌄";
    button.setAttribute(
      "aria-label",
      "Show " + anchor.textContent.trim() + " links",
    );
    button.setAttribute("aria-controls", dropdown.id);
    button.setAttribute("aria-expanded", "false");
    anchor.after(button);
    button.addEventListener("click", () => {
      const open = !dropdown.classList.contains("mobile-open");
      dropdown.classList.toggle("mobile-open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });
  document
    .querySelectorAll(".fade-up")
    .forEach((el) => el.classList.add("visible"));
  const lightbox = document.querySelector(".lightbox"),
    photo = lightbox?.querySelector("img"),
    close = lightbox?.querySelector(".lightbox-close");
  let trigger;
  function closePhoto() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    trigger?.focus();
  }
  if (lightbox) {
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Enlarged project photo");
    lightbox.setAttribute("aria-hidden", "true");
  }
  document.querySelectorAll(".gallery-item").forEach((item) => {
    if (!photo || !lightbox) return;
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute(
      "aria-label",
      "Enlarge " + (item.querySelector("img")?.alt || "project photo"),
    );
    const open = () => {
      const img = item.querySelector("img");
      if (!img) return;
      trigger = item;
      photo.removeAttribute("srcset");
      photo.removeAttribute("sizes");
      photo.src = img.dataset.fullSrc || img.currentSrc || img.src;
      photo.alt = img.alt;
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      close?.focus();
    };
    item.addEventListener("click", open);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
  close?.addEventListener("click", closePhoto);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closePhoto();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("active")) return;
    if (e.key === "Escape") closePhoto();
    if (e.key === "Tab") {
      e.preventDefault();
      close?.focus();
    }
  });
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      let id;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
      if (!target.hasAttribute("tabindex"))
        target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }),
  );
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (new URL(a.href, location.href).pathname === location.pathname) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
  document
    .querySelectorAll('a[href^="tel:"]')
    .forEach((a) =>
      a.addEventListener("click", () => metrics?.event("click_to_call")),
    );
  const contactFields = [
    "name",
    "phone",
    "email",
    "address",
    "city",
    "state_zip",
    "message",
    "company",
  ];
  const careersFields = [
    "name",
    "phone",
    "email",
    "position",
    "citizen",
    "license",
    "info",
    "company",
  ];
  function wire(selector, formType) {
    const form = document.querySelector(selector);
    if (!form) return;
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    const original = button.textContent;
    const limits = {
      name: 160,
      phone: 40,
      email: 254,
      address: 300,
      city: 100,
      state_zip: 100,
      message: 8000,
      position: 200,
      citizen: 100,
      license: 100,
      info: 8000,
      company: 200,
    };
    for (const [name, max] of Object.entries(limits)) {
      const field = form.querySelector('[name="' + name + '"]');
      if (field && ["INPUT", "TEXTAREA"].includes(field.tagName))
        field.maxLength =
          name === "message"
            ? Math.max(
                1,
                max -
                  (form.dataset.requestContext?.length || 0) -
                  (form.dataset.requestContext ? 2 : 0),
              )
            : max;
    }
    const status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);
    let pending = false;
    let submissionId;
    let submissionContent;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (pending) return;
      if (!form.reportValidity()) return;
      pending = true;
      button.disabled = true;
      button.textContent = "Sending…";
      form.setAttribute("aria-busy", "true");
      status.textContent = "";
      status.classList.remove("error");
      const fields = new FormData(form),
        payload = {};
      for (const key of formType === "contact"
        ? contactFields
        : careersFields) {
        const value = fields.get(key);
        if (typeof value === "string") payload[key] = value.trim();
      }
      if (formType === "contact") {
        const details = metrics?.attribution() || {};
        const service = fields.get("service");
        if (
          typeof service === "string" &&
          /^[a-z][a-z0-9_-]{0,49}$/i.test(service)
        )
          details.service = service;
        const city = fields.get("city");
        if (typeof city === "string" && /^[a-zA-Z .'-]{1,60}$/.test(city))
          details.city = city;
        payload.attribution = details;
        if (form.dataset.requestContext)
          payload.message = [form.dataset.requestContext, payload.message]
            .filter(Boolean)
            .join("\n\n");
      }
      const controller = new AbortController(),
        timer = setTimeout(() => controller.abort(), 20000);
      const content = JSON.stringify(payload);
      if (formType === "contact" && (content !== submissionContent || !submissionId)) {
        submissionContent = content;
        submissionId = window.crypto?.randomUUID?.();
      }
      try {
        const response = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType, payload, ...(submissionId ? {submissionId} : {}) }),
          signal: controller.signal,
        });
        if (response.status !== 202) throw Error("Submission failed");
        form.reset();
        submissionId = undefined;
        submissionContent = undefined;
        status.textContent =
          formType === "careers"
            ? "Thanks for applying. We will contact you if an opening matches your qualifications."
            : "Thanks — your request was received. Our team will contact you during business hours.";
        if (formType === "contact" && !payload.company)
          metrics?.event("generate_lead", {
            form: form.dataset.requestContext ? "inspection" : "contact",
          });
      } catch {
        status.classList.add("error");
        status.textContent =
          "We could not send your request. Please try again or call (682) 330-5088.";
        if (formType === "contact")
          metrics?.event("form_error", {
            form: form.dataset.requestContext ? "inspection" : "contact",
            reason: "submission_failed",
          });
      } finally {
        clearTimeout(timer);
        pending = false;
        button.disabled = false;
        button.textContent = original;
        form.removeAttribute("aria-busy");
      }
    });
  }
  wire("#contact-form", "contact");
  wire("#careers-form", "careers");
  if (!document.querySelector(".mobile-actions")) {
    const actions = document.createElement("nav");
    actions.className = "mobile-actions";
    actions.setAttribute("aria-label", "Contact SkyGuard");
    const call = document.createElement("a");
    call.href = "tel:+16823305088";
    call.textContent = "Call SkyGuard";
    call.addEventListener("click", () => metrics?.event("click_to_call"));
    const inspect = document.createElement("a");
    inspect.href = "/pages/inspections.html#contact-form";
    inspect.textContent = "Request inspection";
    actions.append(call, inspect);
    document.body.appendChild(actions);
  }
});
