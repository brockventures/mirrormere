---
name: Rolling Compaction & Session Checkpointing Architecture
description: Operational reference for Zero's sliding window compaction and durable checkpointing engine
category: architecture
updated: 2026-08-30
---

# Zero Rolling Compaction Architecture

Zero uses an in-flight rolling compaction engine (`bridge.py:check_compaction_needed` & `tools/session_summarizer.py`) to maintain persistent continuity across long-running multi-agent and pair-programming sessions without token exhaustion.

## Key Mechanisms

1. **Sliding Conversational Window:**
   - Active interactive turns stay raw and uncompressed for immediate flow, banter, and nuance.
   - Older conversational history is compressed into structured, lossless fact deltas.

2. **Compaction Triggers:**
   - **Turn Threshold:** Evaluated after every turn via `increment_session_turn()`. Compaction triggers when active turns exceed the configured limit (~25-30 turns).
   - **Token / Transcript Step Ceiling:** When transcript steps or active context size cross safe thresholds.
   - **Explicit Reset:** `!reset` or `/reset` issued by the owner.

3. **Lossless Invariant Carry-Forward:**
   - When compaction fires, `session_summarizer.py` extracts:
     - Primary Task & Current State
     - Key Context & Invariants (human names, security rules, mutex tokens)
     - Codebase diffs & verified test results
   - This delta is written to `/workspace/data/last_session_summary.md` (and `last_engineering_summary.md`) and injected into the preamble of the next fresh session.

4. **Transcript Indexing:**
   - Full historical transcripts are archived locally (`transcript_full.jsonl` and `transcript.jsonl`) with indexed search rather than keeping a monolithic context backpack.
