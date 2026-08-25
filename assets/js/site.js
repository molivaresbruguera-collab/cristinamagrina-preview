/* ==========================================================================
   Cristina Magriñá Psychology — site behaviour
   Plain JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  /* --------------------------------------------- 1. Ventana de reserva */
  // Los CTA llevan un mailto: como respaldo. Si hay JavaScript, se intercepta
  // el clic y se abre una ventana con varias vías, porque un mailto no hace
  // nada cuando el dispositivo no tiene app de correo configurada.
  var dialog = document.getElementById("bookDialog");
  var opener = null;

  function openDialog(trigger) {
    if (!dialog) return false;
    opener = trigger || null;
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    var first = dialog.querySelector(".bk__actions .btn");
    if (first) first.focus();
    return true;
  }

  function closeDialog() {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    document.body.style.overflow = "";
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  if (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target.closest("[data-bk-close]")) closeDialog();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDialog();
    });
    // Mantener el foco dentro de la ventana mientras está abierta
    dialog.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = dialog.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-book]");
    if (!trigger) return;
    // Si hay calendario configurado, el enlace ya apunta ahí: no interceptar
    if (cfg.bookingUrl) return;
    if (openDialog(trigger)) e.preventDefault();
  });

  /* ----------------------------------------- 1b. Copiar la dirección */
  // Para quien no tenga app de correo: copiar y pegar en su webmail.
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    var original = btn.textContent;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = btn.getAttribute("data-copied") || "OK";
        btn.classList.add("is-copied");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("is-copied");
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* sin acción */ }
        document.body.removeChild(ta);
      }
    });
  });

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
