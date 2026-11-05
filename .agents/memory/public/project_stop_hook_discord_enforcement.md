---
name: project-stop-hook-discord-enforcement
description: "Stop hook now enforces that Discord messages get an actual reply tool call, not just plain text"
metadata: 
  node_type: memory
  type: project
  originSessionId: ed0e1062-c5c3-43dd-8de8-6fe1becb0194
---

Added 2026-07-05: `~/.ivy/stop.sh` (the Stop hook, fires every time a turn ends) now runs
`~/.ivy/check_discord_reply.py` against the session transcript. It checks whether the last
Discord-tagged incoming message (`<channel source="plugin:discord:discord" ...>` — note the
literal attribute value is `plugin:discord:discord`, not just `discord`) was followed by an
actual `mcp__plugin_discord_discord__*` tool call (reply/edit_message/react).

- If not: hook returns `{"decision":"block","reason":"..."}`, which forces the turn to continue
  instead of stopping — self-correcting, not just logged.
- If it fires twice in a row (`stop_hook_active` true — safety valve against infinite loop): gives
  up blocking and instead posts a direct Discord alert via the bot REST API so Ryan is notified
  even in that edge case.
- Empty/system-event messages (pins etc.) are skipped — matches the existing "ignore empty Discord
  messages" rule, doesn't force spurious replies to those.
- Skipped entirely for scheduled jobs (`IVY_SESSION_TYPE=scheduled`) and for sessions with no
  Discord involvement at all.

**Why:** Ryan reported (2026-07-05) that at least one reply was silently dropped — generated as
plain assistant text instead of a tool call, so it never reached Discord. Root cause was confirmed
to be the model occasionally skipping the reply tool, not a plugin delivery problem (verified the
plugin reliably delivers anything that does go through the tool). Soft instructions in CLAUDE.md
("always use the reply tool") had already been in place and didn't prevent the recurrence, so
enforcement was moved into a code-checked hook instead of relying on memory/instructions alone.
See also [[feedback_oauth_canary_quality_miss]] (Ryan's dissatisfaction that triggered this fix)
and [[feedback_discord_replies]] / [[feedback_first_reply_rule]] (the soft rules this hook now
backstops).

**How to apply:** If Ryan reports another dropped/missing reply, check whether this hook actually
fired (look for the block reason in the transcript, or the fallback alert in the channel) before
assuming it's a new failure mode — the hook only catches "zero Discord tool calls after the last
message," not other partial-failure shapes (e.g., wrong content, a tool_use that errored).
