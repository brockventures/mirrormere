---
name: Mid-Turn Steering Race Condition
description: "A race condition in the bridge mid-turn steering pipeline caused a dropped turn when a rapid follow-"
category: scar
source: scar_mid_turn_steering_race_condition.md
updated: 2026-09-04
---

A race condition in the bridge mid-turn steering pipeline caused a dropped turn when a rapid follow-up interruption arrived while execution was active. Future bridge event handling must ensure mid-turn steering signals safely queue or preempt active turns without dropping messages.
