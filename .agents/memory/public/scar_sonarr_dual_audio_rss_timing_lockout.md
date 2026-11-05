---
name: Sonarr Dual-Audio RSS Timing Lockout
description: "Sonarr grabbed a single-track Japanese release (Erai-raws) over an RSS timing race and locked out th"
category: scar
source: scar_sonarr_dual_audio_rss_timing_lockout.md
updated: 2026-10-27
---

Sonarr grabbed a single-track Japanese release (Erai-raws) over an RSS timing race and locked out the subsequent dual-audio release due to unweighted release profiles. Resolved by prioritizing Dual/Multi-Audio via Custom Format scores and raising the format score cutoff to allow automatic upgrades.
