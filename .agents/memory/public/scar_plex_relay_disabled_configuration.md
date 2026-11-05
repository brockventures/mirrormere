---
name: Plex Relay Disabled Configuration
description: "Plex Relay was explicitly disabled via `PUT /:/prefs?RelayEnabled=0` and persisted as `RelayEnabled="
category: scar
source: scar_plex_relay_disabled_configuration.md
updated: 2026-09-09
---

Plex Relay was explicitly disabled via `PUT /:/prefs?RelayEnabled=0` and persisted as `RelayEnabled="0"` in `/opt/docker/appdata/plex/Preferences.xml` to prevent PMS from silently falling back to the 2 Mbps cloud proxy. Ryan also directed proceeding with the bazaar container restart and verifying port 32400 port-forwarding.
