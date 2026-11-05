---
name: feedback_check_memory_before_claiming_impossible
description: "Before telling Ryan a task can't be done via CLI/automation, search memory for prior precedent — don't declare impossibility from first principles alone"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 83f25cf4-dee4-4322-827d-9159cc048fb3
---

2026-07-07: told Ryan the `synoschedtask` CLI couldn't edit a Task Scheduler trigger time and asked him to do it manually in DSM UI. He pushed back — "I thought you had edited tasks previously" — and he was right: the baseball refresh task's schedule was changed the same way on 2026-06-20 via direct edit of the task's backing file (`/usr/syno/etc/synoschedule.d/root/<id>.task`), documented in [[project_baseball_refresh_schedule]]. See [[reference_synoschedtask_file_edit]] for the technique, now promoted to its own reference memory specifically so it's easier to find next time.

**Why:** I reasoned from the CLI's `--help` output alone (only get/del/run) instead of checking whether this exact wall had been hit and solved before. The prior fix was filed under a baseball-specific memory, easy to miss when the task at hand is unrelated (NAS movies migration).

**How to apply:** When about to tell Ryan "X isn't possible" or "you'll need to do X manually," search memory first — not just for the exact task, but for the underlying mechanism (e.g. "Synology," "CLI can't," "task scheduler"). A negative claim is a stronger claim than a positive one and deserves the same verification bar. This applies especially to recurring infra surfaces (Synology, Docker, HA) where workarounds tend to get found once and then forgotten.
