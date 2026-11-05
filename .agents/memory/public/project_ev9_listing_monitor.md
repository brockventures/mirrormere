---
name: used-kia-ev9-listing-monitor
description: "Daily MarketCheck-API-based monitor (rebuilt 2026-07-16, was SerpAPI) for used 2024 Kia EV9 Land/GT/GT-Line listings; ranked top-3 + guaranteed blue pick, fair-price tags added 2026-07-18"
metadata: 
  node_type: memory
  type: project
  originSessionId: b2920320-fd72-430a-8e5e-59b64e32c546
  modified: 2026-07-24T15:07:07.929Z
---

Ryan wants to buy a used 2024 Kia EV9 over the next few months (this is a *second/replacement* purchase — separate from his current EV9, see [[project_kia_ev9]]). Built a monitor on 2026-05-22 (a4aa3eb1 session).

**Criteria:** 2024 Kia EV9, **Land or GT** trim, **blue**, ≤50,000 miles, ≤$50,000.

**Location:** `~/projects/car_monitor/` on the VM. Main script `search.py`. Constants: `BUDGET_MAX=50000`, `MILES_MAX=50000`, `TARGET_TRIMS={land, gt, gt-line}`. Data in `data/listings.json` and `data/price_history.jsonl`. Discord config in `car_monitor/.env`; SerpAPI key parsed from `~/.claude.json` at runtime (see [[reference_serpapi]]).

**Schedule:** systemd user timer `car-monitor.timer` / `car-monitor.service`, runs daily ~8 AM PT.

**Discord readout Sunday mornings (08:15 PT via `sidecars.py`):** Daily scrape/diff/save runs in background; weekly digest posts to Discord with trend chart.

**2026-08-30 High-Signal Digest Refactor:**
- Replaced the repetitive/hardcoded `_generate_tip()` rules with dynamic market momentum metrics (30-day velocity/pace and average days on lot).
- Streamlined layout to 4–6 lines on mobile:
  - Header: Active count, Land floor, GT floor, 30d pace, and average days on lot.
  - Core Picks: Top Value deal ($/mile) and Top Blue deal (Ocean Blue GT-Line/Land).
  - Deltas: Highlights section only appears when actual price cuts, new arrivals, or sold cars occur; otherwise renders `⚡ Market Movement: Steady`.
  - Always posts weekly update (no silent mode).

**Alert tiers:**
- **In budget** = matches all criteria (Land/GT, ≤$50k, ≤50k mi) — buy-ready.
- **Watch list** = close but slightly over: price $50k–55k, OR over mileage but ≤$50k.

Sources: targets individual listing pages on CarGurus, Cars.com, AutoTrader (Google snippets carry real per-vehicle price + mileage). Discord output uses clickable `[text](url)` markdown links for every listing. Goal beyond alerts: track price trends over time, surface sold listings, and advise Ryan on the right time to buy.

**Blue filter — intentionally OFF (as of 2026-07-07):** Searches still include "blue" in query terms, and color is still detected/tagged per listing (`BLUE_KEYWORDS`, `is_blue()`, the `color` field displayed per listing, and the Land/GT trim price breakdowns/chart all stay). BUT the hard post-parse filter that dropped non-blue listings is **removed** — non-blue listings are no longer excluded. Ryan confirmed 2026-07-07 (Discord msg 1524211536506388571) that disabling blue-only was intentional. NOTE: an earlier session that same day wrongly assumed the un-applied filter was a bug and re-added the `if color is None: continue` skip; Ryan corrected it and it was reverted. Do not re-add the hard skip. See [[feedback_dont_assume_bug_without_asking]].

**Known issue (fixed 2026-05-31):** urllib requests to Discord were getting silently blocked by Cloudflare (HTTP 1010 "Access denied") because no `User-Agent` header was set. Fixed by adding `User-Agent: DiscordBot (Ivy/1.0)` header to all HTTP calls in `search.py`. If Discord posts stop appearing again, check for Cloudflare blocks first.

**Outage 2026-06-27 to 2026-07-07 (11 days), fixed 2026-07-07:** Ryan noticed no daily posts. Root cause was three separate bugs, all from an uncommitted WIP change (never finished/tested) that added a matplotlib trend-chart feature and simplified the search queries:
1. `generate_trend_chart()` crashed (`TypeError` on `None.__format__`) whenever a trim (Land/GT) had zero listings on the most recent day — and this ran *before* `_post_discord()`, so every single run silently failed to post, going back further than the 11-day window (systemd logs show intermittent failures since Jun 19, consistent daily failures from Jul 1). Fixed: annotate the last non-None point per series instead of blindly indexing `[-1]`.
2. The WIP diff also collapsed the working 8-query SerpAPI search (specific per-trim + price-hinted queries) down to 3 generic ones, which mostly surfaced SEO/informational pages instead of real listings — reverted to the original 8-query set.
3. Separately (likely pre-existing, not part of the WIP diff): the "does this snippet have real listing data" gate required literal "mile(s)" but real CarGurus/Cars.com snippets use the abbreviation "mi" (e.g. "28,288 mi") — so almost every real listing was being discarded before parsing even started. Fixed the regex to accept both.
4. ~~Also found the blue-color hard filter (added 2026-06-13) had been silently reduced to a display-only annotation — `color` computed but never used to skip non-blue listings. Re-added the hard skip.~~ **REVERTED same day** — this was NOT a bug. Ryan confirmed disabling blue-only was intentional; the hard skip was removed again. Color is still detected/displayed, just not used to exclude. See blue-filter note below and [[feedback_dont_assume_bug_without_asking]].

All four fixes verified: manual `--dry-run` run found real candidates (3, correctly filtered to 0 after the blue check since none of today's 3 mentioned color), then a real `systemctl --user start car-monitor.service` run completed with `status=0/SUCCESS` and posted to Discord with a working chart attachment.

**How to apply:** When iterating, accuracy of price + mileage parsing from snippets is the known weak point — Ryan flagged inaccurate prices/missing mileage on early runs. Before adding new features to this script, test with a real (non-dry-run, non-mocked) end-to-end run before considering it done — this outage happened because a feature was wired into `main()`'s critical path without that.

---

**REBUILT 2026-07-16 — SerpAPI abandoned entirely, replaced with MarketCheck's real listings API.**

Ryan noticed linked listings never matched the car described (e.g. a "Phoenix" result despite no geo-targeting) and asked for the root cause. Turned out fundamental: the SerpAPI approach parsed price/mileage out of Google *snippets*, which often came from regional category pages, not the individual car — so the URL and the extracted price/mileage frequently described two different things. Not fixable with a tweak; needed a real structured-listings data source.

**New data source: MarketCheck Cars API** (`https://api.marketcheck.com/v2/search/car/active`). Key in `car_monitor/.env` as `MARKETCHECK_API_KEY` (self-serve free tier, 500 calls/mo, 100mi radius cap — this job uses ~1 call/day, nowhere near the limit). Query: make=Kia, model=EV9, year=2024, car_type=used, zip=94061 (Redwood City), radius=75mi, price up to $56k / miles up to 60k (wider than the display filters `BUDGET_MAX`/`MILES_MAX` so `filter_watch_list()` still has a band). Returns real per-vehicle records: `vin`, `price`, `miles`, `build.trim`, `exterior_color`, `dealer.{name,city,state}`, `source`, and critically `vdp_url` — a stable direct link to that exact car. **Dedup/id key is now the VIN** (falls back to the old title+price+miles hash only if VIN is somehow missing) — far more stable than before.

Old SerpAPI functions (`serpapi_search`, `get_serpapi_key`, the old `run_searches`/`extract_listings_from_candidates`) were deleted, not left as dead code. `marketcheck_search()` + `build_listings()` replace them. All downstream logic — `diff_listings`, `append_price_history`, `filter_in_budget`/`filter_watch_list`, `format_discord_message`, `generate_trend_chart`, `_post_discord` — is unchanged in behavior.

**Trim caveat:** MarketCheck's `build.trim` field is clean (Land / GT-Line / Wind / Light — no plain "GT" currently seen in inventory). Client-side `normalize_trim()` still buckets GT-Line under the "GT" summary group as before, consistent with pre-rebuild behavior.

**Real bug found and fixed during the first live run:** Discord hard-rejects any message over 2000 chars with a bare, unhelpful HTTP 400. The old SerpAPI version rarely hit this (usually only 2-3 legit "in budget" hits since half its links were garbage and got filtered out downstream). Real MarketCheck data surfaced 20 legitimate matches in the first run, blowing past the limit. **Fix: `split_message()` + chunked `_post_discord()`** — splits on line boundaries (never mid-line), chart image rides with the first chunk, remaining chunks post as sequential follow-up messages. This is a permanent structural fix, not a one-off — expect multi-message digests going forward whenever inventory is good.

**Baseline reset:** old `listings.json`/`price_history.jsonl` (SerpAPI-era, unreliable — different ID scheme, snippet-derived prices) backed up to `car_monitor/data/serpapi_era_backup/` and cleared so the new system starts a clean, trustworthy baseline. **Trend chart will not render until there are 2+ days of real MarketCheck data points** (needs 2 distinct dates) — this is expected on the first run, not a bug. Should start appearing from the second real scheduled run onward.

**Verified working:** live `--post-discord` run 2026-07-16 posted 3 chunked messages successfully (HTTP 200 x3), real Bay Area listings (San Jose/Hayward/Novato/etc, 14-72mi out), and 3 sample `vdp_url` links were manually confirmed to resolve to the actual specific vehicle (matching VIN/price/trim/miles) rather than a category page. Scheduled timer (`car-monitor.timer`, daily 8 AM PT) requires no changes — it already invokes the same `search.py --post-discord` path, so the rebuild took effect automatically for the next scheduled run.

**How to apply going forward:** If listings ever look wrong again, check MarketCheck's response directly (`marketcheck_search()`) before suspecting the parsing/display layer — the whole point of this rebuild was moving the trust boundary from "hope the regex found the right snippet" to "trust the API's structured fields." If Discord posts silently stop again, check message length first (the old known-issue list — Cloudflare User-Agent block, chart crash on empty trim — still applies too, see above).

---

**RANKING/SCORING SYSTEM added 2026-07-16** (Ryan asked to cap noise + weight toward what he actually wants). `rank_score()` in `search.py`: base score is `-price - (0.15 × miles)` (price/mileage dominate), plus flat tie-breaking bonuses — `RANK_BONUS_GT=2500` (GT/GT-Line trim), `RANK_BONUS_BLUE=2000` (any blue-ish color), `RANK_BONUS_CLEAN_TITLE=600` (carfax_clean_title true), `RANK_BONUS_1_OWNER=400` (carfax_1_owner true). GT/blue bonuses were originally 1500/1000 — Ryan asked to raise both by $1000 (2026-07-16 18:41), now 2500/2000. `rank_best()` returns top `TOP_N_DISPLAY=3` by score per section (in-budget, watch-list — separately ranked). `pick_blue_bonus()` guarantees at least one blue listing is shown even if none makes the natural top 3 — adds it as an extra "+ Blue pick" line, never displaces a genuinely better non-blue car (Ryan's explicit request: "make sure at least one blue option gets included every day").

**Clean title ≠ no accident history** — important domain nuance Ryan asked about directly. `carfax_clean_title` only means not salvage/flood/lemon-buyback/rebuilt branded; a clean-title car can still have been in a repaired accident. MarketCheck's free tier has no accident-count/accident-free field at all (verified against live data 2026-07-16) — clean title is the closest available proxy, but weaker than what Ryan actually wants (no crash history). Kept as a bonus signal since it's still informative, just don't oversell it as "no accidents" when explaining the scoring to Ryan.

**FAIR-PRICE / VALUATION TAGS added 2026-07-18.** Ryan spotted MarketCheck also has a price-prediction endpoint and asked to add it, explicitly scoped to **top-3 in-budget only** (not the full pool, not watch-list — he said so twice, once up front and once correcting an initial implementation that also covered watch-list). `fetch_fair_price(api_key, vin, miles)` calls this per-VIN (max ~6-8 calls/run, well within the 500/mo free tier alongside the 1 daily search call) and `fair_price_tag()` renders "$X under/over/at market" (within `FAIR_PRICE_AT_MARKET_BAND=750` counts as "at market") next to each of the top-3 in-budget lines via `_format_listing_line()`. `dealer_type` is hardcoded to `"franchise"` (no per-dealer signal available to pick automatically) — sanity-checked against `"independent"` on a real VIN and the swing was <$900, never flipped the over/under verdict, so treated as an acceptable bounded assumption, not a hidden guess.

**Observed pattern (2026-07-18, not a bug):** on the first live run with fair-price tags, every single listing came back "over market." Verified this wasn't a `dealer_type` artifact — real signal, likely because EV9s depreciate fast and dealer asking prices lag. Worth re-checking occasionally to see if it's still universally true or was a one-off inventory snapshot.

**Endpoint contract correction:** Ryan's own curl snippet (`GET /v2/predict/car/price?...`) had the wrong path and was missing required params. Real endpoint verified against live docs: `GET /v2/predict/car/us/marketcheck_price` with `vin`, `miles`, `dealer_type`, `zip`. Response is just `{"marketcheck_price": int, "msrp": int}` — no confidence/range field on this tier. See [[reference_marketcheck]].

**As of 2026-07-19: search.py changes are uncommitted** (`git status` shows the file modified, ~760-line diff) — all the ranking + fair-price work above exists in the working tree but hasn't been committed to git.

**Fair-price tag is noisy day-to-day, confirmed 2026-07-20.** Ryan asked why two listings tagged "over market" on 07-19 showed "at market" on 07-20 — checked the log and the listing price/mileage/VIN were identical both days, but MarketCheck's `marketcheck_price` prediction itself moved: one VIN's implied fair price shifted ≥$800, another ≥$2,300, enough to cross the $750 band. Nothing about the car changed; the prediction is just unstable. Treat the over/at/under tag as a low-confidence signal, not a hard fact — if Ryan asks again why a tag flipped, check whether the listing price actually changed before assuming the prediction is trustworthy. Not yet reported to Ryan as something to fix (no clear fix available — it's MarketCheck's model, not our code) but worth mentioning if it recurs a lot.
