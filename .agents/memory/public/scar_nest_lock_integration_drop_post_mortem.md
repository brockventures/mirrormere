---
name: Nest Lock Integration Drop Post-Mortem
description: "An arrival automation appeared to fail, but HA triggers fired normally while the Nest lock entity wa"
category: scar
source: scar_nest_lock_integration_drop_post_mortem.md
updated: 2026-09-14
---

An arrival automation appeared to fail, but HA triggers fired normally while the Nest lock entity was missing due to an unrefreshed Homebridge integration. Nest cloud gRPC tokens remained valid, and restarting the Homebridge container restored the missing lock entity.
