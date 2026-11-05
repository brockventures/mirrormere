---
name: GIF Tool Relevance Degradation Root-Cause
description: "Commit `c10925f` introduced franchise cooldowns to reduce trope repetition, but caused relevance reg"
category: scar
source: scar_gif_tool_relevance_degradation_root_caus.md
updated: 2026-09-07
---

Commit `c10925f` introduced franchise cooldowns to reduce trope repetition, but caused relevance regression via greedy first-match candidate selection in `gif_tool.py:_validate_and_pick` without title-query overlap ranking. When primary franchises are locked on cooldown, Frankenstein fallback queries select the first valid HTTP 200/OCR-safe candidate rather than scoring semantic relevance.
