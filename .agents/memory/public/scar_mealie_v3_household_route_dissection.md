---
name: Mealie v3 Household Route Dissection
description: "In Mealie v3 (`v3.25.1`), recipes, meal plans, and webhooks were re-architected under the Household "
category: scar
source: scar_mealie_v3_household_route_dissection.md
updated: 2026-09-07
---

In Mealie v3 (`v3.25.1`), recipes, meal plans, and webhooks were re-architected under the Household domain, altering expected planner routing. Dissecting the container's physical Nuxt bundle at `/opt/mealie/lib/python3.12/site-packages/mealie/frontend/` revealed the true static route hierarchy needed for integration.
