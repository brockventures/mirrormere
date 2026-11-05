---
name: feedback_agent_polling_pattern
description: "Background agents waiting on a long-running remote process must use one blocking server-side poll loop, not repeated check-then-idle cycles"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 39a4a77b-c474-455d-a7e4-f46008524e36
  modified: 2026-08-04T10:08:18.904Z
---

When a background agent (Route 2/3) needs to wait for a long-running remote process (e.g. an SSH-triggered script on the NAS) to finish, it must NOT check once and then go idle, then get re-notified, check again, go idle again, repeating. Observed twice on the baseball-stats-rerun agent (2026-08-02): it went idle three times ~30-40s apart while the actual remote process (PID still alive on the NAS) had 10+ minutes left to run, generating a stream of spurious `idle_notification` messages back to the lead session.

**Why this matters:** every premature idle forces the lead/team-lead to notice, re-check state directly, and manually nudge the agent back to work — wasted round trips, and a real risk the lead assumes "idle" means "done" and reports a false completion to Ryan.

**Fix, confirmed working:** issue ONE Bash tool call that blocks and polls server-side in a loop (e.g. an SSH command that runs `for i in $(seq 1 N); do check condition; sleep 10s; done` remotely), sized to stay under the ~10-minute Bash tool timeout. If the process isn't done by the end of that call, immediately issue another identical blocking poll — never go idle in between. Only go idle after the final report has actually been sent to Discord.

**How to apply:** when spawning any agent whose job includes "wait for X to finish" (deploys, migrations, long reruns, verify passes), state this polling pattern explicitly in the spawn prompt rather than assuming the agent will infer it — the default behavior (check once, idle, wait for re-notification) is the wrong one for this case.
