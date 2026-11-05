---
name: Baseball Channel Telemetry Discrepancy Forensic
description: "Investigation into the 69.6M token burn in #baseball revealed that telemetry backfill tagging was no"
category: scar
source: scar_baseball_channel_telemetry_discrepancy_f.md
updated: 2026-10-15
---

Investigation into the 69.6M token burn in #baseball revealed that telemetry backfill tagging was not the primary driver (accounting for only 473K tokens); rather, genuine real-time turns were actively logged. Bridge telemetry scripts and database flags (`is_backfill`) require strict attribution checking to avoid misidentifying operational usage spikes as backfill artifacts.
