---
name: Entryway Lock Two-Tier Recovery Architecture
description: "Implemented a two-tier self-healing watchdog for the entryway Nest deadbolt across Home Assistant (`"
category: scar
source: scar_entryway_lock_two_tier_recovery_architec.md
updated: 2026-10-06
---

Implemented a two-tier self-healing watchdog for the entryway Nest deadbolt across Home Assistant (`.82`) and Host 1 to handle stuck `unlocking` states. Tier 1 automates an in-flight timeout fail-safe after 25 seconds, protected by a 180-second cooldown and a 3-strike circuit breaker against sustained upstream outages. Supported by on-demand bridge triggers and scheduler hooks.
