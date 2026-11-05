---
name: VLC Android TV Cast Teardown Race
description: "When streaming to the Google TV Streamer via Home Assistant, VLC's native session (`AndroidNativeApp"
category: scar
source: scar_vlc_android_tv_cast_teardown_race.md
updated: 2026-10-29
---

When streaming to the Google TV Streamer via Home Assistant, VLC's native session (`AndroidNativeApp`) was mistakenly caught by generic Cast receiver cleanup routines sending a `turn_off` signal before launch, kicking the device back to the home screen. Native VLC media sessions must be explicitly excluded from pre-cast teardown signals when relaunching rotated streams.
