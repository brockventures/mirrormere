import {
  BoxGeometry, Color, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial,
  PointLight, Scene, type BufferGeometry,
} from 'three';
import {
  TIER2_LAYOUT_SPEC, type Tier2Bounds2D, type Tier2FixtureKey, type Tier2LayoutSpec,
  type Tier2RoomId, type Tier2WallSpec,
} from './tier2LayoutSpec';
import { buildTier2Fixtures } from './tier2Fixtures';
import { createTier1Materials, type Tier1MaterialPalette } from './tier1Shell';

export interface Tier2SceneMaterials extends Tier1MaterialPalette {
  woodFloor: MeshStandardMaterial;
  slateTileFloor: MeshStandardMaterial;
}

export interface BuiltTier2Scene {
  scene: Scene;
  group: Group;
  shellGroup: Group;
  rooms: Readonly<Record<Tier2RoomId, Group>>;
  roomFloors: Readonly<Record<Tier2RoomId, Mesh>>;
  wallsById: Readonly<Record<string, Group>>;
  stairsUpGroup: Group;
  stairwellVoidGroup: Group;
  fixtures: Readonly<Record<Tier2FixtureKey, Group>>;
  materials: Tier2SceneMaterials;
  dispose: () => void;
}

export interface BuildTier2SceneOptions {
  background?: string | null;
  spec?: Tier2LayoutSpec;
}

interface WallApertureZ {
  z0: number;
  z1: number;
  y0: number;
  y1: number;
}

interface WallDoorwayCutoutX {
  x0: number;
  x1: number;
  y0: number;
}

const WALL_WINDOW_APERTURES: Readonly<Record<string, WallApertureZ>> = {
  'primary-bath-east-marble': { z0: -8.4, z1: -5.0, y0: 2.2, y1: 4.4 },
};

const WALL_DOORWAY_CUTOUTS: Readonly<Record<string, WallDoorwayCutoutX>> = {
  'stairwell-north-accent': { x0: -3.35, x1: -0.35, y0: 4.55 },
};

function namedGroup(name: string): Group {
  const g = new Group();
  g.name = name;
  return g;
}

function applyWorldSpaceFloorUVs(geom: BufferGeometry, bounds: Tier2Bounds2D): void {
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

function buildStairsAndVoid(
  spec: Tier2LayoutSpec,
  materials: Tier2SceneMaterials,
  localMats: MeshStandardMaterial[],
  addBox: AddBoxFn,
): { stairsUpGroup: Group; stairwellVoidGroup: Group } {
  const st = spec.stairsUpToTier3;
  const stairsUpGroup = namedGroup('stairsUpToTier3');
  stairsUpGroup.userData = { stepCount: st.stepCount, direction: st.direction };

  const runZ = (st.zMax - st.zMin) / st.stepCount;
  const riseY = (st.topElevationFt - st.bottomElevationFt) / st.stepCount;

  for (let i = 0; i < st.stepCount; i += 1) {
    const zFront = st.zMax - i * runZ;
    const zBack = st.zMax - (i + 1) * runZ;
    const yPrev = st.bottomElevationFt + i * riseY;
    const yTop = st.bottomElevationFt + (i + 1) * riseY;
    const tread = addBox(
      stairsUpGroup, st.xMin, st.xMax, yTop - 0.11, yTop, zBack, zFront,
      materials.woodFloor, `tier2-stair-tread-${i}`,
    );
    applyWorldSpaceFloorUVs(tread.geometry, { xMin: st.xMin, xMax: st.xMax, zMin: zBack, zMax: zFront });
    addBox(
      stairsUpGroup, st.xMin + 0.04, st.xMax - 0.04, yPrev, yTop - 0.11, zBack, zFront - 0.03,
      materials.whiteTrim, `tier2-stair-riser-${i}`,
    );
  }

  const topThreshold = addBox(
    stairsUpGroup, -3.35, -0.35, st.topElevationFt - 0.11, st.topElevationFt, -11.22, st.zMin,
    materials.woodFloor, 'tier2-stair-top-threshold',
  );
  applyWorldSpaceFloorUVs(topThreshold.geometry, { xMin: -3.35, xMax: -0.35, zMin: -11.22, zMax: st.zMin });

  // Matte-black horizontal iron railings along east edge of upward stairs
  const railX = st.xMax - 0.06;
  addBox(stairsUpGroup, railX - 0.04, railX + 0.04, 0, 3.0, st.zMax - 0.12, st.zMax - 0.04, materials.matteBlackIron, 'stairs-post-bottom');
  addBox(stairsUpGroup, railX - 0.04, railX + 0.04, st.topElevationFt, Math.min(st.topElevationFt + 2.0, 6.55), st.zMin + 0.04, st.zMin + 0.12, materials.matteBlackIron, 'stairs-post-top');
  for (const hOff of [0.8, 1.5, 2.2, 2.9]) {
    addBox(
      stairsUpGroup, railX - 0.03, railX + 0.03, st.topElevationFt * 0.5 + hOff - 0.03, st.topElevationFt * 0.5 + hOff + 0.03,
      st.zMin, st.zMax, materials.matteBlackIron, `stairs-rail-bar-${hOff}`,
    );
  }

  // Stairwell Void from Tier 1 on the East: U/L-turn staircase exiting at x: 3.1..5.6, z = -4.2
  const vd = spec.stairwellVoidFromTier1;
  const stairwellVoidGroup = namedGroup('stairwellVoidFromTier1');
  const shaftMat = new MeshStandardMaterial({ color: 0x151920, roughness: 0.9, metalness: 0.05 });
  localMats.push(shaftMat);

  addBox(stairwellVoidGroup, vd.xMin, vd.xMax, -2.6, -2.48, vd.zMin, vd.zMax, shaftMat, 'stairwell-void-bottom');
  addBox(stairwellVoidGroup, vd.xMin, vd.xMin + 0.08, -2.6, 0.0, vd.zMin, vd.zMax, shaftMat, 'stairwell-void-wall-west');
  addBox(stairwellVoidGroup, vd.xMax - 0.08, vd.xMax, -2.6, 0.0, vd.zMin, vd.zMax, shaftMat, 'stairwell-void-wall-east');
  addBox(stairwellVoidGroup, vd.xMin + 0.08, vd.xMax - 0.08, -2.6, 0.0, vd.zMin, vd.zMin + 0.08, shaftMat, 'stairwell-void-wall-north');
  addBox(stairwellVoidGroup, vd.xMin + 0.08, vd.xMax - 0.08, -2.6, 0.0, vd.zMax - 0.08, vd.zMax, shaftMat, 'stairwell-void-wall-south');

  // Central stair divider core separating west/north winders from east exit flight
  addBox(stairwellVoidGroup, 2.3, 3.1, -2.6, -0.07, -8.0, vd.zMax, materials.officeWall, 'stairwell-void-divider-core');
  addBox(stairwellVoidGroup, 2.3, 3.1, -0.07, 0.0, -8.0, vd.zMax, materials.whiteTrim, 'stairwell-void-divider-cap');

  const eastSpanZ = (vd.zMax - 0.08 - -8.0) / 5;
  const treads: Array<[number, number, number, number, number]> = [];
  for (let i = 0; i < 5; i += 1) {
    const z1 = vd.zMax - 0.08 - i * eastSpanZ;
    treads.push([3.12, vd.xMax - 0.1, z1 - eastSpanZ, z1, -0.22 - i * 0.28]);
  }
  treads.push(
    [3.12, vd.xMax - 0.1, vd.zMin + 0.1, -8.0, -1.62],
    [2.3, 3.12, vd.zMin + 0.1, -8.0, -1.86],
    [vd.xMin + 0.1, 2.3, vd.zMin + 0.1, -8.0, -2.08],
    [vd.xMin + 0.1, 2.28, -8.0, -6.3, -2.24],
    [vd.xMin + 0.1, 2.28, -6.3, -4.6, -2.36],
  );
  treads.forEach(([tx0, tx1, tz0, tz1, yTop], i) => {
    const tread = addBox(
      stairwellVoidGroup, tx0, tx1, yTop - 0.11, yTop, tz0, tz1,
      materials.woodFloor, `stairwell-void-tread-${i}`,
    );
    applyWorldSpaceFloorUVs(tread.geometry, { xMin: tx0, xMax: tx1, zMin: tz0, zMax: tz1 });
    addBox(
      stairwellVoidGroup, tx0 + 0.02, tx1 - 0.02, Math.max(-2.48, yTop - 0.36), yTop - 0.11, tz0, tz1,
      materials.whiteTrim, `stairwell-void-riser-${i}`,
    );
  });

  // South railing wraps x: -0.1..3.1 only, leaving east stair exit (x: 3.1..5.6, z: -4.2) open
  addBox(stairwellVoidGroup, vd.xMin - 0.04, vd.xMin + 0.04, 0, 3.05, vd.zMax - 0.04, vd.zMax + 0.04, materials.matteBlackIron, 'void-post-sw');
  addBox(stairwellVoidGroup, 3.06, 3.14, 0, 3.05, vd.zMax - 0.04, vd.zMax + 0.04, materials.matteBlackIron, 'void-post-s-mid');
  addBox(stairwellVoidGroup, vd.xMax - 0.04, vd.xMax + 0.04, 0, 3.05, vd.zMax - 0.04, vd.zMax + 0.04, materials.matteBlackIron, 'void-post-se');
  addBox(stairwellVoidGroup, vd.xMax - 0.04, vd.xMax + 0.04, 0, 3.05, vd.zMin - 0.04, vd.zMin + 0.04, materials.matteBlackIron, 'void-post-ne');
  for (const hOff of [0.8, 1.5, 2.2, 2.95]) {
    addBox(stairwellVoidGroup, vd.xMin, 3.1, hOff - 0.03, hOff + 0.03, vd.zMax - 0.04, vd.zMax + 0.04, materials.matteBlackIron, `void-rail-south-${hOff}`);
    addBox(stairwellVoidGroup, vd.xMax - 0.04, vd.xMax + 0.04, hOff - 0.03, hOff + 0.03, vd.zMin, vd.zMax, materials.matteBlackIron, `void-rail-east-${hOff}`);
  }

  return { stairsUpGroup, stairwellVoidGroup };
}

function buildWallSegment(
  wall: Tier2WallSpec,
  materials: Tier2SceneMaterials,
  accentMatCache: Map<number, MeshStandardMaterial>,
  localMats: MeshStandardMaterial[],
  addBox: AddBoxFn,
): Group {
  const wg = namedGroup(`wall-${wall.id}`);
  wg.userData = { wallId: wall.id, colorHex: wall.colorHex };

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
  const bodyTop = Math.max(0.2, wall.heightFt - capH);
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

  const ap = WALL_WINDOW_APERTURES[wall.id];
  const door = WALL_DOORWAY_CUTOUTS[wall.id];
  if (ap && !isHorizontal && ap.z0 > z0 && ap.z1 < z1) {
    addWallSpan(x0, x1, 0, bodyTop, z0, ap.z0, 'body');
    addWallSpan(x0, x1, 0, bodyTop, ap.z1, z1, 'body-south');
    addWallSpan(x0, x1, 0, ap.y0, ap.z0, ap.z1, 'sill');
    if (ap.y1 < bodyTop) {
      addWallSpan(x0, x1, ap.y1, bodyTop, ap.z0, ap.z1, 'header');
    }
    addBox(wg, x0, x1, bodyTop, wall.heightFt, z0, z1, materials.whiteTrim, `${wall.id}-cap`);
  } else if (door && isHorizontal && door.x0 > x0 && door.x1 < x1) {
    addWallSpan(x0, door.x0, 0, bodyTop, z0, z1, 'body-west');
    addWallSpan(door.x1, x1, 0, bodyTop, z0, z1, 'body');
    addWallSpan(door.x0, door.x1, 0, door.y0, z0, z1, 'sill');
    addBox(wg, x0, door.x0, bodyTop, wall.heightFt, z0, z1, materials.whiteTrim, `${wall.id}-cap-west`);
    addBox(wg, door.x1, x1, bodyTop, wall.heightFt, z0, z1, materials.whiteTrim, `${wall.id}-cap-east`);
    addBox(wg, -3.42, -3.30, door.y0, wall.heightFt, z0 - 0.02, z1 + 0.02, materials.whiteTrim, 'tier3-doorway-jamb-w');
    addBox(wg, -0.40, -0.28, door.y0, wall.heightFt, z0 - 0.02, z1 + 0.02, materials.whiteTrim, 'tier3-doorway-jamb-e');
  } else {
    addWallSpan(x0, x1, 0, bodyTop, z0, z1, 'body');
    addBox(wg, x0, x1, bodyTop, wall.heightFt, z0, z1, materials.whiteTrim, `${wall.id}-cap`);
  }
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

function buildTier2Windows(
  shellGroup: Group,
  materials: Tier2SceneMaterials,
  localMats: MeshStandardMaterial[],
  addBox: AddBoxFn,
): void {
  const windowsGroup = namedGroup('tier2-windows');
  const frostedGlass = new MeshStandardMaterial({
    color: 0xdff0fa, roughness: 0.44, metalness: 0.05, transparent: true, opacity: 0.56,
  });
  const curtainMat = new MeshStandardMaterial({ color: 0xe6dfd3, roughness: 0.88, metalness: 0.02 });
  localMats.push(frostedGlass, curtainMat);

  // 1. Living Room West window south of fireplace (x = -20.0, z: 2.4..9.4, y: 1.8..4.5)
  buildFramedWindowX(windowsGroup, 'living-west-window', -20.0, 1.8, 4.5, 2.4, 9.4, 3, materials.whiteTrim, materials.glass, addBox);

  // 2. South Living 3-panel window (z = 11.0, x: -18.8..-9.4, y: 1.8..4.5)
  buildFramedWindowZ(windowsGroup, 'south-bench-window', -18.8, -9.4, 1.8, 4.5, 11.0, 3, materials.whiteTrim, materials.glass, addBox);

  // 3. Primary Bedroom South window behind King Bed + flanking curtain panels (z = 11.0, x: 11.8..19.2, y: 1.8..4.5)
  const primaryWin = buildFramedWindowZ(windowsGroup, 'primary-south-window', 11.8, 19.2, 1.8, 4.5, 11.0, 3, materials.whiteTrim, materials.glass, addBox);
  addBox(primaryWin, 11.35, 12.05, 1.8, 4.6, 10.68, 10.86, curtainMat, 'primary-south-curtain-west');
  addBox(primaryWin, 18.95, 19.65, 1.8, 4.6, 10.68, 10.86, curtainMat, 'primary-south-curtain-east');
  addBox(primaryWin, 11.15, 19.85, 4.56, 4.63, 10.72, 10.79, materials.matteBlackIron, 'primary-south-curtain-rod');

  // 4. Primary En-Suite Bath East frosted window (x = 23.5, z: -8.4..-5.0, y: 2.2..4.4)
  buildFramedWindowX(windowsGroup, 'primary-bath-east-window', 23.5, 2.2, 4.4, -8.4, -5.0, 1, materials.whiteTrim, frostedGlass, addBox);

  shellGroup.add(windowsGroup);
}

export function buildTier2Scene(options: BuildTier2SceneOptions = {}): BuiltTier2Scene {
  const spec = options.spec ?? TIER2_LAYOUT_SPEC;
  const basePalette = createTier1Materials();
  const geometries: BufferGeometry[] = [];
  const localMats: MeshStandardMaterial[] = [];
  const accentMatCache = new Map<number, MeshStandardMaterial>();

  const slateTileFloor = new MeshStandardMaterial({ color: 0x32363b, roughness: 0.76, metalness: 0.08 });
  localMats.push(slateTileFloor);

  const materials: Tier2SceneMaterials = {
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

  const group = namedGroup('tier2-root');
  const shellGroup = namedGroup('tier2-shell');
  group.add(shellGroup);

  // Foundation plinth beneath Floor 2 slab (split around stairwell void so shaft stays open)
  const vd = spec.stairwellVoidFromTier1;
  const plinthGroup = namedGroup('tier2-foundation-plinth');
  addBox(plinthGroup, spec.xMin - 0.4, vd.xMin, -0.42, -0.2, spec.zMin - 0.4, spec.zMax + 0.4, materials.foyerThreshold, 'tier2-plinth-west');
  addBox(plinthGroup, vd.xMax, spec.xMax + 0.4, -0.42, -0.2, spec.zMin - 0.4, spec.zMax + 0.4, materials.foyerThreshold, 'tier2-plinth-east');
  addBox(plinthGroup, vd.xMin, vd.xMax, -0.42, -0.2, spec.zMin - 0.4, vd.zMin, materials.foyerThreshold, 'tier2-plinth-north');
  addBox(plinthGroup, vd.xMin, vd.xMax, -0.42, -0.2, vd.zMax, spec.zMax + 0.4, materials.foyerThreshold, 'tier2-plinth-south');
  shellGroup.add(plinthGroup);

  // Room groups and floor slabs
  const rooms = {} as Record<Tier2RoomId, Group>;
  const roomFloors = {} as Record<Tier2RoomId, Mesh>;
  for (const roomId of Object.keys(spec.rooms) as Tier2RoomId[]) {
    const rSpec = spec.rooms[roomId];
    const rGroup = namedGroup(`room-${rSpec.id}`);
    rGroup.userData = { roomId: rSpec.id, label: rSpec.label, floorMaterial: rSpec.floorMaterial };
    const floorMat = rSpec.floorMaterial === 'slate-tile' ? materials.slateTileFloor : materials.woodFloor;
    if (roomId === 'stairLanding') {
      const b = rSpec.bounds;
      const mainFloor = addBox(
        rGroup, b.xMin, b.xMax, -0.2, 0.0, vd.zMax, b.zMax,
        floorMat, 'floor-stairLanding',
      );
      mainFloor.userData = { roomId: rSpec.id, label: rSpec.label, floorMaterial: rSpec.floorMaterial };
      applyWorldSpaceFloorUVs(mainFloor.geometry, { xMin: b.xMin, xMax: b.xMax, zMin: vd.zMax, zMax: b.zMax });
      roomFloors[roomId] = mainFloor;

      const subSlabs: Array<[string, Tier2Bounds2D]> = [
        ['floor-stairLanding-west', { xMin: b.xMin, xMax: vd.xMin, zMin: b.zMin, zMax: vd.zMax }],
        ['floor-stairLanding-north', { xMin: vd.xMin, xMax: b.xMax, zMin: b.zMin, zMax: vd.zMin }],
        ['floor-stairLanding-east', { xMin: vd.xMax, xMax: b.xMax, zMin: vd.zMin, zMax: vd.zMax }],
      ];
      for (const [slabName, sb] of subSlabs) {
        const subMesh = addBox(rGroup, sb.xMin, sb.xMax, -0.2, 0.0, sb.zMin, sb.zMax, floorMat, slabName);
        subMesh.userData = { roomId: rSpec.id, label: rSpec.label, floorMaterial: rSpec.floorMaterial };
        applyWorldSpaceFloorUVs(subMesh.geometry, sb);
      }
    } else {
      const floorMesh = addBox(
        rGroup, rSpec.bounds.xMin, rSpec.bounds.xMax, -0.2, 0.0, rSpec.bounds.zMin, rSpec.bounds.zMax,
        floorMat, `floor-${rSpec.id}`,
      );
      floorMesh.userData = { roomId: rSpec.id, label: rSpec.label, floorMaterial: rSpec.floorMaterial };
      if (rSpec.floorMaterial === 'wood') {
        applyWorldSpaceFloorUVs(floorMesh.geometry, rSpec.bounds);
      }
      roomFloors[roomId] = floorMesh;
    }
    rooms[roomId] = rGroup;
    shellGroup.add(rGroup);
  }

  // Cutaway and accent walls + glazed/frosted windows
  const wallsGroup = namedGroup('tier2-walls');
  const wallsById: Record<string, Group> = {};
  for (const wall of spec.walls) {
    const wg = buildWallSegment(wall, materials, accentMatCache, localMats, addBox);
    wallsById[wall.id] = wg;
    wallsGroup.add(wg);
  }
  shellGroup.add(wallsGroup);
  buildTier2Windows(shellGroup, materials, localMats, addBox);

  // Half-flight stairs to Tier 3 + Stairwell void from Tier 1
  const { stairsUpGroup, stairwellVoidGroup } = buildStairsAndVoid(spec, materials, localMats, addBox);
  shellGroup.add(stairsUpGroup, stairwellVoidGroup);

  // Fixtures
  const fixturesBuilt = buildTier2Fixtures(materials, spec);
  group.add(fixturesBuilt.root);
  for (const key of Object.keys(fixturesBuilt.fixtures) as Tier2FixtureKey[]) {
    const fSpec = spec.fixtures[key];
    rooms[fSpec.roomId].add(fixturesBuilt.fixtures[key]);
  }

  // Lighting
  const lightsGroup = namedGroup('tier2-lights');
  const hemi = new HemisphereLight('#fffaf0', '#47505c', 0.95);
  hemi.position.set(0, 24, 0);
  const sun = new DirectionalLight('#fff6e8', 1.35);
  sun.position.set(12, 28, 18);
  sun.castShadow = true;
  const livingPt = new PointLight('#ffe9c8', 0.85, 28, 1.4);
  livingPt.position.set(-11.8, 7.2, -1.5);
  const landingPt = new PointLight('#fff2dc', 0.72, 24, 1.4);
  landingPt.position.set(3.2, 7.2, -3.5);
  const primaryPt = new PointLight('#ffe9c8', 0.85, 28, 1.4);
  primaryPt.position.set(15.0, 7.2, 4.2);
  const bathPt = new PointLight('#f5f9ff', 0.85, 24, 1.4);
  bathPt.position.set(15.8, 7.2, -6.8);
  lightsGroup.add(hemi, sun, sun.target, livingPt, landingPt, primaryPt, bathPt);
  shellGroup.add(lightsGroup);

  const scene = new Scene();
  scene.name = 'hearth-tier2-scene';
  scene.background = options.background === null ? null : new Color(options.background ?? '#13171e');
  scene.add(group);
  scene.updateMatrixWorld(true);

  return {
    scene,
    group,
    shellGroup,
    rooms,
    roomFloors,
    wallsById,
    stairsUpGroup,
    stairwellVoidGroup,
    fixtures: fixturesBuilt.fixtures,
    materials,
    dispose: () => {
      for (const g of geometries) g.dispose();
      fixturesBuilt.dispose();
      materials.dispose();
    },
  };
}
