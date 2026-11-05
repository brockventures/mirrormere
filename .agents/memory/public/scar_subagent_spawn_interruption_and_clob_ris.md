---
name: Subagent Spawn Interruption and CLOB Risks
description: "A turn dispatch failure was traced to a supervisor restart terminating subagent child processes mid-"
category: scar
source: scar_subagent_spawn_interruption_and_clob_ris.md
updated: 2026-09-20
---

A turn dispatch failure was traced to a supervisor restart terminating subagent child processes mid-init, triggering the zero-action guard. The resulting red-team analysis identified core execution risks on Kalshi: adverse selection from stale 15-minute maker TTLs in low-liquidity CLOBs, in-flight cancellation drops, and NOAA/exchange 503/504 timeout discrepancies.
