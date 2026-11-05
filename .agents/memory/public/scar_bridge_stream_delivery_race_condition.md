---
name: Bridge Stream Delivery Race Condition
description: "Background audit completion tasks can race with and stomp in-flight autopsy responses in the Discord"
category: scar
source: scar_bridge_stream_delivery_race_condition.md
updated: 2026-10-05
---

Background audit completion tasks can race with and stomp in-flight autopsy responses in the Discord bridge stream before delivery. Root-cause autopsies must be decoupled from trailing background status events to avoid dropping user-facing explanations.
