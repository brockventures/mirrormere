---
name: Rules and Memory Indexing Audit Scars
description: "An audit revealed dormant skills stored in `/workspace/.gemini/skills/` unread by `agy`, alongside b"
category: scar
source: scar_rules_and_memory_indexing_audit_scars.md
updated: 2026-10-14
---

An audit revealed dormant skills stored in `/workspace/.gemini/skills/` unread by `agy`, alongside broken rule paths and split-brain indexing in `transcript_index.py` caused by unpruned symlinks and recursive `rglob` across memory subdirectories. These systemic flaws degrade retrieval latency and bloat search embeddings unless symlink traversal is explicitly constrained and skills reside strictly in `.agents/skills/`.
