---
name: project_oauth_silent_outage_2026-07
description: "5-day silent Claude Code auth outage (Jun 29-Jul 4 2026) — token expired, never auto-refreshed, alerting depends on the same broken auth"
metadata: 
  node_type: memory
  type: project
  originSessionId: c7ea3e21-c206-4477-9d2c-881e74a5778e
---

Ivy's Claude Code OAuth access token expired 2026-06-29 ~10:00 AM PT and never auto-refreshed. Every scheduled job (heartbeat, email, memory maintenance, nas-logs, p1-reminder) failed with `401 Invalid authentication credentials` then `Not logged in · Please run /login` on every run for ~5 days straight (confirmed via `/home/droid/heartbeat.log`). The main Discord-facing `ivy.service` kept working on its already-loaded in-memory token until a tmux crash 2026-07-01 ~10:00 PM PT forced a restart — after that the whole bot went unresponsive because the on-disk token was already stale, until Ryan noticed and ran `/login` manually 2026-07-04 09:13 AM PT.

**Why (confirmed root cause, 2026-07-05):** Claude Code's OAuth refresh tokens are single-use/rotating (standard OAuth 2.1 practice — each redemption issues a new refresh token and kills the old one). The CLI's local token manager has no file locking around its read→refresh→write cycle on `~/.claude/.credentials.json`, and ~9 systemd timers (heartbeat, daily, email, nas-logs, p1-reminder, memory, backup, car-monitor) plus one always-on interactive session all share that one file. When two `claude` processes hit expiry around the same moment, both read the same refresh token, both redeem it — the first wins and writes a new pair; the second gets `invalid_grant` back and can wipe the local file, breaking auth for everyone until manual `/login`. Documented upstream, unfixed as of 2026-07-05: [anthropics/claude-code#56339](https://github.com/anthropics/claude-code/issues/56339), [#48786](https://github.com/anthropics/claude-code/issues/48786), [#54443](https://github.com/anthropics/claude-code/issues/54443). Not patchable locally — fix has to land in Anthropic's CLI. New tokens observed to have an ~8hr lifetime (`expiresAt`).

**Blind spot:** heartbeat/health-check alerting is itself powered by `claude -p`, so when Claude's own auth breaks, it can't warn Ryan that it's broken. No auth-independent canary existed.

**How to apply:** If Ryan reports Ivy "went offline" or "lost authorization" again, check `/home/droid/heartbeat.log` for `401`/`Not logged in` patterns first, and check `~/.claude/.credentials.json` `expiresAt` (epoch ms) vs current time.

**Fix shipped 2026-07-04** (Ryan approved): `~/bin/ivy-auth-canary.sh` + `ivy-auth-canary.timer` (every 30 min, systemd user unit). Reads `expiresAt` from the credentials file directly and POSTs a raw Discord REST alert (reusing `DISCORD_BOT_TOKEN` from `~/.claude/channels/discord/.env`, same pattern as `ivy-startup.sh`) if the token is expired — no `claude` invocation anywhere in the failure path, so it can warn even when Claude's own auth is broken. Debounces re-alerts to once per 4hr while broken; self-clears once the token is valid again. Tested end-to-end (HTTP 200) 2026-07-04.

**Tuned 2026-07-05**: the token has two distinct failure modes — a self-healing blip (fixed within minutes once any process makes a live API call) and a genuine stuck outage (the original 5-day incident). Alerting on first detection fired on the blips too and read as noisy/inaccurate. Canary now requires the expiry to persist across 2 consecutive checks (~30 min apart, via a `FIRST_SEEN` marker) before alerting — see [[feedback_oauth_canary_quality_miss]] for why this should've been anticipated up front instead of shipped naive.

**Proposed, not yet built as of 2026-07-05**: wrap the ~9 scheduled `claude -p` invocations (heartbeat/daily/email/nas-logs/p1-reminder/memory/backup/car-monitor) in a shared `flock` so they stop racing each other on refresh — reduces collision surface but can't prevent a race against the always-on interactive session. Awaiting Ryan's go-ahead. See [[heartbeat_system]].
