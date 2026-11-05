---
name: Ivy Daemon Mid-Turn gRPC False Alarm
description: "Ivy's mid-turn steering handler misclassified an intentional local sub-process `SIGINT` interrupt as"
category: scar
source: scar_ivy_daemon_mid_turn_grpc_false_alarm.md
updated: 2026-10-17
---

Ivy's mid-turn steering handler misclassified an intentional local sub-process `SIGINT` interrupt as an upstream gRPC network buffer stall when Ryan sent follow-up messages during active tool streaming. The failure was a local race condition in `ivy_daemon.py` rather than an actual upstream API or network outage.
