/* ============================================================
   BridgexHost v2 — motion + interaction engine (vanilla JS)
   Rules: transform/opacity only, interruptible, pointer-down feedback,
   pointer effects desktop-only, prefers-reduced-motion kills everything.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- nav: hide on scroll down, show on up ---------- */
  var nav = document.getElementById("nav");
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (nav) {
      if (y > 140 && y > lastY) nav.classList.add("hidden");
      else nav.classList.remove("hidden");
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll reveals (staggered) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1400, start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- hero: rotating TLD typewriter ---------- */
  var tldEl = document.getElementById("tldCycle");
  var heroInput = document.getElementById("giantInput");
  var TLDS_ROTATE = ["com", "io", "ai", "in", "co", "dev"];
  var ri = 0, typing = false;
  function rotateTld() {
    if (!tldEl || typing || reduced) return;
    tldEl.classList.add("swap");
    setTimeout(function () {
      ri = (ri + 1) % TLDS_ROTATE.length;
      tldEl.textContent = "." + TLDS_ROTATE[ri];
      tldEl.classList.remove("swap");
    }, 260);
  }
  var rotTimer = null;
  if (tldEl && !reduced) rotTimer = setInterval(rotateTld, 2600);
  if (heroInput) {
    heroInput.addEventListener("focus", function () { typing = true; if (rotTimer) clearInterval(rotTimer); });
    heroInput.addEventListener("blur", function () {
      if (!heroInput.value) { typing = false; if (!reduced && !rotTimer) rotTimer = setInterval(rotateTld, 2600); }
    });
    heroInput.addEventListener("input", function () { typing = true; if (rotTimer) { clearInterval(rotTimer); rotTimer = null; } });
  }

  /* ---------- magnetic buttons (desktop only) ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll(".btn, .mini-btn").forEach(function (btn) {
      var strength = 22;
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x / r.width * strength) + "px," + (y / r.height * strength) + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transition = "transform 0.45s cubic-bezier(0.22,1,0.36,1)";
        btn.style.transform = "translate(0,0)";
        setTimeout(function () { btn.style.transition = ""; }, 460);
      });
    });
  }

  /* ---------- tilt on cards (desktop only) ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (px * 7) + "deg) rotateX(" + (-py * 7) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
        card.style.transform = "";
        setTimeout(function () { card.style.transition = ""; }, 520);
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- ticker: build from pricing data ---------- */
  function buildTicker() {
    var track = document.getElementById("tickerTrack");
    if (!track || !window.BHX_PRICING) return;
    var items = window.BHX_PRICING.TLDS.slice(0, 18).map(function (t) {
      var label = t.regPromo ? "first yr" : "yr";
      return '<span class="tick-item"><span class="t">.' + t.tld + '</span>' +
        '<span class="p">' + window.BHX_PRICING.money(t.reg) + " " + label + '</span>' +
        '<span class="dot">·</span></span>';
    }).join("");
    track.innerHTML = items + items; // seamless loop (translateX -50%)
  }

  /* ---------- pricing table render ---------- */
  function renderTable() {
    var body = document.getElementById("priceTableBody");
    if (!body || !window.BHX_PRICING) return;
    body.innerHTML = window.BHX_PRICING.TLDS.map(function (t) {
      var regCell = window.BHX_PRICING.money(t.reg) +
        (t.regPromo ? ' <span class="muted" style="font-size:.82rem">first year</span>' : "");
      var badge = t.regPromo ? '<span class="badge-promo">FIRST-YEAR OFFER</span>' : "";
      var renewCell = t.renewKnown
        ? '<span class="ren">' + window.BHX_PRICING.money(t.renew) + "/yr</span>"
        : '<span class="ren">Standard rate</span>';
      return "<tr><td><span class='tld'>." + t.tld + "</span>" + badge + "</td>" +
        "<td class='reg'>" + regCell + "</td><td>" + renewCell + "</td>" +
        "<td><a class='mini-btn' href='contact.html?domain=example." + t.tld + "'>Register</a></td></tr>";
    }).join("");
  }

  /* ---------- domain search: HONEST pricing, never availability ---------- */
  function validDomain(raw) {
    var s = String(raw).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (!s || s.length > 253) return null;
    var parts = s.split(".");
    if (parts.length < 2) return null;
    var name = parts.slice(0, -1).join(".");
    var tld = parts[parts.length - 1];
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(name)) return null;
    if (!/^[a-z]{2,}$/.test(tld)) return null;
    return { name: name, tld: tld, full: name + "." + tld };
  }

  function wireSearch(formId, inputId, resultId) {
    var form = document.getElementById(formId);
    var input = document.getElementById(inputId);
    var result = document.getElementById(resultId);
    if (!form || !input || !result || !window.BHX_PRICING) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = validDomain(input.value);
      if (!d) {
        result.className = "search-result show error";
        result.innerHTML = '<div class="domain">That doesn\u2019t look like a domain.</div>' +
          '<p class="note">Try something like <b>yourbrand.com</b> — letters, numbers and hyphens, ending in an extension.</p>';
        return;
      }
      var t = window.BHX_PRICING.find(d.tld);
      if (!t) {
        result.className = "search-result show";
        result.innerHTML = '<div class="domain">' + d.full + "</div>" +
          '<p class="note">.' + d.tld + ' isn\u2019t in our published price list yet — email us at <b>contact@bridgingfx.net</b> and we\u2019ll quote it. We never guess prices.</p>' +
          '<div class="row"><a class="btn btn-white" href="contact.html?domain=' + encodeURIComponent(d.full) + '">Ask for a quote</a></div>';
        return;
      }
      var renewTxt = t.renewKnown
        ? window.BHX_PRICING.money(t.renew) + "/yr on renewal"
        : "renewal at standard rate";
      result.className = "search-result show";
      result.innerHTML = '<div class="domain">' + d.full + "</div>" +
        '<div class="row"><p class="p"><b>' + window.BHX_PRICING.money(t.reg) + "</b>" +
        (t.regPromo ? " first year" : " / year") +
        ' · <span class="muted">' + renewTxt + "</span></p>" +
        '<a class="btn btn-white" href="contact.html?domain=' + encodeURIComponent(d.full) + '">Continue</a></div>' +
        '<p class="note">Exact retail price for this extension. Live availability is confirmed when you order — we never show faked availability badges.</p>';
      result.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    });
  }

  /* ---------- contact form: prefill domain, mailto ---------- */
  function wireContact() {
    var params = new URLSearchParams(window.location.search);
    var domain = params.get("domain");
    var msg = document.getElementById("cf-message");
    var subj = document.getElementById("cf-subject");
    if (domain && msg) {
      msg.value = "Hi BridgexHost team,\n\nI'd like to register: " + domain + "\n\nName:\nCompany:";
      if (subj) subj.value = "Domain order: " + domain;
    }
    var form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var s = (subj && subj.value) || "Website enquiry";
        var b = (msg && msg.value) || "";
        window.location.href = "mailto:contact@bridgingfx.net?subject=" +
          encodeURIComponent(s) + "&body=" + encodeURIComponent(b);
      });
    }
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildTicker();
    renderTable();
    wireSearch("giantForm", "giantInput", "giantResult");
    wireContact();
  });
})();
