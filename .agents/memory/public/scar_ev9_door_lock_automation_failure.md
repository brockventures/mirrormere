---
name: EV9 Door Lock Automation Failure
description: "Home Assistant's EV9 auto-lock automation failed 80% of the time because it skipped sending the lock"
category: scar
source: scar_ev9_door_lock_automation_failure.md
updated: 2026-09-07
---

Home Assistant's EV9 auto-lock automation failed 80% of the time because it skipped sending the lock command whenever `lock.my_ev9_door_lock` falsely reported a `locked` state. The fix removes the premature state check condition in `automations.yaml` so the lock command is reliably dispatched upon Android Auto disconnect regardless of stale state reports.
