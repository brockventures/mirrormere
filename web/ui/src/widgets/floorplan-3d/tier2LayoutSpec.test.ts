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

describe('tier2LayoutSpec — Envelope, 7 Non-Overlapping Rooms, Side-by-Side Stairs/Void, 21 Walls & 31 Fixtures', () => {
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

    expect(TIER2_LAYOUT_SPEC.rooms.livingRoom.bounds).toEqual({ xMin: -20.0, xMax: -3.5, zMin: -11.0, zMax: 2.5 });
    expect(TIER2_LAYOUT_SPEC.rooms.playNook.bounds).toEqual({ xMin: -20.0, xMax: 5.8, zMin: 2.5, zMax: 11.0 });
    expect(TIER2_LAYOUT_SPEC.rooms.stairLanding.bounds).toEqual({ xMin: -3.5, xMax: 5.8, zMin: -11.0, zMax: 2.5 });
    expect(TIER2_LAYOUT_SPEC.rooms.powderRoom.bounds).toEqual({ xMin: 5.8, xMax: 8.5, zMin: -11.0, zMax: -6.2 });
    expect(TIER2_LAYOUT_SPEC.rooms.hallway.bounds).toEqual({ xMin: 5.8, xMax: 8.5, zMin: -6.2, zMax: 11.0 });
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
      xMax: -0.3,
      zMin: -10.6,
      zMax: -4.6,
      stepCount: 7,
      bottomElevationFt: 0.0,
      topElevationFt: 4.55,
      direction: '-z',
    });
    expect(stairwellVoidFromTier1).toEqual({
      xMin: -0.1,
      xMax: 5.6,
      zMin: -10.6,
      zMax: -4.2,
    });
    expect(doBoundsOverlap2D(stairsUpToTier3, stairwellVoidFromTier1)).toBe(false);
    expect(isBoundsContainedIn(stairsUpToTier3, TIER2_LAYOUT_SPEC.rooms.stairLanding.bounds)).toBe(true);
    expect(isBoundsContainedIn(stairwellVoidFromTier1, TIER2_LAYOUT_SPEC.rooms.stairLanding.bounds)).toBe(true);
  });

  it('defines all 21 cutaway and interior wall segments with hall/reach-in closets, east bath doorway, and east green accent wall', () => {
    expect(TIER2_LAYOUT_SPEC.walls).toHaveLength(21);
    const wallById = new Map<string, Tier2WallSpec>(
      TIER2_LAYOUT_SPEC.walls.map((wall: Tier2WallSpec) => [wall.id, wall]),
    );

    expect(wallById.get('west-living-north')).toMatchObject({ x1: -20.0, z1: -11.0, x2: -20.0, z2: 2.0, heightFt: 6.6, exteriorFace: 'west' });
    expect(wallById.get('west-living-window-cutaway')).toMatchObject({ x1: -20.0, z1: 2.0, x2: -20.0, z2: 11.0, heightFt: 1.8, exteriorFace: 'west' });
    expect(wallById.get('north-living-accent')).toMatchObject({ x1: -20.0, z1: -11.0, x2: -3.5, z2: -11.0, heightFt: 6.6, colorHex: 0x38434f, exteriorFace: 'north' });
    expect(wallById.get('south-living-window-cutaway')).toMatchObject({ x1: -20.0, z1: 11.0, x2: -9.0, z2: 11.0, heightFt: 1.8, exteriorFace: 'south' });
    expect(wallById.get('south-playnook-wall')).toMatchObject({ x1: -9.0, z1: 11.0, x2: 6.2, z2: 11.0, heightFt: 4.6, exteriorFace: 'south' });
    expect(wallById.get('south-primary-cutaway')).toMatchObject({ x1: 6.2, z1: 11.0, x2: 23.5, z2: 11.0, heightFt: 1.8, exteriorFace: 'south' });
    expect(wallById.get('living-stair-west-wall')).toMatchObject({ x1: -3.5, z1: -11.0, x2: -3.5, z2: -4.4, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('stairwell-center-divider')).toMatchObject({ x1: -0.2, z1: -10.8, x2: -0.2, z2: -4.4, heightFt: 4.4, thicknessFt: 0.35 });
    expect(wallById.get('stairwell-north-accent')).toMatchObject({ x1: -3.5, z1: -11.0, x2: 5.8, z2: -11.0, heightFt: 6.6, colorHex: 0x353d47, exteriorFace: 'north' });
    expect(wallById.get('powder-west')).toMatchObject({ x1: 5.8, z1: -11.0, x2: 5.8, z2: -6.2, heightFt: 4.2 });
    expect(wallById.get('powder-south')).toMatchObject({ x1: 5.8, z1: -6.2, x2: 6.6, z2: -6.2, heightFt: 4.2 });
    expect(wallById.get('hall-closet-west')).toMatchObject({ x1: 5.8, z1: 0.2, x2: 5.8, z2: 2.8, heightFt: 4.4 });
    expect(wallById.get('hall-closet-south')).toMatchObject({ x1: 5.8, z1: 2.8, x2: 8.5, z2: 2.8, heightFt: 4.4 });
    expect(wallById.get('reach-in-closet-west')).toMatchObject({ x1: 6.2, z1: 2.8, x2: 6.2, z2: 11.0, heightFt: 4.4 });
    expect(wallById.get('primary-bedroom-west')).toMatchObject({ x1: 8.5, z1: 0.2, x2: 8.5, z2: 2.8, heightFt: 4.4 });
    expect(wallById.get('primary-bath-south')).toMatchObject({ x1: 8.5, z1: -2.5, x2: 19.2, z2: -2.5, heightFt: 4.6 });
    expect(wallById.get('primary-bath-south-east-stub')).toMatchObject({ x1: 22.0, z1: -2.5, x2: 23.5, z2: -2.5, heightFt: 4.6 });
    expect(wallById.get('primary-bath-west')).toMatchObject({ x1: 8.5, z1: -11.0, x2: 8.5, z2: -2.5, heightFt: 4.4 });
    expect(wallById.get('primary-bath-north-marble')).toMatchObject({ x1: 5.8, z1: -11.0, x2: 23.5, z2: -11.0, heightFt: 6.6, colorHex: 0xebeef2, exteriorFace: 'north' });
    expect(wallById.get('primary-bath-east-marble')).toMatchObject({ x1: 23.5, z1: -11.0, x2: 23.5, z2: -2.5, heightFt: 6.6, colorHex: 0xebeef2, exteriorFace: 'east' });
    expect(wallById.get('primary-east-green-accent')).toMatchObject({ x1: 23.5, z1: -2.5, x2: 23.5, z2: 11.0, heightFt: 4.8, colorHex: 0x1f3b33, exteriorFace: 'east' });

    for (const interiorId of [
      'living-stair-west-wall',
      'stairwell-center-divider',
      'powder-west',
      'powder-south',
      'hall-closet-west',
      'hall-closet-south',
      'reach-in-closet-west',
      'primary-bedroom-west',
      'primary-bath-south',
      'primary-bath-south-east-stub',
      'primary-bath-west',
    ]) {
      expect(wallById.get(interiorId)?.exteriorFace).toBeUndefined();
    }
  });

  it('contains all 31 fixtures strictly inside their assigned room bounds and overall Tier 2 envelope with audited positions', () => {
    const fixtureEntries = Object.entries(TIER2_LAYOUT_SPEC.fixtures) as Array<[Tier2FixtureKey, Tier2FixtureSpec]>;
    expect(fixtureEntries).toHaveLength(31);
    expect('babyPlayard' in TIER2_LAYOUT_SPEC.fixtures).toBe(false);
    expect('eastChangingDresser' in TIER2_LAYOUT_SPEC.fixtures).toBe(false);

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
    expect(f.fireplaceHearth).toMatchObject({ roomId: 'livingRoom', xMin: -19.9, xMax: -17.9, zMin: -5.2, zMax: -0.6, heightFt: 6.6 });
    expect(f.cornerTvConsole).toMatchObject({ roomId: 'livingRoom', xMin: -19.6, xMax: -17.0, zMin: -10.4, zMax: -6.2, heightFt: 4.2 });
    expect(f.creamSofa).toMatchObject({ roomId: 'livingRoom', xMin: -8.2, xMax: -4.4, zMin: -8.4, zMax: 0.4, heightFt: 2.9 });
    expect(f.westWindowBench).toMatchObject({ roomId: 'playNook', xMin: -19.7, xMax: -17.8, zMin: 2.8, zMax: 9.4, heightFt: 1.6 });
    expect(f.southWindowBench).toMatchObject({ roomId: 'playNook', xMin: -17.5, xMax: -10.2, zMin: 9.2, zMax: 10.7, heightFt: 1.6 });
    expect(f.creamArmchair).toMatchObject({ roomId: 'playNook', xMin: -9.8, xMax: -6.2, zMin: 4.6, zMax: 8.0, heightFt: 3.0 });
    expect(f.catTree).toMatchObject({ roomId: 'playNook', xMin: -9.4, xMax: -7.6, zMin: 8.8, zMax: 10.6, heightFt: 4.6 });
    expect(f.cubeStorageShelves).toMatchObject({ roomId: 'playNook', xMin: -3.2, xMax: 2.0, zMin: 9.4, zMax: 10.7, heightFt: 2.8 });
    expect(f.playNookEastShelves).toMatchObject({ roomId: 'playNook', xMin: 3.8, xMax: 5.5, zMin: 4.2, zMax: 9.6, heightFt: 2.8 });
    expect(f.playNookArtTable).toMatchObject({ roomId: 'playNook', xMin: -0.6, xMax: 3.2, zMin: 4.8, zMax: 7.6, heightFt: 1.9 });
    expect(f.paperLanternArcLamp).toMatchObject({ roomId: 'playNook', xMin: 2.3, xMax: 3.5, zMin: 9.2, zMax: 10.4, heightFt: 6.4 });
    expect(f.stairwellChandelier).toMatchObject({ roomId: 'stairLanding', xMin: 1.8, xMax: 3.4, zMin: -8.2, zMax: -6.6, heightFt: 6.8 });
    expect(f.landingBookcase).toMatchObject({ roomId: 'stairLanding', xMin: 0.0, xMax: 3.1, zMin: -4.0, zMax: -2.8, heightFt: 3.0 });
    expect(f.hallwayCabinetAndMap).toMatchObject({ roomId: 'hallway', xMin: 7.3, xMax: 8.4, zMin: -5.4, zMax: -3.0, heightFt: 2.8 });
    expect(f.hallwayCloset).toMatchObject({ roomId: 'hallway', xMin: 5.9, xMax: 8.4, zMin: 0.3, zMax: 2.7, heightFt: 4.4 });
    expect(f.powderToilet).toMatchObject({ roomId: 'powderRoom', xMin: 6.0, xMax: 7.2, zMin: -10.7, zMax: -8.8, heightFt: 2.5 });
    expect(f.powderVanity).toMatchObject({ roomId: 'powderRoom', xMin: 7.3, xMax: 8.4, zMin: -8.6, zMax: -6.5, heightFt: 2.8 });
    expect(f.primaryKingBed).toMatchObject({ roomId: 'primaryBedroom', xMin: 12.2, xMax: 18.8, zMin: 4.4, zMax: 10.6, heightFt: 3.8 });
    expect(f.northWoodDresser).toMatchObject({ roomId: 'primaryBedroom', xMin: 10.8, xMax: 16.2, zMin: -2.3, zMax: -0.5, heightFt: 3.0 });
    expect(f.bedroomDesk).toMatchObject({ roomId: 'primaryBedroom', xMin: 20.9, xMax: 23.3, zMin: 7.0, zMax: 10.6, heightFt: 2.6 });
    expect(f.bedsideBassinet).toMatchObject({ roomId: 'primaryBedroom', xMin: 20.8, xMax: 23.1, zMin: 2.2, zMax: 5.4, heightFt: 2.7 });
    expect(f.primaryRoundRug).toMatchObject({ roomId: 'primaryBedroom', xMin: 15.8, xMax: 20.4, zMin: 0.6, zMax: 4.2, heightFt: 0.04 });
    expect(f.slidingClosetDoors).toMatchObject({ roomId: 'primaryBedroom', xMin: 8.5, xMax: 8.9, zMin: 2.9, zMax: 10.4, heightFt: 4.4 });
    expect(f.walkInGlassShower).toMatchObject({ roomId: 'primaryBath', xMin: 8.7, xMax: 13.0, zMin: -10.8, zMax: -2.7, heightFt: 4.6 });
    expect(f.walnutDoubleVanity).toMatchObject({ roomId: 'primaryBath', xMin: 16.0, xMax: 22.6, zMin: -10.8, zMax: -8.3, heightFt: 2.9 });
  });
});
