/* ==========================================================================
   Auspify — By Future Through Tech
   Task 1 (Easy) – Responsive Landing Page
   --------------------------------------------------------------------------
   0. Theme boot (runs before paint)   4. Reveal animations
   1. Theme switch                     5. Animated counters
   2. Mobile navigation                6. Contact form validation
   3. Scroll effects
   ========================================================================== */

/* =======================================================================
   0. THEME BOOT
   This file is loaded in <head>, so this runs before the page is painted
   and the saved theme is applied with no flash of the wrong colours.
   ======================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "auspify-theme";
  var saved = null;

  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }

  var prefersDark = window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches;

  var theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();


/* =======================================================================
   Everything below needs the DOM, so it waits for it.
   ======================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var STORAGE_KEY = "auspify-theme";
  var THEME_COLORS = { light: "#ffffff", dark: "#070b14" };

  /* ---------------------------------------------------------------------
     1. THEME SWITCH (sun / moon)
     --------------------------------------------------------------------- */
  var themeToggle = document.getElementById("themeToggle");
  var metaTheme   = document.getElementById("metaTheme");

  function applyTheme(theme, animate) {
    var root = document.documentElement;

    /* Animate the colour change only when the user flips the switch */
    if (animate) {
      root.classList.add("theme-anim");
      window.setTimeout(function () { root.classList.remove("theme-anim"); }, 500);
    }

    root.setAttribute("data-theme", theme);
    if (metaTheme) metaTheme.setAttribute("content", THEME_COLORS[theme]);

    var isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
  }

  /* Sync the button state with the theme chosen during boot */
  applyTheme(document.documentElement.getAttribute("data-theme"), false);

  themeToggle.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next, true);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage blocked */ }
  });

  /* Follow the system setting while the visitor has not made a choice */
  if (window.matchMedia) {
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    var onSystemChange = function (e) {
      var hasChoice = null;
      try { hasChoice = localStorage.getItem(STORAGE_KEY); } catch (err) { /* ignore */ }
      if (!hasChoice) applyTheme(e.matches ? "dark" : "light", true);
    };
    if (systemDark.addEventListener) systemDark.addEventListener("change", onSystemChange);
    else if (systemDark.addListener) systemDark.addListener(onSystemChange);
  }

  /* ---------------------------------------------------------------------
     2. MOBILE NAVIGATION
     --------------------------------------------------------------------- */
  var header    = document.getElementById("header");
  var hamburger = document.getElementById("hamburger");
  var navMenu   = document.getElementById("navMenu");
  var navLinks  = navMenu.querySelectorAll("a");

  function openMenu() {
    navMenu.classList.add("is-open");
    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Close menu");
  }

  function closeMenu() {
    navMenu.classList.remove("is-open");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
  }

  hamburger.addEventListener("click", function () {
    navMenu.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  /* Close when a link is selected */
  Array.prototype.forEach.call(navLinks, function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* Close on Escape and on outside click */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
      closeMenu();
      hamburger.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav") && navMenu.classList.contains("is-open")) closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 920) closeMenu();
  });

  /* ---------------------------------------------------------------------
     3. SCROLL EFFECTS — navbar, active link, back to top
     --------------------------------------------------------------------- */
  var toTop    = document.getElementById("toTop");
  var sections = document.querySelectorAll("main section[id]");
  var ticking  = false;

  function updateOnScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    header.classList.toggle("is-scrolled", y > 16);
    toTop.classList.toggle("is-visible", y > 520);

    var currentId = "";
    Array.prototype.forEach.call(sections, function (section) {
      if (y >= section.offsetTop - 150) currentId = section.id;
    });

    Array.prototype.forEach.call(navLinks, function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
    });

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  updateOnScroll();

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Smooth scrolling that accounts for the sticky header height */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = this.getAttribute("href");
      if (id === "#" || id.length < 2) return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 14);
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ---------------------------------------------------------------------
     4. SECTION REVEAL ANIMATIONS
     --------------------------------------------------------------------- */
  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    Array.prototype.forEach.call(revealItems, function (item, i) {
      item.style.transitionDelay = (i % 4) * 90 + "ms";   /* gentle stagger */
      revealObserver.observe(item);
    });
  } else {
    Array.prototype.forEach.call(revealItems, function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------------------
     5. ANIMATED COUNTERS (statistics)
     --------------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  var reduceMotion = window.matchMedia &&
                     window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduceMotion) { el.textContent = target + suffix; return; }

    var duration = 1600;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var p = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);            /* ease-out cubic */
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
  } else {
    Array.prototype.forEach.call(counters, runCounter);
  }

  /* ---------------------------------------------------------------------
     6. CONTACT FORM VALIDATION
     --------------------------------------------------------------------- */
  var form    = document.getElementById("contactForm");
  var success = document.getElementById("formSuccess");

  var fields = {
    name:    { el: document.getElementById("name"),    error: document.getElementById("nameError") },
    email:   { el: document.getElementById("email"),   error: document.getElementById("emailError") },
    subject: { el: document.getElementById("subject"), error: document.getElementById("subjectError") },
    message: { el: document.getElementById("message"), error: document.getElementById("messageError") }
  };

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  function showError(key, msg) {
    fields[key].error.textContent = msg;
    fields[key].el.closest(".field").classList.add("has-error");
    fields[key].el.setAttribute("aria-invalid", "true");
  }

  function clearError(key) {
    fields[key].error.textContent = "";
    fields[key].el.closest(".field").classList.remove("has-error");
    fields[key].el.removeAttribute("aria-invalid");
  }

  function validateField(key) {
    var value = fields[key].el.value.trim();

    switch (key) {
      case "name":
        if (value === "")      { showError(key, "Please enter your full name."); return false; }
        if (value.length < 2)  { showError(key, "Name must be at least 2 characters."); return false; }
        break;

      case "email":
        if (value === "")                { showError(key, "Please enter your email address."); return false; }
        if (!EMAIL_PATTERN.test(value))  { showError(key, "Please enter a valid email address."); return false; }
        break;

      case "subject":
        if (value === "")      { showError(key, "Please enter a subject."); return false; }
        if (value.length < 3)  { showError(key, "Subject must be at least 3 characters."); return false; }
        break;

      case "message":
        if (value === "")       { showError(key, "Please enter your message."); return false; }
        if (value.length < 10)  { showError(key, "Message must be at least 10 characters."); return false; }
        break;
    }

    clearError(key);
    return true;
  }

  /* Live feedback while typing / on blur */
  Object.keys(fields).forEach(function (key) {
    fields[key].el.addEventListener("input", function () {
      if (fields[key].el.closest(".field").classList.contains("has-error")) validateField(key);
    });
    fields[key].el.addEventListener("blur", function () {
      if (fields[key].el.value.trim() !== "") validateField(key);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    success.hidden = true;

    var isValid = true;
    var firstInvalid = null;

    Object.keys(fields).forEach(function (key) {
      if (!validateField(key)) {
        isValid = false;
        if (!firstInvalid) firstInvalid = fields[key].el;
      }
    });

    if (!isValid) { firstInvalid.focus(); return; }

    /* Valid — no backend, just a friendly confirmation */
    success.hidden = false;
    form.reset();
    success.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(function () { success.hidden = true; }, 7000);
  });

});
