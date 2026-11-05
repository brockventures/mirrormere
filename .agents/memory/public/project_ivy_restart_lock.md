---
name: project-ivy-restart-lock
description: HISTORICAL — stale restart_lock bug (fixed 2026-06-05); the context-based auto-restart this describes was removed entirely 2026-07-12, see [[feedback_context_restart_removed]]
metadata: 
  node_type: memory
  type: project
  originSessionId: 02045b3e-6b66-4900-974f-0270c3bbfd61
---

A stale `restart_lock` file (created 2026-04-17) had blocked every context-window restart since April, letting the main session grow to 165k+ tokens. The ballooned session likely contributed to a memory-pressure crash on June 5 when multiple nightly jobs fired simultaneously at 9:30 PM PT.

**Fix applied 2026-06-05:**
1. Deleted the stale lock file
2. Added `rm -f "$LOCK"` to the success path of `ivy-summarize-and-restart.sh` so the lock always clears after a clean restart
3. Staggered the nightly timer batch: `daily summary 21:29 → P1 reminder 21:30 → email 21:31 → NAS logs 21:33` → spread to `21:29 / 21:31 / 21:33 / 21:37` (previously all near 21:30)

**Why:** The pile-up of 4 timers within 60 seconds created a memory spike on the VM; the staggered schedule gives each job time to finish before the next starts.

**Nightly restart timer disabled (2026-06-20):** `ivy-nightly-restart.timer` (was firing at 4:15 AM PT daily) was disabled by Ryan's request. Timer unit file still on disk — re-enable with `systemctl --user enable --now ivy-nightly-restart.timer` if needed.

**How to apply:** If the context-window restart appears stuck (lock file exists but no restart in progress), check age of `restart_lock` — if older than ~10 minutes, it's stale and can be safely deleted. The success path now handles this automatically.

**2026-07-12 update:** The context-based restart mechanism this memory describes (`~/.ivy/stop.sh` warning at 70%/restarting at 80% token usage) was removed entirely — see [[feedback_context_restart_removed]]. `restart_lock` staleness is no longer a live concern since nothing sets that lock anymore.
