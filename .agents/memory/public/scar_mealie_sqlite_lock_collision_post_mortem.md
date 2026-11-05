---
name: Mealie SQLite Lock Collision Post-Mortem
description: "Mealie experienced an HTTP 500 error presenting as missing recipes due to an SQLite write lock colli"
category: scar
source: scar_mealie_sqlite_lock_collision_post_mortem.md
updated: 2026-09-06
---

Mealie experienced an HTTP 500 error presenting as missing recipes due to an SQLite write lock collision triggered during background seeding. Recipes remained intact; concurrent database operations temporarily blocked frontend reads.
