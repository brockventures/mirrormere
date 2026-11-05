---
name: Bridge PTY Held Open by Descendant Processes
description: "Child processes inheriting slave PTY descriptors prevent EOF on master PTY; mitigated via line-buffered NDJSON parsing and dual completion triggers"
category: scar
source: scar_bridge_pty_held_open_child_processes.md
updated: 2026-09-04
---

Under Unix pseudo-terminal semantics, `master_fd` never returns EOF (`b""`) or raises `EIO` as long as any descendant process holds an open descriptor to `slave_fd`. When `agy` executes background commands or tools, child processes inherit `slave_fd`. Furthermore, if `agy`'s NDJSON output is parsed in raw 8KB chunks without line buffering, chunk-boundary line splits cause `{"event": "result"}` detection to fail silently. 

The structural mitigation in `tools/bridge_runner.py` enforces:
1. **Line-buffered stream parsing (`line_buffer`):** Guarantees zero dropped JSON events regardless of chunk size or boundary splits.
2. **Dual completion triggers:** Triggers termination cutoff on `event: "result"` (1.5s grace) OR on `step_type: "agent_response"` with `state: "DONE"` (2.0s grace without subsequent tool calls).
3. **Active process tree termination & master PTY close:** Once completion triggers fire, `kill_process_tree(proc, signal.SIGTERM)` terminates the process group, residual bytes are drained, and `master_fd` is explicitly closed.
