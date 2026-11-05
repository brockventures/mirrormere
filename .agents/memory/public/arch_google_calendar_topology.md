---
name: Google Calendar Household Architecture & Topology
description: "Overview of the 3-tier calendar system separating personal work/medical from unified household & kid logistics"
category: infrastructure
source: google_calendar_topology.md
updated: 2026-10-31
---

# Google Calendar Architecture & Topology

Migrated and unified on 2026-09-06 to eliminate the 'split-brain kids logistics' pattern.

## 1. Unified Household Hub: Family Calendar
- **Calendar ID:** `family05249951047154432652@group.calendar.google.com`
- **Access Role:** `owner` (both Ryan and Emily have full read/write access)
- **Scope:**
  - **All Kid Logistics:** Daily school dropoffs/pickups (Rosie dropoff, Isaac pickup, Isaac-Rafaela coordination).
  - **Extracurricular Activities:** Rosie gymnastics, Rosie swimming, Rafaela classes.
  - **School Breaks & Milestone Events:** Ski week, spring break, school orientations, star of the week, birthday parties.
  - **Automated Sidecar Integrations:** Dinner plan sync from `/workspace/tools/meal_planner_proposal.py` pushes confirmed weekly dinners here.
- **Rule:** Do not add Ryan or Emily as individual email attendees to events on this calendar; both subscribe directly to the calendar layer.

## 2. Ryan Personal: My calendar (Primary)
- **Calendar ID:** `primary` (`user@example.com`)
- **Access Role:** `owner`
- **Scope:**
  - Solo business travel and flights (e.g., Taipei, Hanoi, UA flights).
  - Personal appointments (dentist, individual medical).
  - Household maintenance work scheduled around Ryan's day (crawlspace, deliveries).
  - Personal recurring financial tasks (property taxes, 529 funding).

## 3. Emily Personal: Emily Brock personal
- **Calendar ID:** `partner@example.com`
- **Access Role:** `owner` (Ryan holds owner delegate access via API)
- **Scope:**
  - Her individual medical appointments (OB-GYN, dental, etc.).
  - Solo tasks and chores (`pay bills`).
  - Family birthdays and anniversary markers.

## 4. Retired & Excluded Calendars
- **Home:** `8ppu6rut9gsr2r29ljuivh5sk0@group.calendar.google.com`
  - Permanently deleted via Google Calendar API on 2026-09-06. Removed from all client views and `FAMILY_CALENDARS` tool mappings.
- **Roy Cloud Community Calendar (`FAMILIES: Roy Cloud Community Calendar`):** `c_f713b3055b57e1d48ca0962e78773a57b609cad582b1bf714d84b0b8c8af0e2c@group.calendar.google.com`
  - Excluded from `FAMILY_CALENDARS` (`calendar_id="all"` sweeps) and all event summaries/sidecars (contains general school-wide events the family does not attend; relevant family school dates live on the `Family` calendar).
