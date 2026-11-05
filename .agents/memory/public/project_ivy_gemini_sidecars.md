---
name: project_ivy_gemini_sidecars
description: "Refined scheduled sidecars architecture with hybrid deterministic probes + LLM synthesis and no-regex log review"
category: engineering
source: project_ivy_gemini_sidecars.md
updated: 2026-09-04
---

---
name: project_ivy_gemini_sidecars
description: "Refined scheduled sidecars architecture with hybrid deterministic probes + LLM synthesis and no-regex log review"
metadata:
  type: project
  updated: 2026-08-24
---

# Ivy-Gemini Scheduled Sidecars Architecture

Refined and deployed 2026-08-23 on AppHost-02 (.84).

## Sidecar Specifications

1. **Heartbeat Sweep (`run_heartbeat_sweep`, every 15m)**
   - **Mode:** Deterministic probes (Docker on .82 & .84, TCP ports 8123/32400/3866, HA API ping, OTBR thread health, Baseball pipeline freshness).
   - **On Failure:** Triggers `gemini-3.7-flash` to pull logs, cross-reference memory, diagnose root cause/blast radius, and propose remediation. Silent when healthy.

2. **Daily Summary (`run_daily_summary`, daily at 22:00 PT)**
   - **Mode:** Telemetry collection + `gemini-3.7-flash` synthesis.
   - Summarizes container health across both NAS boxes, baseball refresh status, and active P1/P2 priorities into a clean standup.

3. **P1 Reminder (`run_p1_reminder`, daily at 21:00 PT)**
   - **Status:** Disabled 2026-08-24 (`P1_REMINDER_ENABLED=0`) — subsumed by the 22:00 PT Daily Summary to eliminate redundant notifications 1 hour apart.

4. **NAS Log Review (`run_nas_log_review`, nightly at 23:30 PT)**
   - **Mode:** Candidate error log pull + `gemini-3.7-flash` reasoning.
   - **No regex stripping of known noise:** Raw error lines are fed to Gemini alongside `known_noise.md` context. Gemini evaluates frequency, rate, and correlation to discern benign noise vs real issues.

5. **Nightly Email & Calendar Triage (`run_nightly_email_triage`, daily at 22:00 PT)**
   - **Mode:** Full semantic Gemini LLM reasoning (no regex pre-filters). Categorizes unread emails, summarizes newsletters, checks week-ahead calendar, and proposes additions.

6. **Memory Doctor (`memory_doctor_job`, weekly Sun 03:00 PT)**
   - **Mode:** Semantic audit of memory index & markdown files. Scheduled strictly at 03:00 PT on Sundays (no startup executions).

7. **Daily Birthday Reminder (`daily_birthday_reminder`, daily at 07:00 PT)**
   - **Mode:** Scans `friends_and_family_master.csv` for birthdays matching current date. Silent when no birthdays.
   - **Interactive Action:** If a birthday is found, sends Discord alert with pre-populated interactive button `[CHOICES: Text <Name> "Happy birthday!" | Remind Me Later]` to enable 1-click texting with human-in-the-loop approval.

8. **Weekly Social & Last Seen Review (`weekly_social_last_seen_review`, weekly Sun 20:30 PT)**
   - **Mode:** Scans the past 7 days of Google Calendar events and communications/invitations for social gatherings, cookouts, home visits, and outings with friends and family.
   - **Interactive Confirmation:** Silent if no events found. When events are identified, presents proposed `Last Seen` updates and waits for interactive confirmation (`[CHOICES: Confirm & Apply Last Seen Updates | Ignore Last Seen Updates]`) before editing `friends_and_family_master.csv` or syncing to Google Sheets.
