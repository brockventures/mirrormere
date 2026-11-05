---
name: Non-Canonical GIF Fallback Failure
description: "A prompt construction flaw and loose fallback rule in `gif_tool.py` allowed live Tenor scraping afte"
category: scar
source: scar_non_canonical_gif_fallback_failure.md
updated: 2026-09-25
---

A prompt construction flaw and loose fallback rule in `gif_tool.py` allowed live Tenor scraping after an initial query hit a 4-turn cooldown block. Enforces strict canonical registry adherence and fixes fallback selector logic to prevent unverified non-canonical GIF posts.
