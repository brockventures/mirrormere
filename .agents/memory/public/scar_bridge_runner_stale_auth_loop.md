---
name: Bridge Runner Stale Auth Loop
description: "The bridge daemon (`PID 1`) became unresponsive in `#baseball` due to an in-memory stale auth-retry "
category: scar
source: scar_bridge_runner_stale_auth_loop.md
updated: 2026-10-08
---

The bridge daemon (`PID 1`) became unresponsive in `#baseball` due to an in-memory stale auth-retry loop caused by long continuous uptime since October 3rd. Root cause traced to diagnostic log triggers trapping the runner in an unrecovered retry state.
