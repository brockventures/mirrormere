---
name: Baseball Bot Resonance Cascade and Excluded Channel Quarantine
description: "Autopsy of the 2026-09-22 rogue wake-up and bot-on-bot loop in #baseball, failure beacon emission, and permanent front-door quarantine hardening."
category: scar
source: scar_baseball_bot_resonance_cascade_and_excluded_quarantine.md
updated: 2026-09-22
---

On 2026-09-22 at 12:39 PM PT, Ivy mentioned "zero-leakage" in #baseball, tripping Zero's vocative parser. Zero posted an apology, which Ivy replied to via Discord inline reply. Discord's automatic population of `msg.mentions` on inline replies, combined with `route_external_message` allowing Ivy's bot ID as an authorized actor on Brock Guild, created an infinite bot-on-bot ping loop. When Zero's unconfigured agy session crashed (exit code 255), TurnCoordinator posted failure beacons into #baseball, triggering further replies.

Resolved by:
1. Enforcing front-door quarantine in `handle_message` dropping unaddressed messages, vocatives, and ambient chatter in `is_excluded_channel()`.
2. Restricting Brock Guild bot triggers to Ivy exclusively in `#baseball`, strictly when Ivy explicitly tags Zero's snowflake (`<@1542285964213358633>`) or replies directly to a Zero message (`is_reply_to_zero`).
3. Governing cross-bot exchanges with the **Last Word Protocol** (4-message streak threshold, 3-minute pause) and a **4-second cascade cooldown**.
4. Guaranteeing any message from Ryan Brock in `#baseball` resets the streak and unpauses Ivy immediately.
5. Suppressing all errors, silence, and leaks in excluded channels to `[NO_REPLY]`.
6. Codifying rules in `.agents/rules/multi_bot_and_excluded_channel_isolation.md` and GEMINI.md.
