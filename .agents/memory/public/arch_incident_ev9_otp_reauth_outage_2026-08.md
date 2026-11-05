---
name: Incident: Kia EV9 OTP Re-Auth Outage & Silent No-Op Failure
description: "Post-mortem on expired Kia cloud session token that caused car automations to silently fail for 3 days"
category: incident
source: incident_ev9_otp_reauth_outage_2026-08.md
updated: 2026-09-04
---

# Incident Post-Mortem: Kia EV9 OTP Re-Auth Outage (2026-08-06 to 2026-08-09)

## Summary
On 2026-08-06 07:28 PT, an HA restart caused `kia_uvo` to require a 2FA OTP (`setup_error: OTP required to refresh token`). All EV9 entities became `unavailable`.

## Silent Failure Mode
Because the lock and climate automations gated on condition checks that evaluated `unavailable` as `false`, automations triggered but silently dropped out without notifying Ryan.

## Remediation
* Ryan re-authenticated via Settings -> Devices & Services -> Kia USA.
* Rewrote automation error handling to explicitly notify when entities evaluate to `unavailable` (`EV9 Lock UNVERIFIED`).
