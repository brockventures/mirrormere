import { describe, expect, it } from 'vitest';
import {
  CAMERA_PRESETS,
  FOYER_STAIRCASE,
  TIER1_ENVELOPE,
  TIER1_FIXTURES,
  TIER1_HA_BINDINGS,
  TIER1_ROOMS,
  TIER1_WALLS,
  UPPER_FLOOR_MASSING,
  findFloorAabbCollisions,
  fixtureCenter,
  fixtureSize,
  fixtureToBox3,
  getFixtureById,
  wallHeightAtZ,
  type CameraPresetId,
  type CameraPresetSpec,
  type FacingDirection,
  type FixtureId,
  type FixtureMountType,
  type FixtureSpec,
  type HaBindingKey,
  type HaEntityBindingSpec,
  type RoomBoundsSpec,
  type RoomId,
  type StaircaseSpec,
  type UpperFloorMassingSpec,
  type UpperMassingId,
  type WallDoorwayCutoutSpec,
  type WallSegmentSpec,
} from './tier1LayoutSpec';

describe('tier1LayoutSpec — Envelope, Rooms, Walls, Upper Massing, Cameras & HA Bindings', () => {
  it('defines the exact 43.5 ft x 22.0 ft right-handed foot-scale Tier 1 envelope and room bounds', () => {
    expect(TIER1_ENVELOPE.xMin).toBe(-20.0);
    expect(TIER1_ENVELOPE.xMax).toBe(23.5);
    expect(TIER1_ENVELOPE.xMax - TIER1_ENVELOPE.xMin).toBeCloseTo(TIER1_ENVELOPE.width, 6);
    expect(TIER1_ENVELOPE.zMin).toBe(-11.0);
    expect(TIER1_ENVELOPE.zMax).toBe(11.0);
    expect(TIER1_ENVELOPE.zMax - TIER1_ENVELOPE.zMin).toBeCloseTo(TIER1_ENVELOPE.depth, 6);
    expect(TIER1_ENVELOPE.floorY).toBe(0.0);
    expect(TIER1_ENVELOPE.wallTopY).toBe(8.6);

    const roomIds: RoomId[] = ['office', 'foyer', 'garage'];
    const rooms: RoomBoundsSpec[] = roomIds.map((id) => TIER1_ROOMS[id]);
    expect(rooms).toHaveLength(3);

    expect(TIER1_ROOMS.office.xMin).toBe(-20.0);
    expect(TIER1_ROOMS.office.xMax).toBe(-3.5);
    expect(TIER1_ROOMS.foyer.xMin).toBe(-3.5);
    expect(TIER1_ROOMS.foyer.xMax).toBe(3.5);
    expect(TIER1_ROOMS.foyer.wallColor.toLowerCase()).toBe('#2c323b');
    expect(TIER1_ROOMS.garage.xMin).toBe(3.5);
    expect(TIER1_ROOMS.garage.xMax).toBe(23.5);

    for (const room of rooms) {
      expect(room.zMin).toBe(-11.0);
      expect(room.zMax).toBe(11.0);
      expect(room.yMin).toBe(0.0);
      expect(room.yMax).toBe(8.6);
    }
  });

  it('defines cutaway wall heights, tapered interior partitions with doorway cutouts, and upper-floor massing', () => {
    const wallById = new Map<string, WallSegmentSpec>(TIER1_WALLS.map((w) => [w.id, w]));

    const westWall = wallById.get('outer-west-office')!;
    const eastWall = wallById.get('outer-east-garage')!;
    const northGarage = wallById.get('outer-north-garage')!;
    expect(wallHeightAtZ(westWall, 0)).toBeCloseTo(8.6, 5);
    expect(wallHeightAtZ(eastWall, 0)).toBeCloseTo(8.6, 5);
    expect(wallHeightAtZ(northGarage, -11.2)).toBeCloseTo(8.6, 5);

    const westPartition = wallById.get('interior-west-foyer')!;
    const eastPartition = wallById.get('interior-east-foyer')!;
    expect(wallHeightAtZ(westPartition, -11.0)).toBeCloseTo(8.6, 5);
    expect(wallHeightAtZ(westPartition, 0.0)).toBeCloseTo(6.55, 5);
    expect(wallHeightAtZ(westPartition, 11.0)).toBeCloseTo(4.5, 5);
    expect(westPartition.foyerSideColor).toBe('#2c323b');

    const officeDoorCutout: WallDoorwayCutoutSpec = westPartition.doorways[0];
    expect(officeDoorCutout.zMin).toBe(6.4);
    expect(officeDoorCutout.zMax).toBe(9.2);

    expect(wallHeightAtZ(eastPartition, -11.0)).toBeCloseTo(8.6, 5);
    expect(wallHeightAtZ(eastPartition, 11.0)).toBeCloseTo(4.5, 5);
    const garageDoorCutout: WallDoorwayCutoutSpec = eastPartition.doorways[0];
    expect(garageDoorCutout.zMin).toBe(-8.5);
    expect(garageDoorCutout.zMax).toBe(-5.8);

    const officeSouth = wallById.get('cutaway-south-office')!;
    expect(officeSouth.heightStart).toBe(1.4);
    expect(officeSouth.heightEnd).toBe(1.4);

    const garageSouthCurb = wallById.get('cutaway-south-garage-curb')!;
    expect(garageSouthCurb.xMin).toBe(5.5);
    expect(garageSouthCurb.xMax).toBe(21.5);
    expect(garageSouthCurb.heightStart).toBe(0.18);
    expect(garageSouthCurb.heightEnd).toBe(0.18);

    // Zero-span branch in wallHeightAtZ
    const zeroSpanWall: WallSegmentSpec = { ...officeSouth, zMin: 11.0, zMax: 11.0 };
    expect(wallHeightAtZ(zeroSpanWall, 11.0)).toBe(1.4);

    const upperIds: UpperMassingId[] = ['tier2South', 'tier3North'];
    const massings: UpperFloorMassingSpec[] = upperIds.map((id) => UPPER_FLOOR_MASSING[id]);
    expect(massings[0].yBase).toBe(9.5);
    expect(massings[0].zMax).toBe(11.0);
    expect(massings[1].yBase).toBe(14.0);
    expect(massings[1].zMin).toBe(-11.0);
    expect(massings[1].yBase).toBeGreaterThan(massings[0].yBase);
  });

  it('defines all 6 camera presets and 8 Home Assistant entity bindings inside valid coordinates', () => {
    const presetIds: CameraPresetId[] = [
      'dollhouse',
      'office',
      'foyer',
      'garage',
      'topdown',
      'stack3Tier',
    ];
    for (const id of presetIds) {
      const preset: CameraPresetSpec = CAMERA_PRESETS[id];
      expect(preset.id).toBe(id);
      expect(preset.fov).toBeGreaterThan(20);
      expect(preset.fov).toBeLessThan(80);
      expect(preset.position[1]).toBeGreaterThan(10);
    }
    expect(CAMERA_PRESETS.stack3Tier.showUpperMassing).toBe(true);
    expect(CAMERA_PRESETS.dollhouse.showUpperMassing).toBe(false);

    const haKeys: HaBindingKey[] = [
      'officeTemp',
      'officeLight',
      'foyerLight',
      'garageLight',
      'washerPower',
      'washerRunning',
      'printerState',
      'garageDoor',
    ];
    for (const key of haKeys) {
      const binding: HaEntityBindingSpec = TIER1_HA_BINDINGS[key];
      expect(binding.key).toBe(key);
      expect(binding.defaultEntityId).toContain(`${binding.domain}.`);
      const room = TIER1_ROOMS[binding.room];
      expect(binding.anchor[0]).toBeGreaterThanOrEqual(room.xMin);
      expect(binding.anchor[0]).toBeLessThanOrEqual(room.xMax);
    }
  });
});

describe('tier1LayoutSpec — Four Mandatory Walkthrough Layout Invariants', () => {
  it('Walkthrough Fix #1: enforces Office North back wall L->R ordering, centered barn door + track, and recessed wet-bar right against Foyer wall', () => {
    const bathDoor = getFixtureById('office-bath-door');
    const nwBookcase = getFixtureById('office-bookcase-nw');
    const barnDoor = getFixtureById('office-barn-door');
    const barnTrack = getFixtureById('office-barn-door-track');
    const wetBarCounter = getFixtureById('office-wetbar-counter');
    const wetBarSink = getFixtureById('office-wetbar-cabinet-sink');
    const wetBarFridge = getFixtureById('office-wetbar-fridge');
    const wetBarShelves = getFixtureById('office-wetbar-shelves');

    // Bathroom door on far left next to NW tall black bookcase
    expect(bathDoor.xMin).toBe(-19.2);
    expect(bathDoor.xMax).toBe(-16.4);
    expect(nwBookcase.zMin).toBe(-10.4);
    expect(nwBookcase.zMax).toBe(-7.6);

    // Strictly Left (-X) -> Right (+X): bathDoor < barnDoor < wetBar
    const bathCenter = fixtureCenter(bathDoor);
    const barnCenter = fixtureCenter(barnDoor);
    const wetBarCenter = fixtureCenter(wetBarCounter);
    expect(bathDoor.xMax).toBeLessThan(barnDoor.xMin);
    expect(barnDoor.xMax).toBeLessThan(wetBarCounter.xMin);
    expect(bathCenter.x).toBeLessThan(barnCenter.x);
    expect(barnCenter.x).toBeLessThan(wetBarCenter.x);

    // Barn door centered in Office (-20.0..-3.5 => midpoint -11.75) on overhead matte-black iron track
    const officeMidX = (TIER1_ROOMS.office.xMin + TIER1_ROOMS.office.xMax) / 2;
    expect(Math.abs(barnCenter.x - officeMidX)).toBeLessThanOrEqual(0.25);
    expect(barnDoor.xMin).toBe(-13.6);
    expect(barnDoor.xMax).toBe(-9.8);
    expect(barnTrack.xMin).toBe(-15.4);
    expect(barnTrack.xMax).toBe(-8.0);
    expect(fixtureCenter(barnTrack).y).toBeCloseTo(7.35, 2);

    // Recessed wet-bar nook on far right (X = -8.2..-3.8, Z = -12.6..-11.0) right against Foyer wall X = -3.5
    expect(wetBarCounter.xMin).toBe(-8.2);
    expect(wetBarCounter.xMax).toBe(-3.8);
    expect(Math.abs(TIER1_ROOMS.foyer.xMin - wetBarCounter.xMax)).toBeLessThanOrEqual(0.35);
    expect(wetBarCounter.zMin).toBe(-12.6);
    expect(wetBarCounter.zMax).toBe(-11.0);

    // Cabinet + bar sink on left, glass-door mini fridge on right, walnut glassware shelves above
    expect(wetBarSink.xMax).toBeLessThanOrEqual(wetBarFridge.xMin);
    expect(fixtureCenter(wetBarSink).x).toBeLessThan(fixtureCenter(wetBarFridge).x);
    expect(wetBarShelves.yMin).toBeGreaterThan(wetBarCounter.yMax);
  });

  it('Walkthrough Fix #2: hugs 13-tread Foyer staircase to Left/West wall rising South-to-North with zero rear shelves and floating wood ledges on Right/East wall', () => {
    const stairsSpec: StaircaseSpec = FOYER_STAIRCASE;
    const stairsFixture = getFixtureById('foyer-staircase');
    const lowerLedge = getFixtureById('foyer-wood-ledge-lower');
    const upperLedge = getFixtureById('foyer-wood-ledge-upper');
    const runnerRug = getFixtureById('foyer-runner-rug');
    const garageDoor = getFixtureById('foyer-garage-door');

    expect(stairsSpec.treadCount).toBe(13);
    expect(stairsSpec.xMin).toBe(-3.5);
    expect(stairsSpec.xMax).toBe(-0.5);
    expect(stairsSpec.xMax).toBeLessThanOrEqual(-0.4);
    expect(stairsFixture.xMax).toBeLessThanOrEqual(-0.4);

    // Rising South (+Z) to North (-Z): zStart > zEnd
    expect(stairsSpec.zStart).toBe(4.6);
    expect(stairsSpec.zEnd).toBe(-10.4);
    expect(stairsSpec.zStart).toBeGreaterThan(stairsSpec.zEnd);
    expect(stairsSpec.yStart).toBe(0.0);
    expect(stairsSpec.yEnd).toBe(8.4);
    expect(stairsSpec.hasRearShelves).toBe(false);

    // All Foyer shelves/ledges must be strictly on the Right/East wall (xMin >= 2.8) and zero shelves behind stairs
    const foyerShelves = TIER1_FIXTURES.filter(
      (f) => f.room === 'foyer' && (f.category === 'shelf' || f.label.toLowerCase().includes('ledge') || f.label.toLowerCase().includes('shelf')),
    );
    expect(foyerShelves).toHaveLength(2);
    for (const ledge of [lowerLedge, upperLedge, ...foyerShelves]) {
      expect(ledge.xMin).toBeGreaterThanOrEqual(2.8);
      expect(ledge.zMin).toBe(0.5);
      expect(ledge.zMax).toBe(4.5);
    }

    // Open East walkway runner rug and interior garage door
    expect(runnerRug.xMin).toBeGreaterThan(stairsFixture.xMax);
    expect(garageDoor.zMin).toBe(-8.5);
    expect(garageDoor.zMax).toBe(-5.8);
  });

  it('Walkthrough Fix #3: keeps Garage South cutaway flush (<= 0.25 ft) with zero floating door panels/rails and charcoal sofa facing North (-Z)', () => {
    const threshold = getFixtureById('garage-south-threshold');
    const sofa = getFixtureById('garage-charcoal-sofa');
    const rug = getFixtureById('garage-pastel-rug');

    expect(threshold.xMin).toBe(5.5);
    expect(threshold.xMax).toBe(21.5);
    expect(threshold.yMax).toBe(0.18);
    expect(threshold.yMax).toBeLessThanOrEqual(0.25);

    // Every Garage fixture or wall near South cutaway (Z >= 10.4, excluding East outer wall) must be <= 0.25 ft high
    const garageSouthFixtures = TIER1_FIXTURES.filter((f) => f.room === 'garage' && f.zMax > 10.4);
    expect(garageSouthFixtures.length).toBeGreaterThan(0);
    for (const item of garageSouthFixtures) {
      expect(item.yMax).toBeLessThanOrEqual(0.25);
    }

    const garageSouthWalls = TIER1_WALLS.filter(
      (w) => w.xMax > 3.7 && w.xMin < 23.5 && w.zMax > 10.5,
    );
    expect(garageSouthWalls.length).toBeGreaterThan(0);
    for (const wall of garageSouthWalls) {
      expect(Math.max(wall.heightStart, wall.heightEnd)).toBeLessThanOrEqual(0.25);
    }

    // Zero floating overhead garage door rails or partial white garage door panels
    for (const f of TIER1_FIXTURES) {
      const lower = f.label.toLowerCase();
      expect(lower).not.toContain('garage door panel');
      expect(lower).not.toContain('overhead garage rail');
    }

    // Charcoal 3-seat sofa sits at X = +9.5..+17.5, Z = +7.4..+10.2 facing North (-Z) toward center rug
    const northFacing: FacingDirection = '-Z';
    expect(sofa.xMin).toBe(9.5);
    expect(sofa.xMax).toBe(17.5);
    expect(sofa.zMin).toBe(7.4);
    expect(sofa.zMax).toBe(10.2);
    expect(sofa.facing).toBe(northFacing);
    expect(fixtureCenter(rug).z).toBeLessThan(fixtureCenter(sofa).z);
  });

  it('Walkthrough Fix #4: enforces Garage North back wall L->R ordering, flush washer/dryer-to-locker join (<= 0.05 ft), and >= 6.0 ft Brock Studios workbench', () => {
    const sink = getFixtureById('garage-utility-sink');
    const washerDryer = getFixtureById('garage-washer-dryer');
    const leftLocker = getFixtureById('garage-locker-left');
    const workbench = getFixtureById('garage-workbench');
    const rightLocker = getFixtureById('garage-locker-right');
    const printer = getFixtureById('garage-ender3-printer');
    const monitor = getFixtureById('garage-cad-monitor');
    const sign = getFixtureById('garage-brock-studios-sign');
    const wireRack = getFixtureById('garage-overhead-wire-rack');

    // Strict L->R ordering: sink < washerDryer <= leftGreenLocker <= workbench <= rightGreenLocker
    expect(sink.xMin).toBe(3.9);
    expect(sink.xMax).toBe(6.2);
    expect(sink.xMax).toBeLessThan(washerDryer.xMin);
    expect(washerDryer.xMin).toBe(6.4);
    expect(washerDryer.xMax).toBe(11.8);
    expect(washerDryer.xMax).toBeLessThanOrEqual(leftLocker.xMin);
    expect(leftLocker.xMin).toBe(11.8);
    expect(leftLocker.xMax).toBe(14.4);
    expect(leftLocker.xMax).toBeLessThanOrEqual(workbench.xMin);
    expect(workbench.xMin).toBe(14.4);
    expect(workbench.xMax).toBe(20.8);
    expect(workbench.xMax).toBeLessThanOrEqual(rightLocker.xMin);
    expect(rightLocker.xMin).toBe(20.8);
    expect(rightLocker.xMax).toBe(23.3);

    // Zero dead gap (<= 0.05 ft) across continuous laundry -> locker -> studio -> NE locker run
    expect(Math.abs(leftLocker.xMin - washerDryer.xMax)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(workbench.xMin - leftLocker.xMax)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(rightLocker.xMin - workbench.xMax)).toBeLessThanOrEqual(0.05);
    expect(TIER1_ROOMS.garage.xMax - rightLocker.xMax).toBeLessThanOrEqual(0.25);

    // Extended workbench width >= 6.0 ft (6.4 ft) with studio gear mounted above/within span
    const benchDimensions = fixtureSize(workbench);
    expect(benchDimensions.x).toBeCloseTo(6.4, 5);
    expect(benchDimensions.x).toBeGreaterThanOrEqual(6.0);

    for (const studioItem of [printer, monitor, sign, wireRack]) {
      expect(studioItem.xMin).toBeGreaterThanOrEqual(workbench.xMin);
      expect(studioItem.xMax).toBeLessThanOrEqual(workbench.xMax);
      expect(studioItem.yMin).toBeGreaterThanOrEqual(workbench.yMax);
    }
  });
});

describe('tier1LayoutSpec — Remaining Wall Fixtures, Three.js Helpers & Zero Floor AABB Collisions', () => {
  it('places remaining Office & Garage fixtures on exact West, South, East, and Center coordinates', () => {
    const bed = getFixtureById('office-guest-bed');
    const cardArt = getFixtureById('office-card-grid-art');
    const trellisRug = getFixtureById('office-trellis-rug');
    const swBookcase = getFixtureById('office-bookcase-sw');
    const wrigleyPrints = getFixtureById('office-wrigley-prints');
    const windowSill = getFixtureById('office-south-window-sill');
    const desk = getFixtureById('office-desk');
    const chair = getFixtureById('office-task-chair');
    const consoleUnit = getFixtureById('office-media-console');
    const wallTv = getFixtureById('office-wall-tv');
    const seDoorway = getFixtureById('office-foyer-doorway');
    const pegboard = getFixtureById('garage-pegboard-bins');
    const gearRack = getFixtureById('garage-wood-gear-rack');
    const cubbies = getFixtureById('garage-grey-cubbies');

    expect([bed.xMin, bed.xMax, bed.zMin, bed.zMax]).toEqual([-19.8, -13.2, -6.4, -0.6]);
    expect(bed.facing).toBe('+X');
    expect(cardArt.yMin).toBeGreaterThan(bed.yMax);
    expect([trellisRug.xMin, trellisRug.xMax, trellisRug.zMin, trellisRug.zMax]).toEqual([
      -19.5, -11.5, -7.2, 0.4,
    ]);
    expect([swBookcase.zMin, swBookcase.zMax]).toEqual([1.4, 4.2]);
    expect([wrigleyPrints.zMin, wrigleyPrints.zMax]).toEqual([5.6, 9.2]);
    expect([windowSill.xMin, windowSill.xMax]).toEqual([-16.8, -8.8]);
    expect([desk.xMin, desk.xMax, desk.zMin, desk.zMax]).toEqual([-16.4, -11.4, 8.2, 10.4]);
    expect(fixtureCenter(chair).x).toBeCloseTo(-13.9, 5);
    expect(fixtureCenter(chair).z).toBeCloseTo(6.7, 5);
    expect(chair.facing).toBe('+Z');
    expect([consoleUnit.zMin, consoleUnit.zMax]).toEqual([-5.2, -1.2]);
    expect(consoleUnit.facing).toBe('-X');
    expect(wallTv.facing).toBe('-X');
    expect([seDoorway.zMin, seDoorway.zMax]).toEqual([6.4, 9.2]);
    expect([pegboard.zMin, pegboard.zMax]).toEqual([-7.5, -1.5]);
    expect([gearRack.zMin, gearRack.zMax]).toEqual([-0.5, 3.0]);
    expect([cubbies.zMin, cubbies.zMax]).toEqual([3.8, 7.4]);
  });

  it('has zero 2D floor AABB collisions among all solid floor-standing furniture items and validates Three.js Box3 helpers', () => {
    const collisions = findFloorAabbCollisions(TIER1_FIXTURES);
    expect(collisions).toEqual([]);

    const workbenchId: FixtureId = 'garage-workbench';
    const bench: FixtureSpec = getFixtureById(workbenchId);
    const mount: FixtureMountType = bench.mount;
    expect(mount).toBe('floor');

    const box = fixtureToBox3(bench);
    expect(box.min.x).toBe(14.4);
    expect(box.max.x).toBe(20.8);

    // Verify collision detector flags actual overlapping floor AABBs
    const overlappingClone: FixtureSpec = {
      ...bench,
      id: 'garage-locker-left',
      xMin: 15.0,
      xMax: 17.0,
    };
    expect(findFloorAabbCollisions([bench, overlappingClone])).toHaveLength(1);

    // Verify unknown fixture id throws deterministically
    expect(() => getFixtureById('nonexistent-id' as FixtureId)).toThrow(/Unknown Tier 1 fixture id/);
  });
});
