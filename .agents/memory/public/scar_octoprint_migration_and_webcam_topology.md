---
name: OctoPrint Migration and Webcam Topology
description: "Ryan's Creality Ender 3 V2 3D printer setup uses an Android device running IP Webcam Pro at IP `192."
category: scar
source: scar_octoprint_migration_and_webcam_topology.md
updated: 2026-10-01
---

Ryan's Creality Ender 3 V2 3D printer setup uses an Android device running IP Webcam Pro at IP `10.0.0.x` (not `.218`, which is the Windows host `DESKTOP-1H2017G`). OctoPrint configuration was backed up from the Windows service on port 8888 for migration to a Docker stack on Host 2 (`127.0.0.1`), with the printer hardware reconnecting via USB. Remote toggling of the IP Webcam Pro app is handled via Android automation (Home Assistant companion app or Tasker/MacroDroid broadcast intents).
