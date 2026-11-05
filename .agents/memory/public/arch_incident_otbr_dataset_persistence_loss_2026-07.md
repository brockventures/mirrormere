---
name: Incident: OTBR Dataset Volume Missing & Ephemeral Mesh Loss
description: "Analysis of OTBR container recreates wiping Thread network dataset and resolution via persistent volume mount"
category: incident
source: incident_otbr_dataset_persistence_loss_2026-07.md
updated: 2026-09-04
---

# Incident Post-Mortem: OTBR Ephemeral Dataset Loss (2026-07-26)

## Summary
OTBR stores its active Thread dataset in `/var/lib/thread`. Because the compose service lacked a persistent bind mount, container recreations silently wiped network credentials.

## Remediation
* Added persistent volume `- /opt/docker/homeassistant/otbr-data:/var/lib/thread` to `docker-compose.yml`.
* Re-applied active TLV from HA storage.
