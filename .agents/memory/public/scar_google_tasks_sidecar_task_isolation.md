---
name: Google Tasks Sidecar Task Isolation
description: "Clarified and resolved a bug in `google_tasks_sync.py` where internal engineering and game developme"
category: scar
source: scar_google_tasks_sidecar_task_isolation.md
updated: 2026-10-13
---

Clarified and resolved a bug in `google_tasks_sync.py` where internal engineering and game development tickets (#70-#77) tracked in `task_manager.py` leaked into Ryan's personal Google Tasks list. Google Tasks syncing must be strictly quarantined to human homelab/household chores rather than automated engineering backlog items.
