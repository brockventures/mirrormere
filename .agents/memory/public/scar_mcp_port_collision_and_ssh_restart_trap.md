---
name: MCP Port Collision & Remote Container Restart SSH Outage Post-Mortem
description: "Collision on port 8769 between google-home MCP and zero_health_server, combined with broken 127.0.0.1:22 SSH default in execute_container_restart"
category: scar
updated: 2026-09-19
---

A two-stage failure caused a 55-minute bridge outage on 2026-09-19:
1. **Broken Container Restart Dispatcher**: `execute_container_restart()` in `tools/bridge_commands.py` defaulted to `Brock@127.0.0.1:22` instead of resolving the Host 2 NAS topology (`_resolve_nas_config()` -> dynamic NAS Host 2 IP and custom SSH port). The SSH command failed with connection refused, leaving the container wedged without an actual restart.
2. **Supervisor Collapse on Boot**: When manually rebooted, `tools/mcp_daemon.py` failed to initialize because `google-home` was assigned to port 8769, colliding with `zero_health_server.py` and `zero-lan-proxy`. The `uvicorn` socket collision inside `asyncio.gather` cancelled all 5 persistent MCP servers, crashing the daemon supervisor on boot.
3. **Recovery & Invariant**: Re-homed Google Home MCP to port 8770, reserved 8769 strictly for `zero_health_server`, and enforced dynamic NAS config resolution (`_resolve_nas_config()`) for all remote host commands.
