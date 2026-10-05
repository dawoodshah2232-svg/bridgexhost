# BridgexHost — marketing website (v2)

Black & white, type-driven marketing site for BridgexHost, the domain
registration brand of BridgingFX (Dubai, UAE).

Design reference: Spaceship's domain page (search-as-hero, giant type)
+ BigRock's promo-pricing punch. Pure monochrome — no brand colors.

## Structure

- `index.html` — hero (giant animated domain search), price ticker,
  first-year promo cards, how-it-works, services, stats, FAQ, big CTA
- `pricing.html` — full 30-TLD price table (JS-rendered), pricing FAQ
- `services.html` — 6 domain lifecycle services
- `about.html` — company facts
- `contact.html` — contact@bridgingfx.net, mailto form with ?domain= prefill
- `404.html` — branded not-found
- `sitemap.xml`, `robots.txt`, `llms.txt` — SEO + AI-search plumbing
- `assets/css/style.css` — monochrome design system
- `assets/js/pricing-data.js` — SINGLE SOURCE OF TRUTH for prices
  (wholesale × 1.30, rounded to .99 — from ResellerClub panel 2026-10-06)
- `assets/js/main.js` — motion engine + honest search + table render

## Honesty rules (do not break)

- Search shows the REAL retail price for the typed TLD + renewal info.
- NEVER show available/taken badges. Availability is confirmed at order.
- Unknown TLD → "email us" note. Invalid input → error message.
- No invented numbers anywhere. "Standard rate" where renewal
  wholesale isn't published.

## Motion rules

- transform/opacity only; IntersectionObserver reveals; magnetic
  buttons + tilt are desktop-pointer-only; press feedback everywhere;
  `prefers-reduced-motion` disables all non-essential animation.

## Deploy

Pure static, relative paths. Push to the `bridgexhost` repo root;
GitHub Pages serves it as-is.
