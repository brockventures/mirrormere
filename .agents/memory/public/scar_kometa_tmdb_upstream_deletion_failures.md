---
name: Kometa TMDb Upstream Deletion Failures
description: "Kometa metadata lookups fail when referenced TMDb collection IDs or promotional short IDs are purged"
category: scar
source: scar_kometa_tmdb_upstream_deletion_failures.md
updated: 2026-09-04
---

Kometa metadata lookups fail when referenced TMDb collection IDs or promotional short IDs are purged upstream (e.g., Tarantino collection ID `1745497`). Updating `config.yml` takes effect immediately on the next scheduled run without requiring a container restart since Kometa re-reads config on execution.
