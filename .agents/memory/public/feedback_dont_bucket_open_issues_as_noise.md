---
name: feedback_dont_bucket_open_issues_as_noise
description: "Don't lump unresolved/widening issues into \"known noise\" — only genuinely self-resolving, scope-stable items belong there"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ed069f82-03ae-4eee-896a-90de2bc70da0
  modified: 2026-08-12T06:00:08.715Z
---

Ryan corrected this 2026-07-07: I had been treating the Matterserver Node 31 connectivity fault and the widening HA device-unreachable issue (Envoy, 9 TP-Link devices, projector, webcam, Roomba, a BAF fan) as "known noise" alongside genuinely benign items (Prowlarr timeouts, Bazarr throttle, forecast_solar bug). He pushed back explicitly: "those are not noise and you should not ignore real issues like that."

**Why:** Noise and unresolved-but-unactioned problems are different categories. Noise = self-resolving, stable scope, no user impact (e.g. [[project_matter_node2_flakiness]], [[project_ha_forecast_solar]]). An issue with an unidentified root cause, or one whose scope is *widening* over time (more devices going down, more log volume), is an open problem that hasn't been investigated yet — calling it "known" makes it sound handled when it isn't.

**How to apply:** Before filing something under "known non-issue" or treating a repeat mention as old news, check: (1) is the root cause actually identified, (2) is the scope stable or growing, (3) has anyone verified it self-recovers with no side effects. If any of those fail, it's an open issue — surface it and propose investigating, don't fold it into the noise list. See [[project_matterserver_node31]] and [[project_ha_devices_unreachable]] for the specific incidents that prompted this.

**Inverse mistake, 2026-08-12: reporting something as ongoing "known noise" after it was actually already fixed.** The nightly NAS log review flagged "P90X & Daniel Tiger poster gaps" as documented noise, four nights after P90X was actually resolved 2026-08-07 (see [[project_posterizarr]]) — the review matched the pre-fix description on a memory-file grep without reading far enough to see that same file's later RESOLVED section, and without checking whether the error still appeared in the *current* logs at all. Ryan caught it ("I thought we fixed that?"); verified P90X had zero log mentions for 3 straight nights. **Same root failure as the main lesson above, opposite direction:** treating a memory match as settled truth (whether "it's noise" or "it's fixed") without re-verifying against current reality is the actual bug — a "known noise" citation needs to check both that the pattern still matches AND that no later update in the same memory file supersedes it. Fixed the process gap directly in `~/projects/NAS_LOG_REVIEW.md` Step 4 (2026-08-12): now explicitly requires reading a matched memory entry in full for a RESOLVED/FIXED marker, and confirming the issue is actually present in tonight's logs before citing it as ongoing noise.
