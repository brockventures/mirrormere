---
name: Google Home MCP Port Collision Outage
description: "A 55-minute daemon boot outage occurred when the new `google-home` MCP server collided on port 8769 "
category: scar
source: scar_google_home_mcp_port_collision_outage.md
updated: 2026-09-20
---

A 55-minute daemon boot outage occurred when the new `google-home` MCP server collided on port 8769 with `zero_health_server`, requiring manual Zero Shard recovery. The fix permanently re-homes `google-home` to port 8770 in [`tools/mcp_daemon.py`](file:///root/Zero-Agent/tools/mcp_daemon.py) and patches `execute_container_restart` routing to resolve NAS host configuration reliably.
