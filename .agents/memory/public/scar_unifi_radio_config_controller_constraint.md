---
name: UniFi Radio Config Controller Constraint
description: "UniFi radio channel assignments are bound to provisioning profiles in the Java application layer rat"
category: scar
source: scar_unifi_radio_config_controller_constraint.md
updated: 2026-09-12
---

UniFi radio channel assignments are bound to provisioning profiles in the Java application layer rather than an underlying native CLI, meaning raw database or backend edits bypass the AP Inform reprovision queue. Wireless meshing was permanently disabled across the APs (`U6 IW` and both `U6 Mesh`), establishing that manual radio channel reassignments must be applied via the web controller UI.
