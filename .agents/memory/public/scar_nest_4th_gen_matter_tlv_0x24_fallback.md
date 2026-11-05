---
name: Nest Learning Thermostat 4th Gen Matter TLV 0x00000024 Subscription Fallback & Image Migration
description: "Root cause and fix for Nest Learning Thermostat 4th Gen (Matter Node 37) failing python-matter-server subscription with CHIP Error 0x00000024 (Invalid TLV tag) and why matterserver was frozen at 8.1.0"
category: engineering
source: scar_nest_4th_gen_matter_tlv_0x24_fallback.md
updated: 2026-10-26
---

## Incident Summary (2026-10-25)

1. **Why `matterserver` Was Not Auto-Updating on Host 1 (`.82`):**
   - **Upstream Registry Migration (`#1262`):** Upstream migrated the repository from `home-assistant-libs/python-matter-server` to `matter-js/python-matter-server`. While GitHub redirects git/API requests, GHCR (`ghcr.io`) does not redirect container pulls: `ghcr.io/home-assistant-libs/python-matter-server:stable` remained permanently frozen at `8.1.0` (`2025-08-14`), whereas `8.1.1` and `8.1.2` were published to `ghcr.io/matter-js/python-matter-server:stable`.
   - **Explicit Dockhand Exclusion (`dockhand.update=false`):** In `/opt/docker/homeassistant/docker-compose.yml` (compose project `trash-guides`), `matter-server` is labeled `dockhand.update=false` alongside `homeassistant`, `go2rtc`, `otbr`, and `zwave-js-ui` so Thursday 4:30 AM PT Dockhand runs do not auto-recreate core Home Assistant / Thread / Matter infrastructure.

2. **Why Nest Learning Thermostat 4th Gen (`Node 37`) Failed Subscription (`CHIP Error 0x00000024: Invalid TLV tag`):**
   - After a physical reboot of the Nest Learning Thermostat 4th Gen, full wildcard attribute interviews (`_interview_node`, which calls `read_attribute(node_id, [()], fabric_filtered=False)` without events) succeeded in ~460ms and populated all 296 attributes.
   - However, `_subscribe_node` in `matter_server/server/device_controller.py` requests `events=[("*", 1)]` alongside `[()]`. Following the reboot, the Nest Thermostat's buffered Matter event log emits a TLV tag that the C++ CHIP SDK (`home-assistant-chip-core 2025.7.0`, `src/lib/core/TLVReader.cpp:827`) rejects with `CHIP Error 0x00000024: Invalid TLV tag`, aborting the subscription before attributes are marked available.

3. **Resolution:**
   - Updated `/opt/docker/homeassistant/docker-compose.yml` image reference to `ghcr.io/matter-js/python-matter-server:stable` (`8.1.2`) and enabled `dockhand.update=true` on `matter-server` per Ryan's directive (2026-10-26).
   - Patched `_subscribe_node` in `/usr/local/lib/python3.12/site-packages/matter_server/server/device_controller.py` (persisted at `/opt/docker/homeassistant/matter-server/device_controller_patched.py` and bind-mounted into the container) to catch `ChipStackError` containing `0x00000024` during subscription and fall back to `_interview_node(node_id)` with a 60-second background attribute polling task, keeping `Node 37` (`climate.nest_learning_thermostat_4th_gen`) permanently available and updated in Home Assistant.
