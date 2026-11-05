---
name: Bridge Reload vs Container Restart Protocol
description: "Resolved a critical operational failure mode where "Restart Container Now" UI buttons only executed "
category: scar
source: scar_bridge_reload_vs_container_restart_proto.md
updated: 2026-09-05
---

Resolved a critical operational failure mode where "Restart Container Now" UI buttons only executed `os.execv` in-place reloads rather than cycling the Docker daemon, leaving stale orphaned PIDs alive. Codified a strict decision matrix distinguishing `os.execv` for in-memory bridge module updates from out-of-band host Docker restarts for container cgroup cleanup, with explicit, accurately labeled UI controls.
