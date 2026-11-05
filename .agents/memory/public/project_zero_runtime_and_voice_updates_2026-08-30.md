# Zero Runtime Safeguards, Steering & Voice Calibration (2026-08-30)

*Covers core operational refinements, bridge concurrency protections, and voice signature adjustments completed on 2026-08-30.*

---

## 1. Voice Signature Calibration (No Baseball)
Following synthesis of Ryan's media profile (Plex played history, Pocket Casts canon), Zero's persona in `/workspace/agents.md` was calibrated with four distinct traits:
- **Arrested Development Deadpan:** Understated dramatic irony when surfacing silent bugs, brittle workarounds, or human hubris. Dry factual callbacks carry comedic weight without forced jokes.
- **Forensic Failure Analysis (Chernobyl / The Big Dig):** When triage hits, dissect outages and system entropy with calm causal clarity. Dissect structural failure chains as mechanical inevitabilities without drama.
- **Rules-Lawyering & Deadpan Absurdity (McElroy / TAZ):** When third-party APIs or bizarre vendor tools behave nonsensically, treat the absurdity with dry amusement and bureaucratic precision rather than sterile error dumps.
- **Game-Theory Tradeoffs (*Survivor*):** Frame architectural choices around leverage, variance, risk exposure, and threat-level management.
- **Explicit Exclusion:** **Baseball metaphors and sabermetric framing were dropped entirely** per Ryan's explicit instruction.

Files updated: `/workspace/agents.md`, `/workspace/.agents/agents.md`, `/workspace/AGY.md`.

---

## 2. In-Flight Reload Protection
- **The Rule:** Zero cannot fire a reload (container restart, in-place bridge reload, or reload flag) from either `#zero-chat` or Crab Cavern threads if actively working on a task in one of them. Both queues and active turns must be completely idle.
- **Bridge Implementation (`/app/bridge.py`):**
  - Added `is_bridge_busy() -> list[str]` which verifies `active_proc is None`, `ext_active_proc is None`, `home_turn_queue.empty()`, and `ext_turn_queue.empty()`.
  - Guarded both external channel and home channel `!reload` / `/reload` command handlers. If busy, replies with:
    `⚠️ Cannot reload right now: actively working on a task in [channel]. Wait for the active task to complete first.`
  - Guarded background `reload_bridge.flag` consumer in scheduler loop.
- **Codified In:** `/workspace/agents.md` (Absolute Restrictions & Rule 9), `/workspace/config/runtime_rules.json` (Rule 8).

---

## 3. Mid-Turn Group & Home Steering Pattern
- **Problem:** In group channels (Crab Cavern) and home chat, user updates or steering messages arriving while `agy` is generating output could cause obsolete, contradictory responses or wasted turns.
- **Architecture (`/app/bridge.py`):**
  - Detects incoming messages while `active_proc` / `ext_active_proc` is executing.
  - Sends `SIGINT` to the active PTY process.
  - Injects a `[MID-TURN GROUP CONVERSATION UPDATE]` steer prompt containing the newest message, instructing the agent to absorb context and pivot cleanly.
  - Deployed across both external channels and `#zero-chat`.

---

## 4. UI Formatting & Action Tag Scrubbing
- **Interactive Discord Buttons:** Append `[CHOICES: Option 1 | Option 2]` at the end of turns to dynamically render clickable Discord UI buttons.
- **Synthetic Action Tags Banned:** Emitting `<Action:...>` or internal progress pseudo-tags was banned in `agents.md` (Rule 11).
- **Bridge Regex Scrubber:** Added regex filter to `format_for_discord()` in `/app/bridge.py` to scrub any leaking `<action:[^>]+>` tags before messages reach Discord.
