---
name: Homebridge Bridge & Apple HomeKit Integration Spec
description: "Active configuration, container setup, and accessory mappings for Apple HomeKit bridge"
category: project
source: project_homebridge.md
updated: 2026-09-04
---

# Homebridge & Apple HomeKit Integration Spec

Homebridge runs in Docker on NasHost-01 (`.82`) to expose non-native smart home accessories and specific Home Assistant entities into Apple HomeKit for iOS family control.

## 🍏 System Configuration
* **Container:** `homebridge/homebridge:latest` on host network mode (`10.0.0.x:8581`).
* **Storage Path:** `/opt/docker/homebridge/`.
* **mDNS Advertiser:** `ciao` (configured to prevent mDNS hostname collisions across NAS hosts).
