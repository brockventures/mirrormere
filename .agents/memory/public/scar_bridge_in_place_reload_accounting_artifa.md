---
name: Bridge In-Place Reload Accounting Artifacts
description: "In-place Python bridge reloads (`os.execv`) preserve the original container process ID and creation "
category: scar
source: scar_bridge_in_place_reload_accounting_artifa.md
updated: 2026-10-08
---

In-place Python bridge reloads (`os.execv`) preserve the original container process ID and creation timestamp in Linux kernel accounting (`ps`/`top`), creating diagnostic red herrings about process start times. Verification of active running code should rely on internal commit hashes or memory state rather than PID start timestamps.
