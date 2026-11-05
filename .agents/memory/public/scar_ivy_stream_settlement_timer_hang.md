---
name: Ivy Stream Settlement Timer Hang
description: "Ivy was blocked after finishing a 48-worker Modal projection run due to an early-cancelled backgroun"
category: scar
source: scar_ivy_stream_settlement_timer_hang.md
updated: 2026-10-14
---

Ivy was blocked after finishing a 48-worker Modal projection run due to an early-cancelled background timer (`task-77`) failing to resolve cleanly. The issue was unwedged and resolved via in-place bridge git sync and reload (`1a07f1b` in `ivy-agent`), establishing a stream-settlement fix for background timer resolution.
