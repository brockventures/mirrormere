---
name: PTY Leak Container Reload Scar
description: "Code changes to long-running bridge runner tools (`tools/bridge_runner.py`) do not take effect dynam"
category: scar
source: scar_pty_leak_container_reload_scar.md
updated: 2026-09-05
---

Code changes to long-running bridge runner tools (`tools/bridge_runner.py`) do not take effect dynamically because PID 1 caches unpatched Python modules in container memory. Resolving stream parser and PTY hang bugs requires an in-place container reload/restart to flush cached runner processes.
