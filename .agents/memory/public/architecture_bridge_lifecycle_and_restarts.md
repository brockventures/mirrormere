---
name: Bridge Lifecycle, In-Place Reloads, and Container Restarts
description: Definitive operational reference and decision matrix for in-place bridge reloads (os.execv) vs Docker container restarts
category: architecture
updated: 2026-09-04
---

# Bridge Lifecycle: In-Place Reloads vs Container Restarts

Zero operates inside the `discord-antigravity-agent` Docker container on Host 2 (`.84`). To maintain high availability while deploying updates, the operational architecture distinguishes between **three distinct runtime states**:

1. **Live Immediately (No Action Needed)**
2. **In-Place Bridge Reload (`os.execv`)**
3. **Detached Docker Container Restart (`docker restart`)**

---

## 1. Decision Matrix: When to Take Which Action

| Category | Target Files / Scenarios | Action Required | Latency | Operational Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Standalone Scripts** | `tools/sidecars.py`, `tools/arr_queue_watchdog.py`, `tools/classifier.py`, `tools/ha_battery_check.py`, `tools/plex_weekly_digest.py` | **None** (Live immediately) | 0s | Spawns a fresh Python interpreter subprocess on each scheduled or ad-hoc invocation. |
| **JSON Configurations** | `data/schedule.json`, `config/runtime_rules.json` | **None** (Live immediately) | 0s | Read dynamically from disk on each evaluation loop or turn dispatch. |
| **Prompts & Instructions** | `GEMINI.md`, `agents.md`, `/workspace/.agents/skills/*` | **None** (Live immediately) | 0s | Read dynamically by the Antigravity CLI runtime on every invocation. |
| **Bridge Core Modules** | `tools/bridge.py`, `tools/bridge_handlers.py`, `tools/bridge_runner.py`, `tools/bridge_formatting.py`, `tools/bridge_scheduler.py`, `tools/bridge_daemons.py`, `tools/bridge_state.py` | **In-Place Bridge Reload** | < 1s | Replaces PID 1 memory image via `os.execv`. Cycles persistent stream workers (`bridge_daemons.py`). Preserves container cgroup and PID 1. |
| **Binary CLI Updates** | `/usr/local/bin/agy` (via `update_antigravity.py`) | **Container Restart** | ~5-8s | Drops the container cgroup; boots fresh container with new binary mounted or installed. |
| **Container Environment** | `Dockerfile`, `docker-compose.yml`, Python `pip` packages, OS `apt` packages, `/secrets/` mounts | **Container Restart** | ~5-8s | Rebuilds/recreates the container namespace, environment variables, and filesystem mounts. |
| **Zombie / Orphan Cleanup** | Stuck PTY file descriptors, orphaned CLI subprocesses, lingering background workers, kernel socket locks | **Container Restart** | ~5-8s | Incinerates container cgroup; terminates all child processes cleanly and reinitializes fresh PID 1. |

---

## 2. Technical Mechanics & Linux Kernel Nuances

### In-Place Bridge Reload (`os.execv`)
• **Mechanism:** Invokes `os.execv(sys.executable, [sys.executable] + sys.argv)`.
• **Lifecycle Chain:**
  1. Shuts down persistent daemons cleanly (`await daemon_manager.shutdown_all()`).
  2. Terminates active turn subprocesses and closes Discord websocket (`await bot.close()`).
  3. Replaces the current process memory image in-place with a fresh Python interpreter running `/app/bridge.py`.
• **The Linux Kernel `execve` Quirk:**
  In Linux, an `execve` system call **replaces the process image but does NOT allocate a new PID (it remains PID 1)** and **does NOT reset `/proc/<pid>/stat` start time (`starttime`)**.
  - `ps aux` or `ps -ef` will continue to show the container's original boot date/time (e.g. `Sep01`).
  - **Diagnostic Rule:** NEVER treat an old start timestamp in `ps aux` as proof that an in-place reload failed. Check application logs (`[Bridge]`), active handler behavior, or the boot intent flag.

### Detached Docker Container Restart (`docker restart`)
• **Mechanism:** Dispatches a detached SSH command to Host 2's Docker daemon.
• **Lifecycle Chain:**
  1. Docker sends `SIGTERM` to PID 1, waiting 10 seconds before escalating to `SIGKILL`.
  2. The Linux kernel terminates the entire container cgroup, destroying all lingering worker processes, orphaned PTYs, and socket locks.
  3. Docker re-creates the container namespace with a brand-new PID 1 and a fresh kernel start timestamp.

---

## 3. How to Execute Both Actions

### A. How to Execute an In-Place Bridge Reload
1. **Interactive Discord Button:**
   `[CHOICES: Reload Bridge In-Place | Postpone Reload]`
2. **Discord Chat Command:**
   Send `!reload`, `/reload`, `reload bridge in-place`, or `reload bridge` in `#zero-chat`.
3. **Agent Post-Turn Flag:**
   ```bash
   touch /workspace/data/reload_bridge.flag
   ```
   The active channel worker detects this flag immediately upon finishing the current turn and triggers `execute_bridge_reload()`.

### B. How to Execute a Docker Container Restart
1. **Interactive Discord Button:**
   `[CHOICES: Restart Docker Container | Postpone Restart]`
2. **Agent / SSH Command (Detached):**
   ```bash
   python3 -c "from tools.bridge_state import record_restart_intent; record_restart_intent('Reason for container restart', initiator='Ryan')"
   ssh -i /secrets/id_ed25519 -p $NAS_SSH_PORT -o StrictHostKeyChecking=no -o BatchMode=yes $NAS_USER@$NAS_HOST_2_IP "nohup sh -c 'sleep 3 && docker restart discord-antigravity-agent' >/dev/null 2>&1 &"
   ```
   *Note: Always bound the command with `nohup` and a 3-second sleep so the active turn returns cleanly before Docker kills the container.*

---

## 4. Surfacing Protocol: How Zero Communicates Actions to Ryan

Whenever modifying code, configuration, or runtime environments, Zero **MUST** conclude the turn with an explicit **Lifecycle Advisory** adhering to these standards:

### Rule 1: Eliminate Ambiguous Button Labels
• **NEVER** output `Restart Container Now` if the underlying action is only an in-place reload.
• If only Python bridge modules were modified, surface:
  `[CHOICES: Reload Bridge In-Place | Postpone Reload]`
• If binaries, system packages, or cgroup cleanup are required, surface:
  `[CHOICES: Restart Docker Container | Postpone Restart]`
• If both options are viable or offering a choice during triage:
  `[CHOICES: Reload Bridge In-Place | Restart Docker Container | Postpone]`

### Rule 2: Mandatory 3-Tier Impact Assessment
Every advisory must explicitly declare:
1. **Impact State:**
   - 🟢 *Live Immediately:* Standalone scripts, `schedule.json`, dynamic runtime rules, memory/prompt docs.
   - 🟡 *In-Place Reload Needed:* Python bridge modules (`tools/bridge_*.py`) cached in PID 1 memory.
   - 🔴 *Container Restart Needed:* Dockerfile, packages, binary updates (`agy`), or zombie process purging.
2. **Queue Safety Check:**
   Confirm `#zero-chat` and Crab Cavern queues are completely idle.
3. **Actionable Proposal:**
   Clear command and properly labeled interactive choice buttons.

### Rule 3: Anti-Overcompliance & Deduplication Invariant
• **Prior Turn Action Deduplication:** If a reload was already initiated, approved, or executed in the current or immediately preceding turn/session (e.g. Ryan clicked `Reload Bridge In-Place`, ran `!reload`, or Zero verified successful reload execution), DO NOT re-prompt with an advisory or choice buttons unless *new, un-reloaded functional code* was authored in the current turn.
• **Status & Verification Turn Exemption:** When Ryan asks a follow-up or status query (e.g. "Did the refactor work?", "Is it running?", "Did that reload?"), report status and telemetry directly. NEVER re-append a lifecycle advisory block or reload choice buttons to verification answers.
• **Autonomous Flag Arming Exemption:** If Zero arms an autonomous in-place reload via `touch /workspace/data/reload_bridge.flag` (which automatically reloads upon turn delivery), NEVER render interactive choice buttons (`[CHOICES: Reload Bridge In-Place | ...]`). State clearly that the reload is armed to trigger post-turn automatically. Interactive buttons are strictly for awaiting human confirmation *prior* to action.
• **Passive Mirroring & Identical Sync Exemption:** Mirroring, copying, or synchronizing identical files across paths (e.g. `cp /workspace/tools/bridge.py /app/bridge.py`) during verification, deployment, or housekeeping does NOT constitute authoring new code. If there is no functional delta requiring a fresh reload, suppress the advisory entirely.
• **Mechanical Delivery Suppression:** In `tools/bridge_pipeline.py`, `deliver_turn_output` automatically scrubs any reload choice buttons if `/workspace/data/reload_bridge.flag` is present on disk, ensuring redundant buttons are never delivered while an autonomous reload is armed.
