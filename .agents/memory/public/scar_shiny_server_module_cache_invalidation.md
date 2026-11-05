---
name: Shiny Server Module Cache Invalidation
description: "In Dockerized Shiny Server environments (`big_board_pro`), updating `restart.txt` is insufficient to"
category: scar
source: scar_shiny_server_module_cache_invalidation.md
updated: 2026-09-28
---

In Dockerized Shiny Server environments (`big_board_pro`), updating `restart.txt` is insufficient to drop in-memory module caches on active R worker processes. Live code changes require restarting the container or terminating the worker process directly rather than relying on file touch triggers.
