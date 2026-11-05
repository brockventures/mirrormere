---
name: Cross-Host HA Execution Boundary
description: "Home Assistant on Host 1 (`.82`) cannot directly execute workspace scripts on Host 2 (`.84`) due to "
category: scar
source: scar_cross_host_ha_execution_boundary.md
updated: 2026-10-01
---

Home Assistant on Host 1 (`.82`) cannot directly execute workspace scripts on Host 2 (`.84`) due to physical container and NAS isolation. Cross-host actions require explicit decoupling through webhook listeners, SSH tunnels, or message brokers rather than direct container mounts.
