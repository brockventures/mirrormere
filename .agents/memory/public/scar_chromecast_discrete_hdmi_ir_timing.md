---
name: Chromecast Discrete HDMI IR Timing
description: "Fixed Home Assistant Chromecast HDMI switching race condition by splitting execution into TV power states and waiting for TV wake before blasting IR"
category: scar
source: scar_chromecast_discrete_hdmi_ir_timing.md
updated: 2026-09-30
---

Fixed Home Assistant Chromecast HDMI switching race condition (`automation.chromecast_change_source`). The Samsung S95B takes ~5-6s to boot from standby and initialize its Tizen OS/HDMI switcher. Waking from cold standby now fires IR Power + WoL, uses `wait_for_trigger` on `media_player.samsung_s95ba_65_tv_qn65s95bafxza` transitioning to `on` (10s timeout), applies a 1s Tizen settle buffer, and sends an idempotent follow-up blast. Dual triggers (`media_player.living_room_tv_2` and `media_player.samsung_s95ba_65_tv_qn65s95bafxza` to `on`) ensure source switches whether turning on the Google TV Streamer or the TV panel directly. If the TV is already running, discrete HDMI IR fires immediately.
