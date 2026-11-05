---
name: project_ivy_network_flapping
description: "Recurring VM network outages (cloudflared QUIC drops, 3-10min so far) causing 'Ivy unreachable' alerts + Discord bot disconnects — cause still unconfirmed, tracking across days"
metadata: 
  node_type: memory
  type: project
  originSessionId: 038a977f-59de-4cbd-9e4a-9e3f38b368fd
  modified: 2026-08-10T08:11:19.641Z
---

Started tracking 2026-08-07 after Ryan asked "why is the Claude connection flapping." Confirmed real via `journalctl --user -u ivy-cloudflared.service` — all 4 tunnel QUIC connections to Cloudflare's edge fail with `timeout: no recent network activity`, then cleanly reconnect once network activity resumes. This is a genuine drop in the VM's outbound network, not application-level — it also explains the Discord bot's gateway connection dropping ("flapping") since that's a separate outbound connection hitting the same underlying network loss.

**Occurrences so far:**
- 2026-08-07: two ~5min drops, 17:16-17:21 PT and 17:33-17:37 PT. Also ~14 much briefer (few-second) blips same day that never escalated to a full "unreachable" alert (cloudflared's 4 redundant connections absorb brief single-connection drops silently).
- 2026-08-08: one ~3min drop, 12:04:30-12:07:12 PT.
- 2026-08-10: one ~10min drop, 00:39:11-00:49:40 AM PT — longer than the typical 3-5min. Confirmed same signature (`timeout: no recent network activity`, all 4 QUIC connections, clean re-registration once it cleared), VM uptime continuous throughout (no reboot), ivy.service stayed active. Ivy initially misdiagnosed this as "no outage" by checking only VM uptime/service-active status instead of the actual tunnel/network layer — Ryan caught it via a Down Detector screenshot. **Lesson reinforced: VM-alive checks (uptime, systemctl active) and network-reachability checks (cloudflared logs, Down Detector) are different signals — a clean VM check does not rule out a real connectivity outage.**

**Ruled out (checked both days):** VM crash/reboot (uptime continuous since 2026-08-01), memory pressure (1.7-1.9GB free both times, not under strain), cloudflared service itself crashing (same PID/process throughout, just reconnects).

**Not yet determined:** the actual upstream cause. Two candidate theories, can't distinguish from inside the VM: (a) the Android host's own WiFi/network power management briefly suspending the VM's network path, (b) home WiFi AP flakiness. **Explicitly NOT confirmed to be the same "shared AP" issue tracked for OTBR** ([[project_matter_ikea]]) — that's a different network path (NAS-side Zigbee USB dongle over the LAN), not this VM's own internet uplink. Don't conflate the two without real evidence linking them.

**How to apply:** if this recurs, check `journalctl --user -u ivy-cloudflared.service --since <window>` for the same `timeout: no recent network activity` signature — that confirms it's this known pattern, not a new problem. Keep logging occurrences here (date + duration) to build a frequency picture. If it starts happening more often, worth escalating to actually checking the phone's own battery-optimization/network settings for this VM's process, or asking Ryan whether the phone was doing something specific during the outage windows (screen off, app switch, physical movement between WiFi APs) that might correlate.
