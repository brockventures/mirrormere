---
name: Bridge Sampler Glitch and Phantom Task Guard
description: "Fixed multi-line sampler glitches bypassing single-token filters and resolved false background-task "
category: scar
source: scar_bridge_sampler_glitch_and_phantom_task_g.md
updated: 2026-10-21
---

Fixed multi-line sampler glitches bypassing single-token filters and resolved false background-task stalls in `task_settle.py` by requiring line-start anchoring and valid on-disk task log prefixes. Mirrored patches to Ivy's daemon and restarted `discord-ivy-agent` after an unprompted task pivot.
