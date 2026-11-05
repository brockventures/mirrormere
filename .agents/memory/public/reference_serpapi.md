---
name: SerpAPI MCP — live search engine results
description: SerpAPI MCP is configured for live Google/Shopping/eBay searches via mcp__serpapi__search
type: reference
originSessionId: 284f77e9-17bd-4b15-9249-4d5eb2457622
---
SerpAPI MCP is wired up in two ways:
1. **Ivy (Claude) on Pixel VM:** Registered in `~/.claude.json` under `mcpServers.serpapi` (HTTP endpoint).
2. **Ivy (Gemini) / Zero:** Implemented at `tools/amazon_serpapi.py` and managed by `tools/mcp_daemon.py` on SSE port **8768** (`amazon-search`), exposing:
   - `search_amazon`: Live Amazon keyword search across regional domains.
   - `get_amazon_product`: Detailed specifications, pricing, variants, and availability for an ASIN.
   - `get_amazon_reviews`: Review breakdown, AI sentiment analysis, and top reviews.

**CLI / Standalone Tool Usage:**
```bash
python3 tools/amazon_serpapi.py search "USB-C cable" --limit=5
python3 tools/amazon_serpapi.py product "B09LCJPZ1P"
python3 tools/amazon_serpapi.py reviews "B09LCJPZ1P" --limit=5
```

**Credentials:** `SERPAPI_API_KEY` stored in `/secrets/env.json`.

**Gotchas observed:**
- Amazon prices in `shopping_results` can be stale or wrong — querying the dedicated `amazon` / `amazon_product` engine via `amazon_serpapi.py` yields direct live Amazon data.
- The eBay engine doesn't filter to *sold* listings cleanly — for sold-listing comps, query Google with `site:ebay.com sold` and parse from organic results.
- Always sanity-check returned prices against multiple sources before quoting them to Ryan.
