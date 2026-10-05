/* BridgexHost — interaction + motion engine (vanilla, transform/opacity only) */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var P = window.BHX_PRICING;

  /* ---------- scroll reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger"), menu = document.getElementById("mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q"), a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null;
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- TLD marquee ---------- */
  function buildMarquee(id, items) {
    var band = document.getElementById(id);
    if (!band || !P) return;
    var track = document.createElement("div");
    track.className = "marquee";
    var html = items.map(function (t) {
      return '<span class="tld-pill">.' + t.tld + ' <span class="p">' + P.money(t.reg) + '</span>' +
        (t.regPromo ? '<span class="promo-tag">OFFER</span>' : '') + '</span>';
    }).join("");
    track.innerHTML = html + html; /* duplicate for seamless loop */
    band.appendChild(track);
  }

  /* ---------- pricing rail cards ---------- */
  var TAGS = { "com":"popular", "net":"popular", "org":"popular", "io":"tech", "ai":"tech",
    "app":"tech", "dev":"tech", "shop":"budget", "xyz":"budget", "club":"budget",
    "in":"business", "co":"business", "co.in":"business", "online":"business",
    "me":"business", "pro":"business" };

  function cardHTML(t) {
    var renew = t.regPromo ? P.money(t.renew) + "/yr" : "Standard rate";
    return '<article class="tcard' + (t.regPromo ? " hot" : "") + '" data-tag="' + (TAGS[t.tld] || "popular") + '">' +
      (t.regPromo ? '<span class="best-ribbon">FIRST-YEAR OFFER</span>' : "") +
      '<div class="tld">.' + t.tld + '</div>' +
      '<div class="price">' + P.money(t.reg) + ' <small>/yr</small></div>' +
      '<div class="renew">Renewal: <b>' + renew + '</b></div>' +
      '<a class="btn btn-outline btn-sm" href="contact.html?domain=yourbrand.' + t.tld + '">Select</a>' +
      '</article>';
  }

  function renderRail(filter) {
    var rail = document.getElementById("rail");
    if (!rail || !P) return;
    var featured = ["com","io","ai","shop","xyz","club","in","co","app","dev","net","org"];
    var list = featured.map(function (k) { return P.find(k); }).filter(Boolean);
    if (filter && filter !== "all") list = list.filter(function (t) { return TAGS[t.tld] === filter; });
    rail.innerHTML = list.map(cardHTML).join("");
    var note = document.getElementById("railNote");
    if (note) note.textContent = list.length + " options · swipe or use the arrows";
    updateArrows();
  }

  function updateArrows() {
    var rail = document.getElementById("rail");
    if (!rail) return;
    var prev = document.getElementById("railPrev"), next = document.getElementById("railNext");
    if (!prev || !next) return;
    prev.disabled = rail.scrollLeft <= 4;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
  }

  var rail = document.getElementById("rail");
  if (rail) {
    rail.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    document.getElementById("railPrev").addEventListener("click", function () {
      rail.scrollBy({ left: -300, behavior: reduced ? "auto" : "smooth" });
    });
    document.getElementById("railNext").addEventListener("click", function () {
      rail.scrollBy({ left: 300, behavior: reduced ? "auto" : "smooth" });
    });
  }

  document.querySelectorAll(".pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".pick").forEach(function (b) { b.classList.remove("on"); });
      btn.classList.add("on");
      renderRail(btn.getAttribute("data-filter"));
    });
  });

  /* ---------- full pricing grid (pricing page) ---------- */
  function renderGrid() {
    var grid = document.getElementById("priceGrid");
    if (!grid || !P) return;
    grid.innerHTML = P.TLDS.map(function (t) {
      var renew = t.regPromo ? P.money(t.renew) + "/yr" : "Standard rate";
      return '<article class="pcard reveal' + (t.regPromo ? " hot" : "") + '">' +
        (t.regPromo ? '<span class="best-ribbon">FIRST-YEAR OFFER</span>' : "") +
        '<div class="tld">.' + t.tld + '</div>' +
        '<div class="reg">' + P.money(t.reg) + ' <small>/ first year' + (t.regPromo ? "" : "") + '</small></div>' +
        '<div class="renew">Renewal: <b>' + renew + '</b></div>' +
        '<a class="btn btn-outline btn-sm" href="contact.html?domain=yourbrand.' + t.tld + '">Select</a>' +
        '</article>';
    }).join("");
    grid.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ---------- floating strip (hero) ---------- */
  function renderStrip() {
    var strip = document.getElementById("floatStrip");
    if (!strip || !P) return;
    var picks = ["com", "io", "ai", "shop"];
    strip.innerHTML = picks.map(function (k) {
      var t = P.find(k);
      return '<div class="tile"><b>.' + t.tld + '</b><span>' + P.money(t.reg) + '</span></div>';
    }).join("");
  }

  /* ---------- domain search (honest: price only, never availability) ---------- */
  function validDomain(s) {
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(s) && s.length <= 253;
  }
  function doSearch(form) {
    var input = form.querySelector("input"), out = form.parentElement.querySelector(".sc-result");
    var raw = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!validDomain(raw)) {
      out.innerHTML = '<div class="sc-err">Please enter a valid domain, e.g. yourbrand.com</div>';
      return;
    }
    var parts = raw.split("."), tld = parts.slice(1).join(".") || parts[0];
    var t = P ? P.find(tld) : null;
    if (!t) {
      out.innerHTML = '<div class="sc-row"><div><div class="dom">' + raw +
        '</div><div class="pr">Not on our published list — <a href="contact.html?domain=' +
        encodeURIComponent(raw) + '" style="color:var(--teal-700);font-weight:700">email us</a> for an exact quote. We never guess prices.</div></div></div>' +
        '<div class="sc-note">Live availability is confirmed only at checkout — we never show made-up “available / taken” badges.</div>';
      return;
    }
    var renew = t.regPromo ? P.money(t.renew) + "/yr" : "Standard rate";
    out.innerHTML = '<div class="sc-row"><div style="min-width:0"><div class="dom">' + raw +
      (t.regPromo ? '<span class="promo-tag">FIRST-YEAR OFFER</span>' : '') +
      '</div><div class="pr"><b>' + P.money(t.reg) + '</b> first year · Renewal: <b>' + renew + '</b></div></div>' +
      '<a class="btn btn-teal btn-sm" href="contact.html?domain=' + encodeURIComponent(raw) + '">Select</a></div>' +
      '<div class="sc-note">Live availability is confirmed only at checkout — we never show made-up “available / taken” badges.</div>';
  }
  document.querySelectorAll(".sc-form").forEach(function (form) {
    form.addEventListener("submit", function (e) { e.preventDefault(); doSearch(form); });
  });

  /* ---------- contact form → mailto, ?domain= prefill ---------- */
  (function () {
    var params = new URLSearchParams(window.location.search);
    var d = params.get("domain");
    if (d) {
      var di = document.getElementById("cDomain"), mi = document.getElementById("cMsg");
      if (di) di.value = d;
      if (mi && !mi.value) mi.value = "Hi BridgexHost team,\n\nI'd like to register " + d + ".\n\nThanks,";
    }
    var form = document.getElementById("contactForm");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cName").value.trim(),
          email = document.getElementById("cEmail").value.trim(),
          dom = document.getElementById("cDomain").value.trim(),
          msg = document.getElementById("cMsg").value.trim();
      var subject = "BridgexHost enquiry" + (dom ? " — " + dom : "");
      var body = "Name: " + name + "\nEmail: " + email + (dom ? "\nDomain: " + dom : "") + "\n\n" + msg;
      window.location.href = "mailto:contact@bridgingfx.net?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  })();

  /* ---------- email / hosting / ssl plan grids ---------- */
  function planCard(o, opts) {
    opts = opts || {};
    var priceHTML;
    if (opts.priceKnown === false) {
      priceHTML = '<div class="reg contact-price">Contact us<small>for exact pricing</small></div>';
    } else {
      priceHTML = '<div class="reg">' + P.money(o.price) + ' <small>' + o.unit + '</small></div>';
    }
    var feats = (o.feats || []).map(function (f) {
      return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + f + '</li>';
    }).join("");
    var cta = opts.priceKnown === false
      ? '<a class="btn btn-outline btn-sm" href="mailto:contact@bridgingfx.net?subject=' +
        encodeURIComponent("BridgexHost enquiry — " + o.name) + '">Get a quote</a>'
      : '<a class="btn btn-teal btn-sm" href="mailto:contact@bridgingfx.net?subject=' +
        encodeURIComponent("BridgexHost enquiry — " + o.name) +
        '&body=' + encodeURIComponent("Hi BridgexHost team,\n\nI'd like " + o.name + " (" + P.money(o.price) + o.unit + ").\n\nThanks,") +
        '">Choose plan</a>';
    return '<article class="pcard reveal' + (o.badge ? " hot" : "") + '">' +
      (o.badge ? '<span class="best-ribbon">' + o.badge + '</span>' : "") +
      '<div class="tld">' + o.name + '</div>' +
      '<div class="plan-tag">' + (o.type || o.tag || "") + '</div>' +
      priceHTML +
      (o.note ? '<div class="plan-note">' + o.note + '</div>' : "") +
      '<ul class="check-list plan-feats">' + feats + '</ul>' + cta + '</article>';
  }

  function renderEmail() {
    var g = document.getElementById("emailGrid");
    if (!g || !P || !P.EMAIL) return;
    g.innerHTML = P.EMAIL.map(function (e) { return planCard(e, {}); }).join("");
    g.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }
  function renderHosting() {
    var g = document.getElementById("hostingGrid");
    if (!g || !P || !P.HOSTING) return;
    g.innerHTML = P.HOSTING.map(function (h) { return planCard(h, { priceKnown: false }); }).join("");
    g.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }
  function renderSSL() {
    var g = document.getElementById("sslGrid");
    if (!g || !P || !P.SSLC) return;
    g.innerHTML = P.SSLC.map(function (s) { return planCard(s, { priceKnown: false }); }).join("");
    g.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ---------- boot ---------- */
  buildMarquee("mq", P ? P.TLDS : []);
  renderStrip();
  renderRail("all");
  renderGrid();
  renderEmail();
  renderHosting();
  renderSSL();
  updateArrows();
})();
