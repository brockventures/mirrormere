---
name: Incident: SMLIGHT RCP Adapter Flap & OTBR Process Supervisor Fix
description: "Post-mortem on SLZB-06P7 TCP disconnects killing otbr-agent and deployment of in-container supervisor"
category: incident
source: incident_otbr_rcp_flapping_supervisor_2026-07.md
updated: 2026-09-04
---

# Incident Post-Mortem: SMLIGHT RCP Flap & OTBR Supervisor (2026-07-27)

## Summary
The SMLIGHT SLZB-06P7 radio adapter experienced transient network disconnects. When `otbr-agent` lost connection to `socat`, it aborted, leaving the container dead.

## Remediation
* Rewrote `/opt/docker/homeassistant/otbr-start.sh` with an auto-restarting supervision loop.
