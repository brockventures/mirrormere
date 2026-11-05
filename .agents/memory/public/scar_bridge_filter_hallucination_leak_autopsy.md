---
name: Bridge Filter Hallucination Leak Autopsy
description: "Resolved a failure chain where background task timeouts and LLM hallucination loops bypassed Discord"
category: scar
source: scar_bridge_filter_hallucination_leak_autopsy.md
updated: 2026-09-20
---

Resolved a failure chain where background task timeouts and LLM hallucination loops bypassed Discord bridge filters by adding cycle deduplication to [`tools/bridge_formatting.py`](file:///tools/bridge_formatting.py) (truncating 1- to 4-line cycles repeating >3 times). Expanded `CLI_LEAK_LINE_PATTERNS` to catch repetitive runaway outputs and suppress formatting leaks.
