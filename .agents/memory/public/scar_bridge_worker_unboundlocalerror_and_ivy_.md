---
name: Bridge Worker UnboundLocalError and Ivy SQL Rollbacks
description: "Fixed an `UnboundLocalError` on `is_internal_cli_leak` in `discord-antigravity-agent` channel worker"
category: scar
source: scar_bridge_worker_unboundlocalerror_and_ivy_.md
updated: 2026-10-08
---

Fixed an `UnboundLocalError` on `is_internal_cli_leak` in `discord-antigravity-agent` channel workers caused by scoped import/variable handling in `tools.bridge_safety`. Additionally verified that sporadic Postgres `column does not exist` errors from `172.16.0.x` were benign exploratory query rollbacks from `discord-ivy-agent`.
