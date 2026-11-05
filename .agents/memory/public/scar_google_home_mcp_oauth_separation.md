---
name: Google Home MCP OAuth Separation
description: "Google OAuth prohibits bundling standard Workspace scopes with Home Platform scopes (`Error 400: inv"
category: scar
source: scar_google_home_mcp_oauth_separation.md
updated: 2026-09-17
---

Google OAuth prohibits bundling standard Workspace scopes with Home Platform scopes (`Error 400: invalid_scope`), requiring isolated token management via a dedicated `google_home_oauth.json` file. The Google Home MCP daemon runs alongside Home Assistant, partitioning responsibilities between fast local device control (HA) and Nest camera cloud clips/history access (Google Home MCP).
