---
name: Nest Lock Circuit Breaker Fix
description: "A false-positive alert for the entryway Nest lock was caused by a transient Google OAuth socket time"
category: scar
source: scar_nest_lock_circuit_breaker_fix.md
updated: 2026-10-07
---

A false-positive alert for the entryway Nest lock was caused by a transient Google OAuth socket timeout tripping an un-reset circuit breaker in the watchdog state machine. The issue was resolved by patching the state machine reset logic in the watchdog, resetting `nest_lock_state.json`, and adding regression coverage in `tools/test_nest_lock_watchdog.py`.
