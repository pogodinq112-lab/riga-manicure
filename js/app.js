/* Riga Manicure — Y2K. Saturs no content.json; uzlīmes, dzirksteles, kurs.exe, dienasgrāmata, čats. */
(function () {
  "use strict";
  var root = document.documentElement;
  var MOTION = root.classList.contains("motion");
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (hasGSAP && window.Draggable) gsap.registerPlugin(Draggable);
  if (!hasGSAP) { root.classList.remove("motion"); MOTION = false; }
  var FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var get = function (o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  $("#year").textContent = new Date().getFullYear();
  if (MOTION) intro(); else stickersDrag();

  fetch("content.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { build(d); after(d); })
    .catch(function () { after(null); });

  /* =========================================================
     Saturs
     ========================================================= */
  function todo(t, big) { return '<div class="todo' + (big ? " todo-big" : "") + '"><b>скоро здесь ♡</b>' + esc(t) + "</div>"; }

  function build(d) {
    var book = d.telegram || d.instagramDm;
    $$("[data-book]").forEach(function (a) { a.href = book; });
    $$("[data-ig]").forEach(function (a) { a.href = d.instagram; });

    $$("[data-field]").forEach(function (el) {
      var key = el.getAttribute("data-field"), v = get(d, key);
      if (key === "reviews") { el.innerHTML = chatHTML(v); return; }
      if (v && v.todo) { el.innerHTML = todo(v.todo, /program|students/.test(key)); return; }
      if (key === "course.program" && Array.isArray(v)) { el.innerHTML = programHTML(v); return; }
      if (key === "students" && Array.isArray(v)) { el.innerHTML = polaHTML(v); return; }
      if (Array.isArray(v)) { el.innerHTML = "<ul>" + v.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; return; }
      if (v != null) el.textContent = v;
    });

    $('[data-list="works"]').innerHTML = d.works.map(function (w, i) {
      return '<li><button type="button" data-i="' + i + '" aria-label="Открыть фото: ' + esc(w.alt) + '">' +
        '<img src="' + esc(w.src.replace(/\.webp$/, "-600.webp")) + '" width="600" height="800" loading="lazy" alt="' + esc(w.alt) + '"></button></li>';
    }).join("");
  }

  // Programma: [{ "title": "...", "items": ["...", "..."] }]
  function programHTML(list) {
    return '<ol class="p-list">' + list.map(function (p) {
      return '<li class="p-item"><span class="p-check" aria-hidden="true"></span><span>' + esc(p.title) +
        (p.items && p.items.length ? "<small>" + p.items.map(esc).join(", ") + "</small>" : "") + "</span></li>";
    }).join("") + "</ol>";
  }
  function polaHTML(list) {
    return '<ul class="pola">' + list.map(function (s) {
      return '<li><img src="' + esc(s.src) + '" loading="lazy" alt="' + esc(s.alt || "Работа ученицы") + '"></li>';
    }).join("") + "</ul>";
  }
  // Atsauksmes: [{ "text": "...", "name": "..." }] → burbuļi; kamēr nav, "raksta…" + vietturis
  function chatHTML(v) {
    if (Array.isArray(v)) {
      return v.map(function (r, i) {
        return '<div class="bubble' + (i % 2 ? " bubble-me" : "") + '">' + esc(r.text) + (r.name ? "<small>" + esc(r.name) + "</small>" : "") + "</div>";
      }).join("");
    }
    return '<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>' + todo(v && v.todo ? v.todo : "Отзывы учениц");
  }

  function after(d) {
    if (d) initLightbox(d.works);
    initFloat(); initBar();
    if (MOTION) scrollMotion(); else $$(".p-item").forEach(function (i) { i.classList.add("is-done"); });
    if (MOTION) sparks();
    root.classList.add("ready");
  }

  /* =========================================================
     Ievads: burti "uzpūšas", birka uzlīp, uzlīmes nokrīt
     ========================================================= */
  function intro() {
    var tl = gsap.timeline({ delay: .1 });
    tl.fromTo(".hero-title .chrome", { opacity: 0, scale: .3, rotation: function () { return rnd(-12, 12); } },
        { opacity: 1, scale: 1, rotation: 0, duration: .9, stagger: .12, ease: "elastic.out(1, .55)" })
      .fromTo(".tag-hero", { opacity: 0, scale: 2.2, rotation: -30 }, { opacity: 1, scale: 1, rotation: -6, duration: .5, ease: "back.out(2.5)" }, "-=.45")
      .fromTo(".sticker", { opacity: 0, y: function () { return rnd(-260, -160); }, rotation: function () { return rnd(-25, 25); } },
        { opacity: 1, y: 0, rotation: 0, duration: 1, stagger: .12, ease: "bounce.out" }, "-=.6")
      .add(function () { root.classList.add("intro-done"); stickersDrag(); });
    setTimeout(function () { if (!root.classList.contains("intro-done")) { tl.progress(1); } }, 4000);
  }

  // Uzlīmes var vilkt; paceltā uzlīme nonāk virspusē
  function stickersDrag() {
    if (!window.Draggable) return;
    var z = 10;
    Draggable.create(".sticker", {
      bounds: ".hero", edgeResistance: .7, zIndexBoost: false,
      onPress: function () { this.target.style.zIndex = ++z; gsap.to(this.target, { scale: 1.06, duration: .2 }); },
      onRelease: function () { gsap.to(this.target, { scale: 1, rotation: rnd(-6, 6), duration: .6, ease: "elastic.out(1, .4)" }); }
    });
  }

  /* =========================================================
     Ritināšana
     ========================================================= */
  function scrollMotion() {
    // kurs.exe "atveras" kā logs
    gsap.fromTo(".win", { scale: .55, opacity: 0, y: 60 }, { scale: 1, opacity: 1, y: 0, duration: .8, ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".course", start: "top 75%" } });

    // dienasgrāmata: lapa ieslīd, punkti atzīmējas ar sirsniņu
    gsap.fromTo(".diary", { y: 80, rotation: -6, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 1, ease: "back.out(1.4)",
      scrollTrigger: { trigger: ".diary-wrap", start: "top 80%" } });
    $$(".p-item").forEach(function (it) {
      ScrollTrigger.create({ trigger: it, start: "top 70%", onEnter: function () { it.classList.add("is-done"); }, onLeaveBack: function () { it.classList.remove("is-done"); } });
    });

    // virsraksti "uzpūšas"
    $$(".sec-title .chrome, .final-title .chrome").forEach(function (h) {
      gsap.fromTo(h, { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .9, ease: "elastic.out(1, .55)", scrollTrigger: { trigger: h, start: "top 85%" } });
    });
    $$(".tag-sec").forEach(function (t) {
      gsap.fromTo(t, { scale: 2, opacity: 0, rotation: 30 }, { scale: 1, opacity: 1, rotation: 5, duration: .5, ease: "back.out(2.5)", scrollTrigger: { trigger: t, start: "top 88%" } });
    });

    // uzlīmju siena: katra uzlīme "uzlīp" ar savu pagriezienu
    ScrollTrigger.batch(".wall li", { start: "top 90%", once: true, onEnter: function (els) {
      gsap.fromTo(els, { scale: .4, opacity: 0, y: 60 }, { scale: 1, opacity: 1, y: 0, duration: .7, stagger: .07, ease: "back.out(1.8)" });
    } });

    // polaroīdi "attīstās"
    ScrollTrigger.batch(".pola li", { start: "top 90%", once: true, onEnter: function (els) {
      gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .1, duration: .6, ease: "back.out(1.6)" });
      gsap.fromTo($$("img", els[0].parentNode), { filter: "brightness(2.2) saturate(0)" }, { filter: "brightness(1) saturate(1)", duration: 2.2, stagger: .1, ease: "power1.out" });
    } });

    // čats: ziņas parādās pa vienai
    gsap.fromTo(".phone", { y: 80, opacity: 0, rotation: 4 }, { y: 0, opacity: 1, rotation: 0, duration: .8, ease: "back.out(1.5)", scrollTrigger: { trigger: ".reviews", start: "top 80%" } });
    gsap.fromTo(".phone-chat > *", { opacity: 0, y: 20, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: .45, stagger: .5, ease: "back.out(2)",
      scrollTrigger: { trigger: ".phone-chat", start: "top 80%" } });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* =========================================================
     Dzirksteles: aiz peles; telefonā pie pieskāriena
     ========================================================= */
  function sparks() {
    var last = 0, live = 0;
    function spawn(x, y, n, spread) {
      for (var i = 0; i < n && live < 40; i++) {
        var s = document.createElement("span"); s.className = "spark"; document.body.appendChild(s); live++;
        gsap.set(s, { x: x, y: y, scale: rnd(.5, 1.2), rotation: rnd(0, 90) });
        gsap.to(s, { x: x + rnd(-spread, spread), y: y + rnd(-spread, spread * .4) - 20, rotation: "+=" + rnd(90, 200), scale: 0, opacity: 0,
          duration: rnd(.6, 1.1), ease: "power2.out", onComplete: function () { this.targets()[0].remove(); live--; } });
      }
    }
    if (FINE) addEventListener("pointermove", function (e) { var t = performance.now(); if (t - last < 45) return; last = t; spawn(e.clientX, e.clientY, 1, 26); }, { passive: true });
    addEventListener("pointerdown", function (e) { spawn(e.clientX, e.clientY, 8, 60); }, { passive: true });
  }

  /* ---------- Peldošā sirds un josla ---------- */
  function initFloat() {
    var f = $("#floatHeart"), heroOut = false, finalIn = false;
    var set = function () { f.classList.toggle("is-on", heroOut && !finalIn); };
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; set(); }, { threshold: .15 }).observe($(".hero"));
    new IntersectionObserver(function (e) { finalIn = e[0].isIntersecting; set(); }).observe($(".final"));
  }
  function initBar() {
    var bar = $(".bar"), last = 0;
    addEventListener("scroll", function () { var y = scrollY; bar.classList.toggle("is-hidden", y > last && y > 300); last = y; }, { passive: true });
  }

  /* ---------- Foto pilnekrānā ---------- */
  function initLightbox(works) {
    var dlg = $("#lightbox"), img = $(".lb-img", dlg), idx = 0, opener = null;
    if (!dlg.showModal) return;
    function show(i) {
      idx = (i + works.length) % works.length;
      img.src = works[idx].src; img.alt = works[idx].alt;
      if (MOTION) gsap.fromTo(img, { opacity: 0, scale: .85, rotation: rnd(-6, 6) }, { opacity: 1, scale: 1, rotation: 0, duration: .55, ease: "back.out(1.8)" });
    }
    $(".wall").addEventListener("click", function (e) {
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
})();
