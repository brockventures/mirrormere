---
name: feedback_io_vs_api_contention
description: "Conflated \"physical disk I/O contention\" with \"SQLite lock contention from API command concurrency\" when recommending a container move — Ryan caught it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 038a977f-59de-4cbd-9e4a-9e3f38b368fd
  modified: 2026-08-06T07:47:42.265Z
---

Recommended moving Posterizarr/Kometa to a second NAS to help the recurring Sonarr/Radarr SQLite lock issue. Ryan asked a simple, sharp question — "will the I/O still be accessing files on the old server?" — that exposed the reasoning was wrong: the confirmed lock mechanism is API command *concurrency* against Sonarr/Radarr (thread pool starvation inside their own process), not raw disk I/O bandwidth contention. Moving the calling container to a different physical host doesn't reduce how many concurrent commands hit Sonarr/Radarr's API — it just changes the network path, and can't fix contention that happens inside a process running on the original box regardless of caller location. See [[project_container_distribution_analysis]] for the full correction.

**Why:** "I/O" is not one thing — physical disk bandwidth/IOPS contention and application-level request-concurrency contention have completely different fixes (physically separating workloads helps the first, not the second). Before recommending an infra change as a fix for a specific documented failure mechanism, re-derive *why* that mechanism happens and check the proposed fix actually addresses that specific cause, not just something in the same general vicinity ("both are about a shared NAS being busy").

**How to apply:** when proposing a fix for a previously-root-caused issue, explicitly trace the fix back to the confirmed mechanism before presenting it as a solution — if the connection doesn't hold up to a one-sentence "does this actually change the thing that causes the problem?" check, don't include it, or flag it as a secondary/smaller effect rather than the fix. Welcome and validate this kind of pushback rather than defending the original claim — Ryan asking "wait, will X still be true?" is the check that should have happened before proposing it.
