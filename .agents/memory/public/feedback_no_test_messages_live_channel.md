---
name: feedback-no-test-messages-live-channel
description: Never send throwaway test/debug messages to the live Discord channel while debugging posting issues (e.g. curl escaping errors) — self-caught violations 2026-07-19, 2026-08-04, and 2026-08-10
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 26384022-70c4-441e-aca6-43cf5a4f25ff
  modified: 2026-08-11T04:39:35.306Z
---

Rule already exists in `~/projects/NIGHTLY_EMAIL.md`: never send a bare "test" or placeholder message to the live Discord channel to verify a token or debug a posting error — fix the escaping/bug and retry with the real content instead. The channel is live and Ryan sees everything posted.

**Why:** during the 2026-07-19 nightly review, while debugging a curl escaping error mid-task, a bare `"test-length-check"` message was sent to the live channel to check length-handling — a direct violation of the explicit rule. Self-caught and flagged in the same turn, but the message still posted.

**How to apply:** when debugging a Discord post that's failing (curl errors, JSON escaping, length limits), write the diagnostic to a local file or run the check in a script/dry-run — never post a placeholder to the live channel to verify behavior. This applies beyond nightly email to any Discord-posting code path (car_monitor, NAS log review, etc).

**Second occurrence, 2026-08-04 (nightly review):** while debugging a curl/Python posting issue, a stray `"test-connectivity-check-ignore"` message was sent to the live `#ivy` channel again — same failure mode as 07-19. No delete tool was available, so it was edited in place to an explanatory note rather than left as an unexplained stray message. The rule clearly isn't sticking on the first read — treat any Discord-posting debug session as a hard no-live-test zone by default, not something to remember to apply case by case.

**Third occurrence, 2026-08-10 (nightly review):** Python's `urllib.request` returned a 403 posting the real review content (env var was set via `source` without `set -a`, so it looked like it should have worked but something about the request still failed — root cause not fully isolated). Instead of debugging *that* failure in isolation, switched to curl with a literal `"curl test - checking auth"` string to sanity-check the token/channel — which posted directly to the live channel. **Concrete rule going forward: when a post fails, the very next attempt must resend the actual pending content (fix the encoding/env issue in the same call), never a placeholder string — even a one-off "let's just confirm the channel/token work" curl call counts as a banned test message.** If you need to verify plumbing, do it against a scratch value you already know (e.g. re-check the token/URL by inspection) rather than an actual HTTP POST to the live endpoint.
