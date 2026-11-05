---
name: NAS scheduled maintenance
description: "Scheduled automated maintenance on NasHost-01 — Dockhand container updates (pullio decommissioned), daily Kometa restart; DSM OS auto-update disabled on both NasHost-01 and AppHost-02/.84 as of 2026-08-04"
category: engineering
source: project_nas_maintenance.md
updated: 2026-09-04
---

**Container-level auto-update — HISTORICAL, pullio decommissioned 2026-05-22.** The old "Thursday ~4 AM PT via pullio" schedule no longer applies — pullio was replaced by Dockhand (per-container, staggered, safe-pull strategy), see [[project_dockhand]] for current behavior and excluded containers. Don't reference pullio as active; [[project_pullio_split_brain]] is now purely historical context for why the switch happened.

**Daily 3:30 AM PT — Kometa restart (swap cleanup)**
DSM Scheduled Task restarts the `kometa` container to free swap. Kometa's process stays resident between runs (sleeps until next 1 AM), so paged-out memory accumulates in swap until the container is cycled. Configured 2026-04-20 via `/usr/syno/etc/synoschedule.d/root/` task file; runs `docker restart kometa >> /var/log/kometa-restart.log 2>&1`.

**DSM OS-level auto-update (NasHost-01) — different from Dockhand, unscheduled/unpredictable.** NasHost-01 has Synology's own DSM auto-update enabled (patches the OS itself, not containers). On 2026-07-08 ~6:15 AM PT it silently installed a small patch (→ DSM 7.3.2-86009 Update 4) and rebooted the whole NAS with no warning — all 28 containers went down together, came back within ~15 min via `restart:always`, no data loss. But it also wiped a non-persistent NFS mount (movies migration to DS1525+, see [[project_second_nas_ds1525]]) and broke that morning's transfer.

**FIXED on NasHost-01 2026-08-04** — Ryan disabled DSM auto-update on NasHost-01 itself (mentioned in passing, no further detail given). Unannounced NasHost-01 reboots from this cause should stop.

**FIXED on AppHost-02/`.84` too — 2026-08-04 evening.** Ryan found and disabled the same DSM auto-update setting there (had initially struggled to locate it in `.84`'s UI). Both NAS boxes are now clear of the unannounced-reboot risk, including the live-NFS-mount risk to the Movies migration (see [[project_second_nas_ds1525]]).

**Why:** Automated maintenance keeps containers current (Dockhand, per-container) and bounds Kometa memory growth (daily) without manual intervention. DSM's own OS auto-update is Synology-controlled, not Ivy-scheduled.

**How to apply:**
- Don't flag Kometa uptime of <24h as an incident — it's the scheduled 3:30 AM cycle
- If either NAS's containers all restart together with clean RestartCount=0 and no crash signature, check DSM's Update & Restore log for an auto-update reboot before treating it as an outage — this specific cause should no longer occur on either box post-08-04
