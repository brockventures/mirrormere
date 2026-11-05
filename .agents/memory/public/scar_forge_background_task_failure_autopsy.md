---
name: Forge Background Task Failure Autopsy
description: "Background task failure alerts stemmed from ad-hoc `forge.py job start` runs rather than scheduled s"
category: scar
source: scar_forge_background_task_failure_autopsy.md
updated: 2026-10-26
---

Background task failure alerts stemmed from ad-hoc `forge.py job start` runs rather than scheduled sidecars. Root causes included diagnostic scratch probe banners leaking upon exceeding the 90-second lease, along with Ivy backtest schema/pickle mismatches and local CPU timeouts on Host 2.
