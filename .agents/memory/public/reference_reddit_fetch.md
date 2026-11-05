---
name: reference-reddit-fetch
description: "Current architecture for unblocked Reddit discussion and community consensus research (Google Engine + Gemini 3.5 Flash Low Grounding)"
category: reference
updated: 2026-09-01
---

## Reddit Discussion & Community Consensus Architecture

### 🚫 Deprecated / Broken Methods (Do NOT Use)
1. **Direct curl to `old.reddit.com` or `www.reddit.com`**: Hard-blocked by Reddit's Cloudflare / PerimeterX WAF ("Blocked by network security").
2. **Self-hosted Redlib / Libreddit**: Blocked by Reddit upstream at host IP level.
3. **Reddit Developer App Creation**: Deprecated by Reddit; triggers mandatory "Responsible Builder Policy" manual review wall.
4. **Arctic Shift API**: Outdated mirror archive; incomplete coverage of 2025-2026 posts and inconsistent comment availability.
5. **Exa / Generic AI Scrapers**: Blocked at edge (`403 SOURCE_NOT_AVAILABLE`).

### ✅ Active Working Methods (Zero-Cost, Unblocked & Grounded)

1. **Standalone Python Tool (`/workspace/tools/reddit_extractor.py`)**:
   - Queries Google Search engine via SerpApi (`engine=google`, `site:reddit.com/r/...`).
   - **Defaults to recent posts** (past 12 months / current year `2026`).
   - CLI Usage:
     - Subreddit search: `python3 /workspace/tools/reddit_extractor.py search "synology vs truenas" --sub selfhosted -n 5`
     - Broad search: `python3 /workspace/tools/reddit_extractor.py search "best quiet dishwasher" --sub BuyItForLife -t year`
     - Timeframe filters: `-t year` (default), `-t month`, `-t week`, `-t 2026`.

2. **Interactive Agent Research (Zero Chat / Crab Cavern / Skills)**:
   - Guided by the [`reddit-research` skill](file:///workspace/.agents/skills/reddit-research/SKILL.md).
   - **Default Model Tier:** **`gemini-3.7-flash-low`** (or subagent `flash_lite`) — optimal for high-volume, low-cost consensus synthesis.
   - Uses Gemini Google Search Grounding to access passage chunks from Google's licensed real-time Reddit feed.
   - **Strict Link Integrity Rule:** Verified URLs are extracted strictly from search/grounding metadata (`web.uri` / `link`), eliminating hallucinated markdown URLs.
