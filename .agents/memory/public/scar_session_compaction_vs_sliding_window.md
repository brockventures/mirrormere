---
name: Session Compaction vs Sliding Window
description: "Identified an architectural regression between legacy Ivy-Gemini (in-place sliding window compaction"
category: scar
source: scar_session_compaction_vs_sliding_window.md
updated: 2026-09-04
---

Identified an architectural regression between legacy Ivy-Gemini (in-place sliding window compaction) and Zero's persistent session model (hard amnesia resets causing latency and token bloat). Addressed channel history drag by evaluating tightened turn ceilings (8–10 turns / 50 steps) and pre-turn tool output scrubbing to preserve responsiveness.
