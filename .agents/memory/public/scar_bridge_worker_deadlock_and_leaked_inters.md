---
name: Bridge Worker Deadlock and Leaked Interstitials
description: "Resolved a critical bridge bug where `is_bridge_busy` conflated perpetual worker loops with active t"
category: scar
source: scar_bridge_worker_deadlock_and_leaked_inters.md
updated: 2026-09-17
---

Resolved a critical bridge bug where `is_bridge_busy` conflated perpetual worker loops with active turns, preventing code hot-reloads and causing the arr watchdog fix to never take effect in memory. Fixed bridge CLI turn completion logic to enforce silence during background async commands rather than leaking internal runtime wait messages to Discord.
