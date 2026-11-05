---
name: Mid-Turn Steering and Compaction Mechanics
description: "Mid-turn steering cannot dynamically inject prompts into an active runner turn; it must abort and re"
category: scar
source: scar_mid_turn_steering_and_compaction_mechani.md
updated: 2026-10-31
---

Mid-turn steering cannot dynamically inject prompts into an active runner turn; it must abort and restart the execution loop. Compaction fires automatically on trigger thresholds, but rapid successive compactions during long sessions can work against active task context if not properly coordinated with execution restarts.
