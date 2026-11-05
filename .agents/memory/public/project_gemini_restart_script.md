---
name: project_gemini_restart_script
description: "Ivy-Gemini standalone restart script on AppHost-02 with Discord health notifications"
category: engineering
source: project_gemini_restart_script.md
updated: 2026-09-04
---

# Ivy-Gemini Container Restart Script & Notification System

## Overview
Implemented 2026-08-23 to allow safe scripted rebuild/restart of the `discord-agent` container on AppHost-02 (10.0.0.x) without running bare Docker commands or risking deadlocks.

## Scripts & Mechanics
- Host location: `/opt/docker/discord-agent/restart-agent.sh` (with `/opt/docker/discord-agent/restart.sh` wrapper).
- **Execution Flow**:
  1. Writes marker file to host `/opt/docker/discord-agent/memory/.restart_info.json` (mounted inside container at `/app/memory/`).
  2. Runs `docker compose build` (unless rebuild is explicitly disabled).
  3. Runs `docker compose up -d`.
  4. Polls `docker inspect` for container status for up to 60s.
  5. If build/up fails or container crashes, fires alert directly via Discord REST API curl.
  6. When container starts successfully, `bot.py`'s `on_ready()` reads `.restart_info.json`, posts `✅ **Ivy-Gemini is back online** (rebuilt) (<elapsed>s · <reason>)`, and deletes the marker file.
