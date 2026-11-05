---
name: Google Cast Sleep Sounds turn_off vs media_stop
description: "Google Nest/Home Minis throw 'Sorry, I didn't understand' when receiving media_stop on native ambient sound streams; use media_player.turn_off"
category: scar
source: scar_google_cast_sleep_sounds_turn_off_vs_media_stop.md
updated: 2026-10-09
---

### Problem
Calling `media_player.media_stop` from Home Assistant against Google Nest/Home Minis running native sleep sounds (`Relaxing Sounds Dogfood`) causes the speaker to speak aloud: *"Sorry, I didn't understand."*

### Root Cause
`media_player.media_stop` targets the media controller layer (`{"type": "STOP"}`), which Google's internal ambient sound receiver fails to handle gracefully, treating the unexpected session halt as an unhandled voice intent.

### Fix
Use `media_player.turn_off` instead. This calls `pychromecast.quit_app()` on the Cast connection manager, terminating the app session cleanly at the platform level without triggering an Assistant intent error. Applied to `automation.sunrise` (Wakeup 2) and `automation.wakeup_1`.
