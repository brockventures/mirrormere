---
name: Ivy Quota Fix via G1 Credits
description: "When Ivy encounters an individual Antigravity quota block, enable credit fallback by injecting `"use"
category: scar
source: scar_ivy_quota_fix_via_g1_credits.md
updated: 2026-10-06
---

When Ivy encounters an individual Antigravity quota block, enable credit fallback by injecting `"useG1Credits": true` into both `/opt/docker/discord-ivy-agent/gemini/antigravity-cli/settings.json` and `/opt/docker/discord-ivy-agent/gemini/settings.json` on Host 2. Re-arming `pending_rollover.flag` ensures her immediate next turn spins up in a fresh session with the updated configuration.
