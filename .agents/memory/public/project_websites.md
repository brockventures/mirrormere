---
name: Ryan's hosted websites
description: "WordPress sites hosted on NasHost-01 Synology NAS — purpose, structure, Docker PHP-FPM 8.4 runtime, and access capabilities"
category: engineering
source: project_websites.md
updated: 2026-10-25
---

Two WordPress sites on NasHost-01 at `/srv/storage/web/`:
- **wordpress1** → **getbigboard.com** (DB: wp01) — baseball blog, hosts the Shiny app, potential future home of the pro app
- **wordpress2** → **ryanbrock.org** (DB: wp02) — personal site with resume; hosts small projects (e.g. plexrequests.ryanbrock.org = Seerr interface)

**PHP-FPM Runtime Architecture (Migrated 2026-10-24 from Synology PHP to Docker):**
- **Container:** `wordpress-php-fpm` (`wordpress:php8.4-fpm-alpine`, PHP 8.4.27+) defined at `/opt/docker/wordpress-php/docker-compose.yml` on NasHost-01.
- **Deprecated & Retired:** Synology's native `PHP8.4` package is uninstalled and all `pkg-WebStation-php82` / `php84` systemd FPM pools are stopped and disabled. Do NOT edit `/usr/syno/etc/packages/WebStation/PHPSettings.json` or `/usr/syno/etc/packages/WebStation/php_profile/`.
- **Configuration Files:** Immutable PHP and FPM pool settings live in `/opt/docker/wordpress-php/php.ini` (`opcache.enable=1`, `memory_limit=256M`, `session.upload_progress.enabled=0`) and `/opt/docker/wordpress-php/www.conf` (`pm.max_children=40`, `pm.max_requests=500`), binding directly to `/run/php-fpm/php-bf9840d0-3147-418e-86b9-3ccb07c3e7bb.sock` (`wordpress`) and `/run/php-fpm/php-1168f9e4-02b3-4eb7-b188-8dc3b4e015af.sock` (`phpmyadmin`).

**WP-CLI SOP (working via Docker container):**
- Command pattern on Host 1: `docker exec wordpress-php-fpm php /srv/storage/web/wp-cli.phar --allow-root --path=/srv/storage/web/wordpress1 [command]`
- Example: `post list --fields=ID,post_title,post_status`

**REST API:**
- Endpoints reachable externally at `https://www.getbigboard.com/wp-json/wp/v2/` and `https://www.ryanbrock.org/wp-json/wp/v2/`
