---
name: OctoPrint Watcher Test PID Collision
description: "Running unit tests (`pytest`) against active daemon tools deleted the live print watcher's PID lock "
category: scar
source: scar_octoprint_watcher_test_pid_collision.md
updated: 2026-10-24
---

Running unit tests (`pytest`) against active daemon tools deleted the live print watcher's PID lock file, allowing a second daemon to spawn after a mid-print restart and duplicate post-print actions (sending two timelapses). Test fixtures touching PID files or singleton locks must use isolated test mock paths or ephemeral temp directories to prevent stomping live production daemons.
