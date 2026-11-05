---
name: feedback-schedule-times-utc
description: "Container schedule env vars are interpreted per-container (Kometa=UTC, Posterizarr=local TZ) — never infer, always verify against actual log start times"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e8d0f5d8-f813-42cc-9b94-456473e26721
  modified: 2026-08-08T05:32:47.966Z
---

**The blanket "schedule env vars are always UTC" rule was WRONG — corrected 2026-08-07.** It holds for Kometa but NOT for Posterizarr. Whether a schedule value is UTC or local depends on whether that specific container actually has a working TZ, so it must be verified per container.

Confirmed by log evidence 2026-08-07:
- **Kometa — UTC.** `KOMETA_TIMES=08:00` → runs 08:00 UTC = 1:00 AM PT. The container itself is on UTC (`kometa.py --validate` reported `05:28 2026-08-08` while the NAS host clock read `22:28 PDT 2026-08-07`), so this isn't Kometa "forcing" UTC — the container just has no local TZ.
- **Posterizarr — LOCAL TZ.** `RUN_TIME=11:00` with `TZ=US/Pacific` → runs at **11:00 AM PT**, not 4:00 AM PT. `docker exec posterizarr date` returns PDT (matches host), and five consecutive `RotatedLogs/Logs_2026080*_1100*/` dirs all start at `11:00:1x`–`11:00:3x` local. Unambiguous.

**Correction propagated:** [[project_posterizarr]] had recorded 11:00 UTC = 4 AM PT since 2026-06-07 — that was wrong for ~2 months. No operational harm (11 AM PT is still well clear of Kometa at 1 AM and Sonarr's Refresh Series at 5:18 AM), but any arr-contention reasoning that assumed a 4 AM Posterizarr window was reasoning about the wrong time of day.

**How to apply:** Never calculate a scheduled time as `env_var_time − TZ_offset`, and never assume UTC either. Verify with two cheap read-only checks: `docker exec <container> date` (is the container even on local time?) and the actual `Starting...` timestamp in its recent logs. Only state a scheduled time as fact once log evidence confirms it.
