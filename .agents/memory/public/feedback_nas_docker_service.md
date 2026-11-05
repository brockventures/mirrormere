---
name: NAS Docker service restart restriction
description: Never stop/restart ContainerManager or Docker daemon on the NAS without explicit approval
type: feedback
originSessionId: 807f42e9-51b2-4a3f-b7e8-4810505c5c12
---
Never stop or restart ContainerManager (the Synology Docker package) or the Docker daemon on the NAS without explicit user approval.

**Why:** Stopping ContainerManager takes down every container on the NAS — Plex, Radarr, Sonarr, HA, all of them — not just the target container. Ryan flagged this directly after I ran `synopkg stop Docker` unilaterally during HA triage (Apr 23 2026).

**How to apply:** If a container is stuck/zombie and nothing else works (docker rm -f, docker kill all hang), surface the situation to Ryan and propose options (DSM GUI restart, NAS reboot, Docker daemon restart) — but do not execute any of them without a "yes, do it."

**Critical: Docker commands going to background (incident 2026-05-28)**
The Bash harness auto-backgrounds long-running SSH commands even without `run_in_background: true`. When this happens to a `docker restart` or `docker stop`, the result shows "Command running in background with ID: ..." — this means the command IS STILL RUNNING on the NAS. Issuing ANY further docker commands while this is in flight (even read-only ones like `docker ps` or `docker exec`) can destabilize the Docker daemon. The 2026-05-28 HA outage was likely caused by issuing `docker ps` and `docker exec` concurrently with a backgrounded `docker restart`.

Rule: If a docker SSH command goes to background automatically, STOP immediately. Do not issue any further docker commands. Wait for the background task notification to complete, then verify with `docker ps` before anything else. If the task doesn't complete in reasonable time, hand off to Ryan — do not escalate.
