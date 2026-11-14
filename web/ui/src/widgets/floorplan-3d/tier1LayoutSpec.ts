import { Box3, Vector3 } from 'three';

export type RoomId = 'office' | 'foyer' | 'garage';
export type FacingDirection = '+X' | '-X' | '+Z' | '-Z' | 'up';
export type FixtureMountType = 'floor' | 'wall' | 'benchtop' | 'overhead' | 'rug' | 'threshold';
export type CameraPresetId = 'dollhouse' | 'office' | 'foyer' | 'garage' | 'topdown' | 'stack3Tier';
export type UpperMassingId = 'tier2South' | 'tier3North';
export type HaBindingKey =
  | 'officeTemp'
  | 'officeLight'
  | 'foyerLight'
  | 'garageLight'
  | 'washerPower'
  | 'washerRunning'
  | 'printerState'
  | 'garageDoor';

export type FixtureId =
  | 'office-bath-door'
  | 'office-barn-door'
  | 'office-barn-door-track'
  | 'office-wetbar-counter'
  | 'office-wetbar-cabinet-sink'
  | 'office-wetbar-fridge'
  | 'office-wetbar-shelves'
  | 'office-bookcase-nw'
  | 'office-guest-bed'
  | 'office-card-grid-art'
  | 'office-trellis-rug'
  | 'office-bookcase-sw'
  | 'office-wrigley-prints'
  | 'office-south-window-sill'
  | 'office-desk'
  | 'office-task-chair'
  | 'office-media-console'
  | 'office-wall-tv'
  | 'office-se-dresser'
  | 'office-foyer-doorway'
  | 'foyer-staircase'
  | 'foyer-wood-ledge-lower'
  | 'foyer-wood-ledge-upper'
  | 'foyer-garage-door'
  | 'garage-utility-sink'
  | 'garage-washer-dryer'
  | 'garage-locker-left'
  | 'garage-workbench'
  | 'garage-ender3-printer'
  | 'garage-cad-monitor'
  | 'garage-brock-studios-sign'
  | 'garage-overhead-wire-rack'
  | 'garage-locker-right'
  | 'garage-pegboard-bins'
  | 'garage-wood-gear-rack'
  | 'garage-grey-cubbies'
  | 'garage-pastel-rug'
  | 'garage-charcoal-sofa'
  | 'garage-exercise-bike'
  | 'garage-cardboard-boxes'
  | 'garage-south-threshold';

export interface RoomBoundsSpec {
  id: RoomId;
  label: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  wallColor: string;
  floorColor: string;
}

export interface WallDoorwayCutoutSpec {
  id: string;
  zMin: number;
  zMax: number;
  yMin: number;
  yMax: number;
}

export interface WallSegmentSpec {
  id: string;
  label: string;
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  heightStart: number;
  heightEnd: number;
  thickness: number;
  color: string;
  foyerSideColor?: string;
  doorways: readonly WallDoorwayCutoutSpec[];
}

export interface StaircaseSpec {
  id: string;
  room: RoomId;
  treadCount: number;
  lowerTreadCount: number;
  upperTreadCount: number;
  xMin: number;
  xMax: number;
  zStart: number;
  zLandingSouth: number;
  zEnd: number;
  xTurnStart: number;
  xTurnEnd: number;
  turnZMin: number;
  turnZMax: number;
  yStart: number;
  yLanding: number;
  yEnd: number;
  treadColor: string;
  railingColor: string;
  railingX: number;
  upperRailingZ: number;
  hasRearShelves: false;
}

export interface UpperFloorMassingSpec {
  id: UpperMassingId;
  label: string;
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  yBase: number;
  height: number;
  color: string;
}

export interface CameraPresetSpec {
  id: CameraPresetId;
  label: string;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  up: readonly [number, number, number];
  fov: number;
  showUpperMassing: boolean;
}

export interface HaEntityBindingSpec {
  key: HaBindingKey;
  defaultEntityId: string;
  domain: string;
  room: RoomId;
  label: string;
  anchor: readonly [number, number, number];
  interactive: boolean;
}

export interface FixtureSpec {
  id: FixtureId;
  label: string;
  room: RoomId;
  category: string;
  mount: FixtureMountType;
  facing: FacingDirection;
  solidFloorFootprint: boolean;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  primaryColor: string;
  accentColor?: string;
}

export const TIER1_ENVELOPE = {
  xMin: -20.0,
  xMax: 23.5,
  width: 43.5,
  zMin: -11.0,
  zMax: 11.0,
  depth: 22.0,
  floorY: 0.0,
  wallTopY: 8.6,
  wetBarAlcoveZMin: -12.6,
} as const;

export const TIER1_ROOMS: Readonly<Record<RoomId, RoomBoundsSpec>> = {
  office: { id: 'office', label: 'Office & Guest Suite', xMin: -20.0, xMax: -3.5, yMin: 0.0, yMax: 8.6, zMin: -11.0, zMax: 11.0, wallColor: '#f3efe6', floorColor: '#9e6b3b' },
  foyer: { id: 'foyer', label: 'Entry Foyer', xMin: -3.5, xMax: 3.5, yMin: 0.0, yMax: 8.6, zMin: -11.0, zMax: 11.0, wallColor: '#2c323b', floorColor: '#9e6b3b' },
  garage: { id: 'garage', label: 'Garage / Laundry / Brock Studios', xMin: 3.5, xMax: 23.5, yMin: 0.0, yMax: 8.6, zMin: -11.0, zMax: 11.0, wallColor: '#eceee9', floorColor: '#9aa0a6' },
};

export const TIER1_WALLS: readonly WallSegmentSpec[] = [
  { id: 'outer-west-office', label: 'Office Outer West Wall', xMin: -20.4, xMax: -20.0, zMin: -11.0, zMax: 11.0, heightStart: 8.6, heightEnd: 8.6, thickness: 0.4, color: '#f3efe6', doorways: [] },
  { id: 'outer-north-office-main', label: 'Office Outer North Back Wall (West-Center)', xMin: -20.4, xMax: -8.2, zMin: -11.4, zMax: -11.0, heightStart: 8.6, heightEnd: 8.6, thickness: 0.4, color: '#f3efe6', doorways: [] },
  { id: 'outer-north-wetbar-west-cheek', label: 'Wet-Bar Alcove West Cheek Wall', xMin: -8.6, xMax: -8.2, zMin: -12.6, zMax: -11.0, heightStart: 8.6, heightEnd: 8.6, thickness: 0.4, color: '#f3efe6', doorways: [] },
  { id: 'outer-north-wetbar-back', label: 'Wet-Bar Alcove Recessed North Wall', xMin: -8.6, xMax: -3.5, zMin: -13.0, zMax: -12.6, heightStart: 8.6, heightEnd: 8.6, thickness: 0.4, color: '#e8e3d8', doorways: [] },
  { id: 'outer-north-wetbar-east-cheek', label: 'Wet-Bar Alcove East Cheek Wall', xMin: -3.8, xMax: -3.5, zMin: -12.6, zMax: -11.0, heightStart: 8.6, heightEnd: 8.6, thickness: 0.3, color: '#f3efe6', doorways: [] },
  { id: 'outer-north-foyer', label: 'Entry Foyer Outer North Wall', xMin: -3.5, xMax: 3.5, zMin: -11.4, zMax: -11.0, heightStart: 8.6, heightEnd: 8.6, thickness: 0.4, color: '#2c323b', doorways: [] },
  { id: 'outer-north-garage', label: 'Garage Outer North Back Wall', xMin: 3.5, xMax: 23.9, zMin: -11.4, zMax: -11.0, heightStart: 8.6, heightEnd: 8.6, thickness: 0.4, color: '#eceee9', doorways: [] },
  { id: 'outer-east-garage', label: 'Garage Outer East Wall', xMin: 23.5, xMax: 23.9, zMin: -11.0, zMax: 11.0, heightStart: 8.6, heightEnd: 8.6, thickness: 0.4, color: '#eceee9', doorways: [] },
  {
    id: 'interior-west-foyer',
    label: 'Office / Entry Foyer Tapered Partition',
    xMin: -3.68,
    xMax: -3.32,
    zMin: -11.0,
    zMax: 11.0,
    heightStart: 8.6,
    heightEnd: 4.5,
    thickness: 0.36,
    color: '#f3efe6',
    foyerSideColor: '#2c323b',
    doorways: [{ id: 'office-se-doorway', zMin: 6.4, zMax: 9.2, yMin: 0.0, yMax: 6.8 }],
  },
  {
    id: 'interior-east-foyer',
    label: 'Entry Foyer / Garage Tapered Partition',
    xMin: 3.32,
    xMax: 3.68,
    zMin: -11.0,
    zMax: 11.0,
    heightStart: 8.6,
    heightEnd: 4.5,
    thickness: 0.36,
    color: '#eceee9',
    foyerSideColor: '#2c323b',
    doorways: [{ id: 'foyer-ne-garage-door', zMin: -8.5, zMax: -5.8, yMin: 0.0, yMax: 6.8 }],
  },
  { id: 'cutaway-south-office', label: 'Office South Street-Facing Cutaway Wall', xMin: -20.4, xMax: -3.5, zMin: 10.8, zMax: 11.2, heightStart: 1.4, heightEnd: 1.4, thickness: 0.4, color: '#f3efe6', doorways: [] },
  { id: 'cutaway-south-foyer-sill', label: 'Entry Foyer South Threshold Sill', xMin: -3.5, xMax: 3.5, zMin: 10.82, zMax: 11.18, heightStart: 0.18, heightEnd: 0.18, thickness: 0.36, color: '#3a404a', doorways: [] },
  { id: 'cutaway-south-garage-curb', label: 'Garage South Flush Concrete Threshold Curb', xMin: 5.5, xMax: 21.5, zMin: 10.82, zMax: 11.18, heightStart: 0.18, heightEnd: 0.18, thickness: 0.36, color: '#b8bec4', doorways: [] },
];

export const FOYER_STAIRCASE: StaircaseSpec = {
  id: 'foyer-west-staircase',
  room: 'foyer',
  treadCount: 13,
  lowerTreadCount: 10,
  upperTreadCount: 3,
  xMin: -3.5,
  xMax: -0.5,
  zStart: 4.6,
  zLandingSouth: -8.4,
  zEnd: -11.0,
  xTurnStart: -0.5,
  xTurnEnd: 3.3,
  turnZMin: -11.0,
  turnZMax: -8.55,
  yStart: 0.0,
  yLanding: 6.45,
  yEnd: 8.4,
  treadColor: '#a57242',
  railingColor: '#1b1e23',
  railingX: -0.55,
  upperRailingZ: -8.55,
  hasRearShelves: false,
};

export const UPPER_FLOOR_MASSING: Readonly<Record<UpperMassingId, UpperFloorMassingSpec>> = {
  tier2South: { id: 'tier2South', label: 'Tier 2 — Main Living Level (South)', xMin: -20.0, xMax: 23.5, zMin: -1.0, zMax: 11.0, yBase: 9.5, height: 9.0, color: '#cfd6df' },
  tier3North: { id: 'tier3North', label: 'Tier 3 — Upper Bedroom Split (North)', xMin: -20.0, xMax: 23.5, zMin: -11.0, zMax: -1.0, yBase: 14.0, height: 8.6, color: '#b9c3d0' },
};

export const CAMERA_PRESETS: Readonly<Record<CameraPresetId, CameraPresetSpec>> = {
  dollhouse: { id: 'dollhouse', label: 'Tier 1 Dollhouse', position: [1.75, 27.5, 33.5], target: [1.75, 2.4, -1.0], up: [0, 1, 0], fov: 40, showUpperMassing: false },
  office: { id: 'office', label: 'Office & Guest Suite', position: [-11.5, 16.5, 21.5], target: [-11.8, 2.6, -2.5], up: [0, 1, 0], fov: 42, showUpperMassing: false },
  foyer: { id: 'foyer', label: 'Entry Foyer', position: [1.2, 14.5, 18.5], target: [-0.2, 3.2, -3.0], up: [0, 1, 0], fov: 40, showUpperMassing: false },
  garage: { id: 'garage', label: 'Garage / Brock Studios', position: [13.5, 17.5, 23.0], target: [13.5, 2.8, -2.5], up: [0, 1, 0], fov: 42, showUpperMassing: false },
  topdown: { id: 'topdown', label: 'Top-Down Plan', position: [1.75, 56.0, 0.01], target: [1.75, 0.0, 0.0], up: [0, 0, -1], fov: 38, showUpperMassing: false },
  stack3Tier: { id: 'stack3Tier', label: '3-Tier Portrait Stack', position: [2.5, 26.0, 48.0], target: [1.75, 9.5, -1.0], up: [0, 1, 0], fov: 42, showUpperMassing: true },
};

export const TIER1_HA_BINDINGS: Readonly<Record<HaBindingKey, HaEntityBindingSpec>> = {
  officeTemp: { key: 'officeTemp', defaultEntityId: 'sensor.office_temperature', domain: 'sensor', room: 'office', label: 'Office Temp', anchor: [-11.8, 5.2, 0.0], interactive: false },
  officeLight: { key: 'officeLight', defaultEntityId: 'light.office_lights', domain: 'light', room: 'office', label: 'Office Lights', anchor: [-11.8, 8.2, 0.0], interactive: true },
  foyerLight: { key: 'foyerLight', defaultEntityId: 'light.entry_foyer_lights', domain: 'light', room: 'foyer', label: 'Foyer Lights', anchor: [0.0, 8.2, -2.0], interactive: true },
  garageLight: { key: 'garageLight', defaultEntityId: 'light.garage_studio_lights', domain: 'light', room: 'garage', label: 'Studio Lights', anchor: [13.5, 8.2, 0.0], interactive: true },
  washerPower: { key: 'washerPower', defaultEntityId: 'sensor.washer_power', domain: 'sensor', room: 'garage', label: 'Washer Power', anchor: [7.8, 3.8, -9.6], interactive: false },
  washerRunning: { key: 'washerRunning', defaultEntityId: 'binary_sensor.washer_running', domain: 'binary_sensor', room: 'garage', label: 'Washer Cycle', anchor: [9.8, 3.8, -9.6], interactive: false },
  printerState: { key: 'printerState', defaultEntityId: 'sensor.ender3_v2_print_status', domain: 'sensor', room: 'garage', label: 'Ender-3 V2', anchor: [15.7, 5.1, -9.7], interactive: false },
  garageDoor: { key: 'garageDoor', defaultEntityId: 'cover.garage_door', domain: 'cover', room: 'garage', label: 'Garage Threshold', anchor: [13.5, 0.8, 10.9], interactive: true },
};

export const TIER1_FIXTURES: readonly FixtureSpec[] = [
  { id: 'office-bath-door', label: 'White 2-Panel Bathroom Door', room: 'office', category: 'door', mount: 'wall', facing: '+Z', solidFloorFootprint: false, xMin: -19.2, xMax: -16.4, yMin: 0.0, yMax: 6.8, zMin: -11.12, zMax: -10.88, primaryColor: '#f7f7f5', accentColor: '#2a2d32' },
  { id: 'office-barn-door', label: 'White Sliding Barn Door', room: 'office', category: 'door', mount: 'wall', facing: '+Z', solidFloorFootprint: false, xMin: -13.6, xMax: -9.8, yMin: 0.05, yMax: 7.2, zMin: -10.95, zMax: -10.65, primaryColor: '#f8f8f6', accentColor: '#1f2226' },
  { id: 'office-barn-door-track', label: 'Matte-Black Barn Door Track Rail', room: 'office', category: 'hardware', mount: 'overhead', facing: '+Z', solidFloorFootprint: false, xMin: -15.4, xMax: -8.0, yMin: 7.25, yMax: 7.45, zMin: -10.98, zMax: -10.62, primaryColor: '#1a1c20' },
  { id: 'office-wetbar-counter', label: 'Recessed Wet-Bar Countertop', room: 'office', category: 'wetbar', mount: 'wall', facing: '+Z', solidFloorFootprint: false, xMin: -8.2, xMax: -3.8, yMin: 2.95, yMax: 3.1, zMin: -12.6, zMax: -11.0, primaryColor: '#e5e2dc', accentColor: '#9aa3ab' },
  { id: 'office-wetbar-cabinet-sink', label: 'Wet-Bar Grey Base Cabinet & Bar Sink', room: 'office', category: 'wetbar', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: -8.2, xMax: -5.6, yMin: 0.0, yMax: 2.95, zMin: -12.6, zMax: -11.0, primaryColor: '#6d737b', accentColor: '#cfd5db' },
  { id: 'office-wetbar-fridge', label: 'Glass-Door Mini Beverage Fridge', room: 'office', category: 'wetbar', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: -5.6, xMax: -3.8, yMin: 0.0, yMax: 2.95, zMin: -12.6, zMax: -11.0, primaryColor: '#23272d', accentColor: '#7fb7d8' },
  { id: 'office-wetbar-shelves', label: 'Walnut Floating Glassware Shelves', room: 'office', category: 'wetbar', mount: 'wall', facing: '+Z', solidFloorFootprint: false, xMin: -8.0, xMax: -3.9, yMin: 4.6, yMax: 6.2, zMin: -12.55, zMax: -11.65, primaryColor: '#6e472b' },
  { id: 'office-bookcase-nw', label: 'NW Tall Black Bookcase', room: 'office', category: 'storage', mount: 'floor', facing: '+X', solidFloorFootprint: true, xMin: -19.9, xMax: -18.7, yMin: 0.0, yMax: 6.8, zMin: -10.4, zMax: -7.6, primaryColor: '#22252a' },
  { id: 'office-guest-bed', label: 'Queen Guest Bed', room: 'office', category: 'furniture', mount: 'floor', facing: '+X', solidFloorFootprint: true, xMin: -19.8, xMax: -13.2, yMin: 0.0, yMax: 3.8, zMin: -6.4, zMax: -0.6, primaryColor: '#e9e5dc', accentColor: '#2d3e56' },
  { id: 'office-card-grid-art', label: 'Collector Card Grid Wall Art', room: 'office', category: 'art', mount: 'wall', facing: '+X', solidFloorFootprint: false, xMin: -19.96, xMax: -19.76, yMin: 4.3, yMax: 6.9, zMin: -5.8, zMax: -1.2, primaryColor: '#1e2229', accentColor: '#d9b36c' },
  { id: 'office-trellis-rug', label: 'Navy & Cream Trellis Rug', room: 'office', category: 'rug', mount: 'rug', facing: 'up', solidFloorFootprint: false, xMin: -19.5, xMax: -11.5, yMin: 0.0, yMax: 0.03, zMin: -7.2, zMax: 0.4, primaryColor: '#233654', accentColor: '#efeae0' },
  { id: 'office-bookcase-sw', label: 'Mid-SW Black Bookcase', room: 'office', category: 'storage', mount: 'floor', facing: '+X', solidFloorFootprint: true, xMin: -19.9, xMax: -18.7, yMin: 0.0, yMax: 6.8, zMin: 1.4, zMax: 4.2, primaryColor: '#22252a' },
  { id: 'office-wrigley-prints', label: 'Wrigley Field Framed Prints', room: 'office', category: 'art', mount: 'wall', facing: '+X', solidFloorFootprint: false, xMin: -19.96, xMax: -19.76, yMin: 3.8, yMax: 6.4, zMin: 5.6, zMax: 9.2, primaryColor: '#2b4c3f', accentColor: '#f2efe9' },
  { id: 'office-south-window-sill', label: 'Office Front Window Sill', room: 'office', category: 'trim', mount: 'wall', facing: '-Z', solidFloorFootprint: false, xMin: -16.8, xMax: -8.8, yMin: 1.35, yMax: 1.52, zMin: 10.75, zMax: 11.25, primaryColor: '#f7f6f2' },
  { id: 'office-desk', label: 'South Window Writing Desk', room: 'office', category: 'furniture', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: -16.4, xMax: -11.4, yMin: 0.0, yMax: 2.5, zMin: 8.2, zMax: 10.4, primaryColor: '#7b5333', accentColor: '#24272c' },
  { id: 'office-task-chair', label: 'Ergonomic Task Chair', room: 'office', category: 'furniture', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: -14.9, xMax: -12.9, yMin: 0.0, yMax: 3.4, zMin: 5.7, zMax: 7.7, primaryColor: '#252930' },
  { id: 'office-media-console', label: 'Walnut TV Table', room: 'office', category: 'furniture', mount: 'floor', facing: '-X', solidFloorFootprint: true, xMin: -5.45, xMax: -3.72, yMin: 0.0, yMax: 2.2, zMin: -5.3, zMax: -1.1, primaryColor: '#6b442a', accentColor: '#1f2329' },
  { id: 'office-wall-tv', label: 'Wall-Mounted Flatscreen TV', room: 'office', category: 'electronics', mount: 'wall', facing: '-X', solidFloorFootprint: false, xMin: -3.96, xMax: -3.69, yMin: 2.95, yMax: 5.55, zMin: -4.9, zMax: -1.5, primaryColor: '#111317' },
  { id: 'office-se-dresser', label: 'Corner Wood Dresser', room: 'office', category: 'furniture', mount: 'floor', facing: '-Z', solidFloorFootprint: true, xMin: -8.6, xMax: -4.1, yMin: 0.0, yMax: 2.85, zMin: 9.25, zMax: 10.75, primaryColor: '#6b442a', accentColor: '#c8cfd6' },
  { id: 'office-foyer-doorway', label: 'Office SE Foyer Doorway', room: 'office', category: 'door', mount: 'wall', facing: '-X', solidFloorFootprint: false, xMin: -3.7, xMax: -3.3, yMin: 0.0, yMax: 6.8, zMin: 6.4, zMax: 9.2, primaryColor: '#f4f2ec' },
  { id: 'foyer-staircase', label: '13-Tread Honey-Wood L-Turn Staircase', room: 'foyer', category: 'stairs', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: -3.5, xMax: 3.3, yMin: 0.0, yMax: 8.4, zMin: -11.0, zMax: 4.6, primaryColor: '#a57242', accentColor: '#1b1e23' },
  { id: 'foyer-wood-ledge-lower', label: 'East Wall Floating Wood Ledge (Lower)', room: 'foyer', category: 'shelf', mount: 'wall', facing: '-X', solidFloorFootprint: false, xMin: 2.9, xMax: 3.48, yMin: 3.1, yMax: 3.28, zMin: 0.5, zMax: 4.5, primaryColor: '#b78652' },
  { id: 'foyer-wood-ledge-upper', label: 'East Wall Floating Wood Ledge (Upper)', room: 'foyer', category: 'shelf', mount: 'wall', facing: '-X', solidFloorFootprint: false, xMin: 2.9, xMax: 3.48, yMin: 4.5, yMax: 4.68, zMin: 0.5, zMax: 4.5, primaryColor: '#b78652' },
  { id: 'foyer-garage-door', label: 'Interior Foyer-to-Garage Door', room: 'foyer', category: 'door', mount: 'wall', facing: '-X', solidFloorFootprint: false, xMin: 3.3, xMax: 3.7, yMin: 0.0, yMax: 6.8, zMin: -8.5, zMax: -5.8, primaryColor: '#e8e7e3' },
  { id: 'garage-utility-sink', label: 'Stainless Utility Sink', room: 'garage', category: 'laundry', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: 3.9, xMax: 6.2, yMin: 0.0, yMax: 3.1, zMin: -10.9, zMax: -8.7, primaryColor: '#c7cdd3', accentColor: '#8e969e' },
  { id: 'garage-washer-dryer', label: 'LG Front-Load Washer & Dryer Counter', room: 'garage', category: 'laundry', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: 6.4, xMax: 11.8, yMin: 0.0, yMax: 3.3, zMin: -10.9, zMax: -8.3, primaryColor: '#f4f6f8', accentColor: '#2c3138' },
  { id: 'garage-locker-left', label: 'Left Tall Sage-Green Storage Locker', room: 'garage', category: 'storage', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: 11.8, xMax: 14.4, yMin: 0.0, yMax: 6.8, zMin: -10.9, zMax: -8.7, primaryColor: '#7d937c', accentColor: '#2b312c' },
  { id: 'garage-workbench', label: 'Brock Studios Butcher-Block Workbench', room: 'garage', category: 'studio', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: 14.4, xMax: 20.8, yMin: 0.0, yMax: 3.1, zMin: -10.9, zMax: -8.5, primaryColor: '#c6935d', accentColor: '#7d937c' },
  { id: 'garage-ender3-printer', label: 'Creality Ender-3 V2 3D Printer', room: 'garage', category: 'studio', mount: 'benchtop', facing: '+Z', solidFloorFootprint: false, xMin: 14.8, xMax: 16.6, yMin: 3.1, yMax: 4.8, zMin: -10.5, zMax: -8.9, primaryColor: '#1d2024', accentColor: '#2a7de1' },
  { id: 'garage-cad-monitor', label: 'CAD Workstation Monitor', room: 'garage', category: 'studio', mount: 'benchtop', facing: '+Z', solidFloorFootprint: false, xMin: 17.6, xMax: 20.1, yMin: 3.1, yMax: 4.6, zMin: -10.6, zMax: -9.4, primaryColor: '#181b20', accentColor: '#4da3ff' },
  { id: 'garage-brock-studios-sign', label: 'BROCK STUDIOS Wall Sign', room: 'garage', category: 'studio', mount: 'wall', facing: '+Z', solidFloorFootprint: false, xMin: 15.4, xMax: 19.8, yMin: 5.1, yMax: 5.9, zMin: -10.98, zMax: -10.82, primaryColor: '#1c2127', accentColor: '#f2efe6' },
  { id: 'garage-overhead-wire-rack', label: 'Overhead Steel Wire Storage Rack', room: 'garage', category: 'studio', mount: 'overhead', facing: '+Z', solidFloorFootprint: false, xMin: 14.4, xMax: 20.8, yMin: 6.4, yMax: 7.2, zMin: -10.9, zMax: -9.1, primaryColor: '#6f767e' },
  { id: 'garage-locker-right', label: 'Right Tall Sage-Green Storage Locker', room: 'garage', category: 'storage', mount: 'floor', facing: '+Z', solidFloorFootprint: true, xMin: 20.8, xMax: 23.3, yMin: 0.0, yMax: 6.8, zMin: -10.9, zMax: -8.7, primaryColor: '#7d937c', accentColor: '#2b312c' },
  { id: 'garage-pegboard-bins', label: 'White Pegboard & Parts Bins', room: 'garage', category: 'storage', mount: 'wall', facing: '-X', solidFloorFootprint: false, xMin: 22.9, xMax: 23.45, yMin: 3.0, yMax: 6.6, zMin: -7.5, zMax: -1.5, primaryColor: '#f6f7f8', accentColor: '#d97b38' },
  { id: 'garage-wood-gear-rack', label: 'East Wall Wood Gear Rack', room: 'garage', category: 'storage', mount: 'floor', facing: '-X', solidFloorFootprint: true, xMin: 21.9, xMax: 23.4, yMin: 0.0, yMax: 5.8, zMin: -0.5, zMax: 3.0, primaryColor: '#a97c50' },
  { id: 'garage-grey-cubbies', label: '2x4 Grey Storage Cubbies', room: 'garage', category: 'storage', mount: 'floor', facing: '-X', solidFloorFootprint: true, xMin: 22.0, xMax: 23.4, yMin: 0.0, yMax: 2.9, zMin: 3.8, zMax: 7.4, primaryColor: '#7a8088' },
  { id: 'garage-pastel-rug', label: 'Pastel-Circles Studio Rug', room: 'garage', category: 'rug', mount: 'rug', facing: 'up', solidFloorFootprint: false, xMin: 8.8, xMax: 18.2, yMin: 0.0, yMax: 0.03, zMin: -2.8, zMax: 4.8, primaryColor: '#e8e2d8', accentColor: '#9ab7b0' },
  { id: 'garage-charcoal-sofa', label: 'Dark Charcoal 3-Seat Sofa', room: 'garage', category: 'furniture', mount: 'floor', facing: '-Z', solidFloorFootprint: true, xMin: 9.5, xMax: 17.5, yMin: 0.0, yMax: 2.9, zMin: 7.4, zMax: 10.2, primaryColor: '#2d3138' },
  { id: 'garage-exercise-bike', label: 'Stationary Spin Exercise Bike', room: 'garage', category: 'fitness', mount: 'floor', facing: '+X', solidFloorFootprint: true, xMin: 4.6, xMax: 6.8, yMin: 0.0, yMax: 4.0, zMin: 1.0, zMax: 3.2, primaryColor: '#1f2329', accentColor: '#d93829' },
  { id: 'garage-cardboard-boxes', label: 'Stacked Cardboard Storage Boxes', room: 'garage', category: 'storage', mount: 'floor', facing: '+X', solidFloorFootprint: true, xMin: 4.3, xMax: 6.9, yMin: 0.0, yMax: 2.5, zMin: 6.6, zMax: 9.2, primaryColor: '#b98b58', accentColor: '#dfd1ba' },
  { id: 'garage-south-threshold', label: 'Flush Concrete Garage Threshold Curb', room: 'garage', category: 'threshold', mount: 'threshold', facing: '-Z', solidFloorFootprint: false, xMin: 5.5, xMax: 21.5, yMin: 0.0, yMax: 0.18, zMin: 10.82, zMax: 11.18, primaryColor: '#b8bec4' },
];

const FIXTURE_BY_ID = new Map<FixtureId, FixtureSpec>(TIER1_FIXTURES.map((f: FixtureSpec) => [f.id, f]));

export function getFixtureById(id: FixtureId): FixtureSpec {
  const found = FIXTURE_BY_ID.get(id);
  if (!found) {
    throw new Error(`Unknown Tier 1 fixture id: ${id}`);
  }
  return found;
}

export function fixtureToBox3(fixture: FixtureSpec): Box3 {
  return new Box3(
    new Vector3(fixture.xMin, fixture.yMin, fixture.zMin),
    new Vector3(fixture.xMax, fixture.yMax, fixture.zMax),
  );
}

export function fixtureCenter(fixture: FixtureSpec): Vector3 {
  return fixtureToBox3(fixture).getCenter(new Vector3());
}

export function fixtureSize(fixture: FixtureSpec): Vector3 {
  return fixtureToBox3(fixture).getSize(new Vector3());
}

export function wallHeightAtZ(wall: WallSegmentSpec, z: number): number {
  const span = wall.zMax - wall.zMin;
  if (span <= 0) {
    return wall.heightStart;
  }
  const t = Math.min(1, Math.max(0, (z - wall.zMin) / span));
  return wall.heightStart + (wall.heightEnd - wall.heightStart) * t;
}

export function findFloorAabbCollisions(
  fixtures: readonly FixtureSpec[] = TIER1_FIXTURES,
  epsilon = 1e-6,
): Array<[FixtureSpec, FixtureSpec]> {
  const floorItems = fixtures.filter((f: FixtureSpec) => f.solidFloorFootprint);
  const collisions: Array<[FixtureSpec, FixtureSpec]> = [];
  for (let i = 0; i < floorItems.length; i += 1) {
    const a = floorItems[i];
    for (let j = i + 1; j < floorItems.length; j += 1) {
      const b = floorItems[j];
      const overlapX = a.xMin + epsilon < b.xMax && a.xMax - epsilon > b.xMin;
      const overlapZ = a.zMin + epsilon < b.zMax && a.zMax - epsilon > b.zMin;
      if (overlapX && overlapZ) {
        collisions.push([a, b]);
      }
    }
  }
  return collisions;
}
