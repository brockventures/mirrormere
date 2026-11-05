---
name: Host 2 DSM Socket Exhaustion Post-Mortem
description: "Host 2 (DS1525+) crashed due to cascading PID exhaustion and IPC socket wedges inside Synology DSM's"
category: scar
source: scar_host_2_dsm_socket_exhaustion_post_mortem.md
updated: 2026-10-12
---

Host 2 (DS1525+) crashed due to cascading PID exhaustion and IPC socket wedges inside Synology DSM's `synoscgi`/`synocgid` layer, not a hardware panic or Ivy container fault. Mitigations deployed include a dedicated PID watchdog sidecar alerting at 75% capacity (`!pid_watchdog`) and auditing persistent DSM Web UI socket connections.
