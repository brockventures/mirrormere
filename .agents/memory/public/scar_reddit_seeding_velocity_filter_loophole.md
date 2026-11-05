---
name: Reddit Seeding Velocity Filter Loophole
description: "A loophole in Reddit term seeding allowed auto-moderated low-quality posts to trigger alerts because"
category: scar
source: scar_reddit_seeding_velocity_filter_loophole.md
updated: 2026-10-27
---

A loophole in Reddit term seeding allowed auto-moderated low-quality posts to trigger alerts because the dead-thread gate only evaluated posts older than 45 minutes, letting brand-new posts slip through. Filtering criteria must guard against newly submitted, zero-engagement posts without relying on a blind grace period.
