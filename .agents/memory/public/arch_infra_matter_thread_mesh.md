---
name: Matter & OpenThread Border Router (OTBR) Infrastructure Spec
description: "Active architecture, network dataset, RCP adapter config, and supervisor loop for the homelab Thread mesh"
category: infra
source: infra_matter_thread_mesh.md
updated: 2026-09-04
---

# Matter & OpenThread Border Router (OTBR) Infrastructure Spec

The homelab Thread mesh integrates Home Assistant directly into the Google Nest Thread fabric (`NEST-PAN-262C`, PAN `0x262c`), allowing local Matter-over-Thread device commissioning (IKEA smart devices, door/window sensors) without Google cloud relay blocks.

## 🧵 Thread Mesh Architecture

* **Border Router Container:** `openthread/otbr:latest` running on NasHost-01 (`10.0.0.x`).
  * REST API: `http://10.0.0.x:8081`.
  * Persistent Dataset Mount: `/opt/docker/homeassistant/otbr-data:/var/lib/thread` (preserves PAN key across container recreates).
* **RCP Radio Adapter:** SMLIGHT SLZB-06P7-2 at `10.0.0.x` (firmware v3.3.1) configured in "Thread to remote OTBR" mode.
* **Bridge & Supervisor:** `/opt/docker/homeassistant/otbr-start.sh` runs a continuous supervision loop managing `socat` (TCP -> PTY) and `otbr-agent`.

## 🛠️ Operational Runbook & Recovery

* **Dataset Re-application:** If OTBR ever loses mesh attachment, active dataset is mirrored in `/opt/docker/homeassistant/config/.storage/thread.datasets`.
* **Restarting OTBR:**
  `cd /opt/docker/homeassistant && docker compose stop otbr && docker compose start otbr`
* **Mesh Verification:**
  `docker exec otbr ot-ctl state` (expect `router` or `child`).

## 📚 Historical Incident Post-Mortems
* `incident_otbr_dataset_persistence_loss_2026-07.md`
* `incident_otbr_rcp_flapping_supervisor_2026-07.md`
