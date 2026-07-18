/* ==========================================================================
   EVENTORA — Main JS
   Handles: mobile nav toggle, scroll-reveal animations, navbar scroll state,
   the hero AI-planner form, smooth page transitions, and the login/register
   auth forms — password show/hide, validation, strength meter, and loading
   button states. Front-end only; wires to the PHP backend later.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initNavbarScrollState();
  initPlannerForm();
  initPageTransitions();
  initPasswordToggles();
  initPasswordStrength();
  initAuthForms();
});

/* --------------------------------------------------------------------------
   Mobile navigation toggle
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (!toggle || !mobileMenu) return;

  toggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  // Close menu when a link is tapped
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    });
  });
}

/* --------------------------------------------------------------------------
   Scroll-reveal — fades/slides elements with [data-reveal] into view
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Navbar background state on scroll
   -------------------------------------------------------------------------- */
function initNavbarScrollState() {
  const navbar = document.querySelector(".eventora-navbar");
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   Hero planner form — placeholder submit handler
   Future integration point: POST to PHP endpoint (e.g. /api/recommend.php)
   which will call the Python AI recommendation microservice and return
   ranked vendor matches based on event_type, city, budget, and guests.
   -------------------------------------------------------------------------- */
function initPlannerForm() {
  const form = document.querySelector("[data-planner-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // TODO(backend): replace with a fetch() call to the PHP API once
    // the booking/recommendation endpoints are live, e.g.:
    // fetch('/api/recommend.php', { method: 'POST', body: JSON.stringify(payload) })
    console.log("Eventora planner request:", payload);

    const button = form.querySelector("button[type='submit']");
    if (!button) return;

    const originalLabel = button.textContent;
    button.textContent = "Finding matches…";
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalLabel;
      button.disabled = false;
    }, 1400);
  });
}

/* --------------------------------------------------------------------------
   Smooth page transitions — fades the page in on load and fades it out
   just before navigating to another internal link, so moving between
   index.html / pages/login.html / pages/register.html feels seamless.
   -------------------------------------------------------------------------- */
function initPageTransitions() {
  document.documentElement.classList.remove("is-leaving");
  document.body.classList.add("is-transitioning");

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute("href");

    // Skip anchors, external links, and links that open in a new tab
    if (!href || href.startsWith("#") || link.target === "_blank" || href.startsWith("http")) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.documentElement.classList.add("is-leaving");
      setTimeout(() => {
        window.location.href = href;
      }, 220);
    });
  });
}

/* --------------------------------------------------------------------------
   Password show/hide toggles
   Any [data-password-toggle] button flips the type of its sibling input
   between "password" and "text" and swaps the eye / eye-slash icon.
   -------------------------------------------------------------------------- */
function initPasswordToggles() {
  const toggles = document.querySelectorAll("[data-password-toggle]");
  if (!toggles.length) return;

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const wrapper = toggle.closest(".input-wrapper");
      const input = wrapper ? wrapper.querySelector("input") : null;
      if (!input) return;

      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";

      const icon = toggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-eye", !isHidden);
        icon.classList.toggle("bi-eye-slash", isHidden);
      }
      toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });
}

/* --------------------------------------------------------------------------
   Password strength indicator (Register page)
   Scores length + character variety, then fills the strength bar and
   updates its label/color accordingly.
   -------------------------------------------------------------------------- */
function initPasswordStrength() {
  const input = document.querySelector("[data-password-strength-input]");
  const meter = document.querySelector("[data-password-strength-meter]");
  if (!input || !meter) return;

  const fill = meter.querySelector(".strength-fill");
  const label = meter.querySelector(".strength-label");

  const levels = [
    { min: 0, width: "0%", color: "var(--color-surface-hover)", text: "" },
    { min: 1, width: "25%", color: "var(--color-danger)", text: "Weak" },
    { min: 2, width: "55%", color: "var(--color-accent)", text: "Fair" },
    { min: 3, width: "80%", color: "var(--color-accent-light)", text: "Good" },
    { min: 4, width: "100%", color: "var(--color-success)", text: "Strong" },
  ];

  function scorePassword(value) {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value) && value.length >= 10) score++;
    return score;
  }

  input.addEventListener("input", () => {
    const value = input.value;
    meter.classList.toggle("is-visible", value.length > 0);
    if (!value.length) return;

    const score = scorePassword(value);
    const level = [...levels].reverse().find((l) => score >= l.min) || levels[0];

    fill.style.width = level.width;
    fill.style.background = level.color;
    label.textContent = level.text;
    label.style.color = level.color;
  });
}

/* --------------------------------------------------------------------------
   Auth form validation — shared by login.html and register.html.
   Frontend-only: prevents submission on invalid input and shows a
   loading state on the submit button. Backend wiring (PHP) comes later.
   -------------------------------------------------------------------------- */
function initAuthForms() {
  const forms = document.querySelectorAll("[data-auth-form]");
  if (!forms.length) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[+\d][\d\s-]{7,14}$/;

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      let isValid = true;

      form.querySelectorAll("[data-validate]").forEach((field) => {
        const group = field.closest(".form-group");
        const rule = field.dataset.validate;
        const value = field.value.trim();
        let fieldValid = true;

        if (field.required && !value) fieldValid = false;
        if (fieldValid && rule === "email" && value && !emailPattern.test(value)) fieldValid = false;
        if (fieldValid && rule === "phone" && value && !phonePattern.test(value)) fieldValid = false;
        if (fieldValid && rule === "password" && value && value.length < 8) fieldValid = false;

        if (fieldValid && rule === "confirm-password") {
          const passwordField = form.querySelector('[data-validate="password"]');
          if (passwordField && value !== passwordField.value) fieldValid = false;
        }

        if (fieldValid && field.type === "checkbox" && field.required && !field.checked) fieldValid = false;

        if (group) group.classList.toggle("has-error", !fieldValid);
        if (!fieldValid) isValid = false;
      });

      if (!isValid) return;

      // TODO(backend): replace with a fetch() call to the PHP auth API, e.g.
      // fetch('/api/login.php', { method: 'POST', body: new FormData(form) })
      const payload = Object.fromEntries(new FormData(form).entries());
      console.log("Eventora auth submission:", payload);

      const button = form.querySelector("button[type='submit']");
      if (!button) return;

      button.classList.add("is-loading");
      button.disabled = true;

      setTimeout(() => {
        button.classList.remove("is-loading");
        button.disabled = false;
      }, 1400);
    });

    // Clear the error state as soon as the person starts correcting a field
    form.querySelectorAll("[data-validate]").forEach((field) => {
      field.addEventListener("input", () => {
        const group = field.closest(".form-group");
        if (group) group.classList.remove("has-error");
      });
    });
  });
}
