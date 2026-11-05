---
name: Enforcing Pre-Enqueue FORGE Tier Gates
description: "Discovered that multi-file builds ran inline instead of routing to #forge because Tier 2/3 gating re"
category: scar
source: scar_enforcing_pre_enqueue_forge_tier_gates.md
updated: 2026-10-23
---

Discovered that multi-file builds ran inline instead of routing to #forge because Tier 2/3 gating relied solely on prompt instructions rather than hard enforcement, ballooning session context past 700K tokens. Fixed by wiring batch_guard PreToolUse hooks to actively block and redirect multi-file edits into FORGE build queues, keeping interactive chat turns lean.
