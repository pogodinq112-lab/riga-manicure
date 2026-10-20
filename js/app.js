/* Riga Manicure — kurss. Saturs no content.json, animācijas ar GSAP. */
(function () {
  "use strict";
  var root = document.documentElement;
  var MOTION = root.classList.contains("motion");
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (!hasGSAP) { root.classList.remove("motion"); MOTION = false; }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var get = function (o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); };

  $("#year").textContent = new Date().getFullYear();
  if (MOTION) intro();

  // Naga forma pēc foto: stileti, mandele vai kvadrāts
  var SHAPES = {
    "hero-polka": "stiletto", "pink-jelly": "stiletto", "gold-stiletto": "stiletto", "red-silver-stiletto": "stiletto",
    "nude-stiletto": "almond", "cherry-glitter": "almond", "french-disco": "almond", "pink-ombre-almond": "almond"
  };
  var shapeOf = function (src) {
    var k = src.split("/").pop().replace(/(-600)?\.\w+$/, "");
    return SHAPES[k] || "square";
  };
  var small = function (src) { return src.replace(/\.webp$/, "-600.webp"); };

  fetch("content.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { build(d); after(d); })
    .catch(function () { after(null); });

  function todo(t, big) {
    return '<div class="todo' + (big ? " todo-big" : "") + '"><b>Скоро здесь</b>' + esc(t) + "</div>";
  }

  function build(d) {
    var book = d.telegram || d.instagramDm;
    $$("[data-book]").forEach(function (a) { a.href = book; });
    $$("[data-ig]").forEach(function (a) { a.href = d.instagram; });

    // vienkārši lauki
    $$("[data-field]").forEach(function (el) {
      var key = el.getAttribute("data-field"), v = get(d, key);
      var big = /program|students|reviews/.test(key);
      if (v && v.todo) { el.innerHTML = todo(v.todo, big); return; }
      if (key === "course.program" && Array.isArray(v)) { el.innerHTML = programHTML(v); return; }
      if (key === "students" && Array.isArray(v)) { el.innerHTML = studentsHTML(v); return; }
      if (key === "reviews" && Array.isArray(v)) { el.innerHTML = reviewsHTML(v); return; }
      if (Array.isArray(v)) { el.innerHTML = "<ul>" + v.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; return; }
      if (v != null) el.textContent = v;
    });

    $('[data-list="works"]').innerHTML = d.works.map(function (w, i) {
      return '<li class="work"><button type="button" data-i="' + i + '" aria-label="Открыть фото: ' + esc(w.alt) + '">' +
        '<figure class="nail nail-' + shapeOf(w.src) + '"><img src="' + esc(small(w.src)) + '" width="600" height="800" loading="lazy" alt="' + esc(w.alt) + '">' +
        '<span class="gloss" aria-hidden="true"></span></figure></button></li>';
    }).join("");
  }

  // Programma: [{ "title": "1. diena: ...", "items": ["...", "..."] }]
  function programHTML(list) {
    return '<ol class="p-list">' + list.map(function (p, i) {
      return '<li class="p-item"><button type="button" aria-expanded="false" aria-controls="p' + i + '">' + esc(p.title) +
        '<span class="p-sign" aria-hidden="true"></span></button><div class="p-panel" id="p' + i + '"><ul>' +
        (p.items || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div></li>";
    }).join("") + "</ol>";
  }
  function studentsHTML(list) {
    return '<ul class="works-grid">' + list.map(function (s) {
      return '<li class="work"><figure class="nail nail-' + shapeOf(s.src) + '"><img src="' + esc(s.src) + '" loading="lazy" alt="' + esc(s.alt || "Работа ученицы") + '"><span class="gloss"></span></figure></li>';
    }).join("") + "</ul>";
  }
  function reviewsHTML(list) {
    return '<ul class="r-list">' + list.map(function (r) {
      return "<li><blockquote><p>" + esc(r.text) + "</p><footer>" + esc(r.name || "") + "</footer></blockquote></li>";
    }).join("") + "</ul>";
  }

  function after(d) {
    initProgram();
    if (d) initLightbox(d.works);
    initDock(); initHeader();
    if (MOTION) scrollMotion();
    if (MOTION && matchMedia("(hover: hover) and (pointer: fine)").matches) magnetic();
    root.classList.add("ready");
  }

  /* ---------- Programmas akordeons ---------- */
  function initProgram() {
    $$(".p-item button").forEach(function (b) {
      b.addEventListener("click", function () {
        var item = b.parentNode, panel = $(".p-panel", item), open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", String(open));
        if (MOTION) gsap.to(panel, { height: open ? "auto" : 0, duration: .55, ease: "expo.out" });
        else panel.style.height = open ? "auto" : "0";
      });
    });
  }

  /* ---------- Josla un galvene ---------- */
  function initDock() {
    var dock = $("#dock"), heroOut = false, finalIn = false;
    var set = function () { dock.classList.toggle("is-on", heroOut && !finalIn); };
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; set(); }, { threshold: .2 }).observe($(".hero"));
    new IntersectionObserver(function (e) { finalIn = e[0].isIntersecting; set(); }).observe($(".final"));
  }
  function initHeader() {
    var top = $("#top"), last = 0;
    addEventListener("scroll", function () {
      var y = scrollY;
      top.classList.toggle("is-solid", y > 30);
      top.classList.toggle("is-hidden", y > last && y > 400);
      last = y;
    }, { passive: true });
  }

  /* ---------- Foto pilnekrānā ---------- */
  function initLightbox(works) {
    var dlg = $("#lightbox"), img = $(".lb-img", dlg), idx = 0, opener = null;
    if (!dlg.showModal) return;
    function show(i) {
      idx = (i + works.length) % works.length;
      img.src = works[idx].src; img.alt = works[idx].alt;
      if (MOTION) gsap.fromTo(img, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .45, ease: "power3.out" });
    }
    $(".works-grid").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]"); if (!b) return;
      opener = b; show(+b.dataset.i); dlg.showModal();
    });
    $(".lb-close", dlg).addEventListener("click", function () { dlg.close(); });
    $(".lb-prev", dlg).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", dlg).addEventListener("click", function () { show(idx + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1); });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
    var sx = 0;
    dlg.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
  }

  /* ---------- Ievads: nags "izaug", atspīdums pārslīd ---------- */
  function intro() {
    gsap.set(".hero-title .line > span", { yPercent: 105, y: 0 });
    var tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: .1 });
    tl.fromTo(".hero-main", { clipPath: "inset(100% 0% 0% 0% round 200px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.3, ease: "expo.inOut" })
      .from(".hero-main img", { scale: 1.25, duration: 1.8 }, "<.2")
      .to(".hero-title .line > span", { yPercent: 0, duration: 1.1, stagger: .1 }, "<")
      .fromTo(".hero-side-1", { opacity: 0, y: 60, rotate: -30 }, { opacity: 1, y: 0, rotate: -12, duration: 1.1, ease: "back.out(1.6)" }, "-=1.1")
      .fromTo(".hero-side-2", { opacity: 0, y: -50, rotate: 30 }, { opacity: 1, y: 0, rotate: 10, duration: 1.1, ease: "back.out(1.6)" }, "<.1")
      .fromTo(".hero-sub", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8 }, "<.1")
      .fromTo(".hero-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8 }, "<.1")
      .add(function () { root.classList.add("intro-done"); gsap.set(".hero-main", { clearProps: "clipPath" }); glossLoop(); });
    setTimeout(function () { if (!root.classList.contains("intro-done")) { tl.progress(1); root.classList.add("intro-done"); } }, 4000);
  }
  function glossLoop() {
    $$(".hero-nails .gloss").forEach(function (g, i) {
      gsap.fromTo(g, { xPercent: -60 }, { xPercent: 60, duration: 1.4, ease: "power2.inOut", repeat: -1, repeatDelay: 3.2, delay: i * .35 });
    });
  }

  /* ---------- Ritināšana ---------- */
  function scrollMotion() {
    // hero: nagi lido dažādos ātrumos
    gsap.to(".hero-main", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-side-1", { yPercent: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-side-2", { yPercent: 30, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // lente
    var tw = gsap.to(".ribbon-track", { xPercent: -50, ease: "none", duration: 24, repeat: -1 });
    ScrollTrigger.create({ onUpdate: function (s) {
      var boost = 1 + Math.min(4, Math.abs(s.getVelocity()) / 350);
      gsap.timeline({ overwrite: true }).to(tw, { timeScale: s.direction * boost, duration: .15, overwrite: true })
        .to(tw, { timeScale: s.direction, duration: 1, ease: "power2.out" }, "+=.15");
    } });

    // fakti: rindas izbīd no kreisās
    gsap.from(".fact", { x: -40, opacity: 0, stagger: .1, duration: .9, ease: "expo.out", scrollTrigger: { trigger: ".facts", start: "top 80%" } });

    // darbi: nagi "izaug" no apakšas
    ScrollTrigger.batch(".work", { start: "top 88%", once: true, onEnter: function (els) {
      gsap.fromTo(els, { clipPath: "inset(100% 0% 0% 0%)", y: 40 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.1, stagger: .08, ease: "expo.out",
        onComplete: function () { gsap.set(els, { clearProps: "clipPath" }); } });
      els.forEach(function (el, i) { var g = $(".gloss", el); if (g) gsap.fromTo(g, { xPercent: -60 }, { xPercent: 60, duration: 1.2, delay: .5 + i * .08, ease: "power2.inOut" }); });
    } });

    // sadaļu virsraksti: maska
    $$(".h2").forEach(function (h) {
      gsap.from(h, { yPercent: 30, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%" } });
    });

    // fināls
    gsap.set(".final-title .line > span", { yPercent: 105 });
    gsap.to(".final-title .line > span", { yPercent: 0, stagger: .12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".final", start: "top 70%" } });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  function magnetic() {
    $$(".magnetic").forEach(function (b) {
      var xTo = gsap.quickTo(b, "x", { duration: .5, ease: "elastic.out(1, .4)" }), yTo = gsap.quickTo(b, "y", { duration: .5, ease: "elastic.out(1, .4)" });
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }
})();
