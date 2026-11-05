---
name: Bridge Entrypoint Split-Brain Sync
description: "Discord shopping buttons failed due to an entrypoint split-brain between the container's running `/a"
category: scar
source: scar_bridge_entrypoint_split_brain_sync.md
updated: 2026-09-11
---

Discord shopping buttons failed due to an entrypoint split-brain between the container's running `/app/bridge.py` and the workspace code. The fix updates `execute_bridge_reload` in `tools/bridge_handlers.py` to automatically synchronize `/workspace/tools/bridge.py` into `/app/bridge.py` prior to `os.execv` reloads.
