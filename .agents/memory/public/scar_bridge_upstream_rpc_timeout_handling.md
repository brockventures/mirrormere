---
name: Bridge Upstream RPC Timeout Handling
description: "`agy` emits `{"event": "result", "result": {"error": "timeout waiting for response"}}` when upstream"
category: scar
source: scar_bridge_upstream_rpc_timeout_handling.md
updated: 2026-09-04
---

`agy` emits `{"event": "result", "result": {"error": "timeout waiting for response"}}` when upstream Gemini streaming RPCs drop or timeout before completion. Previously, `bridge.py` only retried OAuth eligibility failures, leaving upstream timeouts unhandled; proper mitigation requires expanding bridge retry logic to catch and retry these transient streaming RPC timeout events.
