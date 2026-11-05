---
name: Harness Background Task Notification Leak
description: "Commands exceeding the synchronous tool timeout are sent to background tasks, triggering `<RECEIVED_"
category: scar
source: scar_harness_background_task_notification_lea.md
updated: 2026-09-20
---

Commands exceeding the synchronous tool timeout are sent to background tasks, triggering `<RECEIVED_TASK_NOTIFICATION>` harness events upon completion. If raw task notification blocks are echoed back into the response stream rather than filtered, internal harness metadata leaks into user-facing output.
