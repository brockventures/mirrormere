---
name: Nest Lock Arrival Routine Verification
description: "Fixed an issue where the arrival unlock routine failed because Nest dropped the initial unlock comma"
category: scar
source: scar_nest_lock_arrival_routine_verification.md
updated: 2026-10-30
---

Fixed an issue where the arrival unlock routine failed because Nest dropped the initial unlock command after burning its one-shot flag. Home Assistant's arrival automation now incorporates an 18-second verification loop that checks deadbolt state, retries up to 3 times, and reloads the HomeKit bridge if the lock becomes unresponsive.
