---
name: Kometa SQLite Constraint Upstream Collision
description: "Upstream episode reordering on TMDb can trigger SQLite unique constraint collisions during Kometa sy"
category: scar
source: scar_kometa_sqlite_constraint_upstream_collis.md
updated: 2026-09-29
---

Upstream episode reordering on TMDb can trigger SQLite unique constraint collisions during Kometa sync runs when new episode IDs collide with existing records. Resolving metadata order mismatches clears the constraint crash and takes effect automatically on the next scheduled run without restarting the container.
