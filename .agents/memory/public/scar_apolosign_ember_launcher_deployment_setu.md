---
name: ApoloSign EMBER Launcher Deployment Setup
description: "Deployed EMBER to the ApoloSign display using ephemeral Wireless Debugging ports only (NEVER use port 5555 / adb tcpip 5555)"
category: scar
source: scar_apolosign_ember_launcher_deployment_setu.md
updated: 2026-11-02
---

Deployed EMBER to the ApoloSign display as the primary Android Home launcher (`cmd package set-home-activity ventures.brock.ember/.MainActivity`).
**CRITICAL HARDWARE SCAR:** NEVER run `adb tcpip 5555` or use persistent port `5555` on the ApoloSign Rockchip Android 16 tablet—switching `adbd` into persistent TCP 5555 mode crashes the ApoloSign tablet. Always use `/workspace/tools/bin/adb` (Platform-Tools 35+) against the ephemeral Wireless Debugging port only when explicitly needed, and disconnect immediately when done.
