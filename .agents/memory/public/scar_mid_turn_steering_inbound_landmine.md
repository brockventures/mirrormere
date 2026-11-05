---
name: Mid-Turn Steering Inbound Landmine
description: "Concurrent inbound messages tagging Zero while active tool calls were executing triggered mid-turn s"
category: scar
source: scar_mid_turn_steering_inbound_landmine.md
updated: 2026-10-02
---

Concurrent inbound messages tagging Zero while active tool calls were executing triggered mid-turn steering aborts in the bridge router. Root-cause analysis revealed race conditions where mid-flight steer attempts collided with active tool execution, requiring strict queueing and isolation to prevent unhandled abort exceptions.
