---
name: MCP registration — use `claude mcp add`, not settings.json
description: MCPs only defined in settings.json don't load; the authoritative config for Claude Code sessions is ~/.claude.json
type: reference
originSessionId: 469be376-53b6-4ad2-afdb-04e517739c9b
---
MCP servers must be registered with `claude mcp add --scope user <name> <command>` (or equivalent). This writes to `~/.claude.json`, which is what Claude Code actually reads at session start.

**Why:** discovered 2026-04-25/26 when SerpAPI and Google Workspace MCPs were absent from sessions despite being in `~/.claude/settings.json`. `settings.json` is read for hooks, permissions, and env vars — but NOT for MCP server config.

**How to apply:**
- If an MCP tool is "missing" from a session, check `~/.claude.json` first, not settings.json
- To add a new MCP: `claude mcp add --scope user <name> -- <command> [args...]` (use `--` to pass args)
- For env vars to the MCP, use `-e KEY=val` flags on `claude mcp add`
- After adding/changing MCP config, the running session must restart to pick up the new server
