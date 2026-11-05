---
name: Canonical GIF Search Architecture Overhaul
description: "Replaced raw keyword searching against the curated canonical GIF registry with SQLite FTS5 BM25 sear"
category: scar
source: scar_canonical_gif_search_architecture_overha.md
updated: 2026-09-08
---

Replaced raw keyword searching against the curated canonical GIF registry with SQLite FTS5 BM25 search over rich `situation` (12.0) and `vibes` (8.0) metadata fields. Future GIF queries must supply situational context and tone descriptions rather than guessing static tags, incorporating cooldown logic to fall back to secondary matches.
