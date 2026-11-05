---
name: Nest Matterserver TLV Subscription Patch
description: "Nest Learning Thermostat 4th Gen (Node 37) failed to initialize in python-matter-server due to an In"
category: scar
source: scar_nest_matterserver_tlv_subscription_patch.md
updated: 2026-10-26
---

Nest Learning Thermostat 4th Gen (Node 37) failed to initialize in python-matter-server due to an Invalid TLV tag crash (0x00000024) during wildcard event subscriptions. Matterserver was upgraded to 8.1.2 with a persistent bind-mounted patch in `device_controller.py` that catches 0x00000024 on `_subscribe_node` and falls back to attribute-only subscription (`events=None`), restoring all thermostat entities to Home Assistant.
