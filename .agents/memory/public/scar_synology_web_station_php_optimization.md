---
name: Synology Web Station PHP Optimization
description: "Enabled `opcache.so` and `apcu.so` within Synology Web Station's PHP 8.4 profile and regenerated con"
category: scar
source: scar_synology_web_station_php_optimization.md
updated: 2026-09-04
---

Enabled `opcache.so` and `apcu.so` within Synology Web Station's PHP 8.4 profile and regenerated configs via `synowebstation`. This reduced latency from ~850ms down to ~130–150ms while deploying remediation shield layers against scanners.
