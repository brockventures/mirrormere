---
name: ESPHome Ad-Hoc Container Healthchecks
description: "Ad-hoc ESPHome CLI containers (`ghcr.io/esphome/esphome`) launched without `--rm` accumulate thousan"
category: scar
source: scar_esphome_ad_hoc_container_healthchecks.md
updated: 2026-10-18
---

Ad-hoc ESPHome CLI containers (`ghcr.io/esphome/esphome`) launched without `--rm` accumulate thousands of failed healthchecks because Docker probes port 6052, which is not active during CLI command runs. Always supply `--rm` when running one-off ESPHome CLI tasks to prevent orphaned containers from lingering in an unhealthy state.
