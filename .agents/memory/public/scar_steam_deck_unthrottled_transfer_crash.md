---
name: Steam Deck Unthrottled Transfer Crash
description: "Large unthrottled SSH/rsync file transfers to the Steam Deck cause the device/flash controller to ha"
category: scar
source: scar_steam_deck_unthrottled_transfer_crash.md
updated: 2026-09-04
---

Large unthrottled SSH/rsync file transfers to the Steam Deck cause the device/flash controller to hard-lock, requiring a physical hard power cycle rather than a clean auto-reboot. Furthermore, dropped SSH connections leave orphaned rsync processes on NasHost-01 and hang Discord bridge responses in TCP socket purgatory unless explicitly killed and cleaned up. Future transfers to the Deck must throttle bandwidth and handle disconnect timeouts defensively.
