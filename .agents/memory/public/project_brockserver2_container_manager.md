---
name: project_brockserver2_container_manager
description: "Container Manager (Docker 24.0.2) installed on AppHost-02/.84, 2026-08-06 — two install gotchas documented"
category: engineering
source: project_brockserver2_container_manager.md
updated: 2026-09-04
---

Installed per Ryan's request 2026-08-06, first concrete step toward distributing containers off NasHost-01 (see [[project_container_distribution_analysis]]).

**Method:** `sudo /usr/syno/bin/synopkg install_from_server ContainerManager /srv/storage Brock` — `synopkg` isn't on default PATH, full path `/usr/syno/bin/synopkg`. `install_from_server <package> <volume> <user> [beta]` pulls straight from Synology's package server, no manual .spk download needed.

**Gotcha 1 — volume path format.** First two attempts with volume param `volume1` (no leading slash) failed with a generic "Failed to install 'ContainerManager'" and no useful top-level error. Real cause only visible in `/var/log/synopkgmgr.log`: `"Failed to parse volume path: volume1"` / `"encounter an error while choosing installation path, code=[8192]"`. Fix: pass `/srv/storage` (leading slash) instead. `/var/log/synopkg.log` alone doesn't show this — always check `synopkgmgr.log` too for package-install failures on this DSM version.

**Gotcha 2 — DSM's own status check is unreliable, don't trust it alone.** After a successful `synopkg start ContainerManager` (reported success), a follow-up `synopkg status ContainerManager` showed `"status":"stop"` with `"the script status is not 0 but the unit is active, it is possible that package encounters an error after started"` — looked like a crash-on-start. It wasn't: `systemctl is-active pkg-ContainerManager-dockerd.service pkg-ContainerManager-event-watcherd.service` showed both genuinely `active`, and `docker version`/`docker ps` both worked cleanly (client+server handshake, empty container list as expected for a fresh install). **Verify Docker health via `docker version`/`docker ps` directly, not `synopkg status`, if this pattern recurs.**

**Also needed:** the `overlay` kernel module wasn't loaded by default (`lsmod | grep overlay` empty) — loaded via `sudo modprobe overlay` during troubleshooting. Turned out not to be the actual blocker (gotcha 1 was), but Docker needs it regardless, so worth confirming it's loaded on any future Synology Docker install. Not yet confirmed whether this survives a reboot (Synology kernel modules sometimes need a boot-persistent load mechanism, unlike a plain Linux `/etc/modules` — check on next `.84` reboot if Docker fails to start).

**CLI path:** `docker`/`docker-compose`/`dockerd` are NOT on the default SSH PATH — full path `/srv/storage/@appstore/ContainerManager/usr/bin/docker` (and `docker-compose` alongside it). Consider a `bin/nas2docker` wrapper or PATH addition if `.84` container work becomes routine.

**Status as of 2026-08-06 ~1 AM PT:** Container Manager confirmed working, zero containers running yet. Next step (not started): deciding compose file structure / actually moving a workload over — awaiting Ryan's direction, see [[project_container_distribution_analysis]] for candidate list.
