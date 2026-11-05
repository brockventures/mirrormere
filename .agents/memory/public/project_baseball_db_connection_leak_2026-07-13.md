---
name: project_baseball_db_connection_leak_2026-07-13
description: "RESOLVED 2026-07-14 — baseball_db postgres container found unhealthy during 2026-07-13 8PM heartbeat: ~2383 postgres backend processes, pg_isready failing 2358x straight (~8-9hrs). Fix required a full Container Manager/Docker daemon restart — see [[project_baseball_db_shim_wedge_2026-07-14]] for root cause and resolution."
category: engineering
source: project_baseball_db_connection_leak_2026-07-13.md
updated: 2026-09-01
---

2026-07-13 8:04 PM PT heartbeat found `baseball_db` container status "Up" but Docker health "unhealthy" with FailingStreak 2358 (`docker inspect` health log: `pg_isready` returning "no response" on port 5432 every ~13s for ~8-9 hours straight — started roughly 11 AM PT). `docker top baseball_db` showed ~2383 postgres backend processes (way past a sane `max_connections`). `docker exec ... psql` and even `docker logs baseball_db` hung/timed out when tested — the container itself shows healthy CPU/mem (0.04% CPU, 446MB mem) per `docker stats`, so it's not a resource crunch, more likely a connection/backend leak exhausting `max_connections` so new connections (including the healthcheck) can't get in.

This is separate from [[project_nas_log_review_2026-07-12_open_items]]'s collation-mismatch issue, which was fixed via `ALTER DATABASE ... REFRESH COLLATION VERSION` and is unrelated (that fix didn't touch connections/backends).

Morning pipeline refresh (6:50 AM PT `last_refresh.txt`) predates this, so today's baseball data run likely completed before the leak got bad — but if it persists past tomorrow's ~6:45 AM PT refresh ([[project_baseball_refresh_schedule]]), the scraper/pipeline may fail to connect.

Flagged to Ryan in Discord, not yet restarted — awaiting his go-ahead on `docker compose restart baseball_db` (or investigating root cause of the leak first, e.g. a service not closing connections — baseball_shiny_app/pro or the scraper are the likely culprits since they're the main DB clients).

**How to apply:** Check this before next baseball_db anomaly — if it recurs, look for a leaking connection pool in `baseball_shiny_app`/`baseball_shiny_pro`/the scraper rather than assuming it's the same collation issue. Don't restart the container without Ryan's explicit approval per [[feedback_no_direct_docker_cli]].

**Update 2026-07-13 ~9:47 PM PT (nightly log review):** Confirmed user-facing impact — `baseball_shiny_app` logs show repeated `dbConnect` failures ("connection refused" / "server closed the connection unexpectedly") against `db:5432`, so the app is actively erroring for users now, not just failing healthchecks in the background. `docker logs baseball_db --since 24h` still hangs (timed out at 20s). Still awaiting Ryan's go-ahead to restart.
