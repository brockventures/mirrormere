---
name: Ivy Daemon In-Flight Snapshotting Parity
description: "Ported runtime steering and snapshotting fixes from Zero's bridge engine to Ivy on Host 2 (`discord-"
category: scar
source: scar_ivy_daemon_in_flight_snapshotting_parity.md
updated: 2026-10-01
---

Ported runtime steering and snapshotting fixes from Zero's bridge engine to Ivy on Host 2 (`discord-ivy-agent`). Set `"queuedMessages": "send-immediately"` in Ivy's `settings.json` and patched `IvyPersistentWorker` in `tools/ivy_daemon.py` to record in-flight turn context.
