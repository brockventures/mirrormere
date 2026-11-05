---
name: Stale PID File Reuse Collision
description: "A container reboot left behind `/workspace/data/mcp_daemon.pid` containing PID 21, which was subsequ"
category: scar
source: scar_stale_pid_file_reuse_collision.md
updated: 2026-10-19
---

A container reboot left behind `/workspace/data/mcp_daemon.pid` containing PID 21, which was subsequently assigned to `zero_mail_listener.py` upon startup. Because `mcp_daemon.py` only checked process liveness via `os.kill(pid, 0)` without validating the process name or cmdline, it falsely assumed the daemon was already active and skipped starting, triggering heartbeat alert failures. Daemon PID checks must verify process command line identity rather than bare PID liveness.
