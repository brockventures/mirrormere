---
name: project_ivy_counterpart
description: "Ivy is the Assistant GM & Director of Baseball Operations in #baseball on Host 2 via Antigravity"
metadata:
  type: reference
  updated: 2026-09-15
  source: "Updated to reflect true runtime architecture on Host 2."
---

**Ivy** is the Assistant General Manager and Director of Baseball Operations.

- **Host & Runtime**: Runs in `discord-ivy-agent` on **Host 2** (DS1525+) powered by Google Antigravity (`agy`).
- **Channel War Room**: Dedicated to **`<#1548196929308065893>`** (`#baseball`).
- **Configuration & Prompts**: Governed by `/docker/discord-ivy-agent/agents.md` (mounted to `/workspace/agents.md`, `/workspace/AGY.md`, and `/workspace/GEMINI.md`).
- **Bridge Architecture**: `/docker/discord-ivy-agent/bridge.py` connects Ivy to Discord and drives the `agy` CLI process group.
- **Baseball Infrastructure**: Directly integrated with `/docker/baseball` (`/baseball`), `baseball_db` (PostgreSQL 15), containerized scrapers (`baseball-scraper-1`), and R Shiny apps (Big Board Pro on port 3840).
- **Separation from Zero**: Zero (`discord-antigravity-agent` in `/docker/discord-agy-agent`) and Ivy are separate containers on Host 2 with independent brain directories, bridges, and identities.

