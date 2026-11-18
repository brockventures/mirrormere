import { describe, expect, it } from 'vitest';
import {
  TIER2_LAYOUT_SPEC,
  doBoundsOverlap2D,
  isBoundsContainedIn,
  type Tier2Bounds2D,
  type Tier2FixtureKey,
  type Tier2FixtureSpec,
  type Tier2FloorMaterial,
  type Tier2LayoutSpec,
  type Tier2RoomId,
  type Tier2RoomSpec,
  type Tier2StairsUpSpec,
  type Tier2WallSpec,
} from './tier2LayoutSpec';

describe('tier2LayoutSpec — Envelope, 7 Non-Overlapping Rooms, Side-by-Side Stairs/Void, Walls & 29 Fixtures', () => {
  it('defines the exact 43.5 ft x 22.0 ft Tier 2 envelope and ceiling/cutaway heights', () => {
    const spec: Tier2LayoutSpec = TIER2_LAYOUT_SPEC;
    expect(spec.widthFt).toBe(43.5);
    expect(spec.depthFt).toBe(22.0);
    expect(spec.xMin).toBe(-20.0);
    expect(spec.xMax).toBe(23.5);
    expect(spec.xMax - spec.xMin).toBeCloseTo(spec.widthFt, 6);
    expect(spec.zMin).toBe(-11.0);
    expect(spec.zMax).toBe(11.0);
    expect(spec.zMax - spec.zMin).toBeCloseTo(spec.depthFt, 6);
    expect(spec.ceilingHeightFt).toBe(8.5);
    expect(spec.cutawayWallHeightFt).toBe(4.8);
    expect(spec.interiorWallHeightFt).toBe(4.0);
    expect(spec.wallThicknessFt).toBe(0.45);
  });

  it('defines all 7 mutually non-overlapping Tier 2 rooms partitioning the full envelope', () => {
    const expectedIds: Tier2RoomId[] = [
      'livingRoom',
      'playNook',
      'stairLanding',
      'hallway',
      'powderRoom',
      'primaryBedroom',
      'primaryBath',
    ];
    expect(Object.keys(TIER2_LAYOUT_SPEC.rooms)).toEqual(expectedIds);

    let totalAreaSqFt = 0;
    for (const id of expectedIds) {
      const room: Tier2RoomSpec = TIER2_LAYOUT_SPEC.rooms[id];
      expect(room.id).toBe(id);
      expect(isBoundsContainedIn(room.bounds, TIER2_LAYOUT_SPEC)).toBe(true);
      totalAreaSqFt += (room.bounds.xMax - room.bounds.xMin) * (room.bounds.zMax - room.bounds.zMin);
    }
    expect(totalAreaSqFt).toBeCloseTo(TIER2_LAYOUT_SPEC.widthFt * TIER2_LAYOUT_SPEC.depthFt, 6);

    const bathMaterial: Tier2FloorMaterial = TIER2_LAYOUT_SPEC.rooms.primaryBath.floorMaterial;
    expect(bathMaterial).toBe('slate-tile');
    for (const woodId of ['livingRoom', 'playNook', 'stairLanding', 'hallway', 'powderRoom', 'primaryBedroom'] as const) {
      expect(TIER2_LAYOUT_SPEC.rooms[woodId].floorMaterial).toBe('wood');
    }

    expect(TIER2_LAYOUT_SPEC.rooms.powderRoom.bounds).toEqual({ xMin: 3.5, xMax: 8.5, zMin: -11.0, zMax: -5.5 });
    expect(TIER2_LAYOUT_SPEC.rooms.hallway.bounds).toEqual({ xMin: 3.5, xMax: 8.5, zMin: -5.5, zMax: 11.0 });
    expect(TIER2_LAYOUT_SPEC.rooms.primaryBath.bounds).toEqual({ xMin: 8.5, xMax: 23.5, zMin: -11.0, zMax: -2.5 });
    expect(TIER2_LAYOUT_SPEC.rooms.primaryBedroom.bounds).toEqual({ xMin: 8.5, xMax: 23.5, zMin: -2.5, zMax: 11.0 });

    for (let i = 0; i < expectedIds.length; i += 1) {
      for (let j = i + 1; j < expectedIds.length; j += 1) {
        const roomA = TIER2_LAYOUT_SPEC.rooms[expectedIds[i]];
        const roomB = TIER2_LAYOUT_SPEC.rooms[expectedIds[j]];
        expect(doBoundsOverlap2D(roomA.bounds, roomB.bounds)).toBe(false);
      }
    }
  });

  it('places the 7-tread staircase up to Tier 3 and stairwell void from Tier 1 side-by-side on the North without overlapping', () => {
    const stairsUpToTier3: Tier2StairsUpSpec = TIER2_LAYOUT_SPEC.stairsUpToTier3;
    const stairwellVoidFromTier1: Tier2Bounds2D = TIER2_LAYOUT_SPEC.stairwellVoidFromTier1;
    expect(stairsUpToTier3).toEqual({
      xMin: -3.4,
      xMax: -0.15,
      zMin: -10.6,
      zMax: -4.6,
      stepCount: 7,
      bottomElevationFt: 0.0,
      topElevationFt: 4.55,
      direction: '-z',
    });
    expect(stairwellVoidFromTier1).toEqual({
      xMin: 0.15,
      xMax: 3.3,
      zMin: -10.6,
      zMax: -4.4,
    });
    expect(doBoundsOverlap2D(stairsUpToTier3, stairwellVoidFromTier1)).toBe(false);
    expect(isBoundsContainedIn(stairsUpToTier3, TIER2_LAYOUT_SPEC.rooms.stairLanding.bounds)).toBe(true);
    expect(isBoundsContainedIn(stairwellVoidFromTier1, TIER2_LAYOUT_SPEC.rooms.stairLanding.bounds)).toBe(true);
  });

  it('defines all 19 cutaway and interior wall segments with Play Nook south wall, centered bath doorway, and enclosed walk-in closet partitions', () => {
    expect(TIER2_LAYOUT_SPEC.walls).toHaveLength(19);
    const wallById = new Map<string, Tier2WallSpec>(
      TIER2_LAYOUT_SPEC.walls.map((wall: Tier2WallSpec) => [wall.id, wall]),
    );

    expect(wallById.has('play-nook-east-partition')).toBe(false);
    expect(wallById.has('primary-bath-south-east')).toBe(false);
    expect(wallById.has('south-front-cutaway')).toBe(false);
    expect(wallById.get('living-stair-west-wall')).toMatchObject({ x1: -3.5, z1: -11.0, x2: -3.5, z2: -4.4, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('stairwell-center-divider')).toMatchObject({ x1: 0.0, z1: -10.8, x2: 0.0, z2: -4.4, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('north-living-accent')).toMatchObject({ x1: -20.0, z1: -11.0, x2: -3.5, z2: -11.0, colorHex: 0x38434f });
    expect(wallById.get('stairwell-north-accent')).toMatchObject({ x1: -3.5, z1: -11.0, x2: 3.5, z2: -11.0, colorHex: 0x353d47 });
    expect(wallById.get('walk-in-closet-north')).toMatchObject({ x1: 4.5, z1: 2.5, x2: 8.5, z2: 2.5, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('walk-in-closet-west')).toMatchObject({ x1: 4.5, z1: 2.5, x2: 4.5, z2: 11.0, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('primary-bedroom-west')).toMatchObject({ x1: 8.5, z1: 0.2, x2: 8.5, z2: 3.6, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('primary-bath-south-west')).toEqual({
      id: 'primary-bath-south-west',
      x1: 8.5,
      z1: -2.5,
      x2: 13.0,
      z2: -2.5,
      heightFt: 4.6,
      thicknessFt: 0.35,
      colorHex: 0x1f3b33,
    });
    expect(wallById.get('primary-west-green-accent')).toEqual({
      id: 'primary-west-green-accent',
      x1: 15.6,
      z1: -2.5,
      x2: 23.5,
      z2: -2.5,
      heightFt: 4.6,
      thicknessFt: 0.35,
      colorHex: 0x1f3b33,
    });
    expect(wallById.get('primary-bath-north-marble')?.colorHex).toBe(0xebeef2);
    expect(wallById.get('primary-bath-east-marble')?.colorHex).toBe(0xebeef2);
    expect(wallById.get('south-living-window-cutaway')).toMatchObject({ x1: -20.0, z1: 11.0, x2: -11.5, z2: 11.0, heightFt: 2.2 });
    expect(wallById.get('south-playnook-wall')).toMatchObject({ x1: -11.5, z1: 11.0, x2: 4.5, z2: 11.0, heightFt: 4.6 });
    expect(wallById.get('south-primary-cutaway')).toMatchObject({ x1: 4.5, z1: 11.0, x2: 23.5, z2: 11.0, heightFt: 2.2 });
  });

  it('contains all 29 fixtures strictly inside their assigned room bounds and overall Tier 2 envelope with audited positions', () => {
    const fixtureEntries = Object.entries(TIER2_LAYOUT_SPEC.fixtures) as Array<[Tier2FixtureKey, Tier2FixtureSpec]>;
    expect(fixtureEntries).toHaveLength(29);

    for (const [key, fixture] of fixtureEntries) {
      expect(fixture.id).toBe(key);
      expect(fixture.heightFt).toBeGreaterThan(0);
      expect(fixture.xMax).toBeGreaterThan(fixture.xMin);
      expect(fixture.zMax).toBeGreaterThan(fixture.zMin);
      const assignedRoom = TIER2_LAYOUT_SPEC.rooms[fixture.roomId];
      expect(isBoundsContainedIn(fixture, assignedRoom.bounds)).toBe(true);
      expect(isBoundsContainedIn(fixture, TIER2_LAYOUT_SPEC)).toBe(true);
    }

    const f = TIER2_LAYOUT_SPEC.fixtures;
    expect(f.fireplaceHearth).toMatchObject({ roomId: 'livingRoom', xMin: -19.9, xMax: -17.9, zMin: -5.2, zMax: -0.6, heightFt: 4.8 });
    expect(f.cubeStorageShelves).toMatchObject({ roomId: 'playNook', xMin: -11.0, xMax: -6.2, zMin: 9.4, zMax: 10.7, heightFt: 2.8 });
    expect(f.catTree).toMatchObject({ roomId: 'playNook', xMin: -5.8, xMax: -4.0, zMin: 8.8, zMax: 10.6, heightFt: 4.6 });
    expect(f.paperLanternArcLamp).toMatchObject({ roomId: 'playNook', xMin: -4.6, xMax: -3.6, zMin: 7.0, zMax: 8.2, heightFt: 6.2 });
    expect(f.landingBookcase).toMatchObject({ roomId: 'stairLanding', xMin: 0.2, xMax: 3.3, zMin: -4.3, zMax: -3.0, heightFt: 3.0 });
    expect(f.hallwayCabinetAndMap).toMatchObject({ roomId: 'hallway', xMin: 7.1, xMax: 8.4, zMin: -5.0, zMax: -2.6, heightFt: 2.8 });
    expect(f.powderToilet).toMatchObject({ roomId: 'powderRoom', xMin: 3.8, xMax: 5.3, zMin: -9.8, zMax: -7.8, heightFt: 2.5 });
    expect(f.powderVanity).toMatchObject({ roomId: 'powderRoom', xMin: 6.9, xMax: 8.3, zMin: -9.8, zMax: -6.8, heightFt: 2.8 });
    expect(f.bedsideBassinet).toMatchObject({ roomId: 'primaryBedroom', xMin: 16.5, xMax: 19.5, zMin: -2.2, zMax: 0.3, heightFt: 2.8 });
    expect(f.northWoodDresser).toMatchObject({ roomId: 'primaryBedroom', xMin: 8.9, xMax: 12.6, zMin: -2.2, zMax: -0.6, heightFt: 2.8 });
    expect(f.eastChangingDresser).toMatchObject({ roomId: 'primaryBedroom', xMin: 8.7, xMax: 10.4, zMin: 0.4, zMax: 3.4, heightFt: 3.0 });
    expect(f.slidingClosetDoors).toMatchObject({ roomId: 'primaryBedroom', xMin: 8.5, xMax: 9.0, zMin: 3.6, zMax: 10.2, heightFt: 4.4 });
    expect(f.walkInGlassShower).toMatchObject({ roomId: 'primaryBath', xMin: 8.7, xMax: 13.0, zMin: -10.8, zMax: -4.6, heightFt: 4.6 });
    expect(f.walnutDoubleVanity).toMatchObject({ roomId: 'primaryBath', xMin: 16.0, xMax: 22.6, zMin: -10.8, zMax: -8.3, heightFt: 2.9 });
  });
});
