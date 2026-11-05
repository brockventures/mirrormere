---
name: Runtime Async Notification Tag Leak
description: "When commands exceed the 10-second threshold and execute via background tasks, runtime completion ev"
category: scar
source: scar_runtime_async_notification_tag_leak.md
updated: 2026-09-20
---

When commands exceed the 10-second threshold and execute via background tasks, runtime completion events inject raw `<NOTIFICATION>` payloads into the model context that can inadvertently leak into user-facing responses. Output generation must explicitly suppress or sanitize internal harness task completion wrappers before responding to the user.
