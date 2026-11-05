---
name: Known Non-Issues & Expected Operational Noise
description: Benign diagnostic errors, timeouts, and expected warning signatures across homelab services.
category: reference
updated: 2026-09-22
---

# Known Non-Issues & Expected Operational Noise

Things that look like errors during triage or log inspection, but represent expected upstream behavior:

- **Prowlarr `TaskCanceledException` timeouts:**
  - Background indexer health checks against unconfigured, disabled, or rate-limited sites. Benign periodic noise; do not treat as an outage.

- **Kometa TVDb convert warnings (~3000/run):**
  - Upstream TVDb episode coverage gap. Kometa completes its collections and overlays run cleanly despite these warnings.

- **Bazarr OpenSubtitles auth/throttle errors:**
  - Occurs during nightly batch subtitle searches due to upstream OpenSubtitles free-tier API throttling. Self-recovers on next schedule.

- **Home Assistant `forecast_solar` errors after sundown:**
  - Upstream solar production integration throws errors when sun elevation is negative. Self-recovers automatically at sunrise.

- **Matter Node 2 timeouts:**
  - SwitchBot Hub 2 drops its session every 30–90 min and self-recovers automatically.

- **`docker logs kometa` hangs without `--tail`:**
  - Synology DSM utilizes a custom SQLite log driver (`log.db`) where supervisor processes hold stdout open indefinitely. External `docker logs` calls hang without an explicit limit. Always bound log commands with `--tail <N>` or read disk logs directly.

- **Home Assistant / Zigpy `APS_NO_ACK` (183) & `NWK_NO_ROUTE` (205) delivery errors:**
  - Periodic polling timeouts to battery-powered Zigbee end devices (ZEDs, e.g. IKEA Somrig shortcut buttons) while in deep sleep. Benign radio retries; the device wakes and transmits reliably on physical interaction.

- **Home Assistant `enphase_envoy` coordinator timeouts & transient `'unknown'` battery temp values:**
  - Brief Wi-Fi/Ethernet packet drops to the local Enphase Envoy IQ Gateway (`10.0.0.x`) cause momentary coordinator error logs and temporary non-numeric `'unknown'` values for Encharge battery temperature sensors (`sensor.encharge_*_temperature`). Self-recovers on the next 30–60 second poll cycle.

- **Cloudflared origin connection refused on idle dev ports (`8000`, `8001`):**
  - Public web crawlers probing `robots.txt` against paused Crab Cavern sideproject dev ingress routes (`outpost.brock.ventures`, `highball.brock.ventures`). Benign scanner noise while dev servers are offline.

- **Cloudflared QUIC datagram/stream edge rotations (`Application error 0x0 (remote)` / `timeout: no recent network activity`):**
  - Routine Cloudflare edge PoP (`sjc01` / `sjc06`) connection rebalancing over QUIC (`WRN Serve tunnel error` / `WRN Connection terminated`). Re-registers a fresh QUIC tunnel index automatically within 1–2 seconds.

- **Plex `udc input failed with 1011` (`Plex EAE Service`):**
  - Dolby Unified Decoder (`udc`) inside `Plex EAE Service` (EasyAudioEncoder) logs `udc input failed with 1011` (`UDC_ERR_INVALID_BITSTREAM`) to container stdout when `Plex Transcoder` runs background audio loudness analysis (`-af loudnorm=I=-16:TP=-1:LRA=9`) across `EAC3 5.1` (Dolby Digital Plus) media files and hits trailing/partial frame boundaries. Benign background analysis chatter; playback and server health (`:32400/identity` HTTP 200) are unaffected.


