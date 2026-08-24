/* ==========================================================================
   Cristina Magriñá Psychology — site behaviour
   Plain JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  /* ------------------------------------------------- 1. Booking destination */
  // Buttons marked data-book keep their HTML href (a mailto) as a fallback and
  // are only rewritten when a real booking URL has been configured.
  if (cfg.bookingUrl) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-book]"), function (a) {
      a.setAttribute("href", cfg.bookingUrl);
      if (cfg.bookingNewTab !== false) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  /* ------------------------------------------------------ 2. Sticky header */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------- 3. Desktop "Who I help" */
  var dropdowns = document.querySelectorAll("[data-dropdown]");
  Array.prototype.forEach.call(dropdowns, function (item) {
    var link = item.querySelector(".nav__link");
    var close = function () {
      item.classList.remove("is-open");
      if (link) link.setAttribute("aria-expanded", "false");
    };
    var open = function () {
      item.classList.add("is-open");
      if (link) link.setAttribute("aria-expanded", "true");
    };

    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", close);

    // Keyboard: the link still navigates to the overview page on Enter, but
    // focus moving into the item reveals the panel so it can be tabbed through.
    item.addEventListener("focusin", open);
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  });

  /* --------------------------------------------------- 4. Mobile drawer nav */
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("drawer");

  if (toggle && drawer) {
    var setDrawer = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    setDrawer(false);

    toggle.addEventListener("click", function () {
      setDrawer(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close on navigation, on Escape, and when the viewport grows to desktop.
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        setDrawer(false);
        toggle.focus();
      }
    });
    var mq = window.matchMedia("(min-width: 1000px)");
    var onMQ = function (e) { if (e.matches) setDrawer(false); };
    if (mq.addEventListener) mq.addEventListener("change", onMQ);
    else if (mq.addListener) mq.addListener(onMQ);
  }

  /* ------------------------------------------------- 5. Scroll-in animation */
  var reveals = document.querySelectorAll(".reveal");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reveals.length) return;

  if (reduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

  Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
})();
