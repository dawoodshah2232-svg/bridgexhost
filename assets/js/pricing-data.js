/* ============================================================
   BridgexHost pricing data — SINGLE SOURCE OF TRUTH.
   Wholesale USD: ResellerClub panel, observed 2026-10-06 (base slab).
   Retail = floor(wholesale x 1.15) + 0.99  →  15% margin, .99 pricing.
   `promo` = first-year wholesale where ResellerClub lists a promo price.
   `regular` = standard wholesale (used for the renewal column).
   Where no regular wholesale is published, renewal shows "Standard rate"
   with an explanatory note on the pricing page. Nothing is invented.
   ============================================================ */
(function () {
  "use strict";

  var MARGIN = 1.15;

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

  /* ---------- EMAIL (official ResellerClub reseller "from" wholesale,
     resellerclub.com/email, observed 2026-10-06; retail = x1.30 -> .99) */
  var EMAIL = [
    { id: "business", name: "Business Email",
      tag: "Entry-level professional email for startups",
      w: 0.45, price: retail(0.45), unit: "/acc/mo", whiteLabel: true,
      feats: ["5 GB storage per account", "Email on your own domain",
        "POP3, IMAP & webmail sync", "Calendar, contacts & auto-responders",
        "ClamAV anti-virus + branded SSL", "Add 5 GB storage blocks as you grow"] },
    { id: "enterprise", name: "Enterprise Email",
      tag: "Robust email for growing teams",
      w: 2.00, price: retail(2.00), unit: "/acc/mo", whiteLabel: true,
      feats: ["30 GB mailbox per account", "Extra storage $0.20 / 5 GB",
        "Calendar & address book", "Sync across all devices",
        "Auto-responders & forwarding", "Cloudmark protection + branded SSL"] },
    { id: "titan", name: "Titan Email",
      tag: "Modern business email, white-label ready",
      w: 0.69, price: retail(0.69), unit: "/acc/mo", whiteLabel: false,
      note: "Titan branding retained",
      feats: ["Mailboxes on your domain", "Clean webmail + iOS/Android apps",
        "Read receipts & follow-up reminders", "Calendar & contacts built in",
        "One-click mailbox migration"] },
    { id: "workspace", name: "Google Workspace",
      tag: "Google's full productivity suite",
      w: 4.59, price: retail(4.59), unit: "/acc/mo", whiteLabel: false,
      note: "Google branding retained, resold as-is",
      feats: ["Gmail on your domain", "30 GB storage per user",
        "Docs, Sheets, Drive & Meet", "Shared calendars & video meetings",
        "Google spam protection"] }
  ];

  /* ---------- HOSTING (specs from published ResellerClub plan
     descriptions, 2026; wholesale slab prices NOT publicly published —
     plans render as "Contact us for pricing", never invented) */
  var HOSTING = [
    { id: "personal", name: "Personal", os: "Linux", priceKnown: false,
      tag: "Your first website",
      feats: ["1 website", "Unmetered storage & bandwidth",
        "Free SSL certificate", "cPanel / Plesk control panel",
        "400+ one-click installs", "Free DNS management",
        "24/7 support · 30-day money-back"] },
    { id: "business", name: "Business", os: "Linux", priceKnown: false,
      tag: "For growing businesses", badge: "BEST VALUE",
      feats: ["3 websites", "Unmetered storage & bandwidth",
        "Free SSL certificate", "cPanel / Plesk control panel",
        "400+ one-click installs", "Free DNS management",
        "24/7 support · 30-day money-back"] },
    { id: "pro", name: "Pro", os: "Linux", priceKnown: false,
      tag: "Maximum room to grow",
      feats: ["Unlimited websites", "Unmetered storage & bandwidth",
        "Free SSL certificate", "cPanel / Plesk control panel",
        "400+ one-click installs", "Free DNS management",
        "24/7 support · 30-day money-back"] }
  ];

  /* ---------- SSL (4 Sectigo certificate plans per resellerclub.com;
     per-cert wholesale NOT publicly published — "Contact us", never
     invented) */
  var SSLC = [
    { id: "positive", name: "Positive SSL", type: "DV — single domain",
      priceKnown: false,
      tag: "The essential padlock",
      feats: ["Secures one domain", "Domain validation (DV)",
        "SHA2 & ECC 128/256-bit encryption", "Free re-issuance",
        "TrustLogo site seal", "30-day money-back"] },
    { id: "wildcard", name: "Wildcard SSL", type: "DV — domain + all subdomains",
      priceKnown: false,
      tag: "One cert, every subdomain", badge: "MOST FLEXIBLE",
      feats: ["Secures domain + unlimited subdomains", "Domain validation (DV)",
        "SHA2 & ECC 128/256-bit encryption", "Free re-issuance",
        "TrustLogo site seal", "30-day money-back"] },
    { id: "ev", name: "EV SSL", type: "Extended validation",
      priceKnown: false,
      tag: "Maximum trust signal",
      feats: ["Company name in the address bar", "Extended validation (EV)",
        "SHA2 & ECC 128/256-bit encryption", "Free re-issuance",
        "TrustLogo site seal", "30-day money-back"] }
  ];

  window.BHX_PRICING = { TLDS: TLDS, EMAIL: EMAIL, HOSTING: HOSTING, SSLC: SSLC,
    find: find, money: money, retail: retail };
})();
