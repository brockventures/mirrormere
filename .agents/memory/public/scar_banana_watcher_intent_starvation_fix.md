---
name: Banana Watcher Intent Starvation Fix
description: "The Banana Watcher daemon failed silently due to privileged intent starvation on its dedicated token"
category: scar
source: scar_banana_watcher_intent_starvation_fix.md
updated: 2026-09-06
---

The Banana Watcher daemon failed silently due to privileged intent starvation on its dedicated token, leaving it functionally blind to message content. The fix decouples tokens by using `DISCORD_BOT_TOKEN` for full message history hydration while retaining `BANANA_WATCHER_TOKEN` strictly for egress posting.
