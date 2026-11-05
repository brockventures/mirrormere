---
name: Dreaming Pass Watchdog Starvation Scar
description: "Sequential `await` on `_run_sidecar_job_async()` during the nightly dreaming consolidation pass bloc"
category: scar
source: scar_dreaming_pass_watchdog_starvation_scar.md
updated: 2026-09-17
---

Sequential `await` on `_run_sidecar_job_async()` during the nightly dreaming consolidation pass blocked `bridge_scheduler._loop` for 218 seconds despite `asyncio.to_thread()`, preventing `update_gateway_heartbeat()` from firing and tripping a false-positive watchdog alert. Long-running sidecar dispatches must not block the top-level scheduler loop from updating liveness heartbeats.
