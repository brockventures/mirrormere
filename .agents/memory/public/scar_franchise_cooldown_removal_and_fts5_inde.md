---
name: Franchise Cooldown Removal and FTS5 Indexing
description: "Deprecated and removed legacy GIF franchise cooldown checks from `bridge_state.py` and `runtime_rule"
category: scar
source: scar_franchise_cooldown_removal_and_fts5_inde.md
updated: 2026-09-08
---

Deprecated and removed legacy GIF franchise cooldown checks from `bridge_state.py` and `runtime_rules.json`. Deployed a fast local SQLite FTS5 index with Porter stemmer tokenization and BM25 weighted scoring for low-latency situational queries instead of slower LLM inference passes.
