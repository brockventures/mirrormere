---
name: feedback_check_self_clearing_state
description: "Before declaring a monitor/canary \"never fired,\" check whether it self-clears its own evidence on recovery"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 038a977f-59de-4cbd-9e4a-9e3f38b368fd
  modified: 2026-08-10T10:06:45.079Z
---

Investigating the 2026-08-03 OAuth outage, I checked `~/.ivy/auth_canary_first_seen`/`auth_canary_alerted` marker files, found neither existed, and reported to Ryan that the auth-canary had never detected the problem. Wrong — Ryan had a screenshot showing it alerted twice (10:30 AM, 3:00 PM). The canary's own `clear_state()` deletes both marker files once the token becomes valid again, which happened right after Ryan's `/login` fixed things — so by the time I checked, the canary had correctly wiped its own evidence of having worked.

**Why:** absence of a marker/log file is not proof a check never ran or never alerted if the script is designed to self-clear on recovery — read the script's cleanup logic before treating current-state absence as historical absence.

**How to apply:** before concluding any monitor/alert "never fired" or "missed it," (1) read the script for self-clearing/rotation behavior, (2) check the actual notification channel (Discord history, email, etc.) for the alert itself rather than just the detector's local state file. See [[project_oauth_outage_2026-08-03]] for the incident this came from.

**Recurred 2026-08-09 ~6:32 PM PT, different wrong signal.** Ryan asked "Is the token auth actually offline" and I checked `journalctl --user -u ivy-auth-canary.service`, saw every run logged "Finished" cleanly, and told him auth was fine with no alerts posted. Wrong — the canary (`~/bin/ivy-auth-canary.sh`) always exits 0 whether or not it posts a Discord alert; posting the alert IS the script's successful, intended behavior on a dead token, not a failure that would show in systemd's exit status. A real 🔴 alert had fired at 4:00 PM PT that same afternoon (confirmed token expired 37 min on 2 consecutive checks) — invisible to a journal/exit-code check, only visible in the actual Discord message history, which is what caught it when I finally checked `fetch_messages` after Ryan pushed back a second time. **Generalized lesson: "the service ran without crashing" and "the service found nothing wrong" are different claims — a monitor's own success path is often exactly the alert-sending itself, so a clean process exit says nothing about outcome.** Always check the actual notification channel first for any "is X actually a problem" question about a monitor/canary — journal/exit-status is not a substitute and can actively mislead.

**Underlying canary bug fixed 2026-08-10 ~04:57 PT.** The 08-09 recurrence above surfaced a second, separate bug: the canary was checking `expiresAt` (the short-lived access token, which cycles every few hours and looks "expired" constantly even when [[reference_claude_oauth_token_refresh]]'s self-heal is working fine) instead of `refreshTokenExpiresAt` (the real hard-failure signal). Ryan called this out directly ("your canary is checking the wrong thing"). Fixed in `~/bin/ivy-auth-canary.sh` — now reads `refreshTokenExpiresAt`; confirmed live via the deployed script. Kept the existing debounce (2 consecutive bad checks before alerting) as a deliberate choice rather than silently changing it.
