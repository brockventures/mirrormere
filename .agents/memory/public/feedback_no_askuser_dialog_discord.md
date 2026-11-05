---
name: feedback-no-askuser-dialog-discord
description: "Never use the AskUserQuestion dialog tool when the user is on Discord — it doesn't render there"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 988fbf8e-a343-4839-9159-62bed31fa5aa
  modified: 2026-08-02T21:15:44.823Z
---

Don't use the AskUserQuestion tool (interactive dialog/question UI) for Discord conversations. It does not render in Discord — Ryan sees nothing, and it reads as Ivy going silent/unresponsive. Confirmed 2026-08-02: sent a clarifying question via AskUserQuestion during a network-settings task, got no visible response, and Ryan started asking "give a status update" / "you have not been sending updates to discord" because the question never appeared on his end.

**Why:** AskUserQuestion is a host-UI feature (terminal/IDE), not a Discord message — it has no Discord rendering path.

**How to apply:** Any time the active channel is Discord (chat_id present, replying via the Discord reply tool), ask clarifying questions as plain text through `mcp__plugin_discord_discord__reply` instead of AskUserQuestion. Reserve AskUserQuestion for non-Discord (terminal/interactive) sessions only. See [[feedback_discord_replies]] and [[feedback_first_reply_rule]] for related Discord communication rules.
