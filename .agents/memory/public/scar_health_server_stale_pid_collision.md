---
name: Health Server Stale PID Collision
description: "A bridge reboot caused a 502 on `zero.brock.ventures/gotchi` due to a stale PID file for `zero_healt"
category: scar
source: scar_health_server_stale_pid_collision.md
updated: 2026-10-27
---

A bridge reboot caused a 502 on `zero.brock.ventures/gotchi` due to a stale PID file for `zero_health_server.py` colliding with an active thread ID on port 8769. The health daemon failed to spawn cleanly until the stale PID tracking state was cleared. Ensure health server process supervision validates process identity rather than blindly trusting leftover PID files across container reboots.
