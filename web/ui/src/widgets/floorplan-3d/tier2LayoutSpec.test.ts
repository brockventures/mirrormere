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

describe('tier2LayoutSpec — Envelope, Rooms, Non-Overlap, Stairs, Accent Walls & Fixtures', () => {
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

  it('defines all 7 Tier 2 rooms within the envelope with expected floor materials and non-overlapping main zones', () => {
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

    for (const id of expectedIds) {
      const room: Tier2RoomSpec = TIER2_LAYOUT_SPEC.rooms[id];
      expect(room.id).toBe(id);
      expect(isBoundsContainedIn(room.bounds, TIER2_LAYOUT_SPEC)).toBe(true);
    }

    const bathMaterial: Tier2FloorMaterial = TIER2_LAYOUT_SPEC.rooms.primaryBath.floorMaterial;
    const livingMaterial: Tier2FloorMaterial = TIER2_LAYOUT_SPEC.rooms.livingRoom.floorMaterial;
    expect(bathMaterial).toBe('slate-tile');
    expect(livingMaterial).toBe('wood');
    expect(TIER2_LAYOUT_SPEC.rooms.primaryBedroom.floorMaterial).toBe('wood');

    // Primary partition zones do not overlap (powderRoom is nested inside the NW corner of the stairLanding column)
    const primaryZones: Tier2RoomId[] = [
      'livingRoom',
      'playNook',
      'stairLanding',
      'hallway',
      'primaryBedroom',
      'primaryBath',
    ];
    for (let i = 0; i < primaryZones.length; i += 1) {
      for (let j = i + 1; j < primaryZones.length; j += 1) {
        const roomA = TIER2_LAYOUT_SPEC.rooms[primaryZones[i]];
        const roomB = TIER2_LAYOUT_SPEC.rooms[primaryZones[j]];
        expect(doBoundsOverlap2D(roomA.bounds, roomB.bounds)).toBe(false);
      }
    }

    // Powder room does not overlap Living Room, Play Nook, Hallway, Primary Bedroom, or Primary Bath
    for (const otherId of ['livingRoom', 'playNook', 'hallway', 'primaryBedroom', 'primaryBath'] as const) {
      expect(
        doBoundsOverlap2D(TIER2_LAYOUT_SPEC.rooms.powderRoom.bounds, TIER2_LAYOUT_SPEC.rooms[otherId].bounds),
      ).toBe(false);
    }
  });

  it('defines the 7-tread staircase up to Tier 3 and the stairwell void from Tier 1 without overlapping', () => {
    const stairsUpToTier3: Tier2StairsUpSpec = TIER2_LAYOUT_SPEC.stairsUpToTier3;
    const stairwellVoidFromTier1: Tier2Bounds2D = TIER2_LAYOUT_SPEC.stairwellVoidFromTier1;
    expect(stairsUpToTier3.stepCount).toBe(7);
    expect(stairsUpToTier3.direction).toBe('-z');
    expect(stairsUpToTier3.bottomElevationFt).toBe(0.0);
    expect(stairsUpToTier3.topElevationFt).toBe(4.55);
    expect(stairsUpToTier3.xMin).toBe(-3.4);
    expect(stairsUpToTier3.xMax).toBe(0.1);
    expect(stairsUpToTier3.zMin).toBe(-10.6);
    expect(stairsUpToTier3.zMax).toBe(-4.6);

    expect(stairwellVoidFromTier1).toEqual({
      xMin: -0.1,
      xMax: 3.3,
      zMin: -4.4,
      zMax: 2.8,
    });
    expect(doBoundsOverlap2D(stairsUpToTier3, stairwellVoidFromTier1)).toBe(false);
  });

  it('defines all 16 cutaway and interior wall segments with exact accent wall hex colors', () => {
    expect(TIER2_LAYOUT_SPEC.walls).toHaveLength(16);
    const wallById = new Map<string, Tier2WallSpec>(
      TIER2_LAYOUT_SPEC.walls.map((wall: Tier2WallSpec) => [wall.id, wall]),
    );

    expect(wallById.get('north-living-accent')?.colorHex).toBe(0x38434f);
    expect(wallById.get('stairwell-north-accent')?.colorHex).toBe(0x353d47);
    expect(wallById.get('primary-west-green-accent')?.colorHex).toBe(0x1f3b33);
    expect(wallById.get('primary-bath-north-marble')?.colorHex).toBe(0xebeef2);
    expect(wallById.get('primary-bath-east-marble')?.colorHex).toBe(0xebeef2);
    expect(wallById.get('south-front-cutaway')?.heightFt).toBe(2.2);
  });

  it('contains all fixtures strictly inside their assigned room bounds and overall Tier 2 envelope', () => {
    const fixtureEntries = Object.entries(TIER2_LAYOUT_SPEC.fixtures) as Array<[Tier2FixtureKey, Tier2FixtureSpec]>;
    expect(fixtureEntries.length).toBeGreaterThanOrEqual(24);

    for (const [key, fixture] of fixtureEntries) {
      expect(fixture.id).toBe(key);
      expect(fixture.heightFt).toBeGreaterThan(0);
      expect(fixture.xMax).toBeGreaterThan(fixture.xMin);
      expect(fixture.zMax).toBeGreaterThan(fixture.zMin);
      const assignedRoom = TIER2_LAYOUT_SPEC.rooms[fixture.roomId];
      expect(isBoundsContainedIn(fixture, assignedRoom.bounds)).toBe(true);
      expect(isBoundsContainedIn(fixture, TIER2_LAYOUT_SPEC)).toBe(true);
    }
  });
});
