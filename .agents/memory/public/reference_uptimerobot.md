---
name: UptimeRobot API key and monitors
description: UptimeRobot account for external monitoring of Plex, getbigboard.com, ryanbrock.org
type: reference
originSessionId: 90e25265-24d4-4a65-9415-a4b1946f0a3f
modified: 2026-08-23T22:57:46.115Z
---
API key: stored at `~/.ivy/uptimerobot.env` (`UPTIMEROBOT_API_KEY`) — moved out of this file 2026-08-23, do not re-add the raw value here.

Monitors (all on 5-min interval, free plan):
- `104.8.7.19:32400/identity` — Plex external (id: 802875917)
- `getbigboard.com` (id: 802875902)
- `ryanbrock.org` (id: 802875901)
- `https://ivy.brock.ventures/` — Ivy VM health (id: 802897928)

**Heartbeat integration:** The 30-min heartbeat polls `getMonitors` and alerts Discord if any monitor status = 8 (seems down) or 9 (down).

**Note:** Free plan doesn't support webhook/Discord alert contacts. Polling from heartbeat is the workaround.

**Discord webhook created** in #ivy channel (id: 1495224293489901588) — not currently used since UptimeRobot can't call it on free plan.
