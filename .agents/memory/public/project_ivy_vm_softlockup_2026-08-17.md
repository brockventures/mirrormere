---
name: project_ivy_vm_softlockup_2026-08-17
description: "5h43m Ivy outage (1:35-7:18 AM PT) caused by real kernel soft lockups (kcompactd0, rcu_exp_gp_kthr stuck for growing durations, 4:45-6:27 AM PT) — VM starved of host CPU time, not a network/cloudflared-specific issue; likely host power-management related, unconfirmed"
metadata: 
  node_type: memory
  type: project
  originSessionId: e9f23133-f230-464b-920b-6f8633488448
  modified: 2026-08-17T14:21:54.499Z
---

Down Detector showed Ivy unreachable 2026-08-17 01:35 AM PT through 07:18 AM PT — 5h43m, far longer than the typical 3-10 min "network flapping" blips tracked in [[project_ivy_network_flapping]]. Investigated after Ryan asked "why was ivy offline."

**Root cause: genuine kernel soft lockups, not just a dropped tunnel connection.** VM uptime was continuous throughout (no crash/reboot — same boot as the prior restart over a week earlier), and `ivy-cloudflared.service`'s process (PID 513) never restarted either — same PID the whole window. But `dmesg` showed 30 separate `BUG: soft lockup` kernel warnings between 04:45 and 06:27 AM PT:
- `kcompactd0` (kernel memory-compaction daemon) stuck on CPU#0 starting 04:45:23, each successive check showing it stuck *longer* (783s → 1341s → 1902s/kworker → 1929s → 1957s) — never actually recovered/made progress during that stretch.
- `rcu_exp_gp_kthr` (RCU expedited grace-period kernel thread, core kernel sync primitive) stuck on CPU#7 starting ~05:05:53, also escalating (27s → 55s → 111s → 167s → 223s → 277s → 334s → 389s → 445s+) through at least 05:14.

**This explains why it looked like a network problem but wasn't one specifically.** cloudflared logged continuous "no recent network activity"/QUIC timeout errors at a steady 96-251/hour rate for the entire 5h43m window (only one single successful "Registered tunnel connection" the whole time, right at the very end ~07:17:59) — but the actual cause was the VM not getting real CPU scheduling time from the host, not a WiFi/AP/cloudflared-specific fault. A VM that can't run its own network stack threads looks identical from outside to "the network is down."

**Corroborating evidence the whole VM was starved, not just networking:** the 30-min `ivy-auth-canary.timer` skipped its ~05:00 AM slot entirely and ran late at 05:14 instead (should be rock-steady); the 06:00 AM heartbeat took **9min 1.5s of CPU time** to complete (normally well under a minute) — both consistent with the VM fighting for scheduling time during this exact window, unrelated to cloudflared/networking code.

**Most likely cause, NOT confirmed:** the Android host phone doing something overnight that starved the VM's virtual CPUs of real host scheduling time — deep sleep/Doze mode or thermal throttling are the standard suspects for a pattern landing specifically in the middle of the night (1:35-7:18 AM). Cannot verify from inside the VM — no visibility into the host's own power/scheduler state. Current state post-recovery: fully normal, 4.3GB available memory, zero swap in use.

**Relationship to [[project_ivy_network_flapping]]:** that memory's unconfirmed theory (a) was "the Android host's own WiFi/network power management briefly suspending the VM's network path" — this incident is much longer and has actual kernel-level evidence (soft lockups) behind it, which the shorter 3-10 min flapping incidents never had. Plausibly the same underlying mechanism at different severity, but don't merge/conflate them without more evidence — this is the first incident with a confirmed VM-level (not just network-level) signature.

**How to apply:** if Ivy goes unreachable for an extended period (much longer than the usual few-minute network flapping) with the VM uptime staying continuous, check `dmesg -T | grep SOFTLOCKUP` for the outage window before assuming it's just another network blip — this is a materially different, more serious failure mode. If this recurs on a predictable schedule (e.g., always overnight), that would point strongly at a host power-management setting worth investigating/changing, but one occurrence isn't enough to establish a pattern yet.
