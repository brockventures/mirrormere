---
name: Batch Guard Subshell PPID Reset
description: "Fixed a critical root-cause bug in `batch_guard.py` where relying on `os.getppid()` failed because `"
category: scar
source: scar_batch_guard_subshell_ppid_reset.md
updated: 2026-10-25
---

Fixed a critical root-cause bug in `batch_guard.py` where relying on `os.getppid()` failed because `agy` spawns hook scripts inside transient `bash -c` subshells, returning a brand-new PID on every hook invocation. This caused state resets on every single tool call and prematurely bypassed FORGE queue checks and decision cards. Durable fix requires inspecting parent process hierarchy rather than raw immediate PPID.
