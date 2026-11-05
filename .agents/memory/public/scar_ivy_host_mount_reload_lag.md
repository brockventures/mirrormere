---
name: Ivy Host Mount Reload Lag
description: "Ivy (`discord-ivy-agent`) mounts Zero's host directory directly at `/opt/zero:ro`, providing instant"
category: scar
source: scar_ivy_host_mount_reload_lag.md
updated: 2026-10-08
---

Ivy (`discord-ivy-agent`) mounts Zero's host directory directly at `/opt/zero:ro`, providing instantaneous disk parity for tool updates. However, active Python processes do not pick up modified modules until restarted or reloaded, creating an on-disk vs in-memory execution discrepancy.
