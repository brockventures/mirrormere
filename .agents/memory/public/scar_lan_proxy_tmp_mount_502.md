---
name: zero-lan-proxy /tmp bind mount wiped on reboot (zero/ivy 502s)
description: "zero.brock.ventures and ivy.brock.ventures 502'd after Host 2 rebooted because zero-lan-proxy bind-mounted its script from /tmp"
category: scar
updated: 2026-10-12
---

**Symptom (2026-10-12):** `zero.brock.ventures` and `ivy.brock.ventures` returned nginx 502. Both server blocks on Host 1 (`/usr/local/etc/nginx/conf.d/http.brock_ventures_ssl.conf`) proxy to `10.0.0.x:8769`.

**Root cause:** `zero-lan-proxy` (the only thing publishing Host 2 :8769) bind-mounted `/tmp/multi_port_proxy.py`. Host 2 rebooted at 10:02 AM PT, DSM wiped `/tmp`, and the container sat in `Created` state. A second blocker: it also published `8000`, which `sharkfin` already holds, so a plain `docker start` fails with "port is already allocated".

**Fix:** Rebuilt as a compose project at `/opt/docker/zero-lan-proxy/` (`proxy.py` + `docker-compose.yml`), forwarding `:8769` to `discord-antigravity-agent:8769` by container name on `discord-agy-agent_default`. Never bind-mount runtime scripts from `/tmp`.

**Unrecovered:** The old proxy also forwarded `8000` and `8001`. The original script is gone and the targets are unknown. Nothing in the nginx config uses them.

**SSH note:** Host 1 and Host 2 SSH use `$NAS_SSH_USER`, `$NAS_SSH_KEY` and `$NAS_SSH_PORT` (port 22), not root on port 22.
