---
name: Baseball pro app hot reloads
description: baseball_shiny_pro container does not need restart after file edits — Shiny hot reloads automatically
type: feedback
originSessionId: 512a160c-0270-49fa-8a0c-a599283a9ddc
---
The `baseball_shiny_pro` container hot reloads when R files in `shiny_app_pro/` are saved. No `docker restart` needed after code changes.

**Why:** R Shiny in development/watch mode detects file changes and reloads the app automatically.

**How to apply:** After editing any file in `shiny_app_pro/modules/`, do not suggest or request a container restart. Changes take effect immediately.
