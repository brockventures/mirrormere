---
name: Ember Android Kiosk Tablet App
description: "Replaced unstable Fully Kiosk Browser on the ApoloSign Android 16 tablet with native EMBER launcher (NEVER use port 5555)"
category: scar
source: scar_ember_android_kiosk_tablet_app.md
updated: 2026-11-02
---

Replaced unstable Fully Kiosk Browser on the ApoloSign Android 16 tablet after its enterprise MDM/roaming hooks repeatedly crashed the Rockchip Wi-Fi driver. Created the private `brockventures/ember` repository to build a dedicated lightweight Android wrapper for Brock Hearth with native front-camera motion wake, night sleep, and in-app OTA APK updates (`allow-mixed-content` / `ota-enabled`). **NEVER** enable persistent `adb tcpip 5555` on the ApoloSign tablet as it crashes the device; use over-the-air updates or ephemeral Wireless Debugging ports with `/workspace/tools/bin/adb` only.
