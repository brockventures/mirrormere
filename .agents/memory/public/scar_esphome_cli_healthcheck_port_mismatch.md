---
name: ESPHome CLI Healthcheck Port Mismatch
description: "Ad-hoc ESPHome containers (`ghcr.io/esphome/esphome:stable`) spun up for CLI tasks fail default Dock"
category: scar
source: scar_esphome_cli_healthcheck_port_mismatch.md
updated: 2026-10-08
---

Ad-hoc ESPHome containers (`ghcr.io/esphome/esphome:stable`) spun up for CLI tasks fail default Docker healthchecks because the base image expects a web dashboard polling port 6052. Run one-off ESPHome CLI tasks with `--no-healthcheck --rm` to avoid false unhealthy container alerts on Host 1.
