---
name: reference_gemini_weekly_usage_limit_benchmark
description: Measured fleet-wide weekly Gemini usage ceiling (~1.026B wire tokens, 1,341 turns across Zero + Ivy from Sep 29 8pm PT to Oct 05 3:35pm PT) establishing the empirical Antigravity subscription weekly limit
category: reference
updated: 2026-10-05
---

# Gemini Weekly Usage Limit & Fleet Consumption Benchmark

Established on **2026-10-05** following Ryan Brock's confirmation that fleet-wide usage from **Monday, Sep 29, 2026 at 8:00 PM PT** through **Monday, Oct 05, 2026 at 3:35 PM PT** triggered the Google Gemini Antigravity subscription weekly usage limit.

This document serves as the empirical ceiling benchmark for capacity planning, rate-limit anticipation, and session compaction tuning.

---

## 🎯 The Measured Weekly Ceiling (Empirical Limit)

Across **139.6 hours** (~5.8 days) of continuous multi-channel operations, the combined fleet consumed:

- **Total Combined Wire Tokens (Input + Output):** **1,025,801,595 tokens** (~**1.026 Billion**)
- **Total Combined Turns:** **1,341 turns**
- **Total Prompt Cache Reads:** **12,220,432,689 tokens** (~**12.22 Billion**)
- **Total Context Processed:** **13,246,234,284 tokens** (~**13.25 Billion**)
- **Average Daily Burn:** ~176.3M wire tokens / day (~230 turns / day)
- **Active Model:** Gemini 3.8 Flash (High) (1,000,000 token context window)

> **Operational Invariant:** The empirical Google Antigravity subscription weekly rolling limit is **~1.025–1.030 Billion un-cached wire tokens** (or **~1,340 turns** under heavy ~12M token cached context conditions). Approaching this threshold within a rolling 7-day window risks hitting `RESOURCE_EXHAUSTED` weekly quota tripwires.

---

## 📊 Fleet Breakdown (Sep 29 8:00 PM PT – Oct 05 3:35 PM PT)

### 1. Zero (`discord-antigravity-agent` on Host 1 / DS1525+)
- **Turns:** 1,075 turns
- **Direct Wire Tokens:** 1,014,554,922 tokens (98.9% of fleet wire tokens)
  - *Input Tokens:* 951,239,983
  - *Output Tokens:* 63,314,939
- **Prompt Cache Reads:** 12,186,692,689 tokens (92.8% cache hit rate)
- **Thinking Tokens:** 36,210,369 tokens
- **Channel Distribution:**
  - `#the-banana-stand:` 345,604,408 tokens (434 turns | 34.1% of Zero) — Project Agora burst trading
  - `#zero-chat:` 169,451,555 tokens (125 turns | 16.7% of Zero) — Deep pair-programming & architecture
  - `#lounge:` 104,210,191 tokens (130 turns | 10.3% of Zero) — Crab Cavern cross-agent sparring
  - `#zero-ops:` 103,729,959 tokens (84 turns | 10.2% of Zero) — Container triage & daemon maintenance
  - `#homelab:` 72,310,027 tokens (55 turns | 7.1% of Zero) — Compose & storage management
  - `#finances:` 68,186,785 tokens (47 turns | 6.7% of Zero) — Oct 04 Sunday financial run
  - `#3d-print:` 65,273,033 tokens (63 turns | 6.4% of Zero) — Oct 03–04 Ender-3 slicing passes
  - `#projects:` 51,476,275 tokens (51 turns | 5.1% of Zero) — Market Sandbox sprints
  - `#home-assistant:` 23,247,419 tokens (48 turns | 2.3% of Zero) — SwitchBot & automations
  - *Long tail (#vault, #shopping, #seerr-*):* 11,065,270 tokens (38 turns)

### 2. Ivy (`discord-ivy-agent` on Host 2 / DS1525+)
- **Turns:** 266 turns (10 sessions, 24,424 tool/reasoning steps)
- **Direct Wire Tokens:** 11,246,673 tokens (1.1% of fleet wire tokens)
- **Prompt Cache Reads:** ~33,740,000 tokens
- **Dedicated Channel:** `#baseball` (Sabermetric Assistant GM)

---

## 🪓 Key Cost & Rate Limit Drivers

1. **Agora Trading Bursts:** The Friday, Oct 02 multiplayer Agora trading run in `#the-banana-stand` generated 242.7M tokens in under 24 hours (307 turns). High-frequency multi-agent trading loops represent the steepest rate-of-climb in token consumption.
2. **Context Accumulation in Persistent Discord Channels:** Discord sessions run for days without restarting, causing average turn context to swell to ~12M tokens (wire + cache).
3. **Retail vs. Subscription Disconnect:** At standard Gemini Flash API rates, this 5.8-day volume represents **~$350–$500 in retail API compute** (~$1,800/mo run rate) on a flat subscription plan. Google's rolling fair-use tripwire triggered as expected.

---

## 🛠️ Management & Mitigation Guidelines

- **Pacing Agora Bursts:** When active in Project Agora or rapid-fire trading rounds, monitor daily token velocity. A single 200M+ day exhausts ~20–25% of the entire weekly fleet allowance.
- **Proactive Session Compaction:** Periodically compact or cycle long-running Discord sessions once turn counts exceed 100 to reduce cumulative prompt-cache re-evaluation overhead.
- **Rolling Reset Horizon:** Usage drops off on a rolling 7-day basis (the Oct 02 spike will fall off the rolling window on Oct 09).

---

## 🚀 The $200/mo Tier Recalibration (Established 2026-10-12)

Following the upgrade to the **$200/mo Google Gemini tier** on **2026-10-12**, the baseline was reset using the average empirical wire token burn across the first two operational weeks multiplied by the 4x tier expansion factor:

- **Week 1 Fleet Wire Burn (Sep 29 – Oct 05):** 1,025,801,595 tokens (~1.026B)
- **Week 2 Fleet Wire Burn (Oct 05 – Oct 12):** 578,476,472 tokens (~578M)
- **Two-Week Fleet Average:** 802,139,034 tokens (~802.1M tokens)
- **4x Weekly Fleet Budget Ceiling:** **3,208,556,134 tokens** (~**3.209 Billion wire tokens / week**)
- **Target Daily On-Pace Allocation (Weekly / 7):** **458,365,162 tokens / day** (~**458.4M tokens / day**)
- **Intraday Warning Threshold (85%):** **389,610,387 tokens** (~**389.6M tokens / day**)
