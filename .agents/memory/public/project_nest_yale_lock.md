---
name: nest-x-yale-lock-ignores-unlock-command-ongoing
description: "Arrive-home auto-unlock automation fires correctly but the Nest x Yale lock intermittently never completes the unlock; broken since ~2026-05-15, unresolved. Network/Homebridge/HA path CONFIRMED healthy 08-18 — narrowed to lock hardware/firmware itself"
category: engineering
source: project_nest_yale_lock.md
updated: 2026-10-06
---

TENTATIVE / OPEN ISSUE as of 2026-05-21. Ryan's "unlock the door when I arrive home" automation stopped working a few days prior. Investigation confirmed the **automation trigger fires correctly** — the failure is at the device: the Nest x Yale lock acknowledges the unlock command (responds) but **never actually completes the unlock**. Broken since ~2026-05-15.

The lock is bridged to HA via Homebridge's Nest plugin (Entryway Lock — see [[project_homebridge]]). Next diagnostic steps handed to Ryan: check the lock battery in the Nest app, and test whether the Nest app itself can unlock it directly (isolates HA/Homebridge vs. the lock hardware).

**Network path RULED OUT 2026-08-18 with real evidence — confirmed device-side, not Homebridge/HA/network.** While investigating an unrelated Homebridge mDNS bug (see [[project_homebridge]]), checked whether a wrong-IP issue in Homebridge's HomeKit advertisement could explain this. It doesn't: HA can reach Homebridge fine regardless (both run host-network mode on the same box), zero connection errors in HA logs, and — decisively — the unlock automation actually completed successfully on 2026-08-18 ~16:55 PT (`unlocking`→`unlocked`) despite the "wrong" IP being advertised at the time. The classic failure symptom (`unlocking`→`locked` without completing, last seen 08-17 19:08) happens with a demonstrably healthy Homebridge↔HA connection throughout. This narrows the problem to the lock hardware/firmware itself — still intermittent (worked 08-18, failed 08-17), cause within the device not yet identified. Next diagnostic steps unchanged: check battery in the Nest app, test direct unlock via the Nest app to see if the same intermittent failure reproduces outside HA entirely (would confirm it's not even Homebridge-adjacent).

**Resolved 2026-10-05 (Stale Token Disconnection):** Homebridge container logs revealed that on Saturday, 2026-10-03 15:20 PT, the `homebridge-nest` plugin suffered an `ETIMEDOUT` during access token refresh, rejecting the session and dropping communication with Nest cloud. Homebridge retained the last known accessory state (`unlocking`) in memory and rejected incoming commands. Bouncing the Homebridge container on NasHost-01 re-acquired valid tokens, reconnected to Nest cloud, and restored live telemetry. `lock.entryway_lock` in Home Assistant immediately transitioned back to `locked` at 08:38 PT.

**How to apply:** If the lock entity freezes in an intermediate state (`unlocking` or `locking`), inspect Homebridge logs on NasHost-01 (`.82`) for `googleAuth` token timeouts before troubleshooting door hardware or HA automations. Update or archive this memory once verified across subsequent arrivals.
