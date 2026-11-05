---
name: Arch Gaming Everquest Legends
description: "Engineering architecture and post-mortem notes derived from gaming_everquest_legends.md"
category: engineering
source: gaming_everquest_legends.md
updated: 2026-09-20
---

# EverQuest Legends (EQL) — Game & Character Profile

*Documented on 2026-09-19 11:19 PM PT.*

---

## 1. Game Overview & Core Architecture
* **Game:** *EverQuest Legends* (EQL / EQLegends), developed by Game Jawn in collaboration with Daybreak Game Company (2026 release).
* **Architecture Distinction:** This is **NOT** classic 1999 Verant EverQuest, Project 1999, or standard live EQ. It is a modern, solo-friendly reimagining that introduces:
  * **Multiclassing (Gestalt):** Characters combine up to three distinct classes simultaneously into a single avatar.
  * **Instanced Dungeon Crawls:** Non-respawning instanced dungeon zones.
  * **Difficulty Scaler (D1–D4):** Players select difficulty from D1 to D4 upon zoning in, scaling enemy power, loot tables, and currency drops.
  * **Spell Tiering & Progression:** Spells and gear are upgraded dynamically via the merge interface.
  * **Roadmap:** *Nektropos Castle* & *Lake Nerius* (October 2026), followed by *Rulers of Kunark* expansion (mid-December 2026).

---

## 2. Ryan's Character Profile
* **Current Level:** 50
* **Class Gestalt:** **Shadow Knight (SHD) / Shaman (SHM) / Wizard (WIZ)**
  * **Role Archetype:** Heavy plate mitigation, snap aggro generation, feign-death pull control, 65%+ attack-speed slows (`Togor's Insects`), DoTs, self-healing taps (`Life Leech`), burst nuclear DPS (`Ice Comet`), and full teleport/evac utility (`Nek Gate`, `Ro Gate`, evacs).
  * **Gear Rule:** Can equip any item usable by any of the three component classes (e.g., plate armor with INT/WIS caster stats).
* **Platform:** Played on PC / Steam Deck (shortcut must strictly be named `EverQuest Legends` to bind community layout `EverQuest Legends - StackTrace - v1.3`).

---

## 3. Motes of Potential ("Notes") Meta & Economy
* **Terminology:** Officially called **Motes of Potential** (frequently transcribed, autocorrected, or referred to as "notes" in voice-to-text and community chat).
* **Function:** Slotted into the merge interface on spells and equipment to rank up their effectiveness, damage, duration, and resist penetration.
* **Farming Rules & Mechanics:**
  1. **D4 Difficulty Mandatory:** Running content on D4 difficulty maximizes both drop rates and mote tier quality.
  2. **Con Level Multiplier:** Motes drop drastically more often from **Red and Yellow con** mobs. Green/gray mobs have degraded loot tables.
  3. **Guaranteed Crawl Clears:** Completing a non-respawning Dungeon Crawl instance awards a guaranteed completion mote reward.
  4. **The Class-Swap Powerfarm Loop:** Swapping in an unleveled class resets effective character level, allowing the player to enter lower-tier dungeons on D4 (e.g., **Befallen** around Baron/Korven, **Castle Mistmoore**) to mow down red-con rooms with high-tier gear and farm motes rapidly.
  5. **Max-Level (50) Targets:** D4 named/rare hunting in high-level instances (Solusek B, deep Mistmoore, Plane of Hate).
* **Critical Operational Guardrails:**
  * **NEVER combine lower-tier motes at the NPC vendor:** The conversion incurs a massive loss in net mote experience. Use them directly.
  * **Prioritize Spells Over Gear:** Spell upgrades are permanent and grant crucial resist reduction and power to core abilities (e.g. Shaman slow, DoTs, nukes), whereas gear is frequently replaced.
