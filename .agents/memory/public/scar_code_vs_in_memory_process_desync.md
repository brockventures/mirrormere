---
name: Code vs In-Memory Process Desync
description: "A detached background worker running an older version in memory failed because updating script files"
category: scar
source: scar_code_vs_in_memory_process_desync.md
updated: 2026-09-24
---

A detached background worker running an older version in memory failed because updating script files on disk does not update running child processes. When altering runloops or test scripts, stale background tasks must be explicitly terminated before launching new iterations to avoid false-silent states.
