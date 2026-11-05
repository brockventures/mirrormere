---
name: reference_highland_floorplan_and_topology
description: "Ground-truth architectural floor plan, split-level elevation topology, and Home Assistant sensor zoning for 123 Main St"
category: reference
source: reference_highland_floorplan_and_topology.md
updated: 2026-10-15
---

# 123 Main St: Architectural Layout & Sensor Zoning

Official 2D architectural schematic floor plan and elevation topology for 123 Main St, San Francisco, CA 94105 (derived from 2022 Redfin listing MLS #ML81894468, Photo #37).

* **Image Archive:** [`/workspace/docs/floorplan_3519_highland.jpg`](file:///workspace/docs/floorplan_3519_highland.jpg) (secondary copy at [`/workspace/data/floorplan_3519_highland.jpg`](file:///workspace/data/floorplan_3519_highland.jpg)).
* **Google Drive:** Saved to `Home & Landscaping` folder (File ID `1XvgUv-1mNboZG_rlm12LLieV9URnVnb2`).
* **Inspection & Disclosures:** 183-page full disclosure packet saved in Google Drive `Home & Landscaping` (File ID `1QwhRTET5CgVLvXNSg2vsU4bwvoP1uZJg`) and cached locally at [`/workspace/data/3519_Highland_Avenue_-_Disclosure_Packet.pdf`](file:///workspace/data/3519_Highland_Avenue_-_Disclosure_Packet.pdf).

---

## 1. Architectural Topology & Split-Level Structure

The house is a custom split-level design where **Level 2 is divided into two distinct vertical tiers**:

* **Upper Tier (North side — half flight of stairs up):** Kitchen, Breakfast Nook, Hall Bath, Bedroom 2 (Rosie), Bedroom 3 (Isaac).
* **Lower Tier (South side — main arrival level):** Living Room, Dining Area, Central Powder Room, Primary Suite.
* **Level 1 (Ground floor):** Entry Foyer, 2-Car Garage, Sitting Room / Office Suite with dedicated Full Bath.



### Level 1: Ground Floor (380 sq ft living + 440 sq ft garage)
* **Entry Foyer:** Connects exterior front door, 2-car garage interior door, lower suite corridor, and the main staircase rising to Level 2.
* **Sitting Room / Suite (Office):** Front-facing room with closet and kitchenette nook, plus private dedicated full bathroom (tub/shower).
* **2-Car Garage:** Includes utility sink and laundry station hookups.

### Level 2 — South / Lower Tier (Main Living & Primary Suite)
* **Living Room & Dining Area:** Open-concept space along the west and south-central envelope. Features the fireplace on the outer west wall and wide south-facing front windows.
* **Powder Room (Half Bath):** Located centrally off the main hallway immediately adjacent to the stair arrival and dining room.
* **Primary Suite:** Positioned in the front southeast corner (street-facing). Features a walk-in closet (W.I.C.) and an en-suite full bath with double vanity and walk-in shower.

### Level 2 — North / Upper Tier (Kitchen & Kids Wing — Half Flight Up)
* **Elevation Difference:** The north half of the upper floor is **half a flight of stairs up** from the south half.
* **Kitchen & Breakfast Nook:** North-central space with a large prep island, cooking range, refrigerator, and breakfast nook with deck/patio door.
* **Bedroom 2 (Rosie):** East-facing mid-wing bedroom.
* **Bedroom 3 (Isaac):** Northeast rear corner bedroom.
* **Hall Full Bath:** Sits between Bedroom 3 and the kitchen hall, featuring a full bathtub/shower and vanity serving the kids' rooms and guests.

---

## 2. Home Assistant & Automation Grounding Rules

1. **Optical & Acoustic Boundary:**
   * Because the north tier (kitchen, kids' bedrooms) is elevated half a flight above the south tier (living room, dining, primary suite), sound and optical lines of sight are naturally baffled.
   * Motion/presence sensors on the lower tier (Living Room mmWave) do **not** bleed into the elevated kitchen prep area or kids' rooms.

2. **Living Room Motion & Presence (Task #30):**
   * **mmWave Radar (Aqara FP2):** Corner-mounted near the fireplace. Covers the entire Living Room and Dining Area without spillover into the elevated kitchen.
   * **Stair Landing Transition:** The junction between the main arrival stairs and the half-flight up to the kitchen requires a narrow, blinded PIR beam so ascending footsteps trigger ambient lighting without falsely keeping lights on when occupants are seated in the living room.

3. **Sleeping Sanctuary Policy:**
   * **Kids' Bedrooms (Beds 2 & 3):** No automated motion/occupancy sensing per household policy. Only curtain/blind routines.
   * **Primary Suite:** Under-bed or toe-kick low-PIR sensors strictly aimed at floor level (below mattress height) for nighttime bathroom guide lighting.

4. **Vertical Thermal Stratification (3-Tier Temperature Gradient):**
   * **1st Floor / Ground Tier (Coldest — Office, Entry Foyer, Garage):** Always runs coldest (typically `~65°F–67°F`).
   * **2nd Floor / Middle Tier (Moderate — Living Room, Dining, Primary Bedroom):** Runs in the middle band (typically `~69°F–72.5°F`).
   * **3rd Floor / Upper North Tier (Warmest — Kitchen, Rosie's Room, Isaac's Room):** Always runs warmest due to rising heat and upper-tier exposure (typically `~73°F–75°F`).
   * **ESPHome SCD4x Self-Heating Compensation:** The `Office CO2` (`esphome-web-cb53c4`) and `Isaac CO2` (`esphome-web-f8e36c`) ESP32 BLE-proxy nodes require `temperature_offset: 18.0°C` on the `scd4x` component to offset ESP32 enclosure self-heating.
