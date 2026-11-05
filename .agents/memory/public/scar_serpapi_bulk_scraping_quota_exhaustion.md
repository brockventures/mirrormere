---
name: SerpApi Bulk Scraping Quota Exhaustion Post-Mortem
description: An un-cached Green Chef recipe nutrition card search script consumed ~170 SerpApi searches in minutes, exhausting the monthly 250-query quota
type: scar
date: 2026-09-25
---

# Scar: SerpApi Bulk Scraping Quota Exhaustion & Circuit Breakers

## What Happened
On the evening of 2026-09-24, an agent investigating missing Green Chef recipe cards authored an ad-hoc scratch script (`scrape_and_audit_all_gc.py`) that looped over 24 recipes, issuing raw, un-cached Google search requests directly against SerpApi (`https://serpapi.com/search?q=site:cdn2.greenchef.com...&engine=google`). With multiple search query variants tested per recipe, the script burned through approximately 170 queries in under two minutes, driving the monthly usage to 250/250 and locking out the `shopping-advisor` skill until the billing cycle renewal on 2026-09-26.

## Root Causes
1. **Lack of Circuit Breakers:** SerpApi keys were accessible via `/secrets/env.json` with no rate-limiting, daily ceiling, or batch execution cap.
2. **Engine Misuse:** SerpApi was utilized for generic Google web scraping and image searches (also present in `mealie_image_backfill.py`), tasks that should be handled for free via Playwright, Browserless, or direct HTTP fetching.
3. **Short Cache TTL:** `amazon_serpapi.py` used a 4-hour cache TTL, causing redundant queries during iterative shopping sessions.

## Remediations Applied
1. **Circuit Breaker (`tools/serpapi_guard.py`):**
   - Enforces a **15 search/day** hard limit and a **5 search/batch** limit across all callers.
   - Enforces strict engine whitelisting: only `amazon`, `amazon_product`, and `google` (scoped to `site:reddit.com`) are allowed.
2. **PreToolUse Hook Gatekeeper (`.agents/hooks/search_guard.py`):**
   - Intercepts shell commands attempting to invoke `serpapi.com` with unauthorized engines (`google_images`, generic `google`) or ad-hoc scraping loops, actively denying execution before hitting the network.
3. **De-SerpApi `tools/mealie_image_backfill.py`:**
   - Decommissioned SerpApi image scraping from the Mealie backfill script.
4. **Extended Cache TTL:**
   - Bumped `amazon_serpapi.py` cache TTL to 24 hours (and 7 days for product details).
   - Bumped `reddit_extractor.py` cache TTL to 72 hours.
5. **Codified Rule:**
   - Codified `.agents/rules/serpapi_quota_discipline.md` to permanently forbid ad-hoc bulk scraping via SerpApi.
