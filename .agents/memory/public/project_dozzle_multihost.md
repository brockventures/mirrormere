---
name: project_dozzle_multihost
description: "Dozzle (NAS log viewer) extended to cover both NasHost-01 and AppHost-02/.84 via built-in agent mode, 2026-08-07"
category: engineering
source: project_dozzle_multihost.md
updated: 2026-09-01
---

Dozzle (`amir20/dozzle:latest`) is the log-viewer container, previously NasHost-01-only, defined in `/opt/docker/appdata/docker-compose.yml` (`http://10.0.0.x:8082`). Extended 2026-08-07 to also cover AppHost-02 (`.84`) once the [[project_baseball_stack_migration_84]] work put real containers there worth watching.

**How it was done — Dozzle's built-in multi-host "agent" mode**, not a second full Dozzle instance:
- A lightweight `amir20/dozzle:latest` container started with the `agent` subcommand runs on `.84` (port `7007`, mounts `/var/run/docker.sock`), defined in the new `/opt/docker/support/docker-compose.yml` there (same file as `.84`'s new Dockhand instance, see [[project_dockhand]]).
- NasHost-01's existing `dozzle` service got one line added: `DOZZLE_REMOTE_AGENT=10.0.0.x:7007`. Only the `dozzle` service was restarted (`docker compose up -d dozzle`), verified 23 containers running before and after the edit, identical — nothing else in that shared compose file was touched.
- Confirmed working via Dozzle's own config API on NasHost-01 (`:8082`), which lists both hosts: `AppHost-02 endpoint=10.0.0.x:7007 type=agent available=true` alongside `NasHost-01 endpoint=local type=local available=true`. Host names are self-reported by the agent, no manual config needed. Both agent and server were v10.6.14 (exact match) — worth checking version parity if this is ever redone after either side updates independently, since Dozzle's agent protocol is unversioned/undocumented compatibility-wise.

**Landmine found, not touched:** `docker compose` on NasHost-01's `appdata/docker-compose.yml` throws an orphan-containers warning naming `otbr`, `home-assistant`, `matterserver`, `go2rtc` — these are legitimately-managed containers from a different/older compose invocation, not actual orphans. **Never pass `--remove-orphans`** when running compose commands against this file — it would delete Home Assistant and the Matter stack. This applies to any future edit of this compose file, not just Dozzle changes.

**How to apply:** if a third NAS box is ever added, the pattern is: Dozzle agent container on the new box + one more comma-separated `host:port` entry in `DOZZLE_REMOTE_AGENT` on NasHost-01's instance — no second full Dozzle UI needed anywhere. Contrast with Dockhand and Glances, which each need a genuinely separate instance per host (no multi-host mode).

**Heartbeat check 1c false-positive risk (confirmed 2026-08-07 02:xx PT):** `curl http://10.0.0.x:7007/` reliably returns `curl: (52) Empty reply from server` — TCP connects fine, server accepts then closes without sending HTTP data. This is expected: the agent speaks its own (likely gRPC-ish) wire protocol on 7007, not plain HTTP, so a plain GET can never get a real HTTP response even when healthy. Confirmed healthy via container status (`Up ... (healthy)`-equivalent in `docker ps`) at the same time. Don't treat curl 52 on this specific port as a failure — only genuine connection-refused/timeout indicates a real problem. If HEARTBEAT.md's check 1c is ever edited, this is a case for dropping the dozzle-agent HTTP probe (or switching it to a TCP-connect-only check) rather than a curl-response check.
