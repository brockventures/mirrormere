---
name: project_pretooluse_hooks
description: "PreToolUse hooks re-enabled Jun 14 with Docker/systemd enforcement rules — narrowly targeted, no Discord noise"
metadata: 
  node_type: memory
  type: project
  originSessionId: c46efb0e-5e6c-4f3e-824d-b221147fec97
---

PreToolUse hooks re-enabled in `~/.claude/settings.json` on Jun 14 after being disabled Apr 25 (reason: Discord in-progress status messages were noisy). The new version strips out all status messaging and only hard-blocks specific dangerous patterns.

**Script:** `~/.ivy/pretooluse.sh`

**Rules enforced:**
1. Block bare `docker stop/start/restart` (not via compose) — prevents Container Manager desync (incident 2026-06-03/04)
2. Block `systemctl stop/kill ContainerManager` or Docker daemon — stops ALL NAS containers
3. Block system-level `systemctl enable/disable/stop/start/restart` without `--user` flag — requires explicit Ryan approval; exempts `pkg-ContainerManager-event-watcherd`

**Also retained from previous version:**
- Block `mcp__claude_ai_Google_Calendar__delete_event` (irreversible)
- Block `mcp__claude_ai_Google_Calendar__respond_to_event` (sends external RSVP)

**Why:** Reddit post framing — CLAUDE.md rules are advice; hooks are laws. Hooks fire regardless of context length or what was read.

**Background agents default to Opus 4.8:** Also updated CLAUDE.md on Jun 14 — all Route 2/3/4 agent spawns should pass `model: "opus"`.

**UserPromptSubmit hook (2026-06-15):** Added a `UserPromptSubmit` hook that injects the current VM time (PT) as `[System] Current VM time (PT): <date output>` on every prompt. This prevents UTC→PT mental arithmetic errors. Hook is in `~/.claude/settings.json` under `UserPromptSubmit`. The VM is set to `America/Los_Angeles` so `date` returns PT directly.
