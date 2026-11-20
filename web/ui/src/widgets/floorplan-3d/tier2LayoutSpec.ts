export type Tier2RoomId =
  | 'livingRoom'
  | 'playNook'
  | 'stairLanding'
  | 'hallway'
  | 'powderRoom'
  | 'primaryBedroom'
  | 'primaryBath';

export type Tier2FloorMaterial = 'wood' | 'slate-tile';

export type Tier2FixtureKey =
  | 'fireplaceHearth'
  | 'cornerTvConsole'
  | 'livingAreaRug'
  | 'creamSofa'
  | 'sofaSideTable'
  | 'creamArmchair'
  | 'pastelOvalWallArt'
  | 'westWindowBench'
  | 'southWindowBench'
  | 'cubeStorageShelves'
  | 'playNookEastShelves'
  | 'playNookArtTable'
  | 'catTree'
  | 'paperLanternArcLamp'
  | 'stairwellChandelier'
  | 'landingBookcase'
  | 'hallwayCabinetAndMap'
  | 'hallwayCloset'
  | 'powderToilet'
  | 'powderVanity'
  | 'primaryKingBed'
  | 'westNightstand'
  | 'eastNightstand'
  | 'bedsideBassinet'
  | 'primaryRoundRug'
  | 'northWoodDresser'
  | 'bedroomDesk'
  | 'slidingClosetDoors'
  | 'walkInGlassShower'
  | 'primaryBathToilet'
  | 'walnutDoubleVanity';

export interface Tier2Bounds2D {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
}

export interface Tier2RoomSpec {
  id: Tier2RoomId;
  label: string;
  bounds: Tier2Bounds2D;
  floorMaterial: Tier2FloorMaterial;
}

export interface Tier2WallSpec {
  id: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  heightFt: number;
  thicknessFt: number;
  colorHex?: number;
  exteriorFace?: 'north' | 'south' | 'west' | 'east';
}

export interface Tier2StairsUpSpec extends Tier2Bounds2D {
  stepCount: number;
  bottomElevationFt: number;
  topElevationFt: number;
  direction: '-z';
}

export interface Tier2FixtureSpec extends Tier2Bounds2D {
  id: Tier2FixtureKey;
  roomId: Tier2RoomId;
  label: string;
  heightFt: number;
}

export interface Tier2LayoutSpec {
  widthFt: number;
  depthFt: number;
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  ceilingHeightFt: number;
  cutawayWallHeightFt: number;
  interiorWallHeightFt: number;
  wallThicknessFt: number;
  rooms: Readonly<Record<Tier2RoomId, Tier2RoomSpec>>;
  walls: readonly Tier2WallSpec[];
  stairsUpToTier3: Tier2StairsUpSpec;
  stairwellVoidFromTier1: Tier2Bounds2D;
  fixtures: Readonly<Record<Tier2FixtureKey, Tier2FixtureSpec>>;
}

export const TIER2_LAYOUT_SPEC: Tier2LayoutSpec = {
  widthFt: 43.5,
  depthFt: 22.0,
  xMin: -20.0,
  xMax: 23.5,
  zMin: -11.0,
  zMax: 11.0,
  ceilingHeightFt: 8.5,
  cutawayWallHeightFt: 4.8,
  interiorWallHeightFt: 4.0,
  wallThicknessFt: 0.45,
  rooms: {
    livingRoom: {
      id: 'livingRoom',
      label: 'Living Room',
      bounds: { xMin: -20.0, xMax: -3.5, zMin: -11.0, zMax: 2.5 },
      floorMaterial: 'wood',
    },
    playNook: {
      id: 'playNook',
      label: 'Play / Nook Zone',
      bounds: { xMin: -20.0, xMax: 5.8, zMin: 2.5, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    stairLanding: {
      id: 'stairLanding',
      label: 'Stair Landing',
      bounds: { xMin: -3.5, xMax: 5.8, zMin: -11.0, zMax: 2.5 },
      floorMaterial: 'wood',
    },
    hallway: {
      id: 'hallway',
      label: 'Central Hallway',
      bounds: { xMin: 5.8, xMax: 8.5, zMin: -6.2, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    powderRoom: {
      id: 'powderRoom',
      label: 'Powder Bath',
      bounds: { xMin: 5.8, xMax: 8.5, zMin: -11.0, zMax: -6.2 },
      floorMaterial: 'wood',
    },
    primaryBedroom: {
      id: 'primaryBedroom',
      label: 'Primary Bedroom',
      bounds: { xMin: 8.5, xMax: 23.5, zMin: -2.5, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    primaryBath: {
      id: 'primaryBath',
      label: 'Primary En-Suite Bath',
      bounds: { xMin: 8.5, xMax: 23.5, zMin: -11.0, zMax: -2.5 },
      floorMaterial: 'slate-tile',
    },
  },
  walls: [
    { id: 'west-living-north', x1: -20.0, z1: -11.0, x2: -20.0, z2: 2.0, heightFt: 8.5, thicknessFt: 0.45, exteriorFace: 'west' },
    { id: 'west-living-window-cutaway', x1: -20.0, z1: 2.0, x2: -20.0, z2: 11.0, heightFt: 1.8, thicknessFt: 0.45, exteriorFace: 'west' },
    { id: 'north-living-accent', x1: -20.0, z1: -11.0, x2: -3.5, z2: -11.0, heightFt: 8.5, thicknessFt: 0.45, colorHex: 0x38434f, exteriorFace: 'north' },
    { id: 'south-living-window-cutaway', x1: -20.0, z1: 11.0, x2: -9.0, z2: 11.0, heightFt: 1.8, thicknessFt: 0.45, exteriorFace: 'south' },
    { id: 'south-playnook-wall', x1: -9.0, z1: 11.0, x2: 6.2, z2: 11.0, heightFt: 4.6, thicknessFt: 0.45, exteriorFace: 'south' },
    { id: 'south-primary-cutaway', x1: 6.2, z1: 11.0, x2: 23.5, z2: 11.0, heightFt: 1.8, thicknessFt: 0.45, exteriorFace: 'south' },
    { id: 'living-stair-west-wall', x1: -3.5, z1: -11.0, x2: -3.5, z2: -4.4, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'stairwell-center-divider', x1: -0.2, z1: -10.8, x2: -0.2, z2: -4.4, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'stairwell-north-accent', x1: -3.5, z1: -11.0, x2: 5.8, z2: -11.0, heightFt: 8.5, thicknessFt: 0.45, colorHex: 0x353d47, exteriorFace: 'north' },
    { id: 'powder-west', x1: 5.8, z1: -11.0, x2: 5.8, z2: -6.2, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'powder-south', x1: 5.8, z1: -6.2, x2: 6.6, z2: -6.2, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'hall-closet-west', x1: 5.8, z1: 0.2, x2: 5.8, z2: 2.8, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'hall-closet-south', x1: 5.8, z1: 2.8, x2: 8.5, z2: 2.8, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'reach-in-closet-west', x1: 6.2, z1: 2.8, x2: 6.2, z2: 11.0, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'primary-bedroom-west', x1: 8.5, z1: 0.2, x2: 8.5, z2: 2.8, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'primary-bath-south', x1: 8.5, z1: -2.5, x2: 19.2, z2: -2.5, heightFt: 4.6, thicknessFt: 0.35 },
    { id: 'primary-bath-south-east-stub', x1: 22.0, z1: -2.5, x2: 23.5, z2: -2.5, heightFt: 4.6, thicknessFt: 0.35 },
    { id: 'primary-bath-west', x1: 8.5, z1: -11.0, x2: 8.5, z2: -2.5, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'primary-bath-north-marble', x1: 5.8, z1: -11.0, x2: 23.5, z2: -11.0, heightFt: 8.5, thicknessFt: 0.45, colorHex: 0xebeef2, exteriorFace: 'north' },
    { id: 'primary-bath-east-marble', x1: 23.5, z1: -11.0, x2: 23.5, z2: -2.5, heightFt: 8.5, thicknessFt: 0.45, colorHex: 0xebeef2, exteriorFace: 'east' },
    { id: 'primary-east-green-accent', x1: 23.5, z1: -2.5, x2: 23.5, z2: 11.0, heightFt: 4.8, thicknessFt: 0.45, colorHex: 0x1f3b33, exteriorFace: 'east' },
  ],
  stairsUpToTier3: {
    xMin: -3.4,
    xMax: -0.3,
    zMin: -10.6,
    zMax: -4.6,
    stepCount: 7,
    bottomElevationFt: 0.0,
    topElevationFt: 4.55,
    direction: '-z',
  },
  stairwellVoidFromTier1: {
    xMin: -0.1,
    xMax: 5.6,
    zMin: -10.6,
    zMax: -4.2,
  },
  fixtures: {
    fireplaceHearth: { id: 'fireplaceHearth', roomId: 'livingRoom', label: 'Fireplace Hearth & Mantel', xMin: -19.9, xMax: -17.9, zMin: -5.2, zMax: -0.6, heightFt: 4.8 },
    cornerTvConsole: { id: 'cornerTvConsole', roomId: 'livingRoom', label: 'Corner Media Cabinet & TV', xMin: -19.6, xMax: -17.0, zMin: -10.4, zMax: -6.2, heightFt: 4.2 },
    livingAreaRug: { id: 'livingAreaRug', roomId: 'livingRoom', label: 'Living Room Area Rug', xMin: -16.8, xMax: -5.0, zMin: -8.6, zMax: 1.8, heightFt: 0.04 },
    creamSofa: { id: 'creamSofa', roomId: 'livingRoom', label: 'Cream 3-Cushion Sofa', xMin: -8.2, xMax: -4.4, zMin: -8.4, zMax: 0.4, heightFt: 2.9 },
    sofaSideTable: { id: 'sofaSideTable', roomId: 'livingRoom', label: 'Round Wood Side Table', xMin: -7.2, xMax: -5.6, zMin: 0.7, zMax: 2.3, heightFt: 2.0 },
    pastelOvalWallArt: { id: 'pastelOvalWallArt', roomId: 'livingRoom', label: 'Pastel Multi-Oval Wall Art', xMin: -14.8, xMax: -6.2, zMin: -10.9, zMax: -10.5, heightFt: 2.4 },
    westWindowBench: { id: 'westWindowBench', roomId: 'playNook', label: 'West Window Storage Bench', xMin: -19.7, xMax: -17.8, zMin: 2.8, zMax: 9.4, heightFt: 1.6 },
    southWindowBench: { id: 'southWindowBench', roomId: 'playNook', label: 'South Window Storage Bench', xMin: -17.5, xMax: -10.2, zMin: 9.2, zMax: 10.7, heightFt: 1.6 },
    creamArmchair: { id: 'creamArmchair', roomId: 'playNook', label: 'Cream Upholstered Armchair', xMin: -9.8, xMax: -6.2, zMin: 4.6, zMax: 8.0, heightFt: 3.0 },
    catTree: { id: 'catTree', roomId: 'playNook', label: 'Multi-Tier Cream Cat Tree', xMin: -9.4, xMax: -7.6, zMin: 8.8, zMax: 10.6, heightFt: 4.6 },
    cubeStorageShelves: { id: 'cubeStorageShelves', roomId: 'playNook', label: 'White Cube Storage Organizer', xMin: -3.2, xMax: 2.0, zMin: 9.4, zMax: 10.7, heightFt: 2.8 },
    playNookEastShelves: { id: 'playNookEastShelves', roomId: 'playNook', label: 'Play Nook East Toy Shelves', xMin: 3.8, xMax: 5.5, zMin: 4.2, zMax: 9.6, heightFt: 2.8 },
    playNookArtTable: { id: 'playNookArtTable', roomId: 'playNook', label: 'Kids Art Table & Chairs', xMin: -0.6, xMax: 3.2, zMin: 4.8, zMax: 7.6, heightFt: 1.9 },
    paperLanternArcLamp: { id: 'paperLanternArcLamp', roomId: 'playNook', label: 'Paper Lantern Arc Floor Lamp', xMin: 2.3, xMax: 3.5, zMin: 9.2, zMax: 10.4, heightFt: 6.4 },
    stairwellChandelier: { id: 'stairwellChandelier', roomId: 'stairLanding', label: '5-Globe Cascading Chandelier', xMin: 1.8, xMax: 3.4, zMin: -8.2, zMax: -6.6, heightFt: 6.8 },
    landingBookcase: { id: 'landingBookcase', roomId: 'stairLanding', label: 'Dark Espresso Landing Bookcase', xMin: 0.0, xMax: 3.1, zMin: -4.0, zMax: -2.8, heightFt: 3.0 },
    hallwayCabinetAndMap: { id: 'hallwayCabinetAndMap', roomId: 'hallway', label: 'Hallway Cabinet & World Map Art', xMin: 7.3, xMax: 8.4, zMin: -5.4, zMax: -3.0, heightFt: 2.8 },
    hallwayCloset: { id: 'hallwayCloset', roomId: 'hallway', label: 'Hallway Coat Closet', xMin: 5.9, xMax: 8.4, zMin: 0.3, zMax: 2.7, heightFt: 4.4 },
    powderToilet: { id: 'powderToilet', roomId: 'powderRoom', label: 'Powder Room Toilet & Shelves', xMin: 6.0, xMax: 7.2, zMin: -10.7, zMax: -8.8, heightFt: 2.5 },
    powderVanity: { id: 'powderVanity', roomId: 'powderRoom', label: 'Matte-Black Vanity & Arched Mirror', xMin: 7.3, xMax: 8.4, zMin: -8.6, zMax: -6.5, heightFt: 2.8 },
    primaryKingBed: { id: 'primaryKingBed', roomId: 'primaryBedroom', label: 'Primary King Bed', xMin: 12.2, xMax: 18.8, zMin: 4.4, zMax: 10.6, heightFt: 3.8 },
    westNightstand: { id: 'westNightstand', roomId: 'primaryBedroom', label: 'West Nightstand', xMin: 10.2, xMax: 11.9, zMin: 8.8, zMax: 10.5, heightFt: 2.2 },
    eastNightstand: { id: 'eastNightstand', roomId: 'primaryBedroom', label: 'East Nightstand', xMin: 19.1, xMax: 20.8, zMin: 8.8, zMax: 10.5, heightFt: 2.2 },
    bedsideBassinet: { id: 'bedsideBassinet', roomId: 'primaryBedroom', label: 'Bedside Bassinet & Gold Wall Art', xMin: 20.8, xMax: 23.1, zMin: 2.2, zMax: 5.4, heightFt: 2.7 },
    primaryRoundRug: { id: 'primaryRoundRug', roomId: 'primaryBedroom', label: 'Round Textured Cream Rug', xMin: 15.8, xMax: 20.4, zMin: 0.6, zMax: 4.2, heightFt: 0.04 },
    northWoodDresser: { id: 'northWoodDresser', roomId: 'primaryBedroom', label: 'North Dark Wood Dresser & Changing Pad', xMin: 10.8, xMax: 16.2, zMin: -2.3, zMax: -0.5, heightFt: 3.0 },
    bedroomDesk: { id: 'bedroomDesk', roomId: 'primaryBedroom', label: 'Primary Bedroom Desk & Chair', xMin: 20.9, xMax: 23.3, zMin: 7.0, zMax: 10.6, heightFt: 2.6 },
    slidingClosetDoors: { id: 'slidingClosetDoors', roomId: 'primaryBedroom', label: 'White Sliding Closet Doors', xMin: 8.5, xMax: 8.9, zMin: 2.9, zMax: 10.4, heightFt: 4.4 },
    walkInGlassShower: { id: 'walkInGlassShower', roomId: 'primaryBath', label: 'Frameless Walk-In Glass Shower', xMin: 8.7, xMax: 13.0, zMin: -10.8, zMax: -2.7, heightFt: 4.6 },
    primaryBathToilet: { id: 'primaryBathToilet', roomId: 'primaryBath', label: 'Primary Bath Toilet', xMin: 13.6, xMax: 15.4, zMin: -10.7, zMax: -8.6, heightFt: 2.5 },
    walnutDoubleVanity: { id: 'walnutDoubleVanity', roomId: 'primaryBath', label: 'Walnut Double-Sink Vanity & Mirrors', xMin: 16.0, xMax: 22.6, zMin: -10.8, zMax: -8.3, heightFt: 2.9 },
  },
};

export function isBoundsContainedIn(inner: Tier2Bounds2D, outer: Tier2Bounds2D, epsilon = 1e-6): boolean {
  return (
    inner.xMin >= outer.xMin - epsilon &&
    inner.xMax <= outer.xMax + epsilon &&
    inner.zMin >= outer.zMin - epsilon &&
    inner.zMax <= outer.zMax + epsilon
  );
}

export function doBoundsOverlap2D(a: Tier2Bounds2D, b: Tier2Bounds2D, epsilon = 1e-6): boolean {
  const overlapX = a.xMin + epsilon < b.xMax && a.xMax - epsilon > b.xMin;
  const overlapZ = a.zMin + epsilon < b.zMax && a.zMax - epsilon > b.zMin;
  return overlapX && overlapZ;
}
