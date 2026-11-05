---
name: feedback_dont_assume_bug_without_asking
description: "Don't assume unapplied/dormant behavior is a bug and silently 'fix' it — especially filters that change what results Ryan sees; ask first if ambiguous"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: b2920320-fd72-430a-8e5e-59b64e32c546
---

On 2026-07-07 a prior Ivy session, while fixing a real outage in the used-EV9 monitor ([[project_ev9_listing_monitor]]), found the blue-only hard filter computing `color` but never using it to skip non-blue listings. It assumed this was an accidental regression and re-added `if color is None: continue`. Ryan corrected it the same day (Discord msg 1524211536506388571): **"Disabling the blue only filter was intentional."** The "fix" was reverted.

**Lesson:** Code that *computes* a value but doesn't *apply* it isn't automatically a bug — it's often a deliberate, unfinished, or walked-back decision. Before reverting/"restoring" behavior that looks unintentional:
- Don't silently re-enable it. Ask Ryan first if there's any ambiguity about intent.
- This matters most for anything that changes **what results/output Ryan actually sees** — a filter, a threshold, an alert gate, a suppression. Silently narrowing his results (e.g. hiding non-blue cars he wanted to see) is a real cost, not a neutral cleanup.
- Git history / prior memory can show whether a change was intentional; check before assuming.
- When bundling an assumed-fix into a larger legitimate fix (as happened here — it rode along with 3 genuine outage bugs), call it out separately so it's easy to reject without unwinding the real fixes.

Related pattern: [[feedback_check_memory_before_claiming_impossible]], [[feedback_dont_bucket_open_issues_as_noise]] — bias toward checking/asking over confident assumption.
