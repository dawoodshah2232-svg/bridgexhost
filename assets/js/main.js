/* ============================================================
   BridgexHost v5 — interaction engine (vanilla JS)
   transform/opacity only · IntersectionObserver reveals ·
   prefers-reduced-motion respected · no fake availability
   ============================================================ */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var P = window.BHX_PRICING;
  var EMAIL = "contact@bridgingfx.net";

  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function money(n) { return "$" + n.toFixed(2); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; }); }

  /* ---------- header hide / show ---------- */
  var head = $(".site-head"), lastY = 0;
  if (head && !reduced) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y > 140 && y > lastY + 4) head.classList.add("hide");
      else if (y < lastY - 4 || y < 140) head.classList.remove("hide");
      lastY = y;
    }, { passive: true });
  }

  /* ---------- dropdowns ---------- */
  $all(".nav-item").forEach(function (item) {
    var btn = $(".nav-link", item);
    if (!btn || btn.tagName === "A") return;
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = item.classList.contains("open");
      $all(".nav-item.open").forEach(function (o) {
        o.classList.remove("open"); $(".nav-link", o).setAttribute("aria-expanded", "false");
      });
      if (!open) { item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    });
  });
  document.addEventListener("click", function () {
    $all(".nav-item.open").forEach(function (o) {
      o.classList.remove("open"); $(".nav-link", o).setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      $all(".nav-item.open").forEach(function (o) { o.classList.remove("open"); });
      document.body.classList.remove("menu-open");
    }
  });

  /* ---------- mobile menu ---------- */
  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
    $all(".mmenu a").forEach(function (a, i) {
      a.style.transitionDelay = (0.05 + i * 0.045) + "s";
    });
  }

  /* ---------- reveal on scroll ---------- */
  var rv = $all(".rv");
  if ("IntersectionObserver" in window && rv.length && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- FAQ accordion ---------- */
  $all(".qa").forEach(function (qa) {
    var btn = $(".q", qa), panel = $(".a", qa);
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var open = qa.classList.contains("open");
      var group = qa.closest(".faq");
      $all(".qa.open", group).forEach(function (o) {
        o.classList.remove("open");
        $(".a", o).style.maxHeight = null;
        $(".q", o).setAttribute("aria-expanded", "false");
      });
      if (!open) {
        qa.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- tabs (TLD grid) ---------- */
  $all("[data-tabs]").forEach(function (wrap) {
    var btns = $all("[data-tab]", wrap);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-selected", "false"); });
        b.classList.add("on"); b.setAttribute("aria-selected", "true");
        var ev = new CustomEvent("bhx:tab", { detail: b.getAttribute("data-tab"), bubbles: true });
        document.dispatchEvent(ev);
      });
    });
  });

  /* ---------- domain search (honest: prices only, never availability) ---------- */
  function parseDomain(raw) {
    var v = String(raw || "").trim().toLowerCase()
      .replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].split("?")[0];
    if (!v || v.length > 253 || !/^[a-z0-9.-]+$/.test(v)) return { ok: false, why: "bad-chars" };
    var parts = v.split(".");
    if (parts.length < 2) return { ok: false, why: "no-tld" };
    var tld = parts.pop(), sld = parts.join(".");
    if (!sld || sld.length > 63 || /^-|-$/.test(sld) || !/^[a-z0-9-]+$/.test(sld))
      return { ok: false, why: "bad-name" };
    if (!/^[a-z]{2,}$/.test(tld)) return { ok: false, why: "bad-tld" };
    return { ok: true, sld: sld, tld: tld, full: sld + "." + tld };
  }

  $all("[data-search]").forEach(function (form) {
    var input = $("input", form), segBtns = $all(".seg button", form),
        out = $(form.getAttribute("data-search-out") || ".sr", form.parentNode) || $(".sr"),
        mode = form.getAttribute("data-mode") || "register";
    segBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        segBtns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on"); mode = b.getAttribute("data-mode");
        input.placeholder = mode === "transfer" ? "Domain you want to move…" : "Find your domain…";
      });
    });
    var _prefillQ = null;
    try { _prefillQ = new URLSearchParams(location.search).get("domain"); } catch (e) {}
    if (_prefillQ && input && !input.value) input.value = _prefillQ;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = parseDomain(input.value);
      if (!out) return;
      out.classList.remove("show");
      function render(html, err) {
        out.innerHTML = '<div class="sr-card' + (err ? " sr-err" : "") + '">' + html + "</div>";
        out.classList.add("show");
        out.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
      }
      if (!r.ok) {
        var msg = r.why === "no-tld"
          ? "Add an extension — for example, <b>myname.com</b>."
          : "That doesn't look like a valid domain. Use letters, numbers and hyphens — e.g. <b>myname.com</b>.";
        render('<div><div class="sr-dom">Hmm, check that name</div>' +
          '<p class="sr-note">' + msg + "</p></div>", true);
        return;
      }
      if (mode === "transfer") {
        if (/transfers\.html$/.test(location.pathname)) {
          render('<div><div class="sr-dom">' + esc(r.full) + '</div>' +
            '<p class="sr-note">To move <b>' + esc(r.full) + '</b> to BridgexHost: unlock it at your current registrar, grab the authorization (EPP) code, and email both to <a href="mailto:' + EMAIL + '">' + EMAIL + "</a>. Your remaining registration time comes with you, and your site stays up throughout.</p></div>" +
            '<div style="flex-basis:100%"><a class="btn btn-blue btn-sm" href="mailto:' + EMAIL + "?subject=" + encodeURIComponent("Transfer: " + r.full) +
            "&body=" + encodeURIComponent("Hi BridgexHost,\n\nI'd like to transfer " + r.full + " to you.\n\nAuth code:\n") + '">Start transfer</a></div>', false);
          return;
        }
        location.href = "transfers.html?domain=" + encodeURIComponent(r.full);
        return;
      }
      var info = P && P.find(r.tld);
      if (!info) {
        render('<div><div class="sr-dom">' + esc(r.sld) + '<span class="t">.' + esc(r.tld) + "</span></div>" +
          '<p class="sr-note">We don\'t publish pricing for <b>.' + esc(r.tld) + "</b> yet — " +
          'email <a href="mailto:' + EMAIL + "?subject=" + encodeURIComponent("Price check: ." + r.tld) + '">' + EMAIL + "</a> " +
          "and we'll check it for you.</p></div>" +
          '<div class="sr-price"><a class="btn btn-ghost btn-sm" href="pricing.html">See all prices</a></div>', false);
        return;
      }
      var first = money(info.reg), renew = info.renewKnown ? money(info.renew) : "Standard rate";
      render('<div><div class="sr-dom">' + esc(r.sld) + '<span class="t">.' + esc(r.tld) + "</span></div>" +
        '<p class="sr-note">' +
        (info.regPromo ? '<span class="tag tag-amber" style="margin-right:8px">First-year offer</span>' : "") +
        "First year <b>" + first + "</b> · Renewal <b>" + renew + "</b>. " +
        "Live availability is confirmed when you order — we show real prices, not guesswork.</p></div>" +
        '<div class="sr-price"><b>' + first + "</b><small>first year</small></div>" +
        '<div style="flex-basis:100%;display:flex;gap:10px;flex-wrap:wrap">' +
        '<a class="btn btn-blue btn-sm" href="mailto:' + EMAIL + "?subject=" + encodeURIComponent("Order: " + r.full) +
        "&body=" + encodeURIComponent("Hi BridgexHost,\n\nI'd like to register " + r.full + " (" + first + " first year).\n\nName:\n") + '">Order this domain</a>' +
        '<a class="btn btn-ghost btn-sm" href="pricing.html">Compare prices</a></div>', false);
    });

    // auto-submit on the transfers page when ?domain= is present
    if (_prefillQ && form.getAttribute("data-mode") === "transfer") {
      form.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });

  /* ---------- homepage: price pills ---------- */
  $all("[data-pills]").forEach(function (el) {
    if (!P) return;
    var picks = ["com", "shop", "xyz", "io", "ai", "co"];
    el.innerHTML = picks.map(function (t) {
      var d = P.find(t); if (!d) return "";
      return '<a class="ppill" href="pricing.html"><span class="tld">.' + d.tld + "</span><b>" + money(d.reg) + "</b>" +
        '<span class="yr">' + (d.regPromo ? "1st yr" : "/yr") + "</span></a>";
    }).join("");
  });

  /* ---------- generic TLD card list: data-tldchips="com,net,ai" ---------- */
  $all("[data-tldchips]").forEach(function (el) {
    if (!P) return;
    var list = el.getAttribute("data-tldchips").split(",");
    el.innerHTML = list.map(function (t) {
      var d = P.find(t.trim()); if (!d) return "";
      return '<a class="tld" href="pricing.html"><span class="tn">.' + d.tld + "</span>" +
        '<span class="tp"><b>' + money(d.reg) + "</b><small>" + (d.regPromo ? "1st yr" : "/yr") + "</small></span></a>";
    }).join("");
  });

  /* ---------- homepage: marquee ---------- */
  $all("[data-marquee]").forEach(function (el) {
    if (!P) return;
    var items = P.TLDS.slice(0, 14).map(function (d) {
      return '<span><b>.' + d.tld + "</b> " + money(d.reg) + (d.regPromo ? " 1st yr" : "") + ' <i class="dot">•</i></span>';
    }).join("");
    el.innerHTML = '<div class="mq-track">' + items + items + "</div>";
  });

  /* ---------- homepage: offer cards ---------- */
  $all("[data-offers]").forEach(function (el) {
    if (!P) return;
    var offers = P.TLDS.filter(function (d) { return d.regPromo; }).slice(0, 6);
    el.innerHTML = offers.map(function (d) {
      return '<div class="offer rv"><span class="tag tag-amber">First-year offer</span>' +
        '<div class="tld">.' + d.tld + "</div>" +
        '<div class="pr"><b>' + money(d.reg) + "</b><s>" + money(d.renew) + "</s></div>" +
        "<small>then " + money(d.renew) + "/yr on renewal</small>" +
        '<a class="btn btn-white btn-sm" href="domains.html?domain=myname.' + d.tld + '">Claim .' + d.tld + "</a></div>";
    }).join("");
    bindReveals(el);
  });

  /* ---------- homepage: TLD tab grid ---------- */
  $all("[data-tldgrid]").forEach(function (wrap) {
    if (!P) return;
    var grid = $("[data-tldgrid-items]", wrap) || wrap;
    var featured = ["com", "ai", "io", "net", "co", "dev", "org", "in", "xyz"];
    function draw(tab) {
      grid.innerHTML = featured.map(function (t, i) {
        var d = P.find(t); if (!d) return "";
        var price, sub;
        if (tab === "renew") { price = d.renewKnown ? money(d.renew) : "Standard"; sub = d.renewKnown ? "/yr renewal" : "rate on request"; }
        else if (tab === "transfer") { price = money(d.reg); sub = "transfer incl. 1-yr renewal"; }
        else { price = money(d.reg); sub = d.regPromo ? "1st yr offer" : "first year"; }
        return '<a class="tld' + (i === 0 ? " hot" : "") + '" href="pricing.html">' +
          '<span class="tn">.' + d.tld + "</span>" +
          '<span class="tp"><b>' + price + "</b><small>" + sub + "</small></span></a>";
      }).join("");
    }
    draw("register");
    document.addEventListener("bhx:tab", function (e) { draw(e.detail); });
  });

  /* ---------- pricing page: full table ---------- */
  $all("[data-ptable]").forEach(function (wrap) {
    if (!P) return;
    var rows = P.TLDS.map(function (d) {
      var renewCell = d.renewKnown
        ? '<span class="pr">' + money(d.renew) + " <small>/yr</small></span>"
        : '<span class="std">Standard rate<small style="display:block;font-size:.75rem">confirmed at order</small></span>';
      return "<tr><td><span class='ext'>." + d.tld + "</span>" +
        (d.regPromo ? ' <span class="tag tag-amber" style="margin-left:8px">Offer</span>' : "") + "</td>" +
        '<td><span class="pr">' + money(d.reg) + ' <small>' + (d.regPromo ? "1st yr" : "/yr") + "</small></span></td>" +
        "<td>" + renewCell + "</td>" +
        '<td class="rowcta"><a class="btn btn-ghost btn-sm" href="mailto:' + EMAIL +
        "?subject=" + encodeURIComponent("Order: myname." + d.tld) + '">Register</a></td></tr>';
    }).join("");
    $("tbody", wrap).innerHTML = rows;
  });

  /* ---------- email plans ---------- */
  $all("[data-emailplans]").forEach(function (el) {
    if (!P) return;
    el.innerHTML = P.EMAIL.map(function (p, i) {
      return '<div class="plan' + (i === 1 ? " hot" : "") + ' rv">' +
        (i === 1 ? '<span class="tag tag-blue" style="align-self:flex-start;margin-bottom:14px">Most popular</span>' : "") +
        '<div class="pname">' + esc(p.name) + '</div><div class="ptag">' + esc(p.tag) + "</div>" +
        '<div class="pprice">' + money(p.price) + "<small>" + esc(p.unit) + "</small></div>" +
        (p.note ? '<div class="pquote">' + esc(p.note) + "</div>" : "") +
        "<ul>" + p.feats.map(function (f) {
          return '<li><svg viewBox="0 0 24 24" fill="none" stroke="#3ddc84" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + esc(f) + "</li>";
        }).join("") + "</ul>" +
        '<a class="btn ' + (i === 1 ? "btn-blue" : "btn-ghost") + '" href="mailto:' + EMAIL +
        "?subject=" + encodeURIComponent("Order: " + p.name) + '">Order ' + esc(p.name) + "</a></div>";
    }).join("");
    bindReveals(el);
  });

  /* ---------- hosting plans ---------- */
  $all("[data-hostingplans]").forEach(function (el) {
    if (!P) return;
    el.innerHTML = P.HOSTING.map(function (p, i) {
      return '<div class="plan' + (p.badge ? " hot" : "") + ' rv">' +
        (p.badge ? '<span class="tag tag-blue" style="align-self:flex-start;margin-bottom:14px">' + esc(p.badge) + "</span>" : "") +
        '<div class="pname">' + esc(p.name) + '</div><div class="ptag">' + esc(p.tag) + " · " + esc(p.os) + "</div>" +
        '<div class="pquote">Contact us for exact pricing</div>' +
        "<ul>" + p.feats.map(function (f) {
          return '<li><svg viewBox="0 0 24 24" fill="none" stroke="#3ddc84" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + esc(f) + "</li>";
        }).join("") + "</ul>" +
        '<a class="btn ' + (p.badge ? "btn-blue" : "btn-ghost") + '" href="contact.html?topic=Hosting&plan=' + encodeURIComponent(p.name) + '">Get a quote</a></div>';
    }).join("");
    bindReveals(el);
  });

  /* ---------- ssl plans ---------- */
  $all("[data-sslplans]").forEach(function (el) {
    if (!P) return;
    el.innerHTML = P.SSLC.map(function (p, i) {
      return '<div class="plan' + (p.badge ? " hot" : "") + ' rv">' +
        (p.badge ? '<span class="tag tag-blue" style="align-self:flex-start;margin-bottom:14px">' + esc(p.badge) + "</span>" : "") +
        '<div class="pname">' + esc(p.name) + '</div><div class="ptag">' + esc(p.type) + " · Sectigo</div>" +
        '<div class="pquote">Contact us for exact pricing</div>' +
        "<ul>" + p.feats.map(function (f) {
          return '<li><svg viewBox="0 0 24 24" fill="none" stroke="#3ddc84" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + esc(f) + "</li>";
        }).join("") + "</ul>" +
        '<a class="btn ' + (p.badge ? "btn-blue" : "btn-ghost") + '" href="contact.html?topic=SSL&plan=' + encodeURIComponent(p.name) + '">Get a quote</a></div>';
    }).join("");
    bindReveals(el);
  });

  /* ---------- contact form → pre-addressed email ---------- */
  $all("[data-contact]").forEach(function (form) {
    try {
      var q = new URLSearchParams(location.search);
      var topic = q.get("topic"), plan = q.get("plan"), dom = q.get("domain");
      if (topic) { var sel = $("[name=topic]", form); if (sel) sel.value = topic; }
      var msg = $("[name=message]", form);
      if (msg) {
        var pre = "";
        if (plan) pre += "I'm interested in the " + plan + " plan.\n\n";
        if (dom) pre += "Domain: " + dom + "\n\n";
        if (pre) msg.value = pre;
      }
    } catch (e) {}
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("[name=name]", form).value.trim(),
          em = $("[name=email]", form).value.trim(),
          tp = $("[name=topic]", form).value,
          ms = $("[name=message]", form).value.trim();
      var subject = "Website enquiry — " + tp + (name ? " from " + name : "");
      var body = ms + "\n\n—\nName: " + name + "\nEmail: " + em + "\nTopic: " + tp;
      location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  });

  /* ---------- newsletter → email signup ---------- */
  $all("[data-news]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = $("input[type=email]", form).value.trim();
      if (!em || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) {
        $("input[type=email]", form).focus();
        return;
      }
      location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Newsletter signup") +
        "&body=" + encodeURIComponent("Please add me to the BridgexHost newsletter.\n\nEmail: " + em + "\n");
    });
  });

  /* ---------- footer year ---------- */
  $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* reveal helper for JS-injected nodes */
  function bindReveals(root) {
    var nodes = $all(".rv:not(.in)", root);
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io2.unobserve(en.target); }
      });
    }, { threshold: 0.1 });
    nodes.forEach(function (el) { io2.observe(el); });
  }
})();
