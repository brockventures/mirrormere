---
name: CLI Wakeup Banner Egress Leak
description: "Antigravity CLI 2.0 internal background-task wakeup banners leaked into user responses when tasks co"
category: scar
source: scar_cli_wakeup_banner_egress_leak.md
updated: 2026-10-14
---

Antigravity CLI 2.0 internal background-task wakeup banners leaked into user responses when tasks completed during execution. Resolved by adding block-level and line-level regex filtering for CLI wakeup chatter inside `tools/bridge_safety.py` (`strip_internal_cli_chatter`).
