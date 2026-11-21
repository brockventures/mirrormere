export type Tier3RoomId =
  | 'breakfastNook'
  | 'kitchen'
  | 'hallBath'
  | 'upperHall'
  | 'rosieBedroom'
  | 'isaacBedroom';

export type Tier3FloorMaterial = 'wood' | 'slate-tile';

export type Tier3FixtureKey =
  | 'diningTableSet'
  | 'nookWhiteBuffet'
  | 'hearthWallDisplay'
  | 'northKitchenCounters'
  | 'eastRangeAndHood'
  | 'stainlessFridge'
  | 'kitchenIsland'
  | 'playKitchenCorner'
  | 'tallWhitePantry'
  | 'hallBathTub'
  | 'hallBathVanity'
  | 'hallBathToilet'
  | 'rosieTwinBed'
  | 'rosieRainbowAndMap'
  | 'rosieRoundRug'
  | 'rosieWhiteDresser'
  | 'rosieClosetAndDollhouse'
  | 'isaacWoodCrib'
  | 'isaacWalnutDresser'
  | 'isaacGliderAndOttoman'
  | 'isaacPlayCouch'
  | 'isaacStarPlayMat';

export interface Tier3Bounds2D {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
}

export interface Tier3RoomSpec {
  id: Tier3RoomId;
  label: string;
  bounds: Tier3Bounds2D;
  floorMaterial: Tier3FloorMaterial;
}

export interface Tier3WallSpec {
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

export interface Tier3FixtureSpec extends Tier3Bounds2D {
  id: Tier3FixtureKey;
  roomId: Tier3RoomId;
  label: string;
  heightFt: number;
}

export interface Tier3LayoutSpec {
  widthFt: number;
  depthFt: number;
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  ceilingHeightFt: number;
  backWallHeightFt: number;
  cutawayWallHeightFt: number;
  interiorWallHeightFt: number;
  wallThicknessFt: number;
  rooms: Readonly<Record<Tier3RoomId, Tier3RoomSpec>>;
  walls: readonly Tier3WallSpec[];
  stairsDownToTier2: Tier3Bounds2D;
  fixtures: Readonly<Record<Tier3FixtureKey, Tier3FixtureSpec>>;
}

export const TIER3_LAYOUT_SPEC: Tier3LayoutSpec = {
  widthFt: 43.5,
  depthFt: 22.0,
  xMin: -20.0,
  xMax: 23.5,
  zMin: -11.0,
  zMax: 11.0,
  ceilingHeightFt: 8.5,
  backWallHeightFt: 6.6,
  cutawayWallHeightFt: 4.8,
  interiorWallHeightFt: 4.4,
  wallThicknessFt: 0.45,
  rooms: {
    breakfastNook: {
      id: 'breakfastNook',
      label: 'Breakfast Nook',
      bounds: { xMin: -20.0, xMax: -9.5, zMin: -11.0, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    kitchen: {
      id: 'kitchen',
      label: 'Kitchen',
      bounds: { xMin: -9.5, xMax: 6.0, zMin: -11.0, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    hallBath: {
      id: 'hallBath',
      label: 'Hall Bath',
      bounds: { xMin: 6.0, xMax: 11.8, zMin: -11.0, zMax: -0.4 },
      floorMaterial: 'slate-tile',
    },
    upperHall: {
      id: 'upperHall',
      label: 'Upper Hallway',
      bounds: { xMin: 6.0, xMax: 11.8, zMin: -0.4, zMax: 11.0 },
      floorMaterial: 'wood',
    },
    rosieBedroom: {
      id: 'rosieBedroom',
      label: "Rosie's Bedroom",
      bounds: { xMin: 11.8, xMax: 23.5, zMin: -11.0, zMax: 2.0 },
      floorMaterial: 'wood',
    },
    isaacBedroom: {
      id: 'isaacBedroom',
      label: "Isaac's Bedroom",
      bounds: { xMin: 11.8, xMax: 23.5, zMin: 2.0, zMax: 11.0 },
      floorMaterial: 'wood',
    },
  },
  walls: [
    // West outer perimeter (continuous 6.6 ft wall so west nook window runs to full 6.0 ft header)
    { id: 'west-nook-wall', x1: -20.0, z1: -11.0, x2: -20.0, z2: 11.0, heightFt: 6.6, thicknessFt: 0.45, exteriorFace: 'west' },
    // North outer perimeter (6.6 ft back walls)
    { id: 'north-nook-patio', x1: -20.0, z1: -11.0, x2: -9.5, z2: -11.0, heightFt: 6.6, thicknessFt: 0.45, exteriorFace: 'north' },
    { id: 'north-kitchen', x1: -9.5, z1: -11.0, x2: 6.0, z2: -11.0, heightFt: 6.6, thicknessFt: 0.45, exteriorFace: 'north' },
    { id: 'north-hall-bath', x1: 6.0, z1: -11.0, x2: 11.8, z2: -11.0, heightFt: 6.6, thicknessFt: 0.45, exteriorFace: 'north' },
    { id: 'north-rosie-mint', x1: 11.8, z1: -11.0, x2: 23.5, z2: -11.0, heightFt: 6.6, thicknessFt: 0.45, colorHex: 0x42a88c, exteriorFace: 'north' },
    // East outer perimeter
    { id: 'east-rosie-mint', x1: 23.5, z1: -11.0, x2: 23.5, z2: 2.0, heightFt: 6.6, thicknessFt: 0.45, colorHex: 0x42a88c, exteriorFace: 'east' },
    { id: 'east-isaac-navy', x1: 23.5, z1: 2.0, x2: 23.5, z2: 11.0, heightFt: 4.8, thicknessFt: 0.45, colorHex: 0x2f5573, exteriorFace: 'east' },
    // South outer perimeter (open stair doorway x -3.4..-0.3)
    { id: 'south-nook-wall', x1: -20.0, z1: 11.0, x2: -3.4, z2: 11.0, heightFt: 4.6, thicknessFt: 0.45, exteriorFace: 'south' },
    { id: 'south-kitchen-wall', x1: -0.3, z1: 11.0, x2: 11.8, z2: 11.0, heightFt: 4.6, thicknessFt: 0.45, exteriorFace: 'south' },
    { id: 'south-isaac-cutaway', x1: 11.8, z1: 11.0, x2: 23.5, z2: 11.0, heightFt: 1.8, thicknessFt: 0.45, colorHex: 0x2f5573, exteriorFace: 'south' },
    // Interior partitions
    { id: 'kitchen-bath-west', x1: 6.0, z1: -11.0, x2: 6.0, z2: -0.4, heightFt: 4.6, thicknessFt: 0.35 },
    { id: 'hall-bath-south', x1: 6.0, z1: -0.4, x2: 8.6, z2: -0.4, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'bath-rosie-divider', x1: 11.8, z1: -11.0, x2: 11.8, z2: -0.4, heightFt: 4.6, thicknessFt: 0.35, colorHex: 0x42a88c },
    { id: 'pantry-north-wall', x1: 6.0, z1: 3.8, x2: 8.6, z2: 3.8, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'pantry-back-divider', x1: 8.6, z1: 3.8, x2: 8.6, z2: 11.0, heightFt: 4.4, thicknessFt: 0.35 },
    { id: 'isaac-closet-north', x1: 8.6, z1: 7.2, x2: 11.8, z2: 7.2, heightFt: 4.4, thicknessFt: 0.35, colorHex: 0x2f5573 },
    { id: 'rosie-isaac-divider', x1: 11.8, z1: 2.0, x2: 23.5, z2: 2.0, heightFt: 4.6, thicknessFt: 0.35, colorHex: 0x2f5573 },
    { id: 'rosie-closet-west', x1: 17.6, z1: 0.0, x2: 17.6, z2: 2.0, heightFt: 4.4, thicknessFt: 0.35, colorHex: 0x42a88c },
  ],
  stairsDownToTier2: {
    xMin: -3.4,
    xMax: -0.3,
    zMin: 10.6,
    zMax: 11.4,
  },
  fixtures: {
    // Breakfast Nook
    diningTableSet: { id: 'diningTableSet', roomId: 'breakfastNook', label: 'Curved Walnut Dining Table & 6 Chairs', xMin: -17.6, xMax: -10.4, zMin: 1.8, zMax: 7.4, heightFt: 2.9 },
    nookWhiteBuffet: { id: 'nookWhiteBuffet', roomId: 'breakfastNook', label: 'White Nook Sideboard Buffet', xMin: -19.8, xMax: -18.0, zMin: -9.2, zMax: -4.6, heightFt: 5.4 },
    hearthWallDisplay: { id: 'hearthWallDisplay', roomId: 'breakfastNook', label: 'Hearth Wall Display & Shelving', xMin: -19.2, xMax: -9.8, zMin: 9.2, zMax: 10.8, heightFt: 5.0 },
    // Kitchen
    northKitchenCounters: { id: 'northKitchenCounters', roomId: 'kitchen', label: 'North Kitchen Counters & Sink', xMin: -9.4, xMax: 5.7, zMin: -10.8, zMax: -8.4, heightFt: 6.2 },
    eastRangeAndHood: { id: 'eastRangeAndHood', roomId: 'kitchen', label: 'East Range, Oven & Vent Hood', xMin: 3.3, xMax: 5.7, zMin: -8.6, zMax: -4.0, heightFt: 6.5 },
    stainlessFridge: { id: 'stainlessFridge', roomId: 'kitchen', label: 'Stainless French-Door Refrigerator', xMin: 2.8, xMax: 5.7, zMin: -3.8, zMax: -0.5, heightFt: 6.2 },
    kitchenIsland: { id: 'kitchenIsland', roomId: 'kitchen', label: 'Center Kitchen Island & Stools', xMin: -8.3, xMax: 0.9, zMin: -3.7, zMax: 1.8, heightFt: 3.1 },
    playKitchenCorner: { id: 'playKitchenCorner', roomId: 'kitchen', label: 'Kids Play Kitchen Corner', xMin: 0.6, xMax: 5.2, zMin: 8.2, zMax: 10.7, heightFt: 4.4 },
    // Upper Hallway (west-facing pantry flush with kitchen-hall opening, full run z 4.0..10.8)
    tallWhitePantry: { id: 'tallWhitePantry', roomId: 'upperHall', label: 'Tall White Hall Pantry Cabinet', xMin: 6.1, xMax: 8.4, zMin: 4.0, zMax: 10.8, heightFt: 6.2 },
    // Hall Bath
    hallBathTub: { id: 'hallBathTub', roomId: 'hallBath', label: 'Alcove Bathtub & Shower Surround', xMin: 6.2, xMax: 11.6, zMin: -10.8, zMax: -7.6, heightFt: 5.8 },
    hallBathVanity: { id: 'hallBathVanity', roomId: 'hallBath', label: 'Hall Bath Vanity & Mirror', xMin: 6.2, xMax: 8.2, zMin: -6.6, zMax: -3.4, heightFt: 5.6 },
    hallBathToilet: { id: 'hallBathToilet', roomId: 'hallBath', label: 'Hall Bath Toilet', xMin: 6.2, xMax: 7.8, zMin: -2.8, zMax: -0.6, heightFt: 4.2 },
    // Rosie's Bedroom
    rosieTwinBed: { id: 'rosieTwinBed', roomId: 'rosieBedroom', label: "Rosie's Twin Bed", xMin: 16.2, xMax: 23.2, zMin: -7.8, zMax: -3.4, heightFt: 3.2 },
    rosieRainbowAndMap: { id: 'rosieRainbowAndMap', roomId: 'rosieBedroom', label: 'Rainbow Mural & World Map Art', xMin: 23.0, xMax: 23.4, zMin: -7.6, zMax: 0.1, heightFt: 5.8 },
    rosieRoundRug: { id: 'rosieRoundRug', roomId: 'rosieBedroom', label: 'Round Braided Play Rug', xMin: 14.0, xMax: 20.2, zMin: -4.6, zMax: 0.0, heightFt: 0.04 },
    rosieWhiteDresser: { id: 'rosieWhiteDresser', roomId: 'rosieBedroom', label: 'White Nursery Dresser', xMin: 12.0, xMax: 13.8, zMin: -7.2, zMax: -2.4, heightFt: 2.9 },
    rosieClosetAndDollhouse: { id: 'rosieClosetAndDollhouse', roomId: 'rosieBedroom', label: 'Closet & Wooden Dollhouse', xMin: 14.8, xMax: 23.2, zMin: 0.0, zMax: 1.8, heightFt: 4.5 },
    // Isaac's Bedroom
    isaacWoodCrib: { id: 'isaacWoodCrib', roomId: 'isaacBedroom', label: "Isaac's Wood Crib", xMin: 12.1, xMax: 16.5, zMin: 8.3, zMax: 10.7, heightFt: 3.4 },
    isaacWalnutDresser: { id: 'isaacWalnutDresser', roomId: 'isaacBedroom', label: 'Walnut Nursery Dresser & Changing Pad', xMin: 13.0, xMax: 19.2, zMin: 2.2, zMax: 4.2, heightFt: 4.4 },
    isaacGliderAndOttoman: { id: 'isaacGliderAndOttoman', roomId: 'isaacBedroom', label: 'Nursery Glider & Ottoman', xMin: 19.6, xMax: 23.1, zMin: 2.2, zMax: 6.0, heightFt: 3.1 },
    isaacPlayCouch: { id: 'isaacPlayCouch', roomId: 'isaacBedroom', label: 'Modular Foam Play Couch', xMin: 16.8, xMax: 22.6, zMin: 8.4, zMax: 10.7, heightFt: 2.0 },
    isaacStarPlayMat: { id: 'isaacStarPlayMat', roomId: 'isaacBedroom', label: 'Star-Patterned Floor Play Mat', xMin: 14.4, xMax: 19.4, zMin: 4.5, zMax: 8.1, heightFt: 0.04 },
  },
};

export function isBoundsContainedIn(inner: Tier3Bounds2D, outer: Tier3Bounds2D, epsilon = 1e-6): boolean {
  return (
    inner.xMin >= outer.xMin - epsilon &&
    inner.xMax <= outer.xMax + epsilon &&
    inner.zMin >= outer.zMin - epsilon &&
    inner.zMax <= outer.zMax + epsilon
  );
}

export function doBoundsOverlap2D(a: Tier3Bounds2D, b: Tier3Bounds2D, epsilon = 1e-6): boolean {
  const overlapX = a.xMin + epsilon < b.xMax && a.xMax - epsilon > b.xMin;
  const overlapZ = a.zMin + epsilon < b.zMax && a.zMax - epsilon > b.zMin;
  return overlapX && overlapZ;
}
