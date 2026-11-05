---
name: Kasa Firmware HomeKit Probe Bypass
description: "Older 2020-era Kasa switches (Garage Lights, Rosie's Stars, Rosalind's Fan) silently hang on Wi-Fi d"
category: scar
source: scar_kasa_firmware_homekit_probe_bypass.md
updated: 2026-10-31
---

Older 2020-era Kasa switches (Garage Lights, Rosie's Stars, Rosalind's Fan) silently hang on Wi-Fi during startup when Home Assistant probes for Apple HomeKit support. The container upgrade workflow must preserve the HomeKit-probe bypass prior to switch initialization to prevent them from dropping offline across HA Core updates.
