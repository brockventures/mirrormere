---
name: Mid-Turn Steering Context Drop Failure
description: "While SIGINT preemption mechanically interrupts active bridge tool execution upon receiving mid-turn"
category: scar
source: scar_mid_turn_steering_context_drop_failure.md
updated: 2026-10-01
---

While SIGINT preemption mechanically interrupts active bridge tool execution upon receiving mid-turn messages, the bridge drops the preempted prompt's context rather than merging both questions into the subsequent turn. Additionally, container volume isolation between Zero and Ivy (`discord-ivy-agent`) prevents dotfile setting changes like `queuedMessages` from propagating automatically across agents.
