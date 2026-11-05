---
name: reference-marketcheck
description: "MarketCheck Cars API — real structured used-car listings, powers the EV9 monitor since 2026-07-16"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 72329d0c-181d-4e15-a38e-115c3f70d085
---

MarketCheck (`https://api.marketcheck.com/v2/search/car/active`) is a real structured used-vehicle listings API — returns per-vehicle records (VIN, price, miles, trim, exterior color, dealer name/city/state, source, and a stable direct `vdp_url`) rather than scraped search-engine snippets.

**Key:** `MARKETCHECK_API_KEY` in `~/projects/car_monitor/.env` (format `mc_live_...`). Ryan's own self-serve free-tier account.

**Free tier limits:** 500 calls/mo, 5 req/s, 100mi max search radius. The EV9 monitor uses ~1 call/day — nowhere near the cap. If other projects start using this key too, watch the combined call volume against the 500/mo ceiling.

**Currently used by:** [[project_ev9_listing_monitor]] — replaced a SerpAPI/Google-snippet-scraping approach that had a real bug (linked URLs frequently didn't match the described car). See that memory for the full rebuild writeup.

**Coverage caveat:** dealer inventory only (`seller_type=dealer`), aggregated from dealer sites — won't surface true private-party listings. Fine for near-new vehicles (almost always dealer-listed) but worth knowing if this key gets reused for something where private-party coverage matters.

**Nationwide search** needs a paid tier (~$299/mo as of the 2026-07-16 research pass) — the free tier's 100mi radius cap is the practical limit for anything beyond regional search.

**How to apply:** If building another listings-based monitor/search feature, check here first before reaching for SerpAPI — MarketCheck's structured fields are more reliable for anything car-related.

**Second endpoint added 2026-07-18 — price prediction/valuation:** `GET /v2/predict/car/us/marketcheck_price` (not `/v2/predict/car/price` — that path in a casual curl snippet Ryan found was wrong/incomplete). Required params: `api_key`, `vin`, `miles`, `dealer_type` (`franchise`|`independent`), `zip`. Response on the free tier is just `{"marketcheck_price": int, "msrp": int}` — no confidence range. This is a per-VIN call (not a bulk search), so only call it for individual listings you're actually about to display, not the whole result pool. See [[project_ev9_listing_monitor]] for the usage pattern (fair-price tags on top-3 in-budget picks only).
