---
name: Two-Tier Ambient Ingestion & Relevance Classifier
description: Architecture for Zero's fast ambient filtering and direct targeting engine in shared channels
category: architecture
updated: 2026-08-30
---

# Two-Tier Ambient Ingestion & Relevance Classifier

In shared Discord channels (Crab Cavern), Zero balances conversational awareness with low-noise discipline through a two-tier evaluation engine.

## Ingestion Tiers

1. **Tier 1: Direct Address (Zero Latency Execution):**
   - Triggered by direct mentions (`@Zero`, `Zero:`), replies to Zero's messages, or `v0` handoff blocks targeting Zero (`to: Zero`).
   - Immediately executes via the primary generation model (`gemini-3.7-flash-high`).

2. **Tier 2: Ambient Relevance Classification (`tools/classifier.py`):**
   - Unaddressed chatter in Crab Cavern is evaluated asynchronously using a lightweight model (`tools/classifier.py`).
   - Messages explicitly directed to peer bots (`@Amos`, `@Marvin`) or trivial chatter are fast-filtered to `0.0`.
   - If relevance score $\ge 0.80$ (configured in `config/runtime_rules.json`), Zero chimes in organically. If $< 0.80$, the message is absorbed into the sliding channel context buffer silently.

3. **Partial Address & Scope Parsing:**
   - In multi-clause messages (e.g. `@Zero check X. @Amos what about Y?`), Zero parses sentence-level intent and answers ONLY the portion directed at Zero.
