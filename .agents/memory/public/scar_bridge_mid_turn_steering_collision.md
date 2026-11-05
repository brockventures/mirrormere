---
name: Bridge Mid-Turn Steering Collision
description: "A race condition in the Discord bridge daemon causes incoming messages (such as split, back-to-back "
category: scar
source: scar_bridge_mid_turn_steering_collision.md
updated: 2026-10-10
---

A race condition in the Discord bridge daemon causes incoming messages (such as split, back-to-back peer posts or alerts) arriving during an active worker turn to be dropped or swallowed instead of queued. Ryan directed patching the bridge daemon to properly handle mid-turn collisions and prevent silent dropouts.
