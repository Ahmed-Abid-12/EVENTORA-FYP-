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
  initContactForm();
  initFaqPage();
  initVendorList();
  initVendorDetail();
  initForgotPassword();
  initDashboardShell();
  initProgressBars();
  initCreateEvent();
  initMyEvents();
  initBookings();
  initBookingDetail();
  initSavedVendors();
  initNotifications();
  initClientReviews();
  initClientSettings();
  initVendorServices();
  initServiceForm();
  initBookingRequests();
  initVendorCalendar();
  initVendorReviews();
  initVendorApproval();
  initAdminUsers();
  initAdminCategories();
  initAdminTable();
  initAdminVendors();
  initChatbotLogs();
  initAiChatbot();
  initAiRecommendations();
  initCheckout();
  initPaymentHistory();
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

    // D10: this is public vendor filtering, not AI. It hands the visitor to the
    // marketplace with their choices pre-applied. Genuine AI recommendations
    // need a signed-in client and a created event, and live on
    // ai/recommendation.html.
    const data = new FormData(form);
    const params = new URLSearchParams();

    const city = (data.get("city") || "").trim();
    const budget = (data.get("budget") || "").trim();
    const eventType = (data.get("event_type") || "").trim();

    if (city) params.set("city", city);
    if (budget && Number(budget) > 0) params.set("budget", budget);
    // event_type is carried through so the marketplace can use it once vendors
    // are matched to event types by category in Phase 4.
    if (eventType) params.set("event_type", eventType);

    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.textContent = "Finding vendors…";
      button.disabled = true;
    }

    const query = params.toString();
    window.location.href = "pages/vendors.html" + (query ? `?${query}` : "");
  });
}

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
   Shared field validation — the single validation implementation for the
   whole site. Any form opts in by putting [data-validate="<rule>"] on its
   fields; every field lives inside a .form-group, and an invalid field puts
   .has-error on that group.

   Rules: text (default) | email | phone | password | confirm-password | select

   Previously contact.html shipped its own separate blur-based validator.
   Having two meant a fix in one never reached the other, so it was folded
   into this one and the extra "select" rule and live-feedback mode were
   added here rather than duplicated.
   -------------------------------------------------------------------------- */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s-]{7,14}$/;

/**
 * Validate one field. Returns true when the value passes its rule.
 * @param {HTMLElement} field - the input/select/textarea carrying [data-validate]
 * @param {HTMLFormElement} form - the owning form (needed by confirm-password)
 */
function validateField(field, form) {
  const rule = field.dataset.validate || "text";
  const value = (field.value || "").trim();

  if (field.type === "checkbox") return !field.required || field.checked;
  if (field.required && !value) return false;
  if (!value) return true;

  if (rule === "email") return EMAIL_PATTERN.test(value);
  if (rule === "phone") return PHONE_PATTERN.test(value);
  if (rule === "password") return value.length >= 8;

  if (rule === "confirm-password") {
    const passwordField = form.querySelector('[data-validate="password"]');
    return !passwordField || value === passwordField.value;
  }

  return true;
}

/**
 * Validate every [data-validate] field in a form and paint the error states.
 * @returns {{valid: boolean, firstInvalid: HTMLElement|null}}
 */
function validateForm(form, { markValid = false } = {}) {
  let valid = true;
  let firstInvalid = null;

  form.querySelectorAll("[data-validate]").forEach((field) => {
    const group = field.closest(".form-group");
    const fieldValid = validateField(field, form);

    if (group) {
      group.classList.toggle("has-error", !fieldValid);
      if (markValid) group.classList.toggle("is-valid", fieldValid);
    }

    if (!fieldValid) {
      valid = false;
      if (!firstInvalid) firstInvalid = field;
    }
  });

  return { valid, firstInvalid };
}

/**
 * Clear the error state as soon as someone starts correcting a field.
 * Forms marked [data-live-validate] also get on-blur feedback.
 */
function bindFieldFeedback(form) {
  const live = form.hasAttribute("data-live-validate");

  form.querySelectorAll("[data-validate]").forEach((field) => {
    field.addEventListener("input", () => {
      const group = field.closest(".form-group");
      if (!group) return;
      if (live && group.classList.contains("has-error")) {
        const ok = validateField(field, form);
        group.classList.toggle("has-error", !ok);
        group.classList.toggle("is-valid", ok);
      } else {
        group.classList.remove("has-error");
      }
    });

    if (!live) return;

    field.addEventListener("blur", () => {
      const group = field.closest(".form-group");
      if (!group) return;
      const ok = validateField(field, form);
      group.classList.toggle("has-error", !ok);
      group.classList.toggle("is-valid", ok);
    });
  });
}

/** Show a message below a form. Replaces the old inline style.cssText. */
function showFormFeedback(form, message, variant = "is-demo", icon = "bi-info-circle-fill") {
  form.querySelectorAll(".form-feedback").forEach((el) => el.remove());

  const box = document.createElement("div");
  box.className = `form-feedback ${variant}`;
  box.setAttribute("role", "status");
  box.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i>${message}`;
  form.appendChild(box);

  setTimeout(() => box.remove(), 6000);
  return box;
}

/* --------------------------------------------------------------------------
   Auth form validation — shared by login.html and register.html.
   Frontend-only: prevents submission on invalid input and shows a
   loading state on the submit button. Backend wiring (PHP) comes later.
   -------------------------------------------------------------------------- */
function initAuthForms() {
  const forms = document.querySelectorAll("[data-auth-form]");
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const { valid } = validateForm(form);
      if (!valid) return;

      // TODO(backend): replace with a fetch() call to the PHP auth API, e.g.
      // fetch('/api/login.php', { method: 'POST', body: new FormData(form) })
      // The API writes to users (+ client_profiles / vendor_profiles) and
      // redirects by users.role — see Eventora Database v1.0.
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

    bindFieldFeedback(form);
  });
}

/* --------------------------------------------------------------------------
   Contact form — pages/contact.html.
   Uses the shared validator above with live on-blur feedback. The form does
   not persist anything yet, so it says so rather than claiming a message was
   sent. See FUTURE BACKEND note below for where that changes.
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  bindFieldFeedback(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const { valid, firstInvalid } = validateForm(form, { markValid: true });
    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.classList.add("is-loading");
      button.disabled = true;
    }

    // TODO(backend): POST to /api/contact.php, which INSERTs into the
    // contact_messages table (first_name, last_name, email, reason, message)
    // and returns { ok: true }. Only then should this say "Message sent".
    const payload = Object.fromEntries(new FormData(form).entries());
    console.log("Eventora contact submission:", payload);

    setTimeout(() => {
      if (button) {
        button.classList.remove("is-loading");
        button.disabled = false;
      }

      showFormFeedback(
        form,
        "Demo mode — your details passed validation but nothing was sent yet. " +
          "Email us directly using the address in the sidebar.",
        "is-demo",
        "bi-info-circle-fill"
      );

      form.reset();
      form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
    }, 1200);
  });
}

/* --------------------------------------------------------------------------
   FAQ search + category filtering — pages/faq.html.
   Entirely client-side: every question is already in the DOM, so this only
   shows and hides them. Search and category filters combine (an active
   category narrows the pool the search runs against).

   The accordion itself is Bootstrap's; this only adds/removes .is-hidden and
   collapses anything it hides so nothing stays open off-screen.
   -------------------------------------------------------------------------- */
function initFaqPage() {
  const root = document.querySelector("[data-faq]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".accordion-item"));
  const input = root.querySelector("[data-faq-search]");
  const searchWrap = root.querySelector(".faq-search");
  const clearBtn = root.querySelector("[data-faq-clear]");
  const filters = Array.from(root.querySelectorAll("[data-faq-filter]"));
  const countEl = root.querySelector("[data-faq-count]");
  const emptyEl = root.querySelector("[data-faq-empty]");

  let activeCategory = "all";

  // Keep a pristine copy of each searchable region so highlighting can be undone
  const regions = [];
  items.forEach((item) => {
    item.querySelectorAll("[data-faq-text]").forEach((el) => {
      regions.push(el);
      el.dataset.original = el.innerHTML;
    });
  });

  /** Wrap every occurrence of `term` in <mark>, touching text nodes only so
   *  the surrounding markup (links, lists) survives intact. */
  function highlightIn(el, term) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const text = node.nodeValue;
      const lower = text.toLowerCase();
      if (!lower.includes(term)) return;

      const frag = document.createDocumentFragment();
      let pos = 0;
      let i = lower.indexOf(term);

      while (i !== -1) {
        frag.appendChild(document.createTextNode(text.slice(pos, i)));
        const mark = document.createElement("mark");
        mark.textContent = text.slice(i, i + term.length);
        frag.appendChild(mark);
        pos = i + term.length;
        i = lower.indexOf(term, pos);
      }

      frag.appendChild(document.createTextNode(text.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function collapse(item) {
    const panel = item.querySelector(".accordion-collapse");
    if (!panel || !panel.classList.contains("show")) return;
    panel.classList.remove("show");
    const button = item.querySelector(".accordion-button");
    if (button) {
      button.classList.add("collapsed");
      button.setAttribute("aria-expanded", "false");
    }
  }

  function apply() {
    const term = (input.value || "").trim().toLowerCase();
    searchWrap.classList.toggle("has-value", term.length > 0);

    // strip previous highlights before measuring or re-marking
    regions.forEach((el) => {
      if (el.innerHTML !== el.dataset.original) el.innerHTML = el.dataset.original;
    });

    let visible = 0;

    items.forEach((item) => {
      const inCategory = activeCategory === "all" || item.dataset.category === activeCategory;
      const matchesTerm = !term || item.textContent.toLowerCase().includes(term);
      const show = inCategory && matchesTerm;

      item.classList.toggle("is-hidden", !show);

      if (!show) {
        collapse(item);
        return;
      }

      visible += 1;
      if (term) {
        item.querySelectorAll("[data-faq-text]").forEach((el) => highlightIn(el, term));
      }
    });

    if (countEl) {
      if (!term && activeCategory === "all") {
        countEl.textContent = `${items.length} questions`;
      } else {
        countEl.textContent =
          `${visible} of ${items.length} question${items.length === 1 ? "" : "s"}` +
          (term ? ` matching “${input.value.trim()}”` : "");
      }
    }

    if (emptyEl) emptyEl.classList.toggle("is-shown", visible === 0);
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.faqFilter;
      filters.forEach((b) => {
        const on = b === button;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (input) {
    input.addEventListener("input", apply);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        input.value = "";
        apply();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      input.focus();
      apply();
    });
  }

  apply();
}

/* --------------------------------------------------------------------------
   Vendor marketplace — pages/vendors.html.

   Reads its starting state from the URL, so the homepage "Find Vendors" form
   and the category cards both hand off cleanly:
       vendors.html?category=catering&city=Hyderabad&budget=200000

   Filtering, sorting and pagination all run over the DOM because every card
   is already in the page. In Phase 4 PHP emits the same cards from a SQL
   query and these same parameter names become the WHERE clause — the markup
   and the query string do not change shape.
   -------------------------------------------------------------------------- */
function initVendorList() {
  const root = document.querySelector("[data-vendor-list]");
  if (!root) return;

  const PER_PAGE = 9;
  const cards = Array.from(root.querySelectorAll(".vendor-card"));

  const els = {
    search: root.querySelector("[data-filter-search]"),
    category: root.querySelector("[data-filter-category]"),
    city: root.querySelector("[data-filter-city]"),
    budget: root.querySelector("[data-filter-budget]"),
    budgetOut: root.querySelector("[data-budget-output]"),
    sort: root.querySelector("[data-sort]"),
    reset: root.querySelector("[data-filter-reset]"),
    count: root.querySelector("[data-results-count]"),
    chips: root.querySelector("[data-active-filters]"),
    grid: root.querySelector(".vendor-grid"),
    empty: root.querySelector("[data-vendor-empty]"),
    pager: root.querySelector("[data-pagination]"),
  };

  const ratingInputs = Array.from(root.querySelectorAll("[name='min-rating']"));
  const num = (v) => Number(v) || 0;
  const money = (v) => "Rs. " + Number(v).toLocaleString("en-PK");

  let page = 1;

  // ---- starting state from the query string -------------------------------
  const params = new URLSearchParams(window.location.search);
  const setIfPresent = (el, key) => {
    const v = params.get(key);
    if (!el || !v) return;
    const match = Array.from(el.options).find(
      (o) => o.value.toLowerCase() === v.toLowerCase()
    );
    if (match) el.value = match.value;
  };
  setIfPresent(els.category, "category");
  setIfPresent(els.city, "city");
  setIfPresent(els.sort, "sort");
  if (els.search && params.get("q")) els.search.value = params.get("q");
  if (els.budget && params.get("budget")) {
    const b = Math.min(num(params.get("budget")), num(els.budget.max));
    if (b >= num(els.budget.min)) els.budget.value = b;
  }
  const r = params.get("rating");
  if (r) {
    const hit = ratingInputs.find((i) => i.value === r);
    if (hit) hit.checked = true;
  }
  // event_type is carried through from the homepage but has no vendor-level
  // equivalent yet — vendors are matched to event types by category in Phase 4.

  function minRating() {
    const checked = ratingInputs.find((i) => i.checked);
    return checked ? num(checked.value) : 0;
  }

  function currentFilters() {
    return {
      q: (els.search?.value || "").trim().toLowerCase(),
      category: els.category?.value || "",
      city: els.city?.value || "",
      budget: num(els.budget?.value),
      rating: minRating(),
      sort: els.sort?.value || "recommended",
    };
  }

  function matches(card, f) {
    if (f.category && card.dataset.category !== f.category) return false;
    if (f.city && card.dataset.city !== f.city) return false;
    if (f.rating && num(card.dataset.rating) < f.rating) return false;
    if (f.budget && num(card.dataset.price) > f.budget) return false;
    if (f.q) {
      const hay = (card.dataset.name + " " + card.dataset.categoryLabel + " " + card.dataset.city).toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  }

  function sortCards(list, mode) {
    const by = {
      "price-asc": (a, b) => num(a.dataset.price) - num(b.dataset.price),
      "price-desc": (a, b) => num(b.dataset.price) - num(a.dataset.price),
      "rating-desc": (a, b) => num(b.dataset.rating) - num(a.dataset.rating),
      "reviews-desc": (a, b) => num(b.dataset.reviews) - num(a.dataset.reviews),
    }[mode];
    // "recommended" keeps the server's own ordering, which is the DOM order
    return by ? list.slice().sort(by) : list;
  }

  function renderChips(f) {
    if (!els.chips) return;
    const chips = [];
    if (f.category) chips.push(["category", els.category.selectedOptions[0].text]);
    if (f.city) chips.push(["city", f.city]);
    if (f.rating) chips.push(["rating", `${f.rating}★ & up`]);
    if (f.budget && f.budget < num(els.budget.max)) chips.push(["budget", `Under ${money(f.budget)}`]);
    if (f.q) chips.push(["q", `“${els.search.value.trim()}”`]);

    els.chips.innerHTML = chips
      .map(
        ([key, label]) =>
          `<span class="filter-chip">${label}` +
          `<button type="button" data-clear-filter="${key}" aria-label="Remove filter">&times;</button></span>`
      )
      .join("");
  }

  function renderPager(totalPages) {
    if (!els.pager) return;
    if (totalPages <= 1) {
      els.pager.innerHTML = "";
      return;
    }
    let html = `<button class="page-btn" data-page="${page - 1}" ${page === 1 ? "disabled" : ""}
                        aria-label="Previous page">&lsaquo;</button>`;
    for (let i = 1; i <= totalPages; i += 1) {
      html += `<button class="page-btn ${i === page ? "is-current" : ""}" data-page="${i}"
                       aria-label="Page ${i}" ${i === page ? 'aria-current="page"' : ""}>${i}</button>`;
    }
    html += `<button class="page-btn" data-page="${page + 1}" ${page === totalPages ? "disabled" : ""}
                     aria-label="Next page">&rsaquo;</button>`;
    els.pager.innerHTML = html;
  }

  function syncUrl(f) {
    const q = new URLSearchParams();
    if (f.category) q.set("category", f.category);
    if (f.city) q.set("city", f.city);
    if (f.rating) q.set("rating", String(f.rating));
    if (f.q) q.set("q", els.search.value.trim());
    if (f.budget && f.budget < num(els.budget.max)) q.set("budget", String(f.budget));
    if (f.sort && f.sort !== "recommended") q.set("sort", f.sort);
    const url = q.toString() ? `?${q}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }

  function apply({ resetPage = true } = {}) {
    if (resetPage) page = 1;
    const f = currentFilters();

    if (els.budgetOut && els.budget) {
      els.budgetOut.textContent =
        num(els.budget.value) >= num(els.budget.max)
          ? "Any budget"
          : `Up to ${money(els.budget.value)}`;
    }

    const shown = sortCards(cards.filter((c) => matches(c, f)), f.sort);
    const totalPages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PER_PAGE;
    const visible = shown.slice(start, start + PER_PAGE);

    cards.forEach((c) => c.classList.add("is-hidden"));
    visible.forEach((c) => {
      c.classList.remove("is-hidden");
      els.grid.appendChild(c); // reorder in place to honour the sort
    });

    if (els.count) {
      els.count.innerHTML = shown.length
        ? `Showing <strong>${start + 1}–${start + visible.length}</strong> of <strong>${shown.length}</strong> vendors`
        : "No vendors match your filters";
    }
    if (els.empty) els.empty.classList.toggle("is-shown", shown.length === 0);

    renderChips(f);
    renderPager(totalPages);
    syncUrl(f);
  }

  // ---- events -------------------------------------------------------------
  [els.category, els.city, els.sort].forEach((el) => el && el.addEventListener("change", () => apply()));
  ratingInputs.forEach((el) => el.addEventListener("change", () => apply()));
  if (els.search) els.search.addEventListener("input", () => apply());
  if (els.budget) {
    els.budget.addEventListener("input", () => apply());
  }

  if (els.reset) {
    els.reset.addEventListener("click", () => {
      if (els.search) els.search.value = "";
      if (els.category) els.category.value = "";
      if (els.city) els.city.value = "";
      if (els.sort) els.sort.value = "recommended";
      if (els.budget) els.budget.value = els.budget.max;
      ratingInputs.forEach((i) => (i.checked = i.value === "0"));
      apply();
    });
  }

  if (els.chips) {
    els.chips.addEventListener("click", (event) => {
      const button = event.target.closest("[data-clear-filter]");
      if (!button) return;
      const key = button.dataset.clearFilter;
      if (key === "category" && els.category) els.category.value = "";
      if (key === "city" && els.city) els.city.value = "";
      if (key === "q" && els.search) els.search.value = "";
      if (key === "budget" && els.budget) els.budget.value = els.budget.max;
      if (key === "rating") ratingInputs.forEach((i) => (i.checked = i.value === "0"));
      apply();
    });
  }

  if (els.pager) {
    els.pager.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page]");
      if (!button || button.disabled) return;
      const target = Number(button.dataset.page);
      if (!target) return;
      page = target;
      apply({ resetPage: false });
      els.grid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Filter rail collapses on small screens so results stay reachable.
  const toggle = root.querySelector("[data-filter-toggle]");
  const panel = root.querySelector(".filter-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.childNodes[0].nodeValue = open ? "Hide " : "Show ";
    });
  }

  // Save-for-later is a visual placeholder until saved_vendors exists.
  root.addEventListener("click", (event) => {
    const save = event.target.closest("[data-save-vendor]");
    if (!save) return;
    // TODO(backend): POST /api/saved-vendors.php { vendor_id } -> saved_vendors
    const on = save.classList.toggle("is-saved");
    const icon = save.querySelector("i");
    if (icon) icon.className = on ? "bi bi-heart-fill" : "bi bi-heart";
    save.setAttribute("aria-pressed", String(on));
  });

  apply();
}

/* --------------------------------------------------------------------------
   Vendor detail — pages/vendor-detail.html.

   Reads ?vendor_id= and renders that vendor from the demo dataset embedded in
   the page. In Phase 4 this whole function disappears: PHP runs
       SELECT ... FROM vendor_profiles WHERE vendor_id = ?
   and renders the same markup server-side.

   The Book button implements the frozen event-first rule (N.3): it starts the
   booking process, it does NOT create a booking record. Step 1 is always
   "which event does this belong to?".
   -------------------------------------------------------------------------- */
function initVendorDetail() {
  const root = document.querySelector("[data-vendor-detail]");
  if (!root) return;

  const dataEl = document.getElementById("demo-vendor-data");
  if (!dataEl) return;

  let all;
  try {
    all = JSON.parse(dataEl.textContent);
  } catch (err) {
    console.error("Eventora: demo vendor data could not be parsed", err);
    return;
  }

  const money = (v) => "Rs. " + Number(v).toLocaleString("en-PK");
  const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
  const escape = (t) =>
    String(t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const requestedId = Number(new URLSearchParams(window.location.search).get("vendor_id"));
  const vendor = all.vendors.find((v) => v.vendor_id === requestedId) || all.vendors[0];

  if (requestedId && !all.vendors.some((v) => v.vendor_id === requestedId)) {
    // TODO(backend): PHP should return a real 404 page here instead.
    const notice = root.querySelector("[data-not-found]");
    if (notice) notice.hidden = false;
  }

  // ---- header -------------------------------------------------------------
  const set = (sel, value) => {
    const el = root.querySelector(sel);
    if (el) el.textContent = value;
  };

  document.title = `${vendor.business_name} | Eventora`;
  set("[data-v-name]", vendor.business_name);
  set("[data-v-category]", vendor.category_label);
  set("[data-v-city]", vendor.city);
  set("[data-v-rating]", vendor.avg_rating);
  set("[data-v-reviews]", `(${vendor.review_count} reviews)`);
  set("[data-v-description]", vendor.description);
  set("[data-v-address]", vendor.address);
  set("[data-crumb]", vendor.business_name);
  set("[data-v-from]", money(vendor.starting_price));

  const badge = root.querySelector("[data-v-verified]");
  if (badge) {
    badge.className = "badge-pill " + (vendor.is_verified ? "verified" : "pending");
    badge.innerHTML = vendor.is_verified
      ? '<i class="bi bi-patch-check-fill" aria-hidden="true"></i> Verified vendor'
      : '<i class="bi bi-hourglass-split" aria-hidden="true"></i> Verification pending';
  }

  const thumbIcon = root.querySelector("[data-v-icon]");
  if (thumbIcon) thumbIcon.className = `bi ${vendor.icon}`;

  // ---- quick facts --------------------------------------------------------
  const facts = root.querySelector("[data-v-facts]");
  if (facts) {
    const rows = [
      ["bi-geo-alt", "City", vendor.city],
      ["bi-tag", "Category", vendor.category_label],
      ["bi-star", "Rating", `${vendor.avg_rating} from ${vendor.review_count} reviews`],
    ];
    if (vendor.capacity) rows.push(["bi-people", "Capacity", `Up to ${vendor.capacity} guests`]);
    rows.push(["bi-percent", "Commission", "10% platform commission, paid by the vendor"]);
    facts.innerHTML = rows
      .map(
        ([icon, label, value]) =>
          `<li><i class="bi ${icon}" aria-hidden="true"></i><span><strong>${label}:</strong> ${escape(value)}</span></li>`
      )
      .join("");
  }

  // ---- services -----------------------------------------------------------
  const serviceList = root.querySelector("[data-v-services]");
  if (serviceList) {
    serviceList.innerHTML = vendor.services
      .map((s) => {
        const tags = [`<span><i class="bi bi-tag" aria-hidden="true"></i> ${escape(vendor.category_label)}</span>`];
        if (s.capacity) tags.push(`<span><i class="bi bi-people" aria-hidden="true"></i> Up to ${s.capacity}</span>`);
        const action = s.is_available
          ? `<button type="button" class="btn-eventora btn-primary"
                     data-book-service data-service-id="${s.service_id}"
                     data-service-title="${escape(s.title)}">Book This</button>`
          : `<p class="unavailable-note">Currently unavailable</p>`;
        return `<div class="service-row${s.is_available ? "" : " is-unavailable"}">
            <div class="service-info">
              <h4>${escape(s.title)}</h4>
              <p>${escape(s.description)}</p>
              <div class="service-tags">${tags.join("")}</div>
            </div>
            <div class="service-book">
              <p class="service-price">${money(s.base_price)}</p>
              ${action}
            </div>
          </div>`;
      })
      .join("");
  }

  // ---- reviews ------------------------------------------------------------
  set("[data-v-score]", vendor.avg_rating);
  const starsEl = root.querySelector("[data-v-stars]");
  if (starsEl) starsEl.textContent = stars(vendor.avg_rating);
  set("[data-v-total]", `${vendor.review_count} reviews`);

  const bars = root.querySelector("[data-v-bars]");
  if (bars) {
    bars.innerHTML = vendor.rating_breakdown
      .map(
        (pct, i) => `<div class="rating-bar-row">
            <span>${5 - i}★</span>
            <div class="rating-bar"><span style="width:${pct}%"></span></div>
            <span>${pct}%</span>
          </div>`
      )
      .join("");
  }

  const reviewList = root.querySelector("[data-v-reviewlist]");
  if (reviewList) {
    reviewList.innerHTML = vendor.reviews
      .map(
        (r) => `<div class="review-item">
            <div class="review-head">
              <span class="avatar" aria-hidden="true"><i class="bi bi-person-fill"></i></span>
              <div>
                <p class="who">${escape(r.who)}</p>
                <p class="when">${escape(r.when)}</p>
              </div>
              <span class="stars" aria-label="${r.rating} out of 5">${stars(r.rating)}</span>
            </div>
            <p>${escape(r.text)}</p>
          </div>`
      )
      .join("");
  }

  set("[data-v-summary]", vendor.review_summary);

  // The full NLP analysis page needs to know which vendor it is showing.
  const summaryLink = root.querySelector("[data-v-summary-link]");
  if (summaryLink) summaryLink.href = `../ai/review-summary.html?vendor_id=${vendor.vendor_id}`;

  // ---- similar vendors ----------------------------------------------------
  const similar = root.querySelector("[data-v-similar]");
  if (similar) {
    const others = all.vendors
      .filter((v) => v.category === vendor.category && v.vendor_id !== vendor.vendor_id)
      .slice(0, 3);
    similar.closest("section").hidden = others.length === 0;
    similar.innerHTML = others
      .map(
        (v) => `<article class="vendor-card glass-card">
            <div class="vendor-thumb">
              <i class="bi ${v.icon} thumb-icon" aria-hidden="true"></i>
              <span class="demo-tag">Demo</span>
            </div>
            <div class="vendor-card-body">
              <p class="vendor-category">${escape(v.category_label)}</p>
              <h3>${escape(v.business_name)}</h3>
              <div class="vendor-meta">
                <span><i class="bi bi-geo-alt" aria-hidden="true"></i> ${escape(v.city)}</span>
                <span><i class="bi bi-star-fill" aria-hidden="true"></i>
                  <span class="rating-value">${v.avg_rating}</span></span>
              </div>
              <p class="vendor-price">Starting from <strong>${money(v.starting_price)}</strong></p>
            </div>
            <div class="vendor-card-actions">
              <a href="vendor-detail.html?vendor_id=${v.vendor_id}" class="btn-eventora btn-primary">View Details</a>
            </div>
          </article>`
      )
      .join("");
  }

  // ---- booking modal (event-first, per N.3) -------------------------------
  const modal = document.querySelector("[data-booking-modal]");
  if (!modal) return;

  const titleEl = modal.querySelector("[data-modal-service]");
  let lastFocus = null;

  function openModal(serviceTitle) {
    if (titleEl) titleEl.textContent = serviceTitle;
    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    const first = modal.querySelector("button, a");
    if (first) first.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  root.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-book-service]");
    if (!trigger) return;
    // N.3: no bookings row is written here. This opens step 1 of the wizard,
    // where the client picks or creates the event the booking will belong to.
    // TODO(backend): if no session, redirect to login.html?next=<this url>
    openModal(trigger.dataset.serviceTitle || "this service");
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-modal-close]") || event.target.matches(".modal-veil")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Save-for-later placeholder, same as the marketplace
  const save = root.querySelector("[data-save-vendor]");
  if (save) {
    save.addEventListener("click", () => {
      // TODO(backend): POST /api/saved-vendors.php { vendor_id } -> saved_vendors
      const on = save.classList.toggle("is-saved");
      const icon = save.querySelector("i");
      if (icon) icon.className = on ? "bi bi-heart-fill" : "bi bi-heart";
      save.setAttribute("aria-pressed", String(on));
    });
  }
}

/* --------------------------------------------------------------------------
   Forgot / reset password — pages/forgot-password.html.

   One page, two states, decided by the URL:
     forgot-password.html              -> request a reset link
     forgot-password.html?token=<...>  -> set a new password

   That mirrors password_resets (token_hash, expires_at, used_at) without
   inventing a page outside the frozen folder structure. See OPEN ITEM in the
   page comments if the team would rather split this into two files.

   Nothing is sent and no password is changed — both forms validate, then say
   plainly that the backend is not connected. No fake success messages.
   -------------------------------------------------------------------------- */
function initForgotPassword() {
  const root = document.querySelector("[data-forgot-page]");
  if (!root) return;

  const token = new URLSearchParams(window.location.search).get("token");
  const requestPanel = root.querySelector("[data-panel-request]");
  const resetPanel = root.querySelector("[data-panel-reset]");

  // TODO(backend): PHP validates the token before rendering the reset form —
  //   SELECT user_id FROM password_resets
  //   WHERE token_hash = SHA2(:token, 256) AND used_at IS NULL AND expires_at > NOW()
  // An invalid or expired token must render the "link expired" state instead.
  const showReset = Boolean(token);
  if (requestPanel) requestPanel.hidden = showReset;
  if (resetPanel) resetPanel.hidden = !showReset;

  const activeForm = root.querySelector(showReset ? "[data-reset-form]" : "[data-request-form]");
  if (!activeForm) return;

  bindFieldFeedback(activeForm);

  activeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const { valid, firstInvalid } = validateForm(activeForm, { markValid: true });
    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const button = activeForm.querySelector("button[type='submit']");
    if (button) {
      button.classList.add("is-loading");
      button.disabled = true;
    }

    const payload = Object.fromEntries(new FormData(activeForm).entries());

    if (showReset) {
      // TODO(backend): POST /api/reset-password.php { token, password }
      //   -> UPDATE users SET password_hash = :hash WHERE id = :user_id
      //   -> UPDATE password_resets SET used_at = NOW() WHERE token_hash = :hash
      // The plaintext password is hashed server-side and never stored as typed.
      console.log("Eventora reset-password submission:", { token, hasPassword: Boolean(payload.password) });
    } else {
      // TODO(backend): POST /api/forgot-password.php { email }
      //   -> look up users.email
      //   -> INSERT INTO password_resets (user_id, token_hash, expires_at)
      //   -> email the link containing the plaintext token
      // SECURITY: respond identically whether or not the email exists, so the
      // form cannot be used to discover which addresses have accounts.
      console.log("Eventora forgot-password submission:", payload);
    }

    setTimeout(() => {
      if (button) {
        button.classList.remove("is-loading");
        button.disabled = false;
      }

      showFormFeedback(
        activeForm,
        showReset
          ? "Demo mode — your new password passed validation but nothing was changed. " +
            "Password reset is not connected to a backend yet."
          : "Demo mode — no email was sent. Password reset is not connected to a backend yet. " +
            "Contact the team directly if you need access.",
        "is-demo",
        "bi-info-circle-fill"
      );

      activeForm.reset();
      activeForm.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
      const meter = root.querySelector("[data-password-strength-meter]");
      if (meter) meter.classList.remove("is-visible");
    }, 1200);
  });
}

/* --------------------------------------------------------------------------
   Dashboard shell — shared by every client/, vendor/ and admin/ page.

   Handles the off-canvas sidebar below 992px and marks the current page in
   the sidebar navigation automatically, so no page has to hand-edit an
   is-active class (and none can forget to remove the previous one).
   -------------------------------------------------------------------------- */
function initDashboardShell() {
  const shell = document.querySelector("[data-dash-shell]");
  if (!shell) return;

  const sidebar = shell.querySelector("[data-sidebar]");
  const veil = shell.querySelector("[data-sidebar-veil]");
  const openBtn = shell.querySelector("[data-sidebar-open]");
  const closeBtn = shell.querySelector("[data-sidebar-close]");

  // ---- mark the current page in the sidebar ------------------------------
  const here = window.location.pathname.split("/").pop() || "dashboard.html";
  shell.querySelectorAll(".dash-nav a").forEach((link) => {
    const target = (link.getAttribute("href") || "").split("/").pop().split("?")[0];
    const active = target === here;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  // ---- off-canvas drawer --------------------------------------------------
  function setDrawer(open) {
    if (!sidebar) return;
    sidebar.classList.toggle("is-open", open);
    if (veil) veil.classList.toggle("is-open", open);
    if (openBtn) openBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (openBtn) openBtn.addEventListener("click", () => setDrawer(true));
  if (closeBtn) closeBtn.addEventListener("click", () => setDrawer(false));
  if (veil) veil.addEventListener("click", () => setDrawer(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar && sidebar.classList.contains("is-open")) {
      setDrawer(false);
    }
  });

  // Following a link inside the drawer should close it
  shell.querySelectorAll(".dash-nav a").forEach((link) => {
    link.addEventListener("click", () => setDrawer(false));
  });

  // Returning to desktop width must not leave the drawer state stuck
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && sidebar.classList.contains("is-open")) setDrawer(false);
  });

  // TODO(backend): every dashboard page needs a session guard before render —
  //   if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'client') {
  //       header('Location: ../pages/login.html'); exit;
  //   }
  // Client pages must additionally resolve client_profiles.client_id from
  // users.id; never treat the two as interchangeable (frozen ID rule).
}

/* --------------------------------------------------------------------------
   Progress bars — budget tracks, rating breakdowns, anything percentage-based.

   The width is data, not styling, so it lives in data-pct and is applied here
   rather than as an inline style attribute. PHP emits data-pct="<?= $pct ?>"
   and nothing else changes.
   -------------------------------------------------------------------------- */
function initProgressBars() {
  document.querySelectorAll("[data-pct]").forEach((bar) => {
    const pct = Math.max(0, Math.min(100, Number(bar.dataset.pct) || 0));
    bar.style.width = `${pct}%`;
    const track = bar.parentElement;
    if (track && track.getAttribute("role") !== "progressbar") {
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-valuenow", String(pct));
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", "100");
    }
  });
}

/* --------------------------------------------------------------------------
   Create event — client/create-event.html.

   Every field maps to a column on the events table (Eventora Database v1.0).
   Validation reuses the shared validateForm/bindFieldFeedback pair; only the
   two rules that are genuinely new here — a date that must not be in the past,
   and a positive integer — are added below.

   N.3: this is where the event-first rule begins. An event created here is
   what later bookings attach to via bookings.event_id.
   -------------------------------------------------------------------------- */
function initCreateEvent() {
  const form = document.querySelector("[data-create-event-form]");
  if (!form) return;

  const dateField = form.querySelector("[name='event_date']");

  // A past date is never a valid event date. Setting min also stops the
  // native picker offering them, so the error is a fallback, not the barrier.
  if (dateField) {
    const today = new Date();
    const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    dateField.min = iso;
  }

  /* Extra rules layered on top of the shared validator. Kept here rather than
     in validateField() because only this form needs them. */
  function extraRulesPass(field) {
    const value = (field.value || "").trim();
    if (!value) return true;

    if (field.dataset.rule === "future-date") {
      const chosen = new Date(value + "T00:00:00");
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      return chosen >= midnight;
    }

    if (field.dataset.rule === "positive-int") {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 && Number.isInteger(n);
    }

    if (field.dataset.rule === "positive-amount") {
      const n = Number(value);
      return Number.isFinite(n) && n > 0;
    }

    return true;
  }

  function runExtraRules() {
    let ok = true;
    form.querySelectorAll("[data-rule]").forEach((field) => {
      const group = field.closest(".form-group");

      // extraRulesPass() passes empty values through — "is this date in the
      // past?" has no answer for a blank field. Requiredness is the shared
      // validator's job, so an empty required field is already flagged and
      // must NOT be cleared here.
      const missing = field.required && !field.value.trim();
      const pass = !missing && extraRulesPass(field);

      if (group) {
        if (!pass) {
          group.classList.add("has-error");
          group.classList.remove("is-valid");
        } else if (field.value.trim()) {
          group.classList.remove("has-error");
          group.classList.add("is-valid");
        }
      }
      if (!pass) ok = false;
    });
    return ok;
  }

  // ---- live summary rail --------------------------------------------------
  const preview = {
    name: form.querySelector("[name='event_name']"),
    type: () => form.querySelector("[name='event_type']:checked"),
    date: dateField,
    city: form.querySelector("[name='city']"),
    venue: form.querySelector("[name='venue']"),
    guests: form.querySelector("[name='guest_count']"),
    budget: form.querySelector("[name='total_budget']"),
  };

  function setPreview(key, value) {
    const cell = document.querySelector(`[data-preview="${key}"]`);
    if (!cell) return;
    const empty = !value;
    cell.textContent = empty ? "Not set" : value;
    cell.classList.toggle("empty", empty);
  }

  function updatePreview() {
    setPreview("name", preview.name?.value.trim());

    const type = preview.type();
    setPreview("type", type ? type.dataset.label : "");

    let dateText = "";
    if (preview.date?.value) {
      const d = new Date(preview.date.value + "T00:00:00");
      if (!Number.isNaN(d.getTime())) {
        dateText = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      }
    }
    setPreview("date", dateText);

    setPreview("city", preview.city?.value);
    setPreview("venue", preview.venue?.value.trim());

    const guests = Number(preview.guests?.value);
    setPreview("guests", guests > 0 ? `${guests.toLocaleString("en-PK")} guests` : "");

    const budget = Number(preview.budget?.value);
    setPreview("budget", budget > 0 ? "Rs. " + budget.toLocaleString("en-PK") : "");
  }

  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  updatePreview();

  bindFieldFeedback(form);

  // Clear an extra-rule error as soon as the person edits that field
  form.querySelectorAll("[data-rule]").forEach((field) => {
    field.addEventListener("input", () => {
      const group = field.closest(".form-group");
      if (group && extraRulesPass(field)) group.classList.remove("has-error");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const { valid, firstInvalid } = validateForm(form, { markValid: true });
    const extrasOk = runExtraRules();

    if (!valid || !extrasOk) {
      const target = firstInvalid || form.querySelector(".form-group.has-error input, .form-group.has-error select");
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.classList.add("is-loading");
      button.disabled = true;
    }

    // TODO(backend): POST /api/create-event.php
    //   INSERT INTO events
    //     (client_id, event_name, event_type, event_date, city, venue,
    //      guest_count, total_budget, special_requirements, status)
    //   VALUES (:client_id, ..., 'planning')
    //   client_id comes from the session via client_profiles — never users.id.
    //   On success: redirect to my-events.html, or back into the booking
    //   wizard with the new event_id preselected (N.3).
    const payload = Object.fromEntries(new FormData(form).entries());
    console.log("Eventora create-event submission:", payload);

    setTimeout(() => {
      if (button) {
        button.classList.remove("is-loading");
        button.disabled = false;
      }
      showFormFeedback(
        form,
        "Demo mode — the event details passed validation but nothing was saved. " +
          "Event creation is not connected to a database yet.",
        "is-demo",
        "bi-info-circle-fill"
      );
    }, 1200);
  });
}

/* --------------------------------------------------------------------------
   My events — client/my-events.html.

   Filters the client's events by events.status and by a text search over the
   event name, type, city and venue. Runs over the DOM because every card is
   already rendered; in Phase 4 PHP emits the same cards from
       SELECT ... FROM events WHERE client_id = :client_id
   and the status filter becomes an AND clause.

   Reuses .faq-filter pills so the filtering control is the same one people
   already met on the FAQ page.
   -------------------------------------------------------------------------- */
function initMyEvents() {
  const root = document.querySelector("[data-my-events]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".event-card"));
  const pills = Array.from(root.querySelectorAll("[data-event-filter]"));
  const search = root.querySelector("[data-events-search]");
  const countEl = root.querySelector("[data-events-count]");
  const emptyEl = root.querySelector("[data-events-empty]");
  const gridEl = root.querySelector(".events-grid");

  let status = "all";

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const statusOk = status === "all" || card.dataset.status === status;
      const haystack = [
        card.dataset.name,
        card.dataset.type,
        card.dataset.city,
        card.dataset.venue,
      ]
        .join(" ")
        .toLowerCase();
      const termOk = !term || haystack.includes(term);
      const show = statusOk && termOk;

      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} event${cards.length === 1 ? "" : "s"}`
          : `${visible} of ${cards.length} events`;
    }

    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (gridEl) gridEl.hidden = visible === 0;
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      status = pill.dataset.eventFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  // Cancelling an event is destructive and cascades to its bookings, so it
  // always asks first. The confirm step stays in the backend version too.
  root.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-cancel-event]");
    if (!trigger) return;
    event.preventDefault();
    const name = trigger.dataset.cancelEvent;
    // TODO(backend): POST /api/cancel-event.php { event_id }
    //   UPDATE events SET status = 'cancelled' WHERE event_id = ? AND client_id = ?
    //
    //   APPROVED CASCADE RULE — booking rows are never deleted, so payment,
    //   review, commission and audit history survives:
    //     pending    -> cancelled
    //     rejected   -> stays rejected
    //     completed  -> stays completed
    //     cancelled  -> stays cancelled
    //     accepted   -> NOT auto-cancelled and NOT deleted. Needs admin
    //                   handling because a payment may already exist. The
    //                   refund workflow is undefined in Database v1.0 and
    //                   must not be invented here.
    window.alert(
      `Demo mode — "${name}" was not cancelled.\n\n` +
        "Event cancellation is not connected to a database yet. When it is, " +
        "cancelling an event will also require handling any bookings already " +
        "accepted by vendors."
    );
  });

  apply();
}

/* --------------------------------------------------------------------------
   My bookings — client/bookings.html.

   Filters by bookings.status and searches across booking reference, event,
   vendor and service. Same DOM-filtering approach as my-events; in Phase 4
   PHP emits the cards and the status filter becomes an AND clause.

   Actions are rendered server-side per status (see the build comments), so
   this module never has to decide which action is legal — it only filters.
   -------------------------------------------------------------------------- */
function initBookings() {
  const root = document.querySelector("[data-bookings]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".booking-card"));
  const pills = Array.from(root.querySelectorAll("[data-booking-filter]"));
  const search = root.querySelector("[data-bookings-search]");
  const countEl = root.querySelector("[data-bookings-count]");
  const emptyEl = root.querySelector("[data-bookings-empty]");
  const listEl = root.querySelector(".bookings-list");

  let status = "all";

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const statusOk = status === "all" || card.dataset.status === status;
      const haystack = [
        card.dataset.ref,
        card.dataset.event,
        card.dataset.vendor,
        card.dataset.service,
        card.dataset.category,
      ]
        .join(" ")
        .toLowerCase();
      const termOk = !term || haystack.includes(term);
      const show = statusOk && termOk;

      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} booking${cards.length === 1 ? "" : "s"}`
          : `${visible} of ${cards.length} bookings`;
    }

    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (listEl) listEl.hidden = visible === 0;
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      status = pill.dataset.bookingFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  // Cancelling a request is only offered on pending bookings, and even then it
  // confirms first — a vendor may be about to accept it.
  root.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-cancel-booking]");
    if (!trigger) return;
    event.preventDefault();
    // TODO(backend): POST /api/cancel-booking.php { booking_id }
    //   UPDATE bookings SET status = 'cancelled'
    //   WHERE booking_id = ? AND client_id = ? AND status = 'pending'
    //   The status guard matters: if the vendor accepted in the meantime this
    //   must fail rather than cancel an accepted booking. The row is never
    //   deleted — payments, reviews and commissions reference it.
    window.alert(
      `Demo mode — booking ${trigger.dataset.cancelBooking} was not cancelled.\n\n` +
        "Booking cancellation is not connected to a database yet."
    );
  });

  apply();
}

/* --------------------------------------------------------------------------
   Booking detail — client/booking-detail.html.

   Renders one booking from ?booking_id= against the demo dataset embedded in
   the page. The dataset is deliberately the same ten bookings shown on
   bookings.html, so the two pages cannot contradict each other.

   The two rules that matter are enforced here, not just described:
     - payment is offered only when status === 'accepted'
     - review is offered only when status === 'completed'
   -------------------------------------------------------------------------- */
function initBookingDetail() {
  const root = document.querySelector("[data-booking-detail]");
  if (!root) return;

  const dataEl = document.getElementById("demo-booking-data");
  if (!dataEl) return;

  let all;
  try {
    all = JSON.parse(dataEl.textContent);
  } catch (err) {
    console.error("Eventora: demo booking data could not be parsed", err);
    return;
  }

  const money = (v) => "Rs. " + Number(v).toLocaleString("en-PK");
  const esc = (t) =>
    String(t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const wanted = Number(new URLSearchParams(window.location.search).get("booking_id"));
  const bk = all.bookings.find((b) => b.booking_id === wanted) || all.bookings[0];

  if (wanted && !all.bookings.some((b) => b.booking_id === wanted)) {
    // TODO(backend): PHP returns a real 404 when the booking does not exist,
    // or does not belong to the signed-in client.
    const notice = root.querySelector("[data-bd-notfound]");
    if (notice) notice.hidden = false;
  }

  // Several of these appear more than once on the page (the reference in both
  // the breadcrumb and the header, the amount in both the header and the
  // breakdown). querySelector would only fill the first, leaving placeholder
  // text like "Service" or "EVB-0000" visible.
  const set = (sel, value) => {
    root.querySelectorAll(sel).forEach((el) => {
      el.textContent = value;
    });
  };

  document.title = `Booking ${bk.ref} | Eventora Client`;
  set("[data-bd-ref]", bk.ref);
  set("[data-bd-service]", bk.service);
  set("[data-bd-category]", bk.category);
  set("[data-bd-vendor]", bk.vendor);
  set("[data-bd-vendor-city]", bk.vendor_city);
  set("[data-bd-event]", bk.event_name);
  set("[data-bd-event-date]", bk.event_date_pretty);
  set("[data-bd-placed]", bk.placed_pretty);
  set("[data-bd-booking-date]", bk.event_date_pretty);

  const statusEl = root.querySelector("[data-bd-status]");
  if (statusEl) {
    statusEl.className = `booking-status ${bk.status}`;
    statusEl.textContent = bk.status;
  }

  const vendorLink = root.querySelector("[data-bd-vendor-link]");
  if (vendorLink) vendorLink.href = `../pages/vendor-detail.html?vendor_id=${bk.vendor_id}`;

  // ---- money: commission is shown for transparency, never added on top -----
  set("[data-bd-amount]", money(bk.amount));
  set("[data-bd-total]", money(bk.amount));
  set("[data-bd-commission]", money(bk.commission_amount));
  set("[data-bd-vendor-net]", money(bk.amount - bk.commission_amount));
  set("[data-bd-commission-pct]", `${bk.commission_percentage}%`);

  // ---- timeline ------------------------------------------------------------
  const tl = root.querySelector("[data-bd-timeline]");
  if (tl) {
    // The path a booking actually took. rejected and cancelled stop the line.
    const steps = [
      { key: "requested", title: "Booking requested", when: bk.placed_pretty },
    ];

    if (bk.status === "rejected") {
      steps.push({ key: "rejected", title: "Vendor rejected the request", when: bk.decided_pretty, stop: true });
    } else if (bk.status === "cancelled") {
      steps.push({ key: "cancelled", title: "Booking cancelled", when: bk.decided_pretty, stop: true });
    } else {
      steps.push({
        key: "accepted",
        title: "Vendor accepted the request",
        when: ["accepted", "completed"].includes(bk.status) ? bk.decided_pretty : "Waiting for the vendor",
      });
      steps.push({
        key: "paid",
        title: "Payment",
        when: bk.status === "completed" ? bk.paid_pretty : "Available after acceptance",
      });
      steps.push({
        key: "completed",
        title: "Service delivered",
        when: bk.status === "completed" ? bk.event_date_pretty : "After the event",
      });
      steps.push({
        key: "review",
        title: "Leave a review",
        when: bk.status === "completed" ? "Available now" : "Available after completion",
      });
    }

    const reached = {
      pending: ["requested"],
      accepted: ["requested", "accepted"],
      rejected: ["requested", "rejected"],
      cancelled: ["requested", "cancelled"],
      completed: ["requested", "accepted", "paid", "completed", "review"],
    }[bk.status];

    tl.innerHTML = steps
      .map((s) => {
        let cls = "is-pending";
        if (s.stop) cls = "is-stopped";
        else if (reached.includes(s.key)) {
          cls = s.key === reached[reached.length - 1] && bk.status !== "completed"
            ? "is-current"
            : "is-done";
        }
        return `<li class="${cls}">
            <p class="tl-title">${esc(s.title)}</p>
            <p class="tl-when">${esc(s.when)}</p>
          </li>`;
      })
      .join("");
  }

  // ---- payment box: gated on 'accepted' ------------------------------------
  const pay = root.querySelector("[data-bd-payment]");
  if (pay) {
    const states = {
      pending: ["is-locked", "bi-lock", "Payment locked",
        "Payment opens once the vendor accepts this request."],
      accepted: ["is-ready", "bi-unlock", "Ready for payment",
        "The vendor accepted. You can pay for this booking now."],
      rejected: ["is-locked", "bi-x-circle", "No payment due",
        "The vendor rejected this request, so nothing is payable."],
      cancelled: ["is-locked", "bi-x-circle", "No payment due",
        "This booking was cancelled, so nothing is payable."],
      completed: ["is-ready", "bi-check2-circle", "Payment complete",
        "This booking has been paid and the service delivered."],
    }[bk.status];

    pay.className = `bd-payment ${states[0]}`;
    pay.querySelector("[data-pay-icon]").className = `bi ${states[1]}`;
    pay.querySelector("[data-pay-title]").textContent = states[2];
    pay.querySelector("[data-pay-text]").textContent = states[3];

    const payBtn = pay.querySelector("[data-pay-action]");
    // Only an accepted booking may be paid. Not a styling choice — a rule.
    payBtn.hidden = bk.status !== "accepted";
  }

  // ---- side actions --------------------------------------------------------
  const review = root.querySelector("[data-bd-review]");
  if (review) review.hidden = bk.status !== "completed";

  const cancel = root.querySelector("[data-bd-cancel]");
  if (cancel) cancel.hidden = bk.status !== "pending";

  root.addEventListener("click", (event) => {
    const t = event.target.closest("[data-bd-cancel], [data-pay-action]");
    if (!t) return;
    event.preventDefault();
    const what = t.hasAttribute("data-bd-cancel") ? "Cancelling this booking" : "Payment";
    // TODO(backend): cancel -> UPDATE bookings SET status='cancelled'
    //                          WHERE booking_id=? AND client_id=? AND status='pending'
    //                pay    -> redirect to /payment/checkout.php?booking_id=...
    window.alert(`Demo mode — ${what} is not connected to a backend yet.`);
  });
}

/* --------------------------------------------------------------------------
   Saved vendors — client/saved-vendors.html.

   Backed by the saved_vendors extension table. Removing a card here only hides
   it in the DOM; nothing is persisted, and the page says so.
   -------------------------------------------------------------------------- */
function initSavedVendors() {
  const root = document.querySelector("[data-saved-vendors]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".saved-vendor-card"));
  const search = root.querySelector("[data-saved-search]");
  const categorySel = root.querySelector("[data-saved-category]");
  const countEl = root.querySelector("[data-saved-count]");
  const emptyEl = root.querySelector("[data-saved-empty]");
  const gridEl = root.querySelector(".saved-grid");

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    const cat = categorySel?.value || "";
    let visible = 0;

    cards.forEach((card) => {
      if (card.dataset.removed === "true") {
        card.classList.add("is-hidden");
        return;
      }
      const catOk = !cat || card.dataset.category === cat;
      const hay = [card.dataset.name, card.dataset.categoryLabel, card.dataset.city]
        .join(" ")
        .toLowerCase();
      const termOk = !term || hay.includes(term);
      const show = catOk && termOk;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    const remaining = cards.filter((c) => c.dataset.removed !== "true").length;
    if (countEl) {
      countEl.textContent =
        visible === remaining
          ? `${remaining} saved vendor${remaining === 1 ? "" : "s"}`
          : `${visible} of ${remaining} saved vendors`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (gridEl) gridEl.hidden = visible === 0;
  }

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }
  if (categorySel) categorySel.addEventListener("change", apply);

  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-unsave]");
    if (!btn) return;
    const card = btn.closest(".saved-vendor-card");
    if (!card) return;
    // TODO(backend): DELETE FROM saved_vendors
    //                WHERE client_id = :client_id AND vendor_id = :vendor_id
    card.dataset.removed = "true";
    apply();
  });

  apply();
}

/* --------------------------------------------------------------------------
   Notifications — client/notifications.html.

   Read state is DOM-only. Nothing is written anywhere, so the page states that
   plainly rather than implying the change stuck.
   -------------------------------------------------------------------------- */
function initNotifications() {
  const root = document.querySelector("[data-notifications]");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".notification-item"));
  const pills = Array.from(root.querySelectorAll("[data-notif-filter]"));
  const markAll = root.querySelector("[data-mark-all]");
  const countEl = root.querySelector("[data-notif-count]");
  const emptyEl = root.querySelector("[data-notif-empty]");
  const badge = root.querySelector("[data-unread-badge]");

  let filter = "all";

  function unreadCount() {
    return items.filter((i) => i.classList.contains("is-unread")).length;
  }

  function apply() {
    let visible = 0;

    items.forEach((item) => {
      let show = true;
      if (filter === "unread") show = item.classList.contains("is-unread");
      else if (filter !== "all") show = item.dataset.type === filter;
      item.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    // A group heading with nothing under it is noise
    root.querySelectorAll(".notif-group").forEach((group) => {
      const any = Array.from(group.querySelectorAll(".notification-item"))
        .some((i) => !i.classList.contains("is-hidden"));
      group.hidden = !any;
    });

    const unread = unreadCount();
    if (countEl) {
      countEl.textContent = unread
        ? `${unread} unread of ${items.length}`
        : `All ${items.length} read`;
    }
    if (badge) {
      badge.textContent = String(unread);
      badge.hidden = unread === 0;
    }
    if (markAll) markAll.disabled = unread === 0;
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filter = pill.dataset.notifFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-mark-read]");
    if (!btn) return;
    const item = btn.closest(".notification-item");
    if (!item) return;
    // TODO(backend): POST /api/notifications.php { notification_id, is_read: 1 }
    //                UPDATE notifications SET is_read = 1
    //                WHERE notification_id = ? AND user_id = ?
    item.classList.remove("is-unread");
    item.classList.add("is-read");
    apply();
  });

  if (markAll) {
    markAll.addEventListener("click", () => {
      // TODO(backend): UPDATE notifications SET is_read = 1 WHERE user_id = ?
      items.forEach((i) => {
        i.classList.remove("is-unread");
        i.classList.add("is-read");
      });
      apply();
    });
  }

  apply();
}

/* --------------------------------------------------------------------------
   Client reviews — client/reviews.html.

   Eligibility is a hard rule, not a UI preference: reviews.booking_id is
   UNIQUE and a review only exists after the service was delivered. So a
   review form is offered when, and only when,
       booking.status === 'completed'  AND  no review exists yet.
   Every other status — pending, accepted, rejected, cancelled — is ineligible
   and the page says why rather than hiding the booking.
   -------------------------------------------------------------------------- */
function initClientReviews() {
  const root = document.querySelector("[data-client-reviews]");
  if (!root) return;

  // Open/close the inline write-review form
  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-write-review]");
    if (toggle) {
      const card = toggle.closest(".rv-eligible-card");
      const form = card && card.querySelector("[data-review-form]");
      if (!form) return;
      const opening = form.hidden;
      form.hidden = !opening;
      // The form has its own Cancel button in the footer; showing a second one
      // here just gave two identical controls side by side.
      toggle.hidden = opening;
      if (opening) {
        const firstStar = form.querySelector(".star-input input");
        if (firstStar) firstStar.focus();
      }
      return;
    }

    const cancel = event.target.closest("[data-review-cancel]");
    if (cancel) {
      const form = cancel.closest("[data-review-form]");
      if (!form) return;
      form.hidden = true;
      const btn = form.closest(".rv-eligible-card").querySelector("[data-write-review]");
      if (btn) {
        btn.hidden = false;
        btn.focus();
      }
    }
  });

  // Submit — validates rating + text, then states plainly that nothing saved
  root.querySelectorAll("[data-review-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const rating = form.querySelector("input[type='radio']:checked");
      const text = form.querySelector("textarea");
      let ok = true;

      const ratingGroup = form.querySelector("[data-rating-group]");
      if (ratingGroup) {
        ratingGroup.classList.toggle("has-error", !rating);
        if (!rating) ok = false;
      }

      const textGroup = text && text.closest(".form-group");
      const tooShort = !text || text.value.trim().length < 10;
      if (textGroup) {
        textGroup.classList.toggle("has-error", tooShort);
        if (tooShort) ok = false;
      }

      if (!ok) return;

      const button = form.querySelector("button[type='submit']");
      if (button) {
        button.classList.add("is-loading");
        button.disabled = true;
      }

      // TODO(backend): POST /api/review.php
      //   INSERT INTO reviews (booking_id, client_id, vendor_id, rating, review_text)
      //   VALUES (:booking_id, :client_id, :vendor_id, :rating, :text)
      //   Guard first: the booking must belong to this client AND be 'completed'.
      //   UNIQUE(booking_id) prevents a second review on the same booking.
      //   sentiment_score is left NULL here — the Python NLP module fills it
      //   later; PHP must never write it.
      console.log("Eventora review submission:", {
        booking_id: form.dataset.bookingId,
        rating: rating.value,
        review_text: text.value.trim(),
      });

      setTimeout(() => {
        if (button) {
          button.classList.remove("is-loading");
          button.disabled = false;
        }
        showFormFeedback(
          form,
          "Demo mode — your review passed validation but was not saved. " +
            "Reviews are not connected to a database yet.",
          "is-demo",
          "bi-info-circle-fill"
        );
      }, 1100);
    });

    // Clear the error as soon as they start fixing it
    form.querySelectorAll("input[type='radio']").forEach((r) =>
      r.addEventListener("change", () => {
        const g = form.querySelector("[data-rating-group]");
        if (g) g.classList.remove("has-error");
      })
    );
    const ta = form.querySelector("textarea");
    if (ta) {
      ta.addEventListener("input", () => {
        const g = ta.closest(".form-group");
        if (g && ta.value.trim().length >= 10) g.classList.remove("has-error");
      });
    }
  });
}

/* --------------------------------------------------------------------------
   Client settings — client/settings.html.

   Section highlighting plus toggle state. Nothing persists: every control
   resets on reload and the page says so, rather than implying a saved
   preference.
   -------------------------------------------------------------------------- */
function initClientSettings() {
  // Shared by client/settings.html and vendor/settings.html — the section
  // navigation, toggles and save behaviour are identical, so the logic is not
  // duplicated per role.
  const root = document.querySelector(
    "[data-client-settings], [data-vendor-settings], [data-admin-settings]"
  );
  if (!root) return;

  const links = Array.from(root.querySelectorAll(".settings-nav a"));
  const panels = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  // Highlight whichever section is currently in view
  if (panels.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => {
            const on = a.getAttribute("href") === `#${entry.target.id}`;
            a.classList.toggle("is-active", on);
          });
        });
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0 }
    );
    panels.forEach((panel) => observer.observe(panel));
  }

  // Save buttons — validate nothing, save nothing, and admit it
  root.querySelectorAll("[data-settings-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // TODO(backend): POST /api/settings.php
      //   Account fields  -> UPDATE users SET name, email, phone WHERE id = :user_id
      //   Preferences     -> UPDATE client_profiles SET city, preferred_event_types,
      //                                                 average_budget
      //                      WHERE client_id = :client_id
      //   NOTE (flagged): notification and privacy toggles have NO column in
      //   Eventora Database v1.0. They are frontend-only demo controls until a
      //   settings/preferences table is approved. Do not invent one here.
      showFormFeedback(
        form,
        "Demo mode — nothing was saved. Settings are not connected to a database yet.",
        "is-demo",
        "bi-info-circle-fill"
      );
    });
  });

  // Deactivation is the one genuinely destructive action, so it double-checks
  const deactivate = root.querySelector("[data-deactivate]");
  if (deactivate) {
    deactivate.addEventListener("click", () => {
      // TODO(backend): POST /api/deactivate-account.php
      //   UPDATE users SET status = 'blocked' WHERE id = :user_id
      //   The row is NEVER deleted: bookings, payments, commissions and reviews
      //   all hold foreign keys to it, and those FKs are ON DELETE RESTRICT.
      //   Any accepted booking must be resolved with the vendor first.
      window.alert(
        "Demo mode — your account was not deactivated.\n\n" +
          "When this is built, deactivation will set the account status to blocked " +
          "rather than deleting it. Booking, payment, commission and review records " +
          "all hold foreign keys to this account with ON DELETE RESTRICT, so a " +
          "physical delete would fail even if it were attempted."
      );
    });
  }
}

/* --------------------------------------------------------------------------
   Vendor services — vendor/services.html.

   Filters this vendor's own services by category, availability and text.
   In Phase 4 the cards come from
       SELECT ... FROM services WHERE vendor_id = :vendor_id
   where :vendor_id is vendor_profiles.vendor_id resolved from the session —
   never users.id.

   The availability switch flips services.is_available. It is the one control
   here that changes what clients can book, so it is not silently optimistic:
   the UI updates and the page states that nothing was persisted.
   -------------------------------------------------------------------------- */
function initVendorServices() {
  const root = document.querySelector("[data-vendor-services]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".svc-card"));
  const search = root.querySelector("[data-svc-search]");
  const categorySel = root.querySelector("[data-svc-category]");
  const availSel = root.querySelector("[data-svc-availability]");
  const countEl = root.querySelector("[data-svc-count]");
  const emptyEl = root.querySelector("[data-svc-empty]");
  const gridEl = root.querySelector(".svc-grid");

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    const cat = categorySel?.value || "";
    const avail = availSel?.value || "";
    let visible = 0;

    cards.forEach((card) => {
      const catOk = !cat || card.dataset.category === cat;
      const availOk =
        !avail ||
        (avail === "available" && card.dataset.available === "true") ||
        (avail === "unavailable" && card.dataset.available === "false");
      const hay = [card.dataset.title, card.dataset.categoryLabel, card.dataset.description]
        .join(" ")
        .toLowerCase();
      const termOk = !term || hay.includes(term);
      const show = catOk && availOk && termOk;

      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} service${cards.length === 1 ? "" : "s"}`
          : `${visible} of ${cards.length} services`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (gridEl) gridEl.hidden = visible === 0;
  }

  [categorySel, availSel].forEach((el) => el && el.addEventListener("change", apply));
  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  // Availability toggle — reflects services.is_available
  root.addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-svc-toggle]");
    if (!toggle) return;
    const card = toggle.closest(".svc-card");
    if (!card) return;

    const on = toggle.checked;
    card.dataset.available = String(on);
    card.classList.toggle("is-unavailable", !on);

    const pill = card.querySelector(".svc-avail-pill");
    if (pill) {
      pill.className = `svc-avail-pill ${on ? "on" : "off"}`;
      pill.textContent = on ? "Available" : "Unavailable";
    }

    // TODO(backend): POST /api/service-availability.php { service_id, is_available }
    //   UPDATE services SET is_available = :flag
    //   WHERE service_id = :service_id AND vendor_id = :vendor_id
    //   Turning a service off hides it from the marketplace but must NOT affect
    //   bookings already placed against it — those rows keep their own status.
    apply();
  });

  // Initial render — without this the count and empty state never populate
  // until the first interaction.
  apply();
}

/* --------------------------------------------------------------------------
   Service form — vendor/add-service.html and vendor/edit-service.html.

   One module for both pages: the markup is identical, and edit-service simply
   arrives with values already filled in from ?service_id=. Fields map 1:1 to
   the services table (title, category_id, description, base_price, capacity,
   image_url, is_available).

   Validation reuses the shared validateForm/bindFieldFeedback pair. Only the
   two numeric rules that create-event already needed are reused here.
   -------------------------------------------------------------------------- */
function initServiceForm() {
  const form = document.querySelector("[data-service-form]");
  if (!form) return;

  const isEdit = form.dataset.mode === "edit";

  // ---- edit mode: load the service named in the query string --------------
  if (isEdit) {
    const dataEl = document.getElementById("demo-service-data");
    if (dataEl) {
      let all = null;
      try {
        all = JSON.parse(dataEl.textContent);
      } catch (err) {
        console.error("Eventora: demo service data could not be parsed", err);
      }

      if (all) {
        const wanted = Number(new URLSearchParams(window.location.search).get("service_id"));
        const svc = all.services.find((s) => s.service_id === wanted) || all.services[0];

        if (wanted && !all.services.some((s) => s.service_id === wanted)) {
          // TODO(backend): PHP returns 404 if the service does not exist, or
          // does not belong to the signed-in vendor.
          const notice = document.querySelector("[data-svc-notfound]");
          if (notice) notice.hidden = false;
        }

        const set = (name, value) => {
          const field = form.querySelector(`[name="${name}"]`);
          if (field) field.value = value;
        };
        set("title", svc.title);
        set("category_id", svc.category_slug);
        set("description", svc.description);
        set("base_price", svc.base_price);
        set("capacity", svc.capacity || "");

        const avail = form.querySelector("[name='is_available']");
        if (avail) avail.checked = Boolean(svc.is_available);

        const idField = form.querySelector("[name='service_id']");
        if (idField) idField.value = svc.service_id;

        document.querySelectorAll("[data-svc-id]").forEach((el) => {
          el.textContent = svc.service_id;
        });
        document.title = `Edit ${svc.title} | Eventora Vendor`;
      }
    }
  }

  // ---- live preview -------------------------------------------------------
  function updatePreview() {
    const money = (v) => "Rs. " + Number(v).toLocaleString("en-PK");
    const put = (key, value) => {
      const cell = document.querySelector(`[data-preview="${key}"]`);
      if (!cell) return;
      const empty = !value;
      cell.textContent = empty ? "Not set" : value;
      cell.classList.toggle("empty", empty);
    };

    const get = (n) => form.querySelector(`[name="${n}"]`);
    put("title", get("title")?.value.trim());

    const cat = get("category_id");
    put("category", cat && cat.value ? cat.selectedOptions[0].text : "");

    const price = Number(get("base_price")?.value);
    put("price", price > 0 ? money(price) : "");

    const cap = Number(get("capacity")?.value);
    put("capacity", cap > 0 ? `Up to ${cap.toLocaleString("en-PK")}` : "Not applicable");

    const avail = get("is_available");
    put("availability", avail && avail.checked ? "Available" : "Unavailable");
  }

  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  updatePreview();

  bindFieldFeedback(form);

  // Numeric rules that the shared validator does not cover
  function extrasPass(field) {
    const value = (field.value || "").trim();
    if (!value) return true;
    const n = Number(value);
    if (field.dataset.rule === "positive-amount") return Number.isFinite(n) && n > 0;
    if (field.dataset.rule === "non-negative-int") {
      return Number.isFinite(n) && n >= 0 && Number.isInteger(n);
    }
    return true;
  }

  function runExtras() {
    let ok = true;
    form.querySelectorAll("[data-rule]").forEach((field) => {
      const group = field.closest(".form-group");
      // An empty required field is the shared validator's business; clearing
      // its error here would hide it (the create-event bug).
      const missing = field.required && !field.value.trim();
      const pass = !missing && extrasPass(field);
      if (group) {
        if (!pass) {
          group.classList.add("has-error");
          group.classList.remove("is-valid");
        } else if (field.value.trim()) {
          group.classList.remove("has-error");
          group.classList.add("is-valid");
        }
      }
      if (!pass) ok = false;
    });
    return ok;
  }

  form.querySelectorAll("[data-rule]").forEach((field) => {
    field.addEventListener("input", () => {
      const group = field.closest(".form-group");
      if (group && extrasPass(field)) group.classList.remove("has-error");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const { valid, firstInvalid } = validateForm(form, { markValid: true });
    const extrasOk = runExtras();

    if (!valid || !extrasOk) {
      const target = firstInvalid || form.querySelector(".form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea");
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.classList.add("is-loading");
      button.disabled = true;
    }

    // TODO(backend):
    //   add  -> INSERT INTO services
    //             (vendor_id, category_id, title, description, base_price,
    //              capacity, image_url, is_available)
    //           VALUES (:vendor_id, ...)
    //   edit -> UPDATE services SET ... WHERE service_id = :service_id
    //             AND vendor_id = :vendor_id
    //   vendor_id comes from the session via vendor_profiles — never users.id.
    //   category_id is resolved from the slug against categories WHERE is_active = 1.
    const payload = Object.fromEntries(new FormData(form).entries());
    console.log(`Eventora ${isEdit ? "edit" : "add"}-service submission:`, payload);

    setTimeout(() => {
      if (button) {
        button.classList.remove("is-loading");
        button.disabled = false;
      }
      showFormFeedback(
        form,
        isEdit
          ? "Demo mode — your changes passed validation but were not saved. " +
            "Service editing is not connected to a database yet."
          : "Demo mode — the service passed validation but was not created. " +
            "Service creation is not connected to a database yet.",
        "is-demo",
        "bi-info-circle-fill"
      );
    }, 1100);
  });
}

/* --------------------------------------------------------------------------
   Vendor booking requests — vendor/booking-requests.html.

   The only place in the whole platform where a booking changes status by
   vendor action, so the legal transitions live in one table here rather than
   being implied by which buttons happen to be rendered:

       pending  -> accepted | rejected
       accepted -> completed
       rejected  terminal
       completed terminal
       cancelled terminal

   Anything not in that table is refused, even if a button were somehow
   clicked. Accept and Reject both confirm first — a vendor rejecting by
   mistake cannot undo it.
   -------------------------------------------------------------------------- */
const BOOKING_TRANSITIONS = {
  pending: ["accepted", "rejected"],
  accepted: ["completed"],
  rejected: [],
  completed: [],
  cancelled: [],
};

function initBookingRequests() {
  const root = document.querySelector("[data-booking-requests]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".br-card"));
  const pills = Array.from(root.querySelectorAll("[data-br-filter]"));
  const search = root.querySelector("[data-br-search]");
  const countEl = root.querySelector("[data-br-count]");
  const emptyEl = root.querySelector("[data-br-empty]");
  const listEl = root.querySelector(".br-list");
  const modal = document.querySelector("[data-confirm-modal]");

  let filter = "all";
  let pendingAction = null;

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const statusOk = filter === "all" || card.dataset.status === filter;
      const hay = [card.dataset.ref, card.dataset.client, card.dataset.event, card.dataset.service]
        .join(" ")
        .toLowerCase();
      const termOk = !term || hay.includes(term);
      const show = statusOk && termOk;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      const pending = cards.filter((c) => c.dataset.status === "pending").length;
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} requests · ${pending} awaiting your response`
          : `${visible} of ${cards.length} requests`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (listEl) listEl.hidden = visible === 0;
  }

  /** Repaint a card for its new status and render only the legal actions. */
  function render(card, status) {
    card.dataset.status = status;
    card.classList.toggle("is-pending", status === "pending");

    const badge = card.querySelector(".booking-status");
    if (badge) {
      badge.className = `booking-status ${status}`;
      badge.textContent = status;
    }

    const actions = card.querySelector(".br-actions");
    if (!actions) return;

    const ref = card.dataset.ref;
    const detail = `<a href="../client/booking-detail.html?booking_id=${card.dataset.bookingId}" class="btn-eventora btn-ghost">View Details</a>`;

    const NOTE = {
      rejected: "You rejected this request. Rejection is final.",
      cancelled: "The client cancelled this booking.",
      completed: "Service delivered. The client can now leave a review.",
    };

    if (status === "pending") {
      actions.innerHTML =
        detail +
        `<button type="button" class="btn-eventora btn-reject" data-br-action="rejected" data-ref="${ref}">Reject</button>` +
        `<button type="button" class="btn-eventora btn-accept" data-br-action="accepted" data-ref="${ref}">Accept</button>`;
    } else if (status === "accepted") {
      actions.innerHTML =
        detail +
        `<button type="button" class="btn-eventora btn-primary" data-br-action="completed" data-ref="${ref}">Mark Completed</button>`;
    } else {
      actions.innerHTML = detail + `<span class="br-terminal-note">${NOTE[status] || ""}</span>`;
    }
  }

  // ---- confirmation modal --------------------------------------------------
  function openConfirm(card, next) {
    if (!modal) return;
    pendingAction = { card, next };

    const COPY = {
      accepted: ["accept", "bi-check2-circle", "accept",
        "Accept this booking request?",
        "The client is told immediately and can then pay for this booking. You are committing to deliver the service on the event date."],
      rejected: ["reject", "bi-x-circle", "reject",
        "Reject this booking request?",
        "The client is told immediately and will look for another vendor. This cannot be undone — a rejected booking is a terminal state."],
      completed: ["accept", "bi-patch-check", "accept",
        "Mark this booking as completed?",
        "Confirm the service has been delivered. The client can then leave a review, and this booking counts towards your earnings."],
    }[next];

    modal.querySelector("[data-confirm-icon]").className = `confirm-icon ${COPY[0]}`;
    modal.querySelector("[data-confirm-icon] i").className = `bi ${COPY[1]}`;
    modal.querySelector("[data-confirm-title]").textContent = COPY[3];
    modal.querySelector("[data-confirm-text]").textContent = COPY[4];
    modal.querySelector("[data-confirm-ref]").textContent = card.dataset.ref;
    modal.querySelector("[data-confirm-client]").textContent = card.dataset.client;
    modal.querySelector("[data-confirm-service]").textContent = card.dataset.service;

    const go = modal.querySelector("[data-confirm-go]");
    go.className = `btn-eventora ${next === "rejected" ? "btn-reject" : "btn-accept"}`;
    go.textContent = next === "rejected" ? "Yes, reject" : next === "completed" ? "Yes, mark completed" : "Yes, accept";

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    go.focus();
  }

  function closeConfirm() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    pendingAction = null;
  }

  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-br-action]");
    if (!btn) return;
    const card = btn.closest(".br-card");
    if (!card) return;

    const current = card.dataset.status;
    const next = btn.dataset.brAction;

    // Refuse anything the state machine does not allow, whatever was clicked.
    if (!(BOOKING_TRANSITIONS[current] || []).includes(next)) {
      console.warn(`Eventora: refused illegal transition ${current} -> ${next}`);
      return;
    }
    openConfirm(card, next);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-confirm-cancel]") || event.target.matches(".modal-veil")) {
        closeConfirm();
        return;
      }
      if (!event.target.closest("[data-confirm-go]") || !pendingAction) return;

      const { card, next } = pendingAction;
      // Re-check at the point of action, not only when the button was drawn.
      if (!(BOOKING_TRANSITIONS[card.dataset.status] || []).includes(next)) {
        closeConfirm();
        return;
      }

      // TODO(backend):
      //   FUTURE PHP: POST /api/vendor/booking/accept.php  { booking_id }
      //   FUTURE PHP: POST /api/vendor/booking/reject.php  { booking_id }
      //   FUTURE PHP: POST /api/vendor/booking/complete.php { booking_id }
      //   Each runs UPDATE bookings SET status = :next
      //             WHERE booking_id = :id AND vendor_id = :vendor_id
      //               AND status = :expected_current
      //   The status guard is what stops two tabs, or a stale page, from
      //   applying an illegal transition. The row is never deleted.
      //   On accept, a commissions row is written with the rate snapshotted.
      render(card, next);
      closeConfirm();
      apply();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeConfirm();
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filter = pill.dataset.brFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  cards.forEach((card) => render(card, card.dataset.status));
  apply();
}

/* --------------------------------------------------------------------------
   Vendor calendar — vendor/calendar.html.

   Renders a month grid from the bookings embedded in the page. Rejected and
   cancelled bookings are excluded upstream: they are not commitments and must
   not read as occupied dates. Pending IS shown, but dashed and labelled
   unconfirmed, so an unanswered request never looks like confirmed work.
   -------------------------------------------------------------------------- */
function initVendorCalendar() {
  const root = document.querySelector("[data-vendor-calendar]");
  if (!root) return;

  const dataEl = document.getElementById("demo-calendar-data");
  if (!dataEl) return;

  let entries = [];
  try {
    entries = JSON.parse(dataEl.textContent).entries;
  } catch (err) {
    console.error("Eventora: calendar data could not be parsed", err);
    return;
  }

  const MONTHS = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const grid = root.querySelector("[data-cal-grid]");
  const title = root.querySelector("[data-cal-title]");
  const dayPanel = root.querySelector("[data-cal-day]");
  const monthCount = root.querySelector("[data-cal-month-count]");

  const byDate = {};
  entries.forEach((e) => {
    (byDate[e.date] = byDate[e.date] || []).push(e);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Open on a month that actually contains something, so the calendar does not
  // greet the vendor with an empty grid.
  const start = root.dataset.startMonth || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  let view = new Date(Number(start.slice(0, 4)), Number(start.slice(5, 7)) - 1, 1);
  let selected = null;

  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const esc = (t) =>
    String(t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function renderDay(dateStr) {
    if (!dayPanel) return;
    const list = byDate[dateStr] || [];
    const d = new Date(dateStr + "T00:00:00");
    const heading = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

    if (!list.length) {
      dayPanel.innerHTML =
        `<div class="dash-section-head"><h2>${heading}</h2></div>` +
        `<p class="panel-note">Nothing booked on this day.</p>`;
      return;
    }

    dayPanel.innerHTML =
      `<div class="dash-section-head"><h2>${heading}</h2>` +
      `<span class="rv-meta">${list.length} booking${list.length === 1 ? "" : "s"}</span></div>` +
      list
        .map(
          (e) => `<div class="agenda-item">
            <div class="a-body">
              <p class="a-title">${esc(e.event)}</p>
              <p class="a-meta">${esc(e.service)}<span class="sep"> · </span>${esc(e.client)}
                <span class="sep"> · </span>${e.ref}</p>
              <p class="a-meta mt-1"><span class="booking-status ${e.status}">${e.status}</span></p>
            </div>
          </div>`
        )
        .join("");
  }

  function render() {
    const y = view.getFullYear();
    const m = view.getMonth();
    if (title) title.textContent = `${MONTHS[m]} ${y}`;

    // Monday-first week, which is the local convention
    const first = new Date(y, m, 1);
    let offset = first.getDay() - 1;
    if (offset < 0) offset = 6;

    const cells = [];
    const cursor = new Date(y, m, 1 - offset);
    let inMonth = 0;

    for (let i = 0; i < 42; i += 1) {
      const dateStr = iso(cursor);
      const outside = cursor.getMonth() !== m;
      const list = byDate[dateStr] || [];
      if (!outside) inMonth += list.length;

      const shown = list.slice(0, 2);
      const extra = list.length - shown.length;

      cells.push(
        `<div class="cal-cell${outside ? " is-outside" : ""}` +
          `${dateStr === iso(today) ? " is-today" : ""}` +
          `${dateStr === selected ? " is-selected" : ""}"` +
          ` data-date="${dateStr}"${outside ? "" : ' tabindex="0" role="button"'}` +
          ` aria-label="${cursor.getDate()} ${SHORT[cursor.getMonth()]}, ${list.length} bookings">` +
          `<span class="day-num">${cursor.getDate()}</span>` +
          shown
            .map((e) => `<span class="cal-entry ${e.status}" title="${esc(e.event)} — ${esc(e.service)}">${esc(e.event)}</span>`)
            .join("") +
          (extra > 0 ? `<span class="cal-more">+${extra} more</span>` : "") +
          `</div>`
      );
      cursor.setDate(cursor.getDate() + 1);
    }

    if (grid) grid.innerHTML = cells.join("");
    if (monthCount) {
      monthCount.textContent = inMonth
        ? `${inMonth} booking${inMonth === 1 ? "" : "s"} this month`
        : "Nothing booked this month";
    }
  }

  root.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-cal-nav]");
    if (nav) {
      const step = nav.dataset.calNav;
      if (step === "today") {
        view = new Date(today.getFullYear(), today.getMonth(), 1);
      } else {
        view.setMonth(view.getMonth() + Number(step));
      }
      render();
      return;
    }

    const cell = event.target.closest(".cal-cell:not(.is-outside)");
    if (cell) {
      selected = cell.dataset.date;
      render();
      renderDay(selected);
    }
  });

  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const cell = event.target.closest(".cal-cell:not(.is-outside)");
    if (!cell) return;
    event.preventDefault();
    selected = cell.dataset.date;
    render();
    renderDay(selected);
  });

  render();
}

/* --------------------------------------------------------------------------
   Vendor reviews — vendor/reviews.html.

   Filters by rating and searches across client, service, event and text.
   Reviews exist only for completed bookings (reviews.booking_id is UNIQUE),
   so there is no "write" path here — a vendor reads reviews, never authors
   them.
   -------------------------------------------------------------------------- */
function initVendorReviews() {
  const root = document.querySelector("[data-vendor-reviews]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".vr-card"));
  const pills = Array.from(root.querySelectorAll("[data-vr-filter]"));
  const search = root.querySelector("[data-vr-search]");
  const countEl = root.querySelector("[data-vr-count]");
  const emptyEl = root.querySelector("[data-vr-empty]");
  const listEl = root.querySelector("[data-vr-list]");

  let rating = "all";

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const ratingOk = rating === "all" || card.dataset.rating === rating;
      const hay = [card.dataset.client, card.dataset.service, card.dataset.event, card.textContent]
        .join(" ")
        .toLowerCase();
      const termOk = !term || hay.includes(term);
      const show = ratingOk && termOk;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} reviews`
          : `${visible} of ${cards.length} reviews`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (listEl) listEl.hidden = visible === 0;
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      rating = pill.dataset.vrFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  apply();
}

/* --------------------------------------------------------------------------
   Vendor approval — admin/vendor-approval.html.

   The ONLY place vendor_profiles.is_verified may change. Two fields are in
   play and they are deliberately not merged:

       is_verified  documents approved by an admin  (this page)
       status       whether the account may trade   (admin/users.html)

   Approving documents does not unblock a blocked account, and rejecting
   documents does not block an account. Keeping them apart is why a verified
   vendor can still be suspended.

   Transitions here: pending -> verified | rejected. Both are confirmed first,
   because an approval publishes a business to the public marketplace.
   -------------------------------------------------------------------------- */
function initVendorApproval() {
  const root = document.querySelector("[data-vendor-approval]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".ad-approval"));
  const pills = Array.from(root.querySelectorAll("[data-ap-filter]"));
  const search = root.querySelector("[data-ap-search]");
  const countEl = root.querySelector("[data-ap-count]");
  const emptyEl = root.querySelector("[data-ap-empty]");
  const listEl = root.querySelector("[data-ap-list]");
  const modal = document.querySelector("[data-approve-modal]");

  const LEGAL = { pending: ["verified", "rejected"], verified: [], rejected: [] };
  let filter = "all";
  let queued = null;

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const stateOk = filter === "all" || card.dataset.state === filter;
      const hay = [card.dataset.business, card.dataset.city, card.dataset.category]
        .join(" ")
        .toLowerCase();
      const termOk = !term || hay.includes(term);
      const show = stateOk && termOk;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      const pending = cards.filter((c) => c.dataset.state === "pending").length;
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} vendors · ${pending} awaiting review`
          : `${visible} of ${cards.length} vendors`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (listEl) listEl.hidden = visible === 0;
  }

  function render(card, state) {
    card.dataset.state = state;
    card.classList.toggle("is-pending", state === "pending");

    const badge = card.querySelector("[data-ap-badge]");
    if (badge) {
      const map = {
        pending: ["verify-badge unverified", "bi-hourglass-split", "Awaiting verification"],
        verified: ["verify-badge verified", "bi-patch-check-fill", "Verified"],
        rejected: ["verify-badge unverified", "bi-x-circle", "Documents rejected"],
      }[state];
      badge.className = map[0];
      badge.innerHTML = `<i class="bi ${map[1]}" aria-hidden="true"></i> ${map[2]}`;
    }

    const actions = card.querySelector(".ad-approval-actions");
    if (!actions) return;

    if (state === "pending") {
      actions.innerHTML =
        `<button type="button" class="btn-eventora btn-reject" data-ap-action="rejected">Reject Documents</button>` +
        `<button type="button" class="btn-eventora btn-accept" data-ap-action="verified">Approve &amp; Publish</button>`;
    } else {
      const note =
        state === "verified"
          ? "Approved — this vendor is now listed in the public marketplace."
          : "Documents rejected. The vendor can revise and resubmit.";
      actions.innerHTML = `<span class="ap-outcome">${note}</span>`;
    }
  }

  function openConfirm(card, next) {
    if (!modal) return;
    queued = { card, next };
    const copy =
      next === "verified"
        ? ["accept", "bi-patch-check",
           "Approve this vendor?",
           "Their profile and services become publicly visible in the marketplace immediately, and clients can start sending booking requests. This sets vendor_profiles.is_verified only — it does not change the account status."]
        : ["reject", "bi-x-circle",
           "Reject these documents?",
           "The vendor is told and can revise and resubmit. Their profile stays hidden from the marketplace. This does not block or delete the account."];

    modal.querySelector("[data-ap-icon]").className = `confirm-icon ${copy[0]}`;
    modal.querySelector("[data-ap-icon] i").className = `bi ${copy[1]}`;
    modal.querySelector("[data-ap-title]").textContent = copy[2];
    modal.querySelector("[data-ap-text]").textContent = copy[3];
    modal.querySelector("[data-ap-name]").textContent = card.dataset.business;
    modal.querySelector("[data-ap-detail]").textContent =
      `${card.dataset.category} · ${card.dataset.city}`;

    const go = modal.querySelector("[data-ap-go]");
    go.className = `btn-eventora ${next === "rejected" ? "btn-reject" : "btn-accept"}`;
    go.textContent = next === "rejected" ? "Yes, reject" : "Yes, approve";

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    go.focus();
  }

  function closeConfirm() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    queued = null;
  }

  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-ap-action]");
    if (!btn) return;
    const card = btn.closest(".ad-approval");
    if (!card) return;
    if (!(LEGAL[card.dataset.state] || []).includes(btn.dataset.apAction)) {
      console.warn(`Eventora: refused illegal verification change ${card.dataset.state} -> ${btn.dataset.apAction}`);
      return;
    }
    openConfirm(card, btn.dataset.apAction);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-ap-cancel]") || event.target.matches(".modal-veil")) {
        closeConfirm();
        return;
      }
      if (!event.target.closest("[data-ap-go]") || !queued) return;
      const { card, next } = queued;
      if (!(LEGAL[card.dataset.state] || []).includes(next)) {
        closeConfirm();
        return;
      }
      // TODO(backend): POST /api/admin/verify-vendor.php { vendor_id, decision }
      //   UPDATE vendor_profiles SET is_verified = :flag WHERE vendor_id = :id
      //   and record the outcome against vendor_documents (reviewed_by,
      //   reviewed_at, status, remarks). Only an admin session may call this.
      //   vendor_profiles.status is NOT touched here — blocking is a separate
      //   action on admin/users.html.
      render(card, next);
      closeConfirm();
      apply();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeConfirm();
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filter = pill.dataset.apFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  cards.forEach((card) => render(card, card.dataset.state));
  apply();
}

/* --------------------------------------------------------------------------
   Admin users — admin/users.html.

   Blocking sets users.status = 'blocked'. It is never a delete: bookings,
   payments, commissions and reviews hold foreign keys to users with
   ON DELETE RESTRICT, so the row must survive. The admin's own account cannot
   be blocked from here — locking yourself out of the only admin account is
   unrecoverable, there being no public admin signup.
   -------------------------------------------------------------------------- */
function initAdminUsers() {
  const root = document.querySelector("[data-admin-users]");
  if (!root) return;

  const rows = Array.from(root.querySelectorAll("[data-user-row]"));
  const pills = Array.from(root.querySelectorAll("[data-user-filter]"));
  const search = root.querySelector("[data-user-search]");
  const countEl = root.querySelector("[data-user-count]");
  const emptyEl = root.querySelector("[data-user-empty]");
  const tableEl = root.querySelector("[data-user-table]");

  let role = "all";

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    rows.forEach((row) => {
      const roleOk =
        role === "all" ||
        (role === "blocked" ? row.dataset.status === "blocked" : row.dataset.role === role);
      const hay = [row.dataset.name, row.dataset.role, row.dataset.city].join(" ").toLowerCase();
      const termOk = !term || hay.includes(term);
      const show = roleOk && termOk;
      row.hidden = !show;
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === rows.length ? `${rows.length} accounts` : `${visible} of ${rows.length} accounts`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (tableEl) tableEl.hidden = visible === 0;
  }

  function setStatus(row, status) {
    row.dataset.status = status;
    const badge = row.querySelector("[data-user-status]");
    if (badge) {
      badge.className = `account-status ${status}`;
      badge.textContent = status;
    }
    const btn = row.querySelector("[data-user-toggle]");
    if (btn) {
      btn.textContent = status === "blocked" ? "Unblock" : "Block";
      btn.className = `link-action ${status === "blocked" ? "" : "is-danger"}`.trim();
    }
  }

  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-user-toggle]");
    if (!btn) return;
    const row = btn.closest("[data-user-row]");
    if (!row) return;

    // Guard, not just a hidden button: the seeded admin is the only way back in.
    if (row.dataset.role === "admin") {
      window.alert(
        "The administrator account cannot be blocked.\n\n" +
          "There is no public signup path for admins, so blocking the only admin " +
          "account would lock everyone out of the platform permanently."
      );
      return;
    }

    const next = row.dataset.status === "blocked" ? "active" : "blocked";
    // TODO(backend): POST /api/admin/user-status.php { user_id, status }
    //   UPDATE users SET status = :status WHERE id = :user_id AND role <> 'admin'
    //   Never DELETE. Blocking a vendor should also hide their listings, but it
    //   does NOT change vendor_profiles.is_verified — verification is a separate
    //   field decided on admin/vendor-approval.html.
    window.alert(
      `Demo mode — ${row.dataset.name} was not ${next === "blocked" ? "blocked" : "unblocked"}.\n\n` +
        "User management is not connected to a database yet. When it is, this will set " +
        "users.status and never delete the account, because bookings, payments, " +
        "commissions and reviews reference it."
    );
    setStatus(row, next);
    apply();
  });

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      role = pill.dataset.userFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  apply();
}

/* --------------------------------------------------------------------------
   Admin categories — admin/categories.html.

   Categories are SOFT-deactivated, never deleted. services.category_id uses
   ON DELETE RESTRICT, so a category with dependent services cannot be removed
   from the database at all — the admin is therefore never offered a delete
   control for normal management.

   Deactivating hides a category from public filters and from new-service
   creation. Existing services keep their category, stay intact and stay
   bookable. Vendors are never silently delisted.
   -------------------------------------------------------------------------- */
function initAdminCategories() {
  const root = document.querySelector("[data-admin-categories]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".cat-card"));
  const pills = Array.from(root.querySelectorAll("[data-cat-filter]"));
  const search = root.querySelector("[data-cat-search]");
  const countEl = root.querySelector("[data-cat-count]");
  const emptyEl = root.querySelector("[data-cat-empty]");
  const gridEl = root.querySelector(".cat-grid");
  const modal = document.querySelector("[data-cat-modal]");

  const statActive = root.querySelector("[data-stat-active]");
  const statInactive = root.querySelector("[data-stat-inactive]");

  let filter = "all";
  let queued = null;

  function refreshCounts() {
    const active = cards.filter((c) => c.dataset.state === "active").length;
    if (statActive) statActive.textContent = String(active);
    if (statInactive) statInactive.textContent = String(cards.length - active);
  }

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const stateOk = filter === "all" || card.dataset.state === filter;
      const hay = [card.dataset.name, card.dataset.slug, card.dataset.description]
        .join(" ")
        .toLowerCase();
      const termOk = !term || hay.includes(term);
      const show = stateOk && termOk;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} categories`
          : `${visible} of ${cards.length} categories`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (gridEl) gridEl.hidden = visible === 0;
    refreshCounts();
  }

  function render(card, state) {
    card.dataset.state = state;
    const inactive = state === "inactive";
    card.classList.toggle("is-inactive", inactive);

    const badge = card.querySelector("[data-cat-badge]");
    if (badge) {
      badge.className = `cat-state ${state}`;
      badge.textContent = state;
    }

    const warn = card.querySelector("[data-cat-warning]");
    if (warn) warn.hidden = !inactive;

    const toggle = card.querySelector("[data-cat-toggle]");
    if (toggle) {
      toggle.textContent = inactive ? "Activate" : "Deactivate";
      toggle.dataset.catToggle = inactive ? "active" : "inactive";
      toggle.className = `btn-eventora ${inactive ? "btn-accept" : "btn-outline-gold"}`;
    }
  }

  function openConfirm(card, next) {
    if (!modal) return;
    queued = { card, next };
    const services = card.dataset.services;
    const deactivating = next === "inactive";

    modal.querySelector("[data-cat-icon]").className =
      `confirm-icon ${deactivating ? "reject" : "accept"}`;
    modal.querySelector("[data-cat-icon] i").className =
      `bi ${deactivating ? "bi-eye-slash" : "bi-check2-circle"}`;
    modal.querySelector("[data-cat-title]").textContent =
      deactivating ? "Deactivate this category?" : "Activate this category?";
    modal.querySelector("[data-cat-text]").textContent = deactivating
      ? `It disappears from public category filters and cannot be chosen for new services. Its ${services} existing services stay intact, keep this category and remain bookable — no vendor is delisted. This is reversible.`
      : "It reappears in public category filters and can be chosen for new services again.";
    modal.querySelector("[data-cat-name]").textContent = card.dataset.name;
    modal.querySelector("[data-cat-detail]").textContent =
      `${card.dataset.slug} · ${services} services · ${card.dataset.vendors} vendors`;

    const go = modal.querySelector("[data-cat-go]");
    go.className = `btn-eventora ${deactivating ? "btn-outline-gold" : "btn-accept"}`;
    go.textContent = deactivating ? "Yes, deactivate" : "Yes, activate";

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    go.focus();
  }

  function closeConfirm() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    queued = null;
  }

  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-cat-toggle]");
    if (!btn) return;
    const card = btn.closest(".cat-card");
    if (!card) return;
    const next = btn.dataset.catToggle;
    // is_active is boolean: the only legal moves are active<->inactive, and
    // the target must differ from the current state.
    if (!["active", "inactive"].includes(next) || next === card.dataset.state) {
      console.warn(`Eventora: refused illegal category state change ${card.dataset.state} -> ${next}`);
      return;
    }
    openConfirm(card, next);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-cat-cancel]") || event.target.matches(".modal-veil")) {
        closeConfirm();
        return;
      }
      if (!event.target.closest("[data-cat-go]") || !queued) return;
      const { card, next } = queued;
      if (next === card.dataset.state) {
        closeConfirm();
        return;
      }
      // TODO(backend): POST /api/admin/category-state.php { category_id, is_active }
      //   UPDATE categories SET is_active = :flag WHERE id = :id
      //   There is deliberately no DELETE endpoint: services.category_id is
      //   ON DELETE RESTRICT, so removing a category with services is refused
      //   by the database anyway. Deactivation is the supported operation.
      render(card, next);
      closeConfirm();
      apply();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeConfirm();
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filter = pill.dataset.catFilter;
      pills.forEach((p) => {
        const on = p === pill;
        p.classList.toggle("is-active", on);
        p.setAttribute("aria-pressed", String(on));
      });
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }

  cards.forEach((card) => render(card, card.dataset.state));
  apply();
}

/* --------------------------------------------------------------------------
   Admin data tables — admin/bookings.html and admin/payments.html.

   One module drives both: multi-field filtering over table rows, with a live
   total that recomputes from the VISIBLE rows only. Filter fields are declared
   in the markup via data-adt-filter="<dataset key>", so adding a filter needs
   no JavaScript change.

   Totals are summed from the rows on screen rather than hardcoded, so a
   filtered view always reconciles with what the admin can see.
   -------------------------------------------------------------------------- */
function initAdminTable() {
  const root = document.querySelector("[data-admin-table]");
  if (!root) return;

  const rows = Array.from(root.querySelectorAll("[data-adt-row]"));
  const controls = Array.from(root.querySelectorAll("[data-adt-filter]"));
  const search = root.querySelector("[data-adt-search]");
  const reset = root.querySelector("[data-adt-reset]");
  const countEl = root.querySelector("[data-adt-count]");
  const emptyEl = root.querySelector("[data-adt-empty]");
  const wrapEl = root.querySelector("[data-adt-wrap]");

  const money = (v) => "Rs. " + Number(v).toLocaleString("en-PK");

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    const totals = { amount: 0, commission: 0, net: 0 };

    rows.forEach((row) => {
      let show = true;

      controls.forEach((control) => {
        if (!show) return;
        const key = control.dataset.adtFilter;
        const want = control.value;
        if (want && row.dataset[key] !== want) show = false;
      });

      if (show && term) {
        show = (row.dataset.search || row.textContent).toLowerCase().includes(term);
      }

      row.hidden = !show;
      if (!show) return;

      visible += 1;
      totals.amount += Number(row.dataset.amount) || 0;
      totals.commission += Number(row.dataset.commission) || 0;
      totals.net += Number(row.dataset.net) || 0;
    });

    if (countEl) {
      countEl.textContent =
        visible === rows.length ? `${rows.length} records` : `${visible} of ${rows.length} records`;
    }

    // Live totals reflect the filtered view, so what is summed is what is shown.
    root.querySelectorAll("[data-adt-total]").forEach((cell) => {
      const key = cell.dataset.adtTotal;
      if (key === "count") cell.textContent = String(visible);
      else cell.textContent = money(totals[key] || 0);
    });

    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (wrapEl) wrapEl.hidden = visible === 0;
  }

  controls.forEach((c) => c.addEventListener("change", apply));
  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }
  if (reset) {
    reset.addEventListener("click", () => {
      controls.forEach((c) => {
        c.value = "";
      });
      if (search) search.value = "";
      apply();
    });
  }

  apply();
}

/* --------------------------------------------------------------------------
   Admin vendors — admin/vendors.html.

   TWO INDEPENDENT STATE MACHINES on the same row. This is the whole point of
   the page, and merging them would be a data-model error:

     verification (vendor_profiles.is_verified)
        pending  -> verified | rejected
        verified -> rejected            (an admin may revoke)
        rejected -> verified            (vendor resubmitted and passed)

     account status (vendor_profiles.status / users.status)
        pending -> active | blocked
        active  -> blocked
        blocked -> active

   Approving documents does NOT unblock an account. Blocking an account does
   NOT revoke verification. A verified vendor can still be blocked.

   Both machines are checked when the control is offered AND again when the
   action is confirmed, so an injected button cannot force an illegal move.
   -------------------------------------------------------------------------- */
const VERIFY_TRANSITIONS = {
  pending: ["verified", "rejected"],
  verified: ["rejected"],
  rejected: ["verified"],
};

const ACCOUNT_TRANSITIONS = {
  pending: ["active", "blocked"],
  active: ["blocked"],
  blocked: ["active"],
};

function initAdminVendors() {
  const root = document.querySelector("[data-admin-vendors]");
  if (!root) return;

  const rows = Array.from(root.querySelectorAll("[data-vm-row]"));
  const controls = Array.from(root.querySelectorAll("[data-vm-filter]"));
  const search = root.querySelector("[data-vm-search]");
  const reset = root.querySelector("[data-vm-reset]");
  const countEl = root.querySelector("[data-vm-count]");
  const emptyEl = root.querySelector("[data-vm-empty]");
  const wrapEl = root.querySelector("[data-vm-wrap]");
  const modal = document.querySelector("[data-vm-modal]");

  const statVerified = root.querySelector("[data-stat-verified]");
  const statPending = root.querySelector("[data-stat-pending]");
  const statBlocked = root.querySelector("[data-stat-blocked]");

  let queued = null;

  function refreshStats() {
    if (statVerified) {
      statVerified.textContent = String(rows.filter((r) => r.dataset.verify === "verified").length);
    }
    if (statPending) {
      statPending.textContent = String(rows.filter((r) => r.dataset.verify === "pending").length);
    }
    if (statBlocked) {
      statBlocked.textContent = String(rows.filter((r) => r.dataset.account === "blocked").length);
    }
  }

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    rows.forEach((row) => {
      let show = true;
      controls.forEach((control) => {
        if (!show) return;
        const want = control.value;
        if (want && row.dataset[control.dataset.vmFilter] !== want) show = false;
      });
      if (show && term) {
        show = (row.dataset.search || row.textContent).toLowerCase().includes(term);
      }
      row.hidden = !show;
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === rows.length ? `${rows.length} vendors` : `${visible} of ${rows.length} vendors`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (wrapEl) wrapEl.hidden = visible === 0;
    refreshStats();
  }

  function render(row) {
    const verify = row.dataset.verify;
    const account = row.dataset.account;

    const vb = row.querySelector("[data-vm-verify-badge]");
    if (vb) {
      const map = {
        pending: ["verify-badge unverified", "bi-hourglass-split", "Awaiting"],
        verified: ["verify-badge verified", "bi-patch-check-fill", "Verified"],
        rejected: ["verify-badge unverified", "bi-x-circle", "Rejected"],
      }[verify];
      vb.className = map[0];
      vb.innerHTML = `<i class="bi ${map[1]}" aria-hidden="true"></i> ${map[2]}`;
    }

    const ab = row.querySelector("[data-vm-account-badge]");
    if (ab) {
      ab.className = `vendor-account-status ${account}`;
      ab.textContent = account;
    }

    const cell = row.querySelector(".vm-actions");
    if (!cell) return;

    const parts = [`<a href="../pages/vendor-detail.html?vendor_id=${row.dataset.vendorId}" class="link-action">View</a>`];

    // Verification controls, from VERIFY_TRANSITIONS
    if (VERIFY_TRANSITIONS[verify].includes("verified")) {
      parts.push(`<a href="#" class="link-action is-good" data-vm-action="verify:verified">Approve</a>`);
    }
    if (VERIFY_TRANSITIONS[verify].includes("rejected")) {
      parts.push(`<a href="#" class="link-action is-danger" data-vm-action="verify:rejected">Reject</a>`);
    }
    // Account controls, from ACCOUNT_TRANSITIONS
    if (ACCOUNT_TRANSITIONS[account].includes("blocked")) {
      parts.push(`<a href="#" class="link-action is-danger" data-vm-action="account:blocked">Block</a>`);
    }
    if (ACCOUNT_TRANSITIONS[account].includes("active")) {
      parts.push(`<a href="#" class="link-action is-good" data-vm-action="account:active">Unblock</a>`);
    }

    cell.innerHTML = parts.join("");
  }

  function legal(row, axis, next) {
    const current = axis === "verify" ? row.dataset.verify : row.dataset.account;
    const table = axis === "verify" ? VERIFY_TRANSITIONS : ACCOUNT_TRANSITIONS;
    return (table[current] || []).includes(next);
  }

  const COPY = {
    "verify:verified": ["accept", "bi-patch-check", "Approve this vendor's documents?",
      "The profile and its services become publicly visible and clients can send booking requests. This sets is_verified only — it does not change the account status."],
    "verify:rejected": ["reject", "bi-x-circle", "Reject this vendor's documents?",
      "The profile stays hidden from the marketplace and the vendor can revise and resubmit. This does not block or delete the account."],
    "account:blocked": ["reject", "bi-slash-circle", "Block this vendor account?",
      "They can no longer sign in and their listings are hidden. Nothing is deleted — bookings, payments, commissions and reviews all reference this account and are preserved. Verification is unchanged."],
    "account:active": ["accept", "bi-check2-circle", "Unblock this vendor account?",
      "They can sign in again. If their documents are verified, their listings return to the marketplace."],
  };

  function openConfirm(row, axis, next) {
    if (!modal) return;
    queued = { row, axis, next };
    const c = COPY[`${axis}:${next}`];

    modal.querySelector("[data-vm-icon]").className = `confirm-icon ${c[0]}`;
    modal.querySelector("[data-vm-icon] i").className = `bi ${c[1]}`;
    modal.querySelector("[data-vm-title]").textContent = c[2];
    modal.querySelector("[data-vm-text]").textContent = c[3];
    modal.querySelector("[data-vm-name]").textContent = row.dataset.business;
    modal.querySelector("[data-vm-detail]").textContent =
      `vendor_id ${row.dataset.vendorId} · ${row.dataset.category} · ${row.dataset.city}`;

    const go = modal.querySelector("[data-vm-go]");
    go.className = `btn-eventora ${c[0] === "reject" ? "btn-reject" : "btn-accept"}`;
    go.textContent = "Confirm";

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    go.focus();
  }

  function closeConfirm() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    queued = null;
  }

  root.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-vm-action]");
    if (!btn) return;
    event.preventDefault();
    const row = btn.closest("[data-vm-row]");
    if (!row) return;
    const [axis, next] = btn.dataset.vmAction.split(":");
    if (!legal(row, axis, next)) {
      console.warn(`Eventora: refused illegal ${axis} transition -> ${next}`);
      return;
    }
    openConfirm(row, axis, next);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-vm-cancel]") || event.target.matches(".modal-veil")) {
        closeConfirm();
        return;
      }
      if (!event.target.closest("[data-vm-go]") || !queued) return;
      const { row, axis, next } = queued;
      // Re-check at the moment of action, not only when the control was drawn.
      if (!legal(row, axis, next)) {
        closeConfirm();
        return;
      }
      // TODO(backend):
      //   verify  -> UPDATE vendor_profiles SET is_verified = :flag WHERE vendor_id = :id
      //   account -> UPDATE vendor_profiles SET status = :status WHERE vendor_id = :id
      //              and UPDATE users SET status = :status WHERE id = :user_id
      //   Both require an admin session. A vendor can never call either — a
      //   vendor cannot self-verify or self-unblock.
      //   Neither endpoint touches the other field.
      if (axis === "verify") row.dataset.verify = next;
      else row.dataset.account = next;
      render(row);
      closeConfirm();
      apply();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeConfirm();
    });
  }

  controls.forEach((c) => c.addEventListener("change", apply));
  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }
  if (reset) {
    reset.addEventListener("click", () => {
      controls.forEach((c) => {
        c.value = "";
      });
      if (search) search.value = "";
      apply();
    });
  }

  rows.forEach(render);
  apply();
}

/* --------------------------------------------------------------------------
   Admin chatbot logs — admin/chatbot-logs.html.

   READ-ONLY BY DESIGN. chatbot_logs stores a conversation history; Database
   v1.0 defines no operation that mutates it, so this module deliberately
   implements no destructive action. There is no delete, no bulk purge, no
   "ban user", no "retrain model" — inventing any of those would imply backend
   capability that does not exist.

   The only interaction is opening a log to read it. Any injected action
   attribute is ignored, because no mutation handler exists to receive it.
   -------------------------------------------------------------------------- */
function initChatbotLogs() {
  const root = document.querySelector("[data-chatbot-logs]");
  if (!root) return;

  const rows = Array.from(root.querySelectorAll("[data-log-row]"));
  const controls = Array.from(root.querySelectorAll("[data-log-filter]"));
  const search = root.querySelector("[data-log-search]");
  const reset = root.querySelector("[data-log-reset]");
  const countEl = root.querySelector("[data-log-count]");
  const emptyEl = root.querySelector("[data-log-empty]");
  const wrapEl = root.querySelector("[data-log-wrap]");
  const modal = document.querySelector("[data-log-modal]");

  let lastFocus = null;

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    rows.forEach((row) => {
      let show = true;
      controls.forEach((control) => {
        if (!show) return;
        const want = control.value;
        if (want && row.dataset[control.dataset.logFilter] !== want) show = false;
      });
      if (show && term) {
        show = (row.dataset.search || row.textContent).toLowerCase().includes(term);
      }
      row.hidden = !show;
      if (show) visible += 1;
    });

    if (countEl) {
      countEl.textContent =
        visible === rows.length ? `${rows.length} log entries` : `${visible} of ${rows.length} log entries`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (wrapEl) wrapEl.hidden = visible === 0;
  }

  function openLog(row) {
    if (!modal) return;
    lastFocus = document.activeElement;

    const set = (sel, value) => {
      const el = modal.querySelector(sel);
      if (el) el.textContent = value;
    };
    set("[data-log-id]", `#${row.dataset.logId}`);
    set("[data-log-session]", row.dataset.session);
    set("[data-log-user]", row.dataset.user);
    set("[data-log-when]", `${row.dataset.dateLabel} · ${row.dataset.time}`);
    set("[data-log-message]", row.dataset.message);
    set("[data-log-reply]", row.dataset.reply);
    set("[data-log-ms]", `${row.dataset.ms} ms`);

    const intent = modal.querySelector("[data-log-intent]");
    if (intent) {
      intent.className = `intent-badge ${row.dataset.intent === "unrecognised" ? "unrecognised" : ""}`.trim();
      intent.textContent = row.dataset.intent.replace(/_/g, " ");
    }
    const status = modal.querySelector("[data-log-status]");
    if (status) {
      status.className = `log-status ${row.dataset.status}`;
      status.textContent = row.dataset.status;
    }

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    const close = modal.querySelector("[data-log-close]");
    if (close) close.focus();
  }

  function closeLog() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  root.addEventListener("click", (event) => {
    const row = event.target.closest("[data-log-row]");
    if (!row) return;
    openLog(row);
  });

  // Keyboard: a row is focusable, so Enter and Space must open it too.
  root.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = event.target.closest("[data-log-row]");
    if (!row) return;
    event.preventDefault();
    openLog(row);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-log-close]") || event.target.matches(".modal-veil")) {
        closeLog();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-open")) closeLog();
    });
  }

  controls.forEach((c) => c.addEventListener("change", apply));
  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }
  if (reset) {
    reset.addEventListener("click", () => {
      controls.forEach((c) => {
        c.value = "";
      });
      if (search) search.value = "";
      apply();
    });
  }

  apply();
}

/* --------------------------------------------------------------------------
   AI chatbot — ai/chatbot.html.

   THE CRITICAL RULE: there is no AI service. When the user sends a message,
   this does NOT generate an answer. It echoes the message into the thread so
   the interface can be seen working, then replies with a fixed notice saying
   the assistant is not connected yet.

   Writing a canned "smart-sounding" reply here would be the single most
   dishonest thing this project could do — it would make an examiner, or a
   user, believe a model is running when none exists. The reply text below is
   deliberately the same every time and says so.
   -------------------------------------------------------------------------- */
const AI_NOT_CONNECTED =
  "The Eventora assistant is not connected yet. The Python service that will " +
  "answer this has not been built, so no reply can be generated — this is a " +
  "fixed notice, not an AI response. The conversation above is preview data.";

function initAiChatbot() {
  const root = document.querySelector("[data-ai-chatbot]");
  if (!root) return;

  const windowEl = root.querySelector("[data-chat-window]");
  const input = root.querySelector("[data-chat-input]");
  const send = root.querySelector("[data-chat-send]");
  const prompts = Array.from(root.querySelectorAll("[data-chat-prompt]"));

  const esc = (t) =>
    String(t).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function now() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  function addMessage(who, text, time) {
    if (!windowEl) return;
    const wrap = document.createElement("div");
    wrap.className = `chat-msg ${who}`;
    wrap.innerHTML =
      `<div class="cm-text">${esc(text)}</div>` +
      `<span class="cm-time">${esc(time || now())}</span>`;
    windowEl.appendChild(wrap);
    windowEl.scrollTop = windowEl.scrollHeight;
  }

  function syncSend() {
    if (send) send.disabled = !input || !input.value.trim();
  }

  function submit(text) {
    const message = (text || input?.value || "").trim();
    if (!message) return;

    addMessage("user", message);
    if (input) {
      input.value = "";
      input.style.height = "";
    }
    syncSend();

    // TODO(backend): POST /api/chat.php  { message, session_id }
    //   PHP writes the user row and the bot row to chatbot_logs
    //   (user_id, session_id, sender_type, message_text), forwards the message
    //   to the Python service, and returns the reply.
    //   The browser must NEVER call the Python service directly — PHP is the
    //   only browser-facing layer.
    //
    //   Until that exists, no answer is fabricated here.
    window.setTimeout(() => {
      addMessage("bot", AI_NOT_CONNECTED);
    }, 500);
  }

  if (input) {
    input.addEventListener("input", () => {
      syncSend();
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    });
  }

  if (send) send.addEventListener("click", () => submit());

  prompts.forEach((chip) => {
    chip.addEventListener("click", () => submit(chip.dataset.chatPrompt));
  });

  syncSend();
  if (windowEl) windowEl.scrollTop = windowEl.scrollHeight;
}

/* --------------------------------------------------------------------------
   AI recommendations — ai/recommendation.html.

   Filtering and sorting of PREVIEW rows that are already in the page. This
   does not rank anything: the scores were written into the markup at build
   time and resolve to real service_id / vendor_id records.

   "Regenerate" deliberately does not produce different results — there is no
   model to run. It says so rather than shuffling the list to look alive.
   -------------------------------------------------------------------------- */
function initAiRecommendations() {
  const root = document.querySelector("[data-ai-recommendations]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".rec-card"));
  const category = root.querySelector("[data-rec-category]");
  const sort = root.querySelector("[data-rec-sort]");
  const countEl = root.querySelector("[data-rec-count]");
  const emptyEl = root.querySelector("[data-rec-empty]");
  const gridEl = root.querySelector(".rec-grid");
  const regen = root.querySelector("[data-rec-regenerate]");

  const num = (v) => Number(v) || 0;

  function apply() {
    const cat = category?.value || "";
    let visible = 0;

    const shown = cards.filter((card) => {
      const ok = !cat || card.dataset.category === cat;
      card.classList.toggle("is-hidden", !ok);
      if (ok) visible += 1;
      return ok;
    });

    const mode = sort?.value || "score";
    const by = {
      score: (a, b) => num(b.dataset.score) - num(a.dataset.score),
      "price-asc": (a, b) => num(a.dataset.price) - num(b.dataset.price),
      "price-desc": (a, b) => num(b.dataset.price) - num(a.dataset.price),
      rating: (a, b) => num(b.dataset.rating) - num(a.dataset.rating),
    }[mode];
    if (by && gridEl) shown.slice().sort(by).forEach((c) => gridEl.appendChild(c));

    if (countEl) {
      countEl.textContent =
        visible === cards.length
          ? `${cards.length} preview recommendations`
          : `${visible} of ${cards.length} preview recommendations`;
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (gridEl) gridEl.hidden = visible === 0;
  }

  [category, sort].forEach((el) => el && el.addEventListener("change", apply));

  if (regen) {
    regen.addEventListener("click", () => {
      // TODO(backend): POST /api/recommend.php { event_id }
      //   PHP resolves client_id from the session, calls the Python service,
      //   writes rows to recommendations (client_id, event_id, service_id,
      //   vendor_id, score) and returns them ordered by score DESC.
      //   Regenerating will then genuinely re-rank. It cannot today.
      window.alert(
        "No recommendations were generated.\n\n" +
          "The Python recommendation service has not been built, so there is nothing " +
          "to run. The results shown are preview data resolved against real vendor " +
          "and service records — re-running would return exactly the same list, so " +
          "nothing is shuffled to imply otherwise."
      );
    });
  }

  apply();
}

/* --------------------------------------------------------------------------
   Checkout — payment/checkout.html.

   THE RULE THIS MODULE EXISTS TO PROTECT: confirming payment here does NOT
   mark anything paid. No payments row is written, no commissions row is
   written, and the booking status is NOT changed. Those are server
   responsibilities, and a frontend that flipped a booking to paid would be
   lying about money.

   Payment is offered only for an accepted booking. That is enforced server-
   side too — this check is a convenience, not the control.
   -------------------------------------------------------------------------- */
const PAYABLE_STATUS = "accepted";

function initCheckout() {
  const root = document.querySelector("[data-checkout]");
  if (!root) return;

  const form = root.querySelector("[data-checkout-form]");
  const methods = Array.from(root.querySelectorAll("[name='payment_method']"));
  const submit = root.querySelector("[data-checkout-submit]");
  const methodOut = root.querySelector("[data-selected-method]");

  const LABEL = {
    easypaisa: "EasyPaisa",
    jazzcash: "JazzCash",
    bank_transfer: "Bank Transfer",
    credit_card: "Card",
  };

  function chosen() {
    return methods.find((m) => m.checked) || null;
  }

  function sync() {
    const m = chosen();
    if (methodOut) methodOut.textContent = m ? LABEL[m.value] : "Not selected";
    if (submit) submit.disabled = !m;
  }

  methods.forEach((m) => m.addEventListener("change", sync));

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const m = chosen();
      if (!m) return;

      // Guard: only an accepted booking is payable. The server repeats this.
      if (root.dataset.bookingStatus !== PAYABLE_STATUS) {
        console.warn("Eventora: refused payment on a non-accepted booking");
        return;
      }

      if (submit) {
        submit.classList.add("is-loading");
        submit.disabled = true;
      }

      // TODO(backend): POST /api/payment-create.php
      //   { booking_id, payment_method }
      //   The server must, in ONE transaction:
      //     1. verify the booking belongs to this client AND status='accepted'
      //     2. INSERT INTO payments (booking_id, amount, payment_method,
      //                              transaction_id, status)
      //        — amount is read from bookings.total_amount, NEVER from the
      //          request body, or a client could set their own price
      //     3. INSERT INTO commissions (booking_id, vendor_id,
      //                                 commission_percentage, commission_amount)
      //        — percentage SNAPSHOTTED from vendor_profiles.commission_rate
      //     4. redirect to success.php or failed.php based on the real result
      //
      //   Nothing is written here. The booking status is NOT changed by this
      //   page — the vendor marks a booking completed after delivery.
      window.setTimeout(() => {
        if (submit) {
          submit.classList.remove("is-loading");
          submit.disabled = false;
        }
        showFormFeedback(
          form,
          "Demo mode — no payment was taken and no record was created. " +
            "Payment processing is not connected, so nothing was charged to any " +
            "EasyPaisa, JazzCash, bank or card account, and this booking has not " +
            "been marked as paid.",
          "is-demo",
          "bi-info-circle-fill"
        );
      }, 1100);
    });
  }

  sync();
}

/* --------------------------------------------------------------------------
   Payment history — payment/history.html.

   Read-only. A client cannot edit or delete a payment record: financial
   history is protected by ON DELETE RESTRICT and there is no endpoint for it.
   -------------------------------------------------------------------------- */
function initPaymentHistory() {
  const root = document.querySelector("[data-payment-history]");
  if (!root) return;

  const rows = Array.from(root.querySelectorAll("[data-payment-row]"));
  const controls = Array.from(root.querySelectorAll("[data-ph-filter]"));
  const search = root.querySelector("[data-ph-search]");
  const reset = root.querySelector("[data-ph-reset]");
  const countEl = root.querySelector("[data-ph-count]");
  const emptyEl = root.querySelector("[data-ph-empty]");
  const wrapEl = root.querySelector("[data-ph-wrap]");

  const money = (v) => "Rs. " + Number(v).toLocaleString("en-PK");

  function apply() {
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    const totals = { amount: 0, commission: 0, net: 0 };

    rows.forEach((row) => {
      let show = true;
      controls.forEach((control) => {
        if (!show) return;
        const want = control.value;
        if (want && row.dataset[control.dataset.phFilter] !== want) show = false;
      });
      if (show && term) {
        show = (row.dataset.search || row.textContent).toLowerCase().includes(term);
      }
      row.hidden = !show;
      if (!show) return;
      visible += 1;
      totals.amount += Number(row.dataset.amount) || 0;
      totals.commission += Number(row.dataset.commission) || 0;
      totals.net += Number(row.dataset.net) || 0;
    });

    if (countEl) {
      countEl.textContent =
        visible === rows.length ? `${rows.length} payments` : `${visible} of ${rows.length} payments`;
    }
    root.querySelectorAll("[data-ph-total]").forEach((cell) => {
      const key = cell.dataset.phTotal;
      cell.textContent = key === "count" ? String(visible) : money(totals[key] || 0);
    });
    if (emptyEl) emptyEl.hidden = visible !== 0;
    if (wrapEl) wrapEl.hidden = visible === 0;
  }

  controls.forEach((c) => c.addEventListener("change", apply));
  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        search.value = "";
        apply();
      }
    });
  }
  if (reset) {
    reset.addEventListener("click", () => {
      controls.forEach((c) => {
        c.value = "";
      });
      if (search) search.value = "";
      apply();
    });
  }

  apply();
}
