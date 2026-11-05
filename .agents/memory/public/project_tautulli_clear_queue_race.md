---
name: project_tautulli_clear_queue_race
description: "Tautulli's clear_recently_added_queue scheduled job intermittently throws RuntimeError: Set changed size during iteration — upstream code bug (activity_handler.py), low impact, no independent fix"
category: engineering
source: project_tautulli_clear_queue_race.md
updated: 2026-09-01
---

Found during 2026-08-17 nightly NAS log review: Tautulli's `clear_recently_added_queue` job ran 4x in 24h, 2 of which raised `RuntimeError: Set changed size during iteration` at `activity_handler.py:679` (`for grandchild_key in grandchild_keys:` — the set is being mutated by another thread while this loop iterates it, a classic non-thread-safe pattern).

**Impact:** low — this is an internal recently-added-notification cleanup job, not core history/streaming tracking. No evidence of broader Tautulli dysfunction tied to it.

**Not independently fixable** — it's a bug in Tautulli's own bundled code, not a config issue on this end. Would need an upstream Tautulli patch/update.

**How to apply:** treat as known low-severity noise going forward unless it starts throwing on jobs that matter (history recording, notifications actually failing to send) rather than just this cleanup job.

**Second exception shape found in the same job, 2026-08-20 nightly review — `KeyError: 'rating_key'`, not the RuntimeError above.** At 17:53:42 UTC (10:53 AM PT), `clear_recently_added_queue` tried to process library item 51476 (an "Outer Banks" S5 episode, grandparent 12882) that had been queued ~15s earlier (17:38:35 UTC). By the time the job ran, Plex returned a 404 for `/library/metadata/51476` — the rating key no longer resolved (Plex was actively adding a burst of new episodes for the same show in that window, one every ~1min, plausibly re-indexing/renumbering as it went). Tautulli's `get_metadata_details` couldn't parse the (empty) response (`'NoneType' object has no attribute 'getElementsByTagName'`), and the job then hit `KeyError: 'rating_key'` trying to use that None result — same underlying pattern as the RuntimeError above (this job's code isn't defensive against Plex state changing between queueing and processing), just a different trigger (stale/rotated rating key vs. concurrent set mutation) and different exception type. Single occurrence, self-contained to this one item's "recently added" notification — no broader impact. Not independently fixable for the same reason as the original bug (upstream Tautulli code, not a config issue this end). Treat both exception shapes as the same known-low-severity family going forward.
