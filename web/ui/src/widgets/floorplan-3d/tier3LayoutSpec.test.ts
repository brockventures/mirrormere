import { describe, expect, it } from 'vitest';
import {
  TIER3_LAYOUT_SPEC,
  doBoundsOverlap2D,
  isBoundsContainedIn,
  type Tier3Bounds2D,
  type Tier3FixtureKey,
  type Tier3FixtureSpec,
  type Tier3FloorMaterial,
  type Tier3LayoutSpec,
  type Tier3RoomId,
  type Tier3RoomSpec,
  type Tier3WallSpec,
} from './tier3LayoutSpec';

describe('tier3LayoutSpec — Envelope, 6 Non-Overlapping Rooms, Stairway Threshold, 18 Walls & 22 Fixtures', () => {
  it('defines the exact 43.5 ft x 22.0 ft Tier 3 envelope and wall height invariants', () => {
    const spec: Tier3LayoutSpec = TIER3_LAYOUT_SPEC;
    expect(spec.widthFt).toBe(43.5);
    expect(spec.depthFt).toBe(22.0);
    expect(spec.xMin).toBe(-20.0);
    expect(spec.xMax).toBe(23.5);
    expect(spec.xMax - spec.xMin).toBeCloseTo(spec.widthFt, 6);
    expect(spec.zMin).toBe(-11.0);
    expect(spec.zMax).toBe(11.0);
    expect(spec.zMax - spec.zMin).toBeCloseTo(spec.depthFt, 6);
    expect(spec.ceilingHeightFt).toBe(8.5);
    expect(spec.backWallHeightFt).toBe(6.6);
    expect(spec.cutawayWallHeightFt).toBe(4.8);
    expect(spec.interiorWallHeightFt).toBe(4.4);
    expect(spec.wallThicknessFt).toBe(0.45);
  });

  it('defines all 6 mutually non-overlapping Tier 3 rooms partitioning the full envelope', () => {
    const expectedIds: Tier3RoomId[] = [
      'breakfastNook',
      'kitchen',
      'hallBath',
      'upperHall',
      'rosieBedroom',
      'isaacBedroom',
    ];
    expect(Object.keys(TIER3_LAYOUT_SPEC.rooms)).toEqual(expectedIds);

    let totalAreaSqFt = 0;
    for (const id of expectedIds) {
      const room: Tier3RoomSpec = TIER3_LAYOUT_SPEC.rooms[id];
      expect(room.id).toBe(id);
      expect(isBoundsContainedIn(room.bounds, TIER3_LAYOUT_SPEC)).toBe(true);
      totalAreaSqFt += (room.bounds.xMax - room.bounds.xMin) * (room.bounds.zMax - room.bounds.zMin);
    }
    expect(totalAreaSqFt).toBeCloseTo(TIER3_LAYOUT_SPEC.widthFt * TIER3_LAYOUT_SPEC.depthFt, 6);

    const bathMaterial: Tier3FloorMaterial = TIER3_LAYOUT_SPEC.rooms.hallBath.floorMaterial;
    expect(bathMaterial).toBe('slate-tile');
    for (const woodId of ['breakfastNook', 'kitchen', 'upperHall', 'rosieBedroom', 'isaacBedroom'] as const) {
      expect(TIER3_LAYOUT_SPEC.rooms[woodId].floorMaterial).toBe('wood');
    }

    expect(TIER3_LAYOUT_SPEC.rooms.breakfastNook.bounds).toEqual({ xMin: -20.0, xMax: -9.5, zMin: -11.0, zMax: 11.0 });
    expect(TIER3_LAYOUT_SPEC.rooms.kitchen.bounds).toEqual({ xMin: -9.5, xMax: 6.0, zMin: -11.0, zMax: 11.0 });
    expect(TIER3_LAYOUT_SPEC.rooms.hallBath.bounds).toEqual({ xMin: 6.0, xMax: 11.8, zMin: -11.0, zMax: -0.4 });
    expect(TIER3_LAYOUT_SPEC.rooms.upperHall.bounds).toEqual({ xMin: 6.0, xMax: 11.8, zMin: -0.4, zMax: 11.0 });
    expect(TIER3_LAYOUT_SPEC.rooms.rosieBedroom.bounds).toEqual({ xMin: 11.8, xMax: 23.5, zMin: -11.0, zMax: 2.0 });
    expect(TIER3_LAYOUT_SPEC.rooms.isaacBedroom.bounds).toEqual({ xMin: 11.8, xMax: 23.5, zMin: 2.0, zMax: 11.0 });

    for (let i = 0; i < expectedIds.length; i += 1) {
      for (let j = i + 1; j < expectedIds.length; j += 1) {
        const roomA = TIER3_LAYOUT_SPEC.rooms[expectedIds[i]];
        const roomB = TIER3_LAYOUT_SPEC.rooms[expectedIds[j]];
        expect(doBoundsOverlap2D(roomA.bounds, roomB.bounds)).toBe(false);
      }
    }
  });

  it('places the stairsDownToTier2 threshold aligned with the open south doorway gap', () => {
    const stairs: Tier3Bounds2D = TIER3_LAYOUT_SPEC.stairsDownToTier2;
    expect(stairs).toEqual({
      xMin: -3.4,
      xMax: -0.3,
      zMin: 10.6,
      zMax: 11.4,
    });

    const wallById = new Map<string, Tier3WallSpec>(
      TIER3_LAYOUT_SPEC.walls.map((wall: Tier3WallSpec) => [wall.id, wall]),
    );
    const southNook = wallById.get('south-nook-wall');
    const southKitchen = wallById.get('south-kitchen-wall');
    expect(southNook?.x2).toBe(stairs.xMin);
    expect(southKitchen?.x1).toBe(stairs.xMax);
  });

  it('defines all 18 perimeter cutaway, closet, hallway & interior wall segments with Rosie mint and Isaac navy accents', () => {
    expect(TIER3_LAYOUT_SPEC.walls).toHaveLength(18);
    const wallById = new Map<string, Tier3WallSpec>(
      TIER3_LAYOUT_SPEC.walls.map((wall: Tier3WallSpec) => [wall.id, wall]),
    );

    expect(wallById.get('west-nook-wall')).toMatchObject({ x1: -20.0, z1: -11.0, x2: -20.0, z2: 11.0, heightFt: 6.6, exteriorFace: 'west' });
    expect(wallById.get('west-nook-window-cutaway')).toBeUndefined();

    expect(wallById.get('north-nook-patio')).toMatchObject({ x1: -20.0, z1: -11.0, x2: -9.5, z2: -11.0, heightFt: 6.6, exteriorFace: 'north' });
    expect(wallById.get('north-kitchen')).toMatchObject({ x1: -9.5, z1: -11.0, x2: 6.0, z2: -11.0, heightFt: 6.6, exteriorFace: 'north' });
    expect(wallById.get('north-hall-bath')).toMatchObject({ x1: 6.0, z1: -11.0, x2: 11.8, z2: -11.0, heightFt: 6.6, exteriorFace: 'north' });
    expect(wallById.get('north-rosie-mint')).toMatchObject({ x1: 11.8, z1: -11.0, x2: 23.5, z2: -11.0, heightFt: 6.6, colorHex: 0x42a88c, exteriorFace: 'north' });

    expect(wallById.get('east-rosie-mint')).toMatchObject({ x1: 23.5, z1: -11.0, x2: 23.5, z2: 2.0, heightFt: 6.6, colorHex: 0x42a88c, exteriorFace: 'east' });
    expect(wallById.get('east-isaac-navy')).toMatchObject({ x1: 23.5, z1: 2.0, x2: 23.5, z2: 11.0, heightFt: 4.8, colorHex: 0x2f5573, exteriorFace: 'east' });

    expect(wallById.get('south-nook-wall')).toMatchObject({ x1: -20.0, z1: 11.0, x2: -3.4, z2: 11.0, heightFt: 4.6, exteriorFace: 'south' });
    expect(wallById.get('south-kitchen-wall')).toMatchObject({ x1: -0.3, z1: 11.0, x2: 11.8, z2: 11.0, heightFt: 4.6, exteriorFace: 'south' });
    expect(wallById.get('south-isaac-cutaway')).toMatchObject({ x1: 11.8, z1: 11.0, x2: 23.5, z2: 11.0, heightFt: 1.8, colorHex: 0x2f5573, exteriorFace: 'south' });

    expect(wallById.get('kitchen-bath-west')).toMatchObject({ x1: 6.0, z1: -11.0, x2: 6.0, z2: -0.4, heightFt: 4.6, thicknessFt: 0.35 });
    expect(wallById.get('hall-bath-south')).toMatchObject({ x1: 6.0, z1: -0.4, x2: 8.6, z2: -0.4, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('bath-rosie-divider')).toMatchObject({ x1: 11.8, z1: -11.0, x2: 11.8, z2: -0.4, heightFt: 4.6, thicknessFt: 0.35, colorHex: 0x42a88c });
    expect(wallById.get('pantry-north-wall')).toMatchObject({ x1: 6.0, z1: 3.8, x2: 8.6, z2: 3.8, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('pantry-back-divider')).toMatchObject({ x1: 8.6, z1: 3.8, x2: 8.6, z2: 11.0, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('isaac-closet-north')).toBeUndefined();
    expect(wallById.get('isaac-closet-east')).toMatchObject({ x1: 11.8, z1: 7.2, x2: 11.8, z2: 11.0, heightFt: 4.4, thicknessFt: 0.35, colorHex: 0x2f5573 });
    expect(wallById.get('rosie-isaac-divider')).toMatchObject({ x1: 11.8, z1: 2.0, x2: 23.5, z2: 2.0, heightFt: 4.6, thicknessFt: 0.35, colorHex: 0x2f5573 });
    expect(wallById.get('rosie-closet-west')).toMatchObject({ x1: 17.6, z1: 0.0, x2: 17.6, z2: 2.0, heightFt: 4.4, thicknessFt: 0.35, colorHex: 0x42a88c });

    for (const interiorId of [
      'kitchen-bath-west',
      'hall-bath-south',
      'bath-rosie-divider',
      'pantry-north-wall',
      'pantry-back-divider',
      'isaac-closet-east',
      'rosie-isaac-divider',
      'rosie-closet-west',
    ]) {
      expect(wallById.get(interiorId)?.exteriorFace).toBeUndefined();
    }
  });

  it('contains all 22 fixtures strictly inside their assigned room bounds and overall Tier 3 envelope', () => {
    const fixtureEntries = Object.entries(TIER3_LAYOUT_SPEC.fixtures) as Array<[Tier3FixtureKey, Tier3FixtureSpec]>;
    expect(fixtureEntries).toHaveLength(22);

    for (const [key, fixture] of fixtureEntries) {
      expect(fixture.id).toBe(key);
      expect(fixture.heightFt).toBeGreaterThan(0);
      expect(fixture.xMax).toBeGreaterThan(fixture.xMin);
      expect(fixture.zMax).toBeGreaterThan(fixture.zMin);
      const assignedRoom = TIER3_LAYOUT_SPEC.rooms[fixture.roomId];
      expect(isBoundsContainedIn(fixture, assignedRoom.bounds)).toBe(true);
      expect(isBoundsContainedIn(fixture, TIER3_LAYOUT_SPEC)).toBe(true);
    }

    const f = TIER3_LAYOUT_SPEC.fixtures;
    expect(f.diningTableSet).toMatchObject({ roomId: 'breakfastNook', xMin: -17.6, xMax: -10.4, zMin: 1.8, zMax: 7.4, heightFt: 2.9 });
    expect(f.nookWhiteBuffet).toMatchObject({ roomId: 'breakfastNook', xMin: -19.8, xMax: -18.0, zMin: -9.2, zMax: -4.6, heightFt: 5.4 });
    expect(f.hearthWallDisplay).toMatchObject({ roomId: 'breakfastNook', xMin: -19.2, xMax: -9.8, zMin: 9.2, zMax: 10.8, heightFt: 5.0 });

    expect(f.northKitchenCounters).toMatchObject({ roomId: 'kitchen', xMin: -9.4, xMax: 5.7, zMin: -10.8, zMax: -6.8, heightFt: 6.2 });
    expect(f.kitchenIsland.zMin - f.northKitchenCounters.zMax).toBeGreaterThan(3.0);
    expect(f.eastRangeAndHood).toMatchObject({ roomId: 'kitchen', xMin: 3.3, xMax: 5.7, zMin: -8.6, zMax: -4.0, heightFt: 6.5 });
    expect(f.stainlessFridge).toMatchObject({ roomId: 'kitchen', xMin: 2.8, xMax: 5.7, zMin: -3.8, zMax: -0.5, heightFt: 6.2 });
    expect(f.stainlessFridge.zMax).toBeLessThanOrEqual(TIER3_LAYOUT_SPEC.rooms.hallBath.bounds.zMax);
    expect(doBoundsOverlap2D(f.eastRangeAndHood, f.stainlessFridge)).toBe(false);
    expect(f.kitchenIsland).toMatchObject({ roomId: 'kitchen', xMin: -8.3, xMax: 0.9, zMin: -3.7, zMax: 1.8, heightFt: 3.1 });
    expect(f.playKitchenCorner).toMatchObject({ roomId: 'kitchen', xMin: 0.6, xMax: 5.2, zMin: 8.2, zMax: 10.7, heightFt: 4.4 });

    expect(f.tallWhitePantry).toMatchObject({ roomId: 'upperHall', xMin: 6.1, xMax: 8.4, zMin: 4.0, zMax: 10.8, heightFt: 6.2 });
    expect(f.tallWhitePantry.xMax).toBeLessThan(8.6);
    expect(f.tallWhitePantry.zMin).toBeGreaterThan(3.8);
    expect(f.tallWhitePantry.zMax).toBeLessThan(11.0);

    expect(f.hallBathTub).toMatchObject({ roomId: 'hallBath', xMin: 6.2, xMax: 11.6, zMin: -10.8, zMax: -7.6, heightFt: 5.8 });
    expect(f.hallBathVanity).toMatchObject({ roomId: 'hallBath', xMin: 6.2, xMax: 8.2, zMin: -6.6, zMax: -3.4, heightFt: 5.6 });
    expect(f.hallBathToilet).toMatchObject({ roomId: 'hallBath', xMin: 6.2, xMax: 7.8, zMin: -2.8, zMax: -0.6, heightFt: 4.2 });

    expect(f.rosieTwinBed).toMatchObject({ roomId: 'rosieBedroom', xMin: 16.2, xMax: 23.2, zMin: -7.8, zMax: -3.4, heightFt: 3.2 });
    expect(f.rosieRainbowAndMap).toMatchObject({ roomId: 'rosieBedroom', xMin: 21.95, xMax: 23.4, zMin: -7.6, zMax: 0.1, heightFt: 5.8 });
    expect(f.rosieRoundRug).toMatchObject({ roomId: 'rosieBedroom', xMin: 14.0, xMax: 20.2, zMin: -4.6, zMax: 0.0, heightFt: 0.04 });
    expect(f.rosieWhiteDresser).toMatchObject({ roomId: 'rosieBedroom', xMin: 12.0, xMax: 13.8, zMin: -7.2, zMax: -2.4, heightFt: 2.9 });
    expect(f.rosieClosetAndDollhouse).toMatchObject({ roomId: 'rosieBedroom', xMin: 14.8, xMax: 23.2, zMin: 0.0, zMax: 1.8, heightFt: 4.5 });
    expect(f.rosieClosetAndDollhouse.zMax).toBeLessThanOrEqual(2.0);

    expect(f.isaacWoodCrib).toMatchObject({ roomId: 'isaacBedroom', xMin: 12.1, xMax: 16.5, zMin: 8.3, zMax: 10.7, heightFt: 3.4 });
    expect(f.isaacWoodCrib.xMax - f.isaacWoodCrib.xMin).toBeCloseTo(4.4, 6);
    expect(f.isaacWoodCrib.zMax - f.isaacWoodCrib.zMin).toBeCloseTo(2.4, 6);
    expect(doBoundsOverlap2D(f.isaacWoodCrib, f.isaacPlayCouch)).toBe(false);
    expect(doBoundsOverlap2D(f.isaacWoodCrib, f.isaacStarPlayMat)).toBe(false);
    expect(doBoundsOverlap2D(f.isaacWalnutDresser, f.isaacStarPlayMat)).toBe(false);
    expect(doBoundsOverlap2D(f.isaacGliderAndOttoman, f.isaacStarPlayMat)).toBe(false);
    expect(doBoundsOverlap2D(f.kitchenIsland, f.eastRangeAndHood)).toBe(false);
    expect(doBoundsOverlap2D(f.kitchenIsland, f.stainlessFridge)).toBe(false);
    expect(f.isaacWalnutDresser).toMatchObject({ roomId: 'isaacBedroom', xMin: 13.0, xMax: 19.2, zMin: 2.2, zMax: 4.2, heightFt: 4.4 });
    expect(f.isaacGliderAndOttoman).toMatchObject({ roomId: 'isaacBedroom', xMin: 19.6, xMax: 23.1, zMin: 2.2, zMax: 6.0, heightFt: 3.1 });
    expect(f.isaacPlayCouch).toMatchObject({ roomId: 'isaacBedroom', xMin: 16.8, xMax: 22.6, zMin: 8.4, zMax: 10.7, heightFt: 2.0 });
    expect(f.isaacStarPlayMat).toMatchObject({ roomId: 'isaacBedroom', xMin: 14.4, xMax: 19.4, zMin: 4.5, zMax: 8.1, heightFt: 0.04 });
  });

  it('validates bounds helper edge cases', () => {
    expect(doBoundsOverlap2D({ xMin: 0, xMax: 5, zMin: 0, zMax: 5 }, { xMin: 5, xMax: 10, zMin: 0, zMax: 5 })).toBe(false);
    expect(doBoundsOverlap2D({ xMin: 0, xMax: 6, zMin: 0, zMax: 5 }, { xMin: 5, xMax: 10, zMin: 0, zMax: 5 })).toBe(true);
    expect(isBoundsContainedIn({ xMin: 0, xMax: 5, zMin: 0, zMax: 5 }, { xMin: 0, xMax: 5, zMin: 0, zMax: 5 })).toBe(true);
    expect(isBoundsContainedIn({ xMin: -0.1, xMax: 5, zMin: 0, zMax: 5 }, { xMin: 0, xMax: 5, zMin: 0, zMax: 5 })).toBe(false);
  });
});
