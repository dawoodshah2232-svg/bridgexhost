/* ============================================================
   BridgexHost pricing data — SINGLE SOURCE OF TRUTH.
   Wholesale USD: ResellerClub panel, observed 2026-10-06 (base slab).
   Retail = floor(wholesale x 1.30) + 0.99  →  30% margin, .99 pricing.
   `promo` = first-year wholesale where ResellerClub lists a promo price.
   `regular` = standard wholesale (used for the renewal column).
   Where no regular wholesale is published, renewal shows "Standard rate"
   with an explanatory note on the pricing page. Nothing is invented.
   ============================================================ */
(function () {
  "use strict";

  var MARGIN = 1.30;

  function retail(usd) { return Math.floor(usd * MARGIN) + 0.99; }
  function money(n) { return "$" + n.toFixed(2); }

  // tld, wholesale (regular), promo wholesale (first year) or null
  var RAW = [
    { tld: "com",   w: 13.49 },
    { tld: "net",   w: 14.99 },
    { tld: "org",   w: 15.99, promo: 10.29 },
    { tld: "in",    w: 12.89 },
    { tld: "co.in", w: 11.19 },
    { tld: "io",    w: 58.39, promo: 34.99 },
    { tld: "ai",    w: 101.49 },
    { tld: "biz",   w: 25.19, promo: 7.29 },
    { tld: "info",  w: 31.19, promo: 4.19 },
    { tld: "us",    w: 8.99,  promo: 4.99 },
    { tld: "co",    w: 35.69, promo: 17.89 },
    { tld: "me",    w: 18.99 },
    { tld: "tv",    w: 33.59 },
    { tld: "uk",    w: 8.79 },
    { tld: "eu",    w: 9.69,  promo: 5.29 },
    { tld: "xyz",   w: 16.89, promo: 2.39 },
    { tld: "club",  w: 23.09, promo: 1.49 },
    { tld: "shop",  w: 39.29, promo: 0.99 },
    { tld: "online",w: 36.99, promo: 6.99 },
    { tld: "app",   w: 18.39 },
    { tld: "dev",   w: 16.39 },
    { tld: "page",  w: 16.69 },
    { tld: "de",    w: 7.39 },
    { tld: "ca",    w: 15.09 },
    { tld: "cc",    w: 10.49 },
    { tld: "ws",    w: 28.99 },
    { tld: "mobi",  w: 52.49 },
    { tld: "asia",  w: 14.49 },
    { tld: "name",  w: 10.49 },
    { tld: "pro",   w: 32.39, promo: 3.59 }
  ];

  var TLDS = RAW.map(function (r) {
    var hasPromo = (r.promo != null);
    var regW = hasPromo ? r.promo : r.w;
    return {
      tld: r.tld,
      reg: retail(regW),        // first-year retail (promo wholesale if listed)
      regPromo: hasPromo,       // true → "first-year offer" badge
      renew: retail(r.w),       // renewal retail from regular wholesale…
      renewKnown: hasPromo      // …but only promo TLDs publish a regular wholesale,
                                // so others show "Standard rate" + explanatory note
    };
  });

  function find(tld) {
    tld = String(tld).toLowerCase().replace(/^\./, "");
    for (var i = 0; i < TLDS.length; i++) {
      if (TLDS[i].tld === tld) return TLDS[i];
    }
    return null;
  }

  window.BHX_PRICING = { TLDS: TLDS, find: find, money: money, retail: retail };
})();
