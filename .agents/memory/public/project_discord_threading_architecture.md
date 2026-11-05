---
name: project_discord_threading_architecture
description: "Discord Native Threading, Parallel Task Execution, 60s Dynamic Escalation, and Semantic Titling for Zero"
metadata:
  type: project_architecture
  created: 2026-08-30
  status: deployed_and_running
---

# 🧵 Discord Native Threading & Parallel Task Architecture

### 1. Scope & Isolation
- **Active Scope:** Strictly scoped to `#zero-chat` (`1542081375287640084`) and threads spawned from it.
- **Crab Cavern Policy:** Threading is strictly **disabled** in Crab Cavern (`#the-banana-stand`, `#lounge`). Crab Cavern runs single-message turns with Banana mutex claims.

---

### 2. Thread Spawning Decision Matrix
Default behavior: **All standard turns remain inline in `#zero-chat` (99%+ of turns).**

A dedicated Discord Thread is spawned ONLY under explicit triggers:
1. **Explicit Commands & Prefixes:** `/goal`, `/plan`, `/deep-research`, `/new`, or prefixing with `thread:` / `parallel:`.
2. **Multi-Subagent Fan-Out:** Spinning up 2+ subagents concurrently for deep tasks.
*(Note: Dynamic time-based escalation has been disabled in favor of Parallel Channel Workers, keeping `#zero-chat` turns unified and inline without sidebar fragmentation).*

---

### 3. Semantic Thread Titling Engine (`generate_concise_thread_title`)
- Extracts true task intent and domain concepts rather than slicing raw conversational openers (e.g. filters out `"ok so heres a new..."`).
- Synthesizes clean 2–3 word semantic slugs (e.g. `🧵 Thread Stream Debug`, `🧵 Music Playlist Discovery`, `🧵 Homelab Storage Audit`, `🧵 Reboot Engine Setup`).

---

### 4. Lifecycle & Retention Policy
- **Discord Sidebar:** 24-hour native auto-archive (`auto_archive_duration=1440`).
- **Storage Pruning:** `sessions.json` and scratch files >14 days old are pruned during the weekly **Memory Doctor** pass.
- **Permanent Knowledge:** Curated memory in `/workspace/memory/` is preserved forever.
