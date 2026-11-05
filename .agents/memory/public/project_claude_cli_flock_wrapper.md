---
name: project-claude-cli-flock-wrapper
description: Shared flock wrapper serializes scheduled claude -p calls to reduce OAuth refresh-token races
metadata: 
  node_type: memory
  type: project
  originSessionId: ed0e1062-c5c3-43dd-8de8-6fe1becb0194
---

Added 2026-07-05: `~/bin/claude-locked.sh` wraps `claude` with `flock -w 120 -E 99
~/.ivy/claude-cli.lock claude "$@"`. The 7 systemd services that invoke `claude --dangerously-skip-permissions -p ...`
(`ivy-heartbeat`, `ivy-daily`, `ivy-p1-reminder`, `ivy-email`, `ivy-nas-logs`, `ivy-unsubscribe`,
`ivy-memory`) now call this wrapper instead of `claude` directly, so at most one of them can hit
`~/.claude/.credentials.json` at a time. On lock timeout it exits distinctly (code 99) rather than
hanging.

**Why:** root cause of the [[project_oauth_silent_outage_2026-07]] 5-day auth outage: Claude Code's
OAuth refresh tokens are single-use/rotating with no file locking, so two `claude` processes
refreshing near-simultaneously can race — the loser gets `invalid_grant` and can wipe the shared
credentials file. Documented in upstream issues #56339, #48786, #54443. Not something patchable
from here (fix has to land in Anthropic's CLI); this only reduces collision odds between Ivy's own
timers. Does **not** protect against a race with the always-on interactive session, which isn't
wrapped (it runs continuously, not spawned per-invocation).

**How to apply:** if the OAuth-outage/invalid_grant symptom recurs, check whether it's still the
interactive-session-vs-timer race (expected residual risk) or something new before re-diagnosing
from scratch. `backup.sh` and `car_monitor/search.py` do not call `claude` directly (just reference
paths with "claude" in the name) so they were correctly left out of this wrapping.
