---
name: project_zero_reboot_briefing_engine
description: "Zero Intelligent Reboot Briefing & Startup Recovery Engine on AppHost-02 (.84)"
category: engineering
source: project_zero_reboot_briefing_engine.md
updated: 2026-09-04
---

# 🔄 Zero Intelligent Reboot Briefing & Startup Recovery Engine

### 1. Overview
Replaces the static hardcoded startup ping (`🟢 Zero is online and ready.`) with an **autonomous, agentic startup briefing turn** whenever Zero restarts or recovers on AppHost-02 (`.84`).

### 2. Architecture & Lifecycle
1. **Pre-Restart Intent Tracking (`restart_intent.json`):**
   - Automatically records the specific reason for reboot (e.g. feature deployment, manual `!reload`, container config change).
2. **In-Flight Turn Interruption Recovery (`in_flight_turn.json`):**
   - If the system restarted while a turn was actively executing, captures the interrupted prompt.
3. **Autonomous Startup Briefing (`on_ready`):**
   - On boot, Zero triggers an internal startup turn in `#zero-chat`:
     - Explains *why* the reboot occurred (planned deploy vs. unexpected crash/recovery).
     - Summarizes what capabilities were upgraded or what tasks were recovered.
     - Proactively proposes 2–3 immediate, contextual next steps.
     - Renders interactive Discord choice buttons (`[CHOICES: ...]`).
