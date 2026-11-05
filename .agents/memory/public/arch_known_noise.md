---
name: known_noise
description: "Recurring false alarms — don't panic and don't fix these"
category: engineering
source: known_noise.md
updated: 2026-09-04
---

Things that look like problems but aren't:

- **Prowlarr `TaskCanceledException`** — background health checks against indexer
  sites that aren't even configured. Expected.
- **Kometa TVDb convert warnings** (~3000 per run) — TVDb episode coverage gap.
  The run still completes clean.
- **Bazarr OpenSubtitles auth/throttle errors** — nightly, benign.
- **HA `forecast_solar` errors after sundown** — upstream library bug, self-recovers.
- **Matter Node 2 timeouts** — a SwitchBot Hub 2 drops its session every 30–90
  minutes and recovers on its own.
- **HA `zigpy_znp` frame truncation / watchdog messages** — legacy Zigbee
  coordinator noise, low impact.
- **HA Nabucasa `google_report_state` timeouts** — flat background noise.
- **Chromecast heartbeat flapping** (Office / Living Room / Pixel Tablet) —
  reconnect loop that self-recovers via IPv4 fallback.
- **Thread/OTBR mesh chatter** (Link Request/Accept, deferred acks) — normal for a
  multi-border-router mesh.
- **Tailscale cold-start latency** — first ping after idle can exceed 200ms, then
  drops to LAN speed.
- **Transient indexer rate-limits (HTTP 429 / timeouts)** — brief Prowlarr/Newznab rate limits (e.g. Nzb.su, NZBgeek). Discord health warnings suppressed in Sonarr/Radarr via `includeHealthWarnings: false`.

**Important:** this list is for *confirmed-benign* patterns only. An issue that is
merely unresolved does not belong here — see [[feedback_working_style]].
