---
name: feedback_oauth_canary_quality_miss
description: Ryan was unimpressed with auth-canary work (2026-07-05) — execution lapse plus noisy/undertested alerting
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c7ea3e21-c206-4477-9d2c-881e74a5778e
  modified: 2026-08-10T04:57:48.833Z
---

Ryan explicitly said "I am not impressed by your work on this" regarding the auth-canary incident response (2026-07-05). Three compounding issues, not one:

1. Dropped a Discord reply mid-thread by writing it as terminal text instead of calling the reply tool (see [[feedback_discord_replies]]) — a basic execution failure, not bad luck.
2. Framed a monitoring/detection script (the canary) as if it were closer to a fix than it was — the actual OAuth refresh race is an upstream Claude Code bug I can't patch; the canary only adds visibility.
3. Didn't anticipate that alerting on every expiry detection (including blips that self-heal in minutes) would read as noisy/inaccurate — should have tested or reasoned through the "fires on first detection vs. persists across checks" distinction *before* shipping, not after Ryan flagged it.

**Why:** Ryan's bar isn't just "did you find a plausible root cause" — it's "does the delivered artifact actually behave well and get communicated reliably." Two solid pieces of investigation (root cause research, canary build) were undercut by sloppy execution on delivery and insufficient anticipation of edge-case behavior.

**How to apply:** Before shipping a monitoring/alerting change, think through its false-positive modes and decide the alert threshold deliberately (e.g., require persistence across N checks) rather than shipping the naive first-detection version and iterating after a complaint. When something is genuinely just a detection/mitigation (not a fix), say so plainly up front rather than letting the framing imply more than was delivered. Double-check every Discord-triggered turn actually produced a tool-based reply — see [[feedback_discord_replies]].

**Second real flaw found 2026-08-09, Ryan caught it again: the canary checks the wrong field.** It reads `accessToken`'s `expiresAt` from the credentials file — but the access token is *designed* to cycle through expired states every few hours as normal operation (see [[reference_claude_oauth_token_refresh]]), self-healing the moment anything makes a live API call. During any quiet stretch with no active API traffic (idle evening, no scheduled job due), the access token just sits expired — indistinguishable, from the canary's perspective, from the real unrecoverable failure mode (dead refresh token, the actual Jun29-Jul4 5-day incident). Despite the persistence-across-2-checks debounce already added after the first quality miss above, the canary still fired a false "this isn't a self-healing blip... run /login ASAP" alert on 2026-08-09 for what was, in fact, a self-healing blip — just one long enough (~30-60 min of inactivity) to clear the debounce threshold. **The debounce filters short blips but can't distinguish "genuinely stuck" from "just idle long enough."** The correct field to check is `refreshTokenExpiresAt` — a separate, much-longer-lived field that only goes bad in the actual unrecoverable case, unaffected by routine access-token cycling. **FIXED 2026-08-09 ~21:57 PT.** Ryan approved; `~/bin/ivy-auth-canary.sh` now checks `refreshTokenExpiresAt` instead of `expiresAt`, alert message updated to say "refresh token" specifically. Test-ran clean (no false alert, refresh token valid until 2026-09-07). Deliberately kept the 2-consecutive-check debounce even though it's less necessary for this field (refresh-token expiry doesn't have the access-token's self-healing-blip behavior) — flagged as a conscious choice to Ryan rather than silently decided, cheap insurance against a corrupt/mid-write file read, worst case adds ~30 min alert delay on a genuine outage.

**Broader lesson: for any "is this actually a persistent problem" monitor, check the field/signal that can ONLY indicate genuine failure, not one that cycles through failure-looking states as part of normal operation.** A debounce/persistence window is a band-aid over checking the wrong signal, not a substitute for checking the right one — it just widens the false-positive window instead of eliminating it.
