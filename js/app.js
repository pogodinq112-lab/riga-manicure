/* Riga Manicure — laku katalogs. Saturs no content.json. Izvēlētais tonis pārkrāso visu lapu (--accent). */
(function () {
  "use strict";
  var root = document.documentElement;
  var MOTION = root.classList.contains("motion");
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (!hasGSAP) { root.classList.remove("motion"); MOTION = false; }
  var FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var get = function (o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); };
  var no = function (i) { return "No. " + String(i + 1).padStart(2, "0"); };
  var small = function (src) { return src.replace(/\.webp$/, "-600.webp"); };
  // gaišam tonim teksts melns, tumšam balts
  var light = function (hex) {
    var n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2] > .4;
  };

  $("#year").textContent = new Date().getFullYear();

  var WORKS = [], current = 0;

  fetch("content.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { build(d); after(); })
    .catch(function () { after(); });

  function todo(t, big) { return '<div class="todo' + (big ? " todo-big" : "") + '"><b>Уточняется.</b>' + esc(t) + "</div>"; }

  function build(d) {
    WORKS = d.works;
    var book = d.telegram || d.instagramDm;
    $$("[data-book]").forEach(function (a) { a.href = book; });
    $$("[data-ig]").forEach(function (a) { a.href = d.instagram; });

    $$("[data-field]").forEach(function (el) {
      var key = el.getAttribute("data-field"), v = get(d, key);
      if (v && v.todo) { el.innerHTML = todo(v.todo, /program|students|reviews/.test(key)); return; }
      if (key === "course.program" && Array.isArray(v)) {
        el.innerHTML = '<ol class="s-list">' + v.map(function (p) {
          return "<li><span><b>" + esc(p.title) + "</b>" + (p.items ? "<small>" + p.items.map(esc).join(", ") + "</small>" : "") + "</span></li>";
        }).join("") + "</ol>"; return;
      }
      if (key === "students" && Array.isArray(v)) {
        el.innerHTML = '<ul class="cards">' + v.map(function (s) {
          return '<li class="card"><div class="card-img"><img src="' + esc(s.src) + '" loading="lazy" alt="' + esc(s.alt || "Работа ученицы") + '"></div></li>';
        }).join("") + "</ul>"; return;
      }
      if (key === "reviews" && Array.isArray(v)) {
        el.innerHTML = '<ul class="r-list">' + v.map(function (r) {
          return "<li><blockquote>" + esc(r.text) + "</blockquote>" + (r.name ? "<footer>" + esc(r.name) + "</footer>" : "") + "</li>";
        }).join("") + "</ul>"; return;
      }
      if (Array.isArray(v)) { el.innerHTML = v.map(esc).join("<br>"); return; }
      if (v != null) el.textContent = v;
    });

    // palete
    $('[data-list="palette"]').innerHTML = WORKS.map(function (w, i) {
      return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" data-i="' + i + '" style="background:' + w.swatch + ';--tc:' + (light(w.swatch) ? "#141112" : "#fff") +
        '" aria-label="' + no(i) + " " + esc(w.name) + '"><span>' + String(i + 1).padStart(2, "0") + "</span></button>";
    }).join("");

    // svītrkods no toņiem
    var bars = "";
    WORKS.forEach(function (w, i) { bars += '<i style="--w:' + (2 + (i * 7) % 6) + "px;--c:" + w.swatch + '"></i><i style="--w:' + (1 + (i * 3) % 3) + 'px"></i>'; });
    $('[data-list="barcode"]').innerHTML = bars;

    // katalogs
    $('[data-list="works"]').innerHTML = WORKS.map(function (w, i) {
      return '<li class="card" style="--sw:' + w.swatch + '"><button type="button" data-i="' + i + '" aria-label="' + no(i) + " " + esc(w.name) + ": " + esc(w.alt) + '">' +
        '<div class="card-img"><img src="' + esc(small(w.src)) + '" width="600" height="800" loading="lazy" alt="' + esc(w.alt) + '"><span class="card-coat" aria-hidden="true"></span></div>' +
        '<div class="card-meta"><span class="dot" aria-hidden="true"></span><span class="card-no">' + no(i) + '</span><span class="card-hex">' + w.swatch.toUpperCase() + '</span><span class="card-name">' + esc(w.name) + "</span></div>" +
        "</button></li>";
    }).join("");
  }

  function after() {
    if (WORKS.length) { setTone(0, false); initPalette(); initLightbox(); }
    if (MOTION) motion(); else $$(".card-coat").forEach(function (c) { c.style.transform = "scaleY(0)"; });
    root.classList.add("ready");
  }

  /* =========================================================
     Toņa maiņa: lapa + testeris
     ========================================================= */
  function setTone(i, animate) {
    if (!WORKS[i]) return;
    var w = WORKS[i], prev = current; current = i;
    root.style.setProperty("--accent", w.swatch);
    root.style.setProperty("--on-accent", light(w.swatch) ? "#141112" : "#fff");
    $$(".palette button").forEach(function (b) { b.setAttribute("aria-checked", String(+b.dataset.i === i)); });
    $("#testerNo").textContent = no(i);
    $("#testerName").textContent = w.name;
    $("#testerHex").textContent = w.swatch.toUpperCase();
    var img = $("#testerImg");
    var swap = function () { img.srcset = small(w.src) + " 600w, " + w.src + " " + (w.w || 825) + "w"; img.src = small(w.src); img.alt = w.alt; };
    if (!MOTION || !animate || prev === i) { swap(); return; }
    // jauns "slānis" pārkrāso foto un atklāj nākamo darbu
    var coat = $(".tester-coat");
    gsap.timeline({ overwrite: true })
      .set(coat, { transformOrigin: "bottom" })
      .to(coat, { scaleY: 1, duration: .35, ease: "power2.in" })
      .add(swap)
      .set(coat, { transformOrigin: "top" })
      .to(coat, { scaleY: 0, duration: .55, ease: "power3.out", delay: .08 });
  }

  function initPalette() {
    var pal = $(".palette");
    pal.addEventListener("click", function (e) { var b = e.target.closest("button[data-i]"); if (b) setTone(+b.dataset.i, true); });
    pal.addEventListener("keydown", function (e) {
      if (!/Arrow(Left|Right|Up|Down)/.test(e.key)) return;
      e.preventDefault();
      var n = (current + (/Right|Down/.test(e.key) ? 1 : -1) + WORKS.length) % WORKS.length;
      setTone(n, true); $('.palette button[data-i="' + n + '"]').focus();
    });
    $$(".palette button").forEach(function (b) { b.tabIndex = +b.dataset.i === 0 ? 0 : -1; });
    pal.addEventListener("focusin", function () { $$(".palette button").forEach(function (b) { b.tabIndex = +b.dataset.i === current ? 0 : -1; }); });
    if (FINE) pal.addEventListener("pointerover", function (e) { var b = e.target.closest("button[data-i]"); if (b) setTone(+b.dataset.i, true); });
  }

  /* ---------- Foto pilnekrānā (atverot, lapa pieņem darba toni) ---------- */
  function initLightbox() {
    var dlg = $("#lightbox"), img = $(".lb-img", dlg), cap = $(".lb-cap", dlg), idx = 0, opener = null;
    if (!dlg.showModal) return;
    function show(i) {
      idx = (i + WORKS.length) % WORKS.length;
      var w = WORKS[idx];
      img.src = w.src; img.alt = w.alt;
      cap.innerHTML = '<span class="dot" style="background:' + w.swatch + '"></span>' + no(idx) + " " + esc(w.name);
      setTone(idx, false);
      if (MOTION) gsap.fromTo(img, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, ease: "power3.out" });
    }
    $(".cards").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]"); if (!b) return;
      opener = b; show(+b.dataset.i); dlg.showModal();
    });
    $(".lb-close", dlg).addEventListener("click", function () { dlg.close(); });
    $(".lb-prev", dlg).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", dlg).addEventListener("click", function () { show(idx + 1); });
    dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
    var sx = 0;
    dlg.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
  }

  /* =========================================================
     Kustība: krāsu paraugi izbīd, no kartītēm "nomazgājas" laka slānis
     ========================================================= */
  function motion() {
    gsap.from(".hero-title, .hero-sub, .hero-cta, .kicker", { y: 24, opacity: 0, duration: .9, stagger: .08, ease: "expo.out" });
    // pēc ieslīdēšanas transform atdodam CSS, lai izvēlētais tonis paceļas pareizi
    gsap.from(".palette button", { yPercent: 60, opacity: 0, duration: .8, stagger: .035, ease: "expo.out", delay: .25, clearProps: "transform" });
    gsap.from(".tester-img img", { scale: 1.12, duration: 1.6, ease: "expo.out" });

    gsap.from(".label", { y: 50, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".label-sec", start: "top 75%" } });
    gsap.from(".label-rows > div", { x: -20, opacity: 0, duration: .6, stagger: .06, ease: "expo.out", scrollTrigger: { trigger: ".label-rows", start: "top 80%" } });
    gsap.from(".barcode i", { scaleY: 0, transformOrigin: "bottom", duration: .5, stagger: .015, ease: "power2.out", scrollTrigger: { trigger: ".label-foot", start: "top 92%" } });

    $$(".sec-head").forEach(function (h) {
      gsap.from(h, { y: 30, opacity: 0, duration: .8, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%" } });
    });

    gsap.set(".card-coat", { scaleY: 1 });
    ScrollTrigger.batch(".cards .card", { start: "top 88%", once: true, onEnter: function (els) {
      els.forEach(function (el, i) {
        gsap.to($(".card-coat", el), { scaleY: 0, duration: .9, delay: i * .08, ease: "power3.inOut" });
        gsap.from($(".card-meta", el), { y: 10, opacity: 0, duration: .6, delay: .3 + i * .08, ease: "expo.out" });
      });
    } });

    gsap.from(".final-title", { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".final", start: "top 75%" } });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
