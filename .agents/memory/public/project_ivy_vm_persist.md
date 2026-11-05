---
name: Ivy VM auto-start via Magisk module
description: Magisk module on the Pixel that auto-starts the Debian VM after Android reboot
type: project
originSessionId: 0d4f6545-795c-4894-9a4e-86500e57bf75
modified: 2026-08-01T18:07:12.042Z
---
The Ivy VM dies when the Pixel phone reboots — Android Virtualization Framework kills crosvm, and `~/autostart.sh`'s OOM protection only covers in-session memory pressure, not boot. Fix is the `terminal_vm_persist.zip` Magisk module from `github.com/DigijEth/VM_Magisk_Module`, installed on the phone 2026-05-04. Now auto-starts on boot.

**Why:** A 10.5h outage on May 2-3 (phone rebooted, no one noticed) made watchdog-only recovery insufficient. Auto-start is the durable fix.

**How to apply:**
- If the VM is unreachable and uptime correlates with phone reboot, suspect the Magisk module didn't run — check Magisk on the phone, not the VM.
- Do NOT bundle the zip into the Pixie public repo. Direct users to the upstream GitHub source. Install steps were added to `~/projects/pixel-claude-server/docs/SETUP.md` after Phase 0, Step 2c.
- The module is the local Pixie/Ivy host's responsibility, not part of the VM image.

**Second failure mode (confirmed 2026-08-01):** the VM can also go down and come back (fresh kernel boot, no graceful shutdown in the journal) WITHOUT the phone itself rebooting — Ryan confirmed the phone stayed up during a ~10:06-10:30 AM PT outage that morning. This means crosvm/the AVF guest process was killed independently (Android OOM/background-app killer, or the Terminal app force-stopped) — `autostart.sh`'s OOM protection only applies seconds after boot, so a kill in that early window slips through. From inside the guest there's no way to confirm which — no logcat/host-log access, no battery passthrough. If this recurs, the phone-side Terminal app's own crash/recent log or `adb logcat` around the outage time would be needed to pin it down further.
