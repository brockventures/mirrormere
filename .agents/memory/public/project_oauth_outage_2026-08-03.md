---
name: project_oauth_outage_2026-08-03
description: "Second OAuth credential-wipe outage (~10 AM-5:24 PM PT, 08-03) — canary worked this time, but the flock fix never actually covered the collision path"
metadata: 
  node_type: memory
  type: project
  originSessionId: 038a977f-59de-4cbd-9e4a-9e3f38b368fd
  modified: 2026-08-04T00:47:40.654Z
---

Recurrence of the [[project_oauth_silent_outage_2026-07]] failure mode, ~7.5hrs instead of 5 days.

**Timeline (PT, 2026-08-03):** last good heartbeat 8:01 AM → `~/.ivy/active_agents.json` shows a background agent (EV9 pre-cool work) spawned 9:55 AM → first failed heartbeat 10:00 AM ("OAuth session expired and could not be refreshed") → canary alerted correctly at 10:30 AM and 3:00 PM (2-consecutive-check debounce working as designed) → always-on interactive `ivy.service` kept running fine the whole time on its cached in-memory token, masking the outage from Discord → something stopped `ivy.service` at 5:19 PM, it didn't exit cleanly, systemd SIGKILLed it at 5:20:42 PM (90s timeout) and auto-restarted per `Restart=on-failure` → fresh restart loaded the already-broken on-disk token → manual `/login` at 5:24 PM actually fixed it.

**Root cause confirmed, not just suspected:** canary alert text read "expired 29762970 min" (~56.6 years) — proves `expiresAt` was reset to ~0, i.e. the credentials file got corrupted/wiped by a losing `invalid_grant` response, not a natural TTL expiry. Same single-use-refresh-token race as June, still unpatched upstream.

**The July flock fix ([[project_claude_cli_flock_wrapper]]) did not actually close this gap.** It only wraps the 7 named systemd timers. It does not cover: (1) the always-on interactive session (can't — it holds a token in memory continuously, not per-invocation), or (2) ad-hoc background agents spawned via the Agent tool mid-conversation, which run as separate `claude` processes touching the same credentials file unprotected. The 9:55 AM EV9 agent spawn (5 min before first failure) is the best circumstantial lead for today's second colliding process — timing fits, but no process/log survived to prove it definitively.

**Also found:** the EV9 agent's `active_agents.json` entry was still present 7.5+ hrs later with no matching process — stale cleanup, separate from the auth issue but worth a general fix per the Route 2 agent-cleanup protocol in CLAUDE.md.

**Not yet built:** a lock that background-agent spawns (and ideally the interactive session's own refresh cycle) actually respect. Proposed to Ryan 08-03, awaiting go-ahead — this is the real fix; the existing flock wrapper only ever covered timer-vs-timer collisions.
