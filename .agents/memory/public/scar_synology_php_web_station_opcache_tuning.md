---
name: Synology PHP Web Station OPcache Tuning
description: "Enabling `opcache.so` and `apcu.so` within Synology Web Station's PHP 8.4 profile and regenerating c"
category: scar
source: scar_synology_php_web_station_opcache_tuning.md
updated: 2026-09-05
---

Enabling `opcache.so` and `apcu.so` within Synology Web Station's PHP 8.4 profile and regenerating configs via `synowebstation` resolves high latency, cutting response times from ~850ms down to ~130–150ms. Always regenerate Web Station configurations after adjusting PHP extension profiles.
