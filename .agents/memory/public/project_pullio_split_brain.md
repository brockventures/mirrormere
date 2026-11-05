---
name: Pullio split-brain ghost containers
description: "HISTORICAL — Pullio decommissioned 2026-05-22, replaced by Dockhand; documents the split-brain failure that drove the switch"
category: engineering
source: project_pullio_split_brain.md
updated: 2026-09-01
---

**STATUS: Pullio was fully removed from the NAS on 2026-05-22** (all `org.hotio.pullio.*` labels stripped, DSM cron disabled) and replaced by [[project_dockhand]]. This split-brain failure mode is the reason for the switch — kept here as rationale and as a pattern to watch for in any auto-updater.

When pullio's Thursday update attempts to recreate a container that's wedged at the kernel level, the recreate can finish partway — the new container starts but the old one never gets removed. Docker's `restart: always` policy then keeps both running. Observed 2026-05-14 with Home Assistant: a `<id>_home-assistant` container appeared alongside the original `home-assistant`, causing two HA processes to run in parallel and trigger repeating crash/restart notification floods.

**Why:** Pullio uses compose-style recreate; if the stop step times out on a wedged container, the start step still proceeds, and the orphan never gets cleaned up.

**How to apply:**
- During NAS log review and heartbeat checks, flag any `<id>_<servicename>` duplicate alongside an existing `<servicename>` container as an anomaly — surface to Ryan, don't silently dedupe.
- Do not attempt `docker rm` on the ghost from here — if the daemon is wedged enough to produce the split-brain, more Docker commands will crash ContainerManager. Hand off to Ryan for DSM-side cleanup.
- More likely to occur on Thursdays (pullio's scheduled run) and on containers with a recent history of hangs (HA especially).
