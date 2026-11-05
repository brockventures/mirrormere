---
name: UniFi Gateway Controller Plane Cascade
description: "Investigated an apparent switch/desktop network drop to reveal an internal UniFi controller plane fr"
category: scar
source: scar_unifi_gateway_controller_plane_cascade.md
updated: 2026-09-25
---

Investigated an apparent switch/desktop network drop to reveal an internal UniFi controller plane freeze caused by RabbitMQ/AMQP consumer lockups and inform listener wedging rather than physical reboots. Ryan explicitly rejected custom background watchdogs on appliance OS (UniFi OS) and external DNS offloading as fragile, establishing a preference for native controller hygiene (e.g. keeping "Log Allowed Traffic" disabled to prevent queue congestion) and scheduled clean maintenance restarts.
