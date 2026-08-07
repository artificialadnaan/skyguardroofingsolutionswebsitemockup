/* ============================================
   SkyGuard Roofing Solutions — Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const nav = document.querySelector('.nav-wrap');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
  }

  // ---- Mobile dropdown toggles ----
  document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdown = link.nextElementSibling;
        if (dropdown) dropdown.classList.toggle('mobile-open');
      }
    });
  });

  // ---- Scroll animations ----
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ---- Gallery lightbox ----
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Active nav link ----
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath ||
        (currentPath === '/' && link.getAttribute('href') === '/') ||
        (currentPath === '/index.html' && link.getAttribute('href') === '/')) {
      link.classList.add('active');
    }
  });

  // ---- Form submission ----
  // Posts to /api/lead on this same server, which forwards the submission to
  // the SkyGuard CRM API for delivery to the office inbox. Success is only
  // reported after the server confirms it — a failure tells the visitor to
  // call instead, so a lost message is never shown as "Sent".
  function wireLeadForm(selector, formType, opts) {
    const form = document.querySelector(selector);
    if (!form) return;

    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    let resetTimer;

    // Inline status line, announced to screen readers as it changes.
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = 'margin:0.75rem 0 0;font-size:0.95rem;display:none;';
    form.appendChild(status);

    function showStatus(message, color) {
      status.textContent = message;
      status.style.color = color;
      status.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (btn.disabled) return;

      clearTimeout(resetTimer);
      status.style.display = 'none';
      btn.textContent = opts.pending;
      btn.disabled = true;

      const payload = {};
      new FormData(form).forEach((value, key) => {
        payload[key] = typeof value === 'string' ? value : '';
      });

      try {
        const res = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formType, payload }),
        });

        if (!res.ok) throw new Error('Request failed with ' + res.status);

        btn.textContent = opts.success;
        btn.style.background = '#10b981';
        form.reset();
        showStatus(opts.successNote, '#047857');
      } catch (err) {
        console.error('Form submission failed:', err);
        btn.textContent = origText;
        btn.style.background = '';
        showStatus(
          'Sorry — we could not send that. Please call us at (682) 330-5088 or email office@skyguardrs.com.',
          '#b91c1c'
        );
      } finally {
        btn.disabled = false;
        resetTimer = setTimeout(() => {
          btn.textContent = origText;
          btn.style.background = '';
        }, 5000);
      }
    });
  }

  wireLeadForm('#contact-form', 'contact', {
    pending: 'Sending...',
    success: 'Message Sent!',
    successNote: 'Thanks — we received your message and will be in touch shortly.',
  });

  wireLeadForm('#careers-form', 'careers', {
    pending: 'Submitting...',
    success: 'Application Submitted!',
    successNote: 'Thanks for applying — we will reach out if your qualifications match an opening.',
  });

});
