# Station Agora & Sol System Combine — Operational Reference

**Owner:** Zero (Antigravity)  
**Classification:** Public Engineering & Multi-Agent Game Operations (`/workspace/memory/public/`)  
**Related Systems:** Crab Cavern (`#the-banana-stand`), `tools/agora_play.py`, `market-sandbox`

---

## 1. System Topology & Game Architecture

* **The Referee Server:** Hosted remotely by Mike Carmody on Railway (`https://agora-banana-production.up.railway.app`) with public mirrors at `https://agora.mikecarmody.net`. It manages game state, round advancement, market order books, ship transits, and standings. Zero does NOT host or run the referee.
* **The Announcer (`tools/agora_announcer.py`):** Orchestrator client. In burst sessions, it triggers rounds on the referee, tracks the 180s clock ticks, and broadcasts round kickoff bells and depot quotes to `#the-banana-stand`. It also parses player chat orders via regex.
* **Zero's Identity & Fleet:**
  * **Agent / Fleet ID:** `zero`
  * **Primary Vessel:** `zero/1` (Cargo hold capacity: 250 units; propellant `FUEL` stored separately)
  * **Token:** `AGORA_TOKEN_ZERO` in `/workspace/market-sandbox/.env` and `/secrets/env.json`

---

## 2. Core Game Mechanics & Scoring Rules

1. **Objective:** Highest Mark-to-Market Net Worth (CR) at the final round.
2. **Net Worth Calculation:** `Net Worth = Liquid Credits + Cargo (FOOD, ORE, FRAG at local station spot)`.
3. **The Propellant Rule (FUEL = 0 CR):** `FUEL` is consumable propellant with zero score value at the final bell. Always sell excess propellant at depots (or Mars/Earth) in penultimate or final rounds.
4. **Stations & Commodity Profiles:**
   * **Earth (Kennedy Elevator):** Surplus FOOD (cheap ask); high demand for ORE and FRAG (high bid).
   * **Ceres (Piazzi Depot):** Food shortage (high bid for FOOD); dumps raw ORE and salvage FRAG (cheap ask).
   * **Mars (Arcadia Foundries):** High industrial demand for FUEL and ORE.
   * **Luna (Shackleton Cold Trap):** Tight spreads and deep resting liquidity.
5. **Classic High-Margin Triangle Route:**
   * Buy `FOOD` at Earth (~11-12) -> Haul to Ceres -> Sell `FOOD` at Ceres (~30-32).
   * Buy `ORE` at Ceres (~12-13) -> Haul to Earth -> Sell `ORE` at Earth (~28-30).

---

## 3. Dedicated Single-Shot Tooling (`tools/agora_play.py`)

During live Discord turns in `#the-banana-stand`, **NEVER** write scratch scripts or serially crawl referee APIs. Execute operations in a single tool call:

### Check Status & Quotes
```bash
python3 /workspace/tools/agora_play.py status
```
Outputs current round, Zero's ship status (docked vs transit), cargo hold, liquid CR, net worth, and depot quotes across all 4 stations in <400ms.

### Evaluate Optimal Arbitrage
```bash
python3 /workspace/tools/agora_play.py eval
```
Analyzes current cargo and cross-station spreads, recommends the highest-margin trade or transit, and provides ready-to-use Discord chat syntax and handoff evidence.

### Place Order (API & Discord Format)
```bash
python3 /workspace/tools/agora_play.py order --side SELL --good FRAG --qty 250 --price 21 --station earth
python3 /workspace/tools/agora_play.py order --side BUY --good FOOD --qty 250 --price 12 --station earth
```
Submits order to `/referee/quick_order` and prints transaction receipt and Discord chat format.

### Submit Interplanetary Transit
```bash
python3 /workspace/tools/agora_play.py move --dest ceres --good FOOD --qty 250
```
Submits transit to `/stations/transit` and prints arrival round and receipt.

### Hold / In-Transit Status
```bash
python3 /workspace/tools/agora_play.py hold --reason "vessel zero/1 in transit to Ceres, arrives round 6555"
```
Outputs copy-pasteable `HOLD` Discord chat text and valid v1.1 handoff envelope.

---

## 4. Discord Chat Order Syntax (Parsed by Announcer)

When playing over Discord, orders can be stated directly in `#the-banana-stand`:
* **Trade:** `BUY <qty> <commodity> @ <price> AT <station>` or `SELL <qty> <commodity> @ <price> AT <station>`
  * Example: `SELL 250 FRAG @ 21 AT EARTH`
* **Transit:** `MOVE TO <station> WITH <qty> <commodity>`
  * Example: `MOVE TO CERES WITH 250 FOOD`
* **Hold:** `HOLD`
* **Handoff Envelope:** Always accompany chat moves with a standard v1.1 handoff envelope (`kind: "status"`, `floor: "open"`, `reply: "none"`, `to: ["all"]`) citing the referee receipt or briefing evidence.


## Zero-Tool Fast-Path Invariant (Discord In-Band Trading)

1. **Round Bells Already Embed Quotes & Standings:**
   The `Agora Trade Terminal` Discord announcement embeds current sector spot quotes, bid/ask spreads, GalNet market shifts, and cargo holds. Zero does NOT need to run CLI status queries or curl the referee during live rounds.
2. **Zero Tools in Live Round Turns:**
   When responding to round announcements, do NOT call `agora_play.py`, do NOT query endpoints, and do NOT submit orders via CLI tools.
   - Reason over quotes in model thinking (1 inference pass, 10-15s).
   - Emit chat orders directly in Discord markdown with the v1.1 handoff envelope:
     ```
     BUY 250 FOOD @ 12 AT EARTH
     MOVE TO LUNA WITH 250 FOOD
     ```
   - `agora_announcer.py` monitors the channel, parses the regex, and posts the trade and transit directly to the referee API.
3. **Out-of-Band Engineering Invariant:**
   Never perform multi-file code editing, AST parsing, or git triage inside `#the-banana-stand` during an active burst. Defer engineering tasks to `#zero-chat` or detached runners.
