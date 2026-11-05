---
name: Recovering Legacy Gemini API Key
description: "During the August 29 migration from legacy Discord agent to Antigravity, `GEMINI_API_KEY` was omitte"
category: scar
source: scar_recovering_legacy_gemini_api_key.md
updated: 2026-09-08
---

During the August 29 migration from legacy Discord agent to Antigravity, `GEMINI_API_KEY` was omitted from `.env` due to Antigravity using OAuth tokens. The direct Gemini API key was recovered from the archived legacy deployment directory at `/opt/docker/discord-agent-legacy-` to restore direct API plane parity.
