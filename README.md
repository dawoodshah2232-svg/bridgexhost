# BridgexHost — marketing website (v3)

Static marketing site for BridgexHost, themed on the owner's BridgeX Apps
site: light SaaS, teal #14b8a6 primary, warm orange accents, DM Sans.

- Live: https://dawoodshah2232-svg.github.io/bridgexhost/
- Pure static HTML/CSS/JS — GitHub Pages ready, relative paths.

Pages: `index.html` (hero domain search, TLD marquee, pricing rail, services,
how-it-works, FAQ, dark CTA), `pricing.html` (30-TLD grid + FAQ),
`services.html`, `about.html`, `contact.html`, `404.html`.

SEO/AIO/GEO: unique titles + meta descriptions, canonical, OG + Twitter cards,
JSON-LD (Organization, WebSite/SearchAction, FAQPage, Offers/Services ItemLists),
`sitemap.xml`, `robots.txt`, `llms.txt`.

Pricing: `assets/js/pricing-data.js` is the single source of truth —
wholesale USD from the ResellerClub panel (2026-10-06), retail =
floor(wholesale × 1.30) + 0.99. Nothing is invented.

Honesty rule: the search shows the published retail price + renewal for a
typed TLD. It NEVER shows available/taken badges; live availability is
confirmed only at checkout.
