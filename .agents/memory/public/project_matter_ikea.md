---
name: Matter Device Commissioning — IKEA Myggspray
description: "Operational notes on commissioning IKEA Thread/Matter devices via homelab OTBR"
category: project
source: project_matter_ikea.md
updated: 2026-09-04
---

# Matter Device Commissioning: IKEA Myggspray

IKEA Thread devices commission into Home Assistant via our dedicated OpenThread Border Router (OTBR) on `NEST-PAN-262C`.

* **Active Architecture:** See [`infra_matter_thread_mesh.md`](file:///workspace/memory/private/infra_matter_thread_mesh.md).
* **Commissioning Notes:** Devices join via the local OTBR fabric without requiring Google cloud routing.
