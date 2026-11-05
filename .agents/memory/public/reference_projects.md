---
name: reference_projects
description: "Overview of Home Server, Baseball Analytics, and Jumbotron projects plus 12 strict operational guardrails"
category: engineering
source: reference_projects.md
updated: 2026-09-01
---

# Ryan's Core Projects & Cross-Project Guardrails (Reference)

## 1. Home Server (Synology NAS — //NasHost-01/docker)
- Home Assistant Container (Docker) on NasHost-01 (`10.0.0.x`).
- YAML-first configuration, 2-space indentation, Jinja2 templating.
- Integrations: Enphase solar/battery, Emporia Vue, Kia EV9, Nest Thermostat, Big Ass Fans, TP-Link, Hue, Samsung TVs, Chromecasts, Nest Protect/cameras via go2rtc, Nest x Yale via Homebridge, Roomba, Matter/SmartThings curtains.

## 2. Baseball Analytics (//AppHost-02/docker/baseball)
- Migrated to AppHost-02 (`.84`) on 2026-08-07.
- Three isolated Shiny apps:
  - **Pro app (`shiny_app_pro/`):** Port `3840`, 21 modular components (default target).
  - **Dev app (`shiny_app_dev/`):** Port `3839`, single-file monolithic.
  - **Prod app (`shiny_app/`):** Port `3838`, single-file monolithic.
- Refresh pipeline sequence: `scrape_metadata` → `scrape_prospect_positions.py` → `process_metadata.R` → `data_ingestion.R` → `calculate_dollar_values.R` → `compute_bbmix.R`.

## 3. Pixel Patchwork / Jumbotron (`brockventures/jumbotron`)
- Android app turning multiple Pixel phones into a synchronized video wall.
- Master phone creates WiFi hotspot (`wlan2`), runs WebSocket server (`:8081`), NanoHTTPD (`:8080`), and progressive chunked HLS encoder.
- Display phones scan QR, join hotspot, download per-tile cropped video segments, and play with ExoPlayer in sync. Master plays audio and displays tile (0,0).

## 4. Sandboxed Autonomous Amazon Purchasing (P1 Pipeline Idea)
- Defined in [`project_amazon_sandboxed_purchasing.md`](file:///workspace/.agents/memory/project_amazon_sandboxed_purchasing.md).
- 4-layer containment: Privacy.com virtual card ($100/mo cap, merchant-locked), dedicated Amazon sub-profile, Browserless/Playwright headless engine, Discord approval button gateway.

## 12 Strict Cross-Project Guardrails
1. Never take down or restart Docker containers autonomously.
2. Never delete media in `\\NasHost-01\data\media`.
3. Never take unapproved browser actions.
4. Never modify `secrets.yaml` or `.env` without confirmation.
5. Dev changes go through `shiny_app_dev/`, never edit `shiny_app/` directly.
6. Never drop or reset PostgreSQL databases without confirmation.
7. Never run full data refresh without confirming order and scope.
8. Never push to `main` without confirmation (`dev` is working branch).
9. Never modify `docker-compose.yml` without showing diff first.
10. Never delete or overwrite CSV data in `shiny_app/data/`.
11. Don't restart HA core without confirming.
12. Never copy `shiny_app_pro/` files into other Shiny app directories (keep isolated).
