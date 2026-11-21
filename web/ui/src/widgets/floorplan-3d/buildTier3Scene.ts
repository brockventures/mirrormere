import {
  BoxGeometry, Color, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial,
  PointLight, Scene, type BufferGeometry,
} from 'three';
import {
  TIER3_LAYOUT_SPEC, type Tier3Bounds2D, type Tier3FixtureKey, type Tier3LayoutSpec,
  type Tier3RoomId, type Tier3WallSpec,
} from './tier3LayoutSpec';
import { buildTier3Fixtures } from './tier3Fixtures';
import { createTier1Materials, type Tier1MaterialPalette } from './tier1Shell';

export interface Tier3SceneMaterials extends Tier1MaterialPalette {
  woodFloor: MeshStandardMaterial;
  slateTileFloor: MeshStandardMaterial;
}

export interface BuiltTier3Scene {
  scene: Scene;
  group: Group;
  shellGroup: Group;
  rooms: Readonly<Record<Tier3RoomId, Group>>;
  roomFloors: Readonly<Record<Tier3RoomId, Mesh>>;
  wallsById: Readonly<Record<string, Group>>;
  stairsDownGroup: Group;
  fixtures: Readonly<Record<Tier3FixtureKey, Group>>;
  ceilingFansGroup: Group;
  materials: Tier3SceneMaterials;
  dispose: () => void;
}

export type Tier3WallMode = 'standard' | 'half';

export interface BuildTier3SceneOptions {
  background?: string | null;
  spec?: Tier3LayoutSpec;
  wallMode?: Tier3WallMode;
}

interface WallApertureX { x0: number; x1: number; y0: number; y1: number; }
interface WallApertureZ { z0: number; z1: number; y0: number; y1: number; }

const WALL_APERTURES_X: Readonly<Record<string, WallApertureX>> = {
  'north-nook-patio': { x0: -18.5, x1: -10.5, y0: 0.0, y1: 6.1 },
  'north-kitchen': { x0: -5.0, x1: -1.8, y0: 3.3, y1: 5.5 },
  'north-hall-bath': { x0: 7.0, x1: 10.8, y0: 4.2, y1: 5.8 },
  'north-rosie-mint': { x0: 14.4, x1: 20.4, y0: 0.0, y1: 6.1 },
};

const WALL_APERTURES_Z: Readonly<Record<string, WallApertureZ>> = {
  'east-isaac-navy': { z0: 3.0, z1: 8.6, y0: 1.8, y1: 4.5 },
};

function resolveWallHeightFt(wall: Tier3WallSpec, wallMode: Tier3WallMode): number {
  if (wallMode !== 'half') return wall.heightFt;
  const isTargetWall = !wall.exteriorFace || wall.exteriorFace === 'south' || wall.id === 'east-isaac-navy';
  return isTargetWall ? Math.min(wall.heightFt, 2.2) : wall.heightFt;
}

function namedGroup(name: string): Group {
  const g = new Group();
  g.name = name;
  return g;
}

function applyWorldSpaceFloorUVs(geom: BufferGeometry, bounds: Tier3Bounds2D): void {
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;
  if (!pos || !uv) return;
  const cx = (bounds.xMin + bounds.xMax) / 2;
  const cz = (bounds.zMin + bounds.zMax) / 2;
  for (let i = 0; i < pos.count; i += 1) {
    const wx = cx + pos.getX(i);
    const wz = cz + pos.getZ(i);
    uv.setXY(i, (wx + 20.0) / 16.0, (wz + 12.6) / 16.0);
  }
  uv.needsUpdate = true;
}

type AddBoxFn = (
  parent: Group, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number,
  mat: MeshStandardMaterial, name?: string,
) => Mesh;

function buildWallSegment(
  wall: Tier3WallSpec,
  wallMode: Tier3WallMode,
  materials: Tier3SceneMaterials,
  accentMatCache: Map<number, MeshStandardMaterial>,
  localMats: MeshStandardMaterial[],
  addBox: AddBoxFn,
): Group {
  const wg = namedGroup(`wall-${wall.id}`);
  const wallHeight = resolveWallHeightFt(wall, wallMode);
  wg.userData = { wallId: wall.id, colorHex: wall.colorHex, heightFt: wallHeight };

  let wallMat = materials.officeWall;
  if (wall.colorHex !== undefined) {
    const cached = accentMatCache.get(wall.colorHex);
    if (cached) {
      wallMat = cached;
    } else {
      wallMat = new MeshStandardMaterial({ color: wall.colorHex, roughness: 0.78, metalness: 0.04 });
      accentMatCache.set(wall.colorHex, wallMat);
      localMats.push(wallMat);
    }
  }

  const isHorizontal = Math.abs(wall.z1 - wall.z2) <= Math.abs(wall.x1 - wall.x2);
  const halfT = wall.thicknessFt / 2;
  const x0 = isHorizontal ? Math.min(wall.x1, wall.x2) : Math.min(wall.x1, wall.x2) - halfT;
  const x1 = isHorizontal ? Math.max(wall.x1, wall.x2) : Math.max(wall.x1, wall.x2) + halfT;
  const z0 = isHorizontal ? Math.min(wall.z1, wall.z2) - halfT : Math.min(wall.z1, wall.z2);
  const z1 = isHorizontal ? Math.max(wall.z1, wall.z2) + halfT : Math.max(wall.z1, wall.z2);

  const capH = 0.07;
  const bodyTop = Math.max(0.2, wallHeight - capH);
  const addWallSpan = (xa: number, xb: number, ya: number, yb: number, za: number, zb: number, suffix: string): void => {
    const face = wall.exteriorFace;
    if (face === 'west' || face === 'east') {
      const xm = (xa + xb) / 2;
      const westExt = face === 'west';
      addBox(wg, xa, xm, ya, yb, za, zb, westExt ? materials.exteriorSiding : wallMat, `${wall.id}-${suffix}${westExt ? '-ext' : ''}`);
      addBox(wg, xm, xb, ya, yb, za, zb, westExt ? wallMat : materials.exteriorSiding, `${wall.id}-${suffix}${westExt ? '' : '-ext'}`);
      return;
    }
    if (face === 'north' || face === 'south') {
      const zm = (za + zb) / 2;
      const northExt = face === 'north';
      addBox(wg, xa, xb, ya, yb, za, zm, northExt ? materials.exteriorSiding : wallMat, `${wall.id}-${suffix}${northExt ? '-ext' : ''}`);
      addBox(wg, xa, xb, ya, yb, zm, zb, northExt ? wallMat : materials.exteriorSiding, `${wall.id}-${suffix}${northExt ? '' : '-ext'}`);
      return;
    }
    addBox(wg, xa, xb, ya, yb, za, zb, wallMat, `${wall.id}-${suffix}`);
  };

  const apX = WALL_APERTURES_X[wall.id];
  const apZ = WALL_APERTURES_Z[wall.id];
  if (apX && isHorizontal && apX.x0 > x0 && apX.x1 < x1 && apX.y1 <= wallHeight) {
    addWallSpan(x0, apX.x0, 0, bodyTop, z0, z1, 'body');
    addWallSpan(apX.x1, x1, 0, bodyTop, z0, z1, 'body-east');
    if (apX.y0 > 0.05) addWallSpan(apX.x0, apX.x1, 0, apX.y0, z0, z1, 'sill');
    if (apX.y1 < bodyTop) addWallSpan(apX.x0, apX.x1, apX.y1, bodyTop, z0, z1, 'header');
  } else if (apZ && !isHorizontal && apZ.z0 > z0 && apZ.z1 < z1 && apZ.y1 <= wallHeight) {
    addWallSpan(x0, x1, 0, bodyTop, z0, apZ.z0, 'body');
    addWallSpan(x0, x1, 0, bodyTop, apZ.z1, z1, 'body-south');
    if (apZ.y0 > 0.05) addWallSpan(x0, x1, 0, apZ.y0, apZ.z0, apZ.z1, 'sill');
    if (apZ.y1 < bodyTop) addWallSpan(x0, x1, apZ.y1, bodyTop, apZ.z0, apZ.z1, 'header');
  } else {
    addWallSpan(x0, x1, 0, bodyTop, z0, z1, 'body');
  }
  addBox(wg, x0, x1, bodyTop, wallHeight, z0, z1, materials.whiteTrim, `${wall.id}-cap`);
  return wg;
}

function buildFramedWindowZ(
  parent: Group, name: string, x0: number, x1: number, y0: number, y1: number, zCenter: number,
  panels: number, trimMat: MeshStandardMaterial, glassMat: MeshStandardMaterial, addBox: AddBoxFn,
): Group {
  const wg = namedGroup(name);
  addBox(wg, x0, x1, y0, y0 + 0.09, zCenter - 0.22, zCenter + 0.22, trimMat, `${name}-sill`);
  addBox(wg, x0, x1, y1 - 0.09, y1, zCenter - 0.22, zCenter + 0.22, trimMat, `${name}-header`);
  addBox(wg, x0, x0 + 0.1, y0 + 0.09, y1 - 0.09, zCenter - 0.22, zCenter + 0.22, trimMat, `${name}-jamb-w`);
  addBox(wg, x1 - 0.1, x1, y0 + 0.09, y1 - 0.09, zCenter - 0.22, zCenter + 0.22, trimMat, `${name}-jamb-e`);
  for (let p = 1; p < panels; p += 1) {
    const mx = x0 + ((x1 - x0) * p) / panels;
    addBox(wg, mx - 0.04, mx + 0.04, y0 + 0.09, y1 - 0.09, zCenter - 0.08, zCenter + 0.08, trimMat, `${name}-mullion-${p}`);
  }
  addBox(wg, x0 + 0.1, x1 - 0.1, y0 + 0.09, y1 - 0.09, zCenter - 0.04, zCenter + 0.04, glassMat, `${name}-glass`);
  parent.add(wg);
  return wg;
}

function buildFramedWindowX(
  parent: Group, name: string, xCenter: number, y0: number, y1: number, z0: number, z1: number,
  panels: number, trimMat: MeshStandardMaterial, glassMat: MeshStandardMaterial, addBox: AddBoxFn,
): Group {
  const wg = namedGroup(name);
  addBox(wg, xCenter - 0.24, xCenter + 0.24, y0, y0 + 0.09, z0, z1, trimMat, `${name}-sill`);
  addBox(wg, xCenter - 0.24, xCenter + 0.24, y1 - 0.09, y1, z0, z1, trimMat, `${name}-header`);
  addBox(wg, xCenter - 0.24, xCenter + 0.24, y0 + 0.09, y1 - 0.09, z0, z0 + 0.1, trimMat, `${name}-jamb-n`);
  addBox(wg, xCenter - 0.24, xCenter + 0.24, y0 + 0.09, y1 - 0.09, z1 - 0.1, z1, trimMat, `${name}-jamb-s`);
  for (let p = 1; p < panels; p += 1) {
    const mz = z0 + ((z1 - z0) * p) / panels;
    addBox(wg, xCenter - 0.08, xCenter + 0.08, y0 + 0.09, y1 - 0.09, mz - 0.04, mz + 0.04, trimMat, `${name}-mullion-${p}`);
  }
  addBox(wg, xCenter - 0.04, xCenter + 0.04, y0 + 0.09, y1 - 0.09, z0 + 0.1, z1 - 0.1, glassMat, `${name}-glass`);
  parent.add(wg);
  return wg;
}

function buildTier3Windows(
  shellGroup: Group,
  wallMode: Tier3WallMode,
  materials: Tier3SceneMaterials,
  localMats: MeshStandardMaterial[],
  addBox: AddBoxFn,
): void {
  const windowsGroup = namedGroup('tier3-windows');
  const frostedGlass = new MeshStandardMaterial({
    color: 0xdff0fa, roughness: 0.44, metalness: 0.05, transparent: true, opacity: 0.56,
  });
  const valanceMat = new MeshStandardMaterial({ color: 0x3b4048, roughness: 0.86, metalness: 0.04 });
  const doormatMat = new MeshStandardMaterial({ color: 0x76644f, roughness: 0.94, metalness: 0.01 });
  const blushCurtainMat = new MeshStandardMaterial({ color: 0xd8b6bc, roughness: 0.88, metalness: 0.02 });
  const peachCurtainMat = new MeshStandardMaterial({ color: 0xe2b695, roughness: 0.88, metalness: 0.02 });
  localMats.push(frostedGlass, valanceMat, doormatMat, blushCurtainMat, peachCurtainMat);

  // 1. Patio sliding glass door on north-nook-patio (x -18.5..-10.5, z -11, y 0..6.1)
  const patioDoor = buildFramedWindowZ(windowsGroup, 'nook-patio-door', -18.5, -10.5, 0.0, 6.1, -11.0, 2, materials.whiteTrim, materials.glass, addBox);
  addBox(patioDoor, -18.7, -10.3, 5.55, 6.16, -10.74, -10.52, valanceMat, 'nook-patio-valance');
  addBox(patioDoor, -16.2, -12.8, 0.0, 0.04, -10.55, -9.35, doormatMat, 'nook-patio-doormat');

  // 2. Kitchen sink window on north-kitchen (x -5.0..-1.8, z -11, y 3.3..5.5)
  buildFramedWindowZ(windowsGroup, 'kitchen-sink-window', -5.0, -1.8, 3.3, 5.5, -11.0, 2, materials.whiteTrim, materials.glass, addBox);

  // 3. Hall bath frosted clerestory window on north-hall-bath (x 7.0..10.8, z -11, y 4.2..5.8)
  buildFramedWindowZ(windowsGroup, 'hall-bath-clerestory-window', 7.0, 10.8, 4.2, 5.8, -11.0, 2, materials.whiteTrim, frostedGlass, addBox);

  // 4. Breakfast nook west window on west-nook-window-cutaway (x -20, z -1.3..8.3, y 1.8..4.5)
  const nookWestWin = buildFramedWindowX(windowsGroup, 'nook-west-window', -20.0, 1.8, 4.5, -1.3, 8.3, 3, materials.whiteTrim, materials.glass, addBox);
  addBox(nookWestWin, -19.86, -19.66, 4.18, 4.52, -1.35, 8.35, valanceMat, 'nook-west-roller-valance');

  // 5. Rosie north full-height double French patio doors + full-length blush-pink curtains (#d8b6bc)
  const rosieDoors = namedGroup('rosie-north-french-doors');
  addBox(rosieDoors, 14.4, 20.4, 0.0, 0.06, -11.22, -10.78, materials.whiteTrim, 'rosie-north-french-doors-threshold');
  addBox(rosieDoors, 14.4, 20.4, 5.98, 6.1, -11.22, -10.78, materials.whiteTrim, 'rosie-north-french-doors-header');
  addBox(rosieDoors, 14.4, 14.52, 0.06, 5.98, -11.22, -10.78, materials.whiteTrim, 'rosie-north-french-doors-jamb-w');
  addBox(rosieDoors, 20.28, 20.4, 0.06, 5.98, -11.22, -10.78, materials.whiteTrim, 'rosie-north-french-doors-jamb-e');
  for (const side of ['w', 'e'] as const) {
    const isWest = side === 'w';
    const [px0, px1] = isWest ? [14.52, 17.39] : [17.41, 20.28];
    const [gx0, gx1] = isWest ? [14.72, 17.20] : [17.60, 20.08];
    const [ox0, ox1] = isWest ? [14.52, 14.72] : [20.08, 20.28];
    const [mx0, mx1] = isWest ? [17.20, 17.39] : [17.41, 17.60];
    const hx = isWest ? 17.28 : 17.52;
    addBox(rosieDoors, ox0, ox1, 0.06, 5.98, -11.08, -10.92, materials.whiteTrim, `rosie-north-french-doors-stile-${side}`);
    addBox(rosieDoors, mx0, mx1, 0.06, 5.98, -11.08, -10.92, materials.whiteTrim, `rosie-north-french-doors-mullion-${side}`);
    addBox(rosieDoors, px0, px1, 0.06, 0.46, -11.08, -10.92, materials.whiteTrim, `rosie-north-french-doors-rail-bottom-${side}`);
    addBox(rosieDoors, px0, px1, 5.68, 5.98, -11.08, -10.92, materials.whiteTrim, `rosie-north-french-doors-rail-top-${side}`);
    addBox(rosieDoors, gx0, gx1, 0.46, 5.68, -11.04, -10.96, materials.glass, `rosie-north-french-doors-glass-${side}`);
    addBox(rosieDoors, hx - 0.03, hx + 0.03, 2.55, 3.35, -10.92, -10.82, materials.matteBlackIron, `rosie-north-french-doors-handle-${side}-int`);
    addBox(rosieDoors, hx - 0.03, hx + 0.03, 2.55, 3.35, -11.18, -11.08, materials.matteBlackIron, `rosie-north-french-doors-handle-${side}-ext`);
  }
  addBox(rosieDoors, 13.70, 14.55, 0.05, 6.2, -10.74, -10.52, blushCurtainMat, 'rosie-north-curtain-west');
  addBox(rosieDoors, 20.25, 21.10, 0.05, 6.2, -10.74, -10.52, blushCurtainMat, 'rosie-north-curtain-east');
  addBox(rosieDoors, 13.50, 21.30, 6.16, 6.23, -10.70, -10.62, materials.matteBlackIron, 'rosie-north-curtain-rod');
  windowsGroup.add(rosieDoors);

  // 6. Isaac east window + warm peach curtains (#e2b695) on east-isaac-navy (omitted in half-wall mode so nothing floats above 2.2 ft)
  if (wallMode !== 'half') {
    const isaacWin = buildFramedWindowX(windowsGroup, 'isaac-east-window', 23.5, 1.8, 4.5, 3.0, 8.6, 2, materials.whiteTrim, materials.glass, addBox);
    addBox(isaacWin, 23.06, 23.24, 1.6, 4.58, 2.40, 3.25, peachCurtainMat, 'isaac-east-curtain-north');
    addBox(isaacWin, 23.06, 23.24, 1.6, 4.58, 8.35, 9.20, peachCurtainMat, 'isaac-east-curtain-south');
    addBox(isaacWin, 23.12, 23.20, 4.54, 4.61, 2.25, 9.35, materials.matteBlackIron, 'isaac-east-curtain-rod');
  }

  shellGroup.add(windowsGroup);
}

function buildStairsDownToTier2(
  spec: Tier3LayoutSpec,
  wallMode: Tier3WallMode,
  materials: Tier3SceneMaterials,
  addBox: AddBoxFn,
): Group {
  const st = spec.stairsDownToTier2;
  const stairsDownGroup = namedGroup('stairsDownToTier2');
  stairsDownGroup.userData = { stepCount: 3, direction: '+z' };
  const jambHeight = wallMode === 'half' ? 2.6 : 4.6;

  // White door jambs framing the open south passage (x -3.4..-0.3, z 11.0)
  addBox(stairsDownGroup, st.xMin - 0.08, st.xMin + 0.08, 0, jambHeight, 10.74, 11.26, materials.whiteTrim, 'tier3-stair-jamb-w');
  addBox(stairsDownGroup, st.xMax - 0.08, st.xMax + 0.08, 0, jambHeight, 10.74, 11.26, materials.whiteTrim, 'tier3-stair-jamb-e');

  // Matte-black child safety gate (y 0..2.6) across the stair arrival doorway
  const gateGroup = namedGroup('tier3-safety-gate');
  const gx0 = st.xMin + 0.08;
  const gx1 = st.xMax - 0.08;
  addBox(gateGroup, gx0, gx0 + 0.09, 0.0, 2.6, 10.92, 11.02, materials.matteBlackIron, 'safety-gate-post-w');
  addBox(gateGroup, gx1 - 0.09, gx1, 0.0, 2.6, 10.92, 11.02, materials.matteBlackIron, 'safety-gate-post-e');
  addBox(gateGroup, gx0, gx1, 2.50, 2.60, 10.92, 11.02, materials.matteBlackIron, 'safety-gate-rail-top');
  addBox(gateGroup, gx0, gx1, 0.08, 0.18, 10.92, 11.02, materials.matteBlackIron, 'safety-gate-rail-bottom');
  for (let i = 0; i < 7; i += 1) {
    const sx = gx0 + 0.34 + i * 0.37;
    addBox(gateGroup, sx - 0.03, sx + 0.03, 0.18, 2.50, 10.94, 11.00, materials.matteBlackIron, `safety-gate-spindle-${i}`);
  }
  stairsDownGroup.add(gateGroup);

  // 3 descending hint treads on south side (z 11.0..12.2)
  const treadDepth = 0.4;
  for (let i = 0; i < 3; i += 1) {
    const tz0 = 11.0 + i * treadDepth;
    const tz1 = tz0 + treadDepth;
    const yTop = -0.35 - i * 0.6;
    const tread = addBox(
      stairsDownGroup, st.xMin + 0.05, st.xMax - 0.05, yTop - 0.11, yTop, tz0, tz1,
      materials.woodFloor, `tier3-stair-hint-tread-${i}`,
    );
    applyWorldSpaceFloorUVs(tread.geometry, { xMin: st.xMin + 0.05, xMax: st.xMax - 0.05, zMin: tz0, zMax: tz1 });
    addBox(
      stairsDownGroup, st.xMin + 0.08, st.xMax - 0.08, yTop - 0.6, yTop - 0.11, tz0, tz0 + 0.08,
      materials.whiteTrim, `tier3-stair-hint-riser-${i}`,
    );
  }

  return stairsDownGroup;
}

export function buildTier3Scene(options: BuildTier3SceneOptions = {}): BuiltTier3Scene {
  const spec = options.spec ?? TIER3_LAYOUT_SPEC;
  const wallMode: Tier3WallMode = options.wallMode ?? 'standard';
  const basePalette = createTier1Materials();
  const geometries: BufferGeometry[] = [];
  const localMats: MeshStandardMaterial[] = [];
  const accentMatCache = new Map<number, MeshStandardMaterial>();

  const slateTileFloor = new MeshStandardMaterial({ color: 0x32363b, roughness: 0.76, metalness: 0.08 });
  localMats.push(slateTileFloor);

  const materials: Tier3SceneMaterials = {
    ...basePalette,
    woodFloor: basePalette.oakFloor,
    slateTileFloor,
    dispose: () => {
      for (const m of localMats) m.dispose();
      basePalette.dispose();
    },
  };

  const addBox: AddBoxFn = (parent, x0, x1, y0, y1, z0, z1, mat, name) => {
    const geom = new BoxGeometry(Math.max(0.02, x1 - x0), Math.max(0.02, y1 - y0), Math.max(0.02, z1 - z0));
    geometries.push(geom);
    const mesh = new Mesh(geom, mat);
    if (name) mesh.name = name;
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const group = namedGroup('tier3-root');
  const shellGroup = namedGroup('tier3-shell');
  group.add(shellGroup);

  // Foundation plinth beneath Floor 3 slab
  const plinthGroup = namedGroup('tier3-foundation-plinth');
  addBox(plinthGroup, spec.xMin - 0.4, spec.xMax + 0.4, -0.42, -0.2, spec.zMin - 0.4, spec.zMax + 0.4, materials.foyerThreshold, 'tier3-plinth');
  shellGroup.add(plinthGroup);

  // Room groups and floor slabs
  const rooms = {} as Record<Tier3RoomId, Group>;
  const roomFloors = {} as Record<Tier3RoomId, Mesh>;
  for (const roomId of Object.keys(spec.rooms) as Tier3RoomId[]) {
    const rSpec = spec.rooms[roomId];
    const rGroup = namedGroup(`room-${rSpec.id}`);
    rGroup.userData = { roomId: rSpec.id, label: rSpec.label, floorMaterial: rSpec.floorMaterial };
    const floorMat = rSpec.floorMaterial === 'slate-tile' ? materials.slateTileFloor : materials.woodFloor;
    const floorMesh = addBox(
      rGroup, rSpec.bounds.xMin, rSpec.bounds.xMax, -0.2, 0.0, rSpec.bounds.zMin, rSpec.bounds.zMax,
      floorMat, `floor-${rSpec.id}`,
    );
    floorMesh.userData = { roomId: rSpec.id, label: rSpec.label, floorMaterial: rSpec.floorMaterial };
    if (rSpec.floorMaterial === 'wood') {
      applyWorldSpaceFloorUVs(floorMesh.geometry, rSpec.bounds);
    }
    roomFloors[roomId] = floorMesh;
    rooms[roomId] = rGroup;
    shellGroup.add(rGroup);
  }

  // Cutaway and accent walls + glazed/frosted windows & curtains
  const wallsGroup = namedGroup('tier3-walls');
  const wallsById: Record<string, Group> = {};
  for (const wall of spec.walls) {
    const wg = buildWallSegment(wall, wallMode, materials, accentMatCache, localMats, addBox);
    wallsById[wall.id] = wg;
    wallsGroup.add(wg);
  }
  shellGroup.add(wallsGroup);
  buildTier3Windows(shellGroup, wallMode, materials, localMats, addBox);

  // Stair arrival doorway down to Floor 2 with safety gate & 3 descending hint treads
  const stairsDownGroup = buildStairsDownToTier2(spec, wallMode, materials, addBox);
  shellGroup.add(stairsDownGroup);

  // Fixtures
  const fixturesBuilt = buildTier3Fixtures(materials, spec);
  group.add(fixturesBuilt.root);
  for (const key of Object.keys(fixturesBuilt.fixtures) as Tier3FixtureKey[]) {
    const fSpec = spec.fixtures[key];
    rooms[fSpec.roomId].add(fixturesBuilt.fixtures[key]);
  }

  // Balanced lighting (HemisphereLight, DirectionalLight with full-floor shadow frustum, 4 room PointLights)
  const lightsGroup = namedGroup('tier3-lights');
  const hemi = new HemisphereLight('#fffaf0', '#47505c', 1.05);
  hemi.position.set(0, 24, 0);
  const sun = new DirectionalLight('#fff6e8', 1.1);
  sun.position.set(12, 28, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 20, bottom: -20, near: 2, far: 65 });
  Object.assign(sun.shadow, { bias: -0.0006, normalBias: 0.04, radius: 2.5 });
  sun.shadow.camera.updateProjectionMatrix();
  lightsGroup.add(hemi, sun, sun.target);
  const roomPointSpecs: ReadonlyArray<[string, number, number, number, number]> = [
    ['#ffe9c8', 0.85, -14.5, 0.0, 28],
    ['#fff2dc', 0.88, -1.5, -1.0, 28],
    ['#f5f9ff', 0.82, 9.0, -4.5, 22],
    ['#ffe9c8', 0.85, 17.5, 0.5, 28],
  ];
  for (const [col, inten, px, pz, dist] of roomPointSpecs) {
    const pt = new PointLight(col, inten, dist, 1.4);
    pt.position.set(px, 7.2, pz);
    lightsGroup.add(pt);
  }
  shellGroup.add(lightsGroup);

  const scene = new Scene();
  scene.name = 'hearth-tier3-scene';
  scene.background = options.background === null ? null : new Color(options.background ?? '#13171e');
  scene.add(group);
  scene.updateMatrixWorld(true);

  return {
    scene, group, shellGroup, rooms, roomFloors, wallsById, stairsDownGroup,
    fixtures: fixturesBuilt.fixtures, ceilingFansGroup: fixturesBuilt.ceilingFansGroup, materials,
    dispose: () => {
      for (const g of geometries) g.dispose();
      fixturesBuilt.dispose();
      materials.dispose();
    },
  };
}
