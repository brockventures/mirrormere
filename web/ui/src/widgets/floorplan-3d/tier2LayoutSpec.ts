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
  | 'southWindowBench'
  | 'cubeStorageShelves'
  | 'babyPlayard'
  | 'catTree'
  | 'paperLanternArcLamp'
  | 'stairwellChandelier'
  | 'landingBookcase'
  | 'hallwayCabinetAndMap'
  | 'powderToilet'
  | 'powderVanity'
  | 'primaryKingBed'
  | 'westNightstand'
  | 'eastNightstand'
  | 'bedsideBassinet'
  | 'primaryRoundRug'
  | 'northWoodDresser'
  | 'eastChangingDresser'
  | 'slidingClosetDoors'
  | 'walkInGlassShower'
  | 'primaryBathToilet'
  | 'walnutDoubleVanity'
  | 'bathLinenCloset';

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
      bounds: { xMin: -20.0, xMax: -3.5, zMin: 2.5, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    stairLanding: {
      id: 'stairLanding',
      label: 'Stair Landing',
      bounds: { xMin: -3.5, xMax: 3.5, zMin: -11.0, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    hallway: {
      id: 'hallway',
      label: 'Central Hallway',
      bounds: { xMin: 3.5, xMax: 6.5, zMin: -11.0, zMax: 4.5 },
      floorMaterial: 'wood',
    },
    powderRoom: {
      id: 'powderRoom',
      label: 'Powder Bath',
      bounds: { xMin: 0.2, xMax: 3.5, zMin: -11.0, zMax: -5.5 },
      floorMaterial: 'wood',
    },
    primaryBedroom: {
      id: 'primaryBedroom',
      label: 'Primary Bedroom',
      bounds: { xMin: 6.5, xMax: 23.5, zMin: -2.5, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    primaryBath: {
      id: 'primaryBath',
      label: 'Primary En-Suite Bath',
      bounds: { xMin: 6.5, xMax: 23.5, zMin: -11.0, zMax: -2.5 },
      floorMaterial: 'slate-tile',
    },
  },
  walls: [
    { id: 'west-living', x1: -20.0, z1: -11.0, x2: -20.0, z2: 11.0, heightFt: 4.8, thicknessFt: 0.45 },
    { id: 'north-living-accent', x1: -20.0, z1: -11.0, x2: -3.5, z2: -11.0, heightFt: 4.8, thicknessFt: 0.45, colorHex: 0x38434f },
    { id: 'south-front-cutaway', x1: -20.0, z1: 11.0, x2: 23.5, z2: 11.0, heightFt: 2.2, thicknessFt: 0.45 },
    { id: 'play-nook-east-partition', x1: -3.5, z1: 2.5, x2: -3.5, z2: 11.0, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'stairwell-north-accent', x1: -0.2, z1: -4.5, x2: 3.5, z2: -4.5, heightFt: 4.4, thicknessFt: 0.35, colorHex: 0x353d47 },
    { id: 'powder-west', x1: 0.2, z1: -11.0, x2: 0.2, z2: -5.5, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'powder-south', x1: 0.2, z1: -5.5, x2: 3.5, z2: -5.5, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'powder-east', x1: 3.5, z1: -11.0, x2: 3.5, z2: -7.5, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'hallway-north', x1: 0.2, z1: -11.0, x2: 6.5, z2: -11.0, heightFt: 4.8, thicknessFt: 0.45 },
    { id: 'primary-west-green-accent', x1: 6.5, z1: 0.5, x2: 6.5, z2: 11.0, heightFt: 4.6, thicknessFt: 0.35, colorHex: 0x1f3b33 },
    { id: 'primary-bath-west', x1: 6.5, z1: -11.0, x2: 6.5, z2: -2.5, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'primary-bath-south-west', x1: 6.5, z1: -2.5, x2: 12.8, z2: -2.5, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'primary-bath-south-east', x1: 15.4, z1: -2.5, x2: 23.5, z2: -2.5, heightFt: 4.2, thicknessFt: 0.35 },
    { id: 'primary-bath-north-marble', x1: 6.5, z1: -11.0, x2: 23.5, z2: -11.0, heightFt: 4.8, thicknessFt: 0.45, colorHex: 0xebeef2 },
    { id: 'primary-bath-east-marble', x1: 23.5, z1: -11.0, x2: 23.5, z2: -2.5, heightFt: 4.8, thicknessFt: 0.45, colorHex: 0xebeef2 },
    { id: 'primary-bedroom-east', x1: 23.5, z1: -2.5, x2: 23.5, z2: 11.0, heightFt: 4.8, thicknessFt: 0.45 },
  ],
  stairsUpToTier3: {
    xMin: -3.4,
    xMax: 0.1,
    zMin: -10.6,
    zMax: -4.6,
    stepCount: 7,
    bottomElevationFt: 0.0,
    topElevationFt: 4.55,
    direction: '-z',
  },
  stairwellVoidFromTier1: {
    xMin: -0.1,
    xMax: 3.3,
    zMin: -4.4,
    zMax: 2.8,
  },
  fixtures: {
    fireplaceHearth: { id: 'fireplaceHearth', roomId: 'livingRoom', label: 'Fireplace Hearth & Mantel', xMin: -19.9, xMax: -18.3, zMin: -3.5, zMax: 1.5, heightFt: 4.6 },
    cornerTvConsole: { id: 'cornerTvConsole', roomId: 'livingRoom', label: 'Corner Media Cabinet & TV', xMin: -19.4, xMax: -15.6, zMin: -10.4, zMax: -6.2, heightFt: 4.2 },
    livingAreaRug: { id: 'livingAreaRug', roomId: 'livingRoom', label: 'Living Room Area Rug', xMin: -16.8, xMax: -6.2, zMin: -7.2, zMax: 1.8, heightFt: 0.04 },
    creamSofa: { id: 'creamSofa', roomId: 'livingRoom', label: 'Cream 3-Cushion Sofa', xMin: -10.4, xMax: -6.8, zMin: -6.4, zMax: 0.8, heightFt: 2.9 },
    sofaSideTable: { id: 'sofaSideTable', roomId: 'livingRoom', label: 'Round Wood Side Table', xMin: -9.4, xMax: -7.8, zMin: 1.0, zMax: 2.4, heightFt: 2.0 },
    creamArmchair: { id: 'creamArmchair', roomId: 'livingRoom', label: 'Cream Upholstered Armchair', xMin: -17.4, xMax: -14.2, zMin: -0.8, zMax: 2.2, heightFt: 3.0 },
    pastelOvalWallArt: { id: 'pastelOvalWallArt', roomId: 'livingRoom', label: 'Pastel Multi-Oval Wall Art', xMin: -14.0, xMax: -6.5, zMin: -10.9, zMax: -10.5, heightFt: 2.4 },
    southWindowBench: { id: 'southWindowBench', roomId: 'playNook', label: 'South Window Storage Bench', xMin: -16.5, xMax: -10.5, zMin: 9.3, zMax: 10.7, heightFt: 1.7 },
    cubeStorageShelves: { id: 'cubeStorageShelves', roomId: 'playNook', label: 'White Cube Storage Organizer', xMin: -4.9, xMax: -3.6, zMin: 3.6, zMax: 8.8, heightFt: 2.8 },
    babyPlayard: { id: 'babyPlayard', roomId: 'playNook', label: 'Mesh Baby Playard', xMin: -8.8, xMax: -5.6, zMin: 4.4, zMax: 7.4, heightFt: 2.6 },
    catTree: { id: 'catTree', roomId: 'playNook', label: 'Multi-Tier Cream Cat Tree', xMin: -7.4, xMax: -5.6, zMin: 8.2, zMax: 10.0, heightFt: 4.6 },
    paperLanternArcLamp: { id: 'paperLanternArcLamp', roomId: 'playNook', label: 'Paper Lantern Arc Floor Lamp', xMin: -5.4, xMax: -4.0, zMin: 8.8, zMax: 10.2, heightFt: 6.2 },
    stairwellChandelier: { id: 'stairwellChandelier', roomId: 'stairLanding', label: '5-Globe Cascading Chandelier', xMin: 0.8, xMax: 2.4, zMin: -1.8, zMax: -0.2, heightFt: 6.8 },
    landingBookcase: { id: 'landingBookcase', roomId: 'stairLanding', label: 'Dark Espresso Landing Bookcase', xMin: 0.0, xMax: 3.3, zMin: 2.9, zMax: 4.2, heightFt: 3.0 },
    hallwayCabinetAndMap: { id: 'hallwayCabinetAndMap', roomId: 'hallway', label: 'Hallway Cabinet & World Map Art', xMin: 3.9, xMax: 6.1, zMin: -10.8, zMax: -9.5, heightFt: 2.8 },
    powderToilet: { id: 'powderToilet', roomId: 'powderRoom', label: 'Powder Room Toilet & Shelves', xMin: 0.6, xMax: 2.1, zMin: -10.7, zMax: -9.0, heightFt: 2.5 },
    powderVanity: { id: 'powderVanity', roomId: 'powderRoom', label: 'Matte-Black Vanity & Arched Mirror', xMin: 2.2, xMax: 3.4, zMin: -8.6, zMax: -6.6, heightFt: 2.8 },
    primaryKingBed: { id: 'primaryKingBed', roomId: 'primaryBedroom', label: 'Primary King Bed', xMin: 11.6, xMax: 18.2, zMin: 4.2, zMax: 10.6, heightFt: 3.8 },
    westNightstand: { id: 'westNightstand', roomId: 'primaryBedroom', label: 'West Nightstand', xMin: 9.6, xMax: 11.3, zMin: 8.8, zMax: 10.5, heightFt: 2.2 },
    eastNightstand: { id: 'eastNightstand', roomId: 'primaryBedroom', label: 'East Nightstand', xMin: 18.5, xMax: 20.2, zMin: 8.8, zMax: 10.5, heightFt: 2.2 },
    bedsideBassinet: { id: 'bedsideBassinet', roomId: 'primaryBedroom', label: 'Bedside Bassinet & Gold Wall Art', xMin: 6.8, xMax: 9.6, zMin: 3.2, zMax: 6.0, heightFt: 2.8 },
    primaryRoundRug: { id: 'primaryRoundRug', roomId: 'primaryBedroom', label: 'Round Textured Cream Rug', xMin: 8.6, xMax: 13.6, zMin: 0.6, zMax: 5.6, heightFt: 0.04 },
    northWoodDresser: { id: 'northWoodDresser', roomId: 'primaryBedroom', label: 'North Dark Wood Dresser', xMin: 8.2, xMax: 12.2, zMin: -2.3, zMax: -0.6, heightFt: 2.8 },
    eastChangingDresser: { id: 'eastChangingDresser', roomId: 'primaryBedroom', label: 'East Dark Wood Changing Dresser', xMin: 20.8, xMax: 23.2, zMin: -1.8, zMax: 1.4, heightFt: 3.0 },
    slidingClosetDoors: { id: 'slidingClosetDoors', roomId: 'primaryBedroom', label: 'White Sliding Closet Doors', xMin: 22.8, xMax: 23.4, zMin: 2.0, zMax: 8.6, heightFt: 4.4 },
    walkInGlassShower: { id: 'walkInGlassShower', roomId: 'primaryBath', label: 'Frameless Walk-In Glass Shower', xMin: 11.8, xMax: 16.4, zMin: -10.8, zMax: -4.2, heightFt: 4.6 },
    primaryBathToilet: { id: 'primaryBathToilet', roomId: 'primaryBath', label: 'Primary Bath Toilet', xMin: 16.8, xMax: 18.5, zMin: -10.6, zMax: -8.6, heightFt: 2.5 },
    walnutDoubleVanity: { id: 'walnutDoubleVanity', roomId: 'primaryBath', label: 'Walnut Double-Sink Vanity & Mirrors', xMin: 20.8, xMax: 23.3, zMin: -9.8, zMax: -3.6, heightFt: 2.9 },
    bathLinenCloset: { id: 'bathLinenCloset', roomId: 'primaryBath', label: 'Primary Bath Linen Closet', xMin: 6.8, xMax: 9.6, zMin: -10.8, zMax: -8.2, heightFt: 4.4 },
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
