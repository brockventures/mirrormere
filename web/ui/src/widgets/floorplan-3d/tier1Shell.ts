import {
  BoxGeometry, CanvasTexture, Color, DataTexture, DirectionalLight, Group, HemisphereLight,
  Mesh, MeshStandardMaterial, PointLight, RepeatWrapping, RGBAFormat, SRGBColorSpace, Vector3,
  type BufferGeometry, type Texture,
} from 'three';
import {
  FOYER_STAIRCASE, TIER1_HA_BINDINGS, TIER1_ROOMS, TIER1_WALLS, UPPER_FLOOR_MASSING, wallHeightAtZ,
  type RoomId, type UpperMassingId, type WallDoorwayCutoutSpec, type WallSegmentSpec,
} from './tier1LayoutSpec';

export interface Tier1MaterialPalette {
  oakFloor: MeshStandardMaterial; foyerFloor: MeshStandardMaterial; garageFloor: MeshStandardMaterial;
  stairTread: MeshStandardMaterial;
  trellisRug: MeshStandardMaterial; pastelCirclesRug: MeshStandardMaterial;
  wrigleyArt: MeshStandardMaterial; collectorCardArt: MeshStandardMaterial; brockStudiosSign: MeshStandardMaterial;
  officeWall: MeshStandardMaterial; garageWall: MeshStandardMaterial; foyerSlateWall: MeshStandardMaterial;
  whiteTrim: MeshStandardMaterial; glass: MeshStandardMaterial; brushedSteel: MeshStandardMaterial;
  matteBlackIron: MeshStandardMaterial; concreteCurb: MeshStandardMaterial; foyerThreshold: MeshStandardMaterial;
  upperMassingSouth: MeshStandardMaterial; upperMassingNorth: MeshStandardMaterial;
  textures: Texture[]; materials: MeshStandardMaterial[]; dispose: () => void;
}

export interface Tier1ShellLights {
  hemisphere: HemisphereLight; sun: DirectionalLight; roomPoints: Readonly<Record<RoomId, PointLight>>;
}

export interface Tier1ShellBuildResult {
  root: Group; floors: Readonly<Record<RoomId, Mesh>>; wallsById: Readonly<Record<string, Group>>;
  staircaseGroup: Group; stairTreads: readonly Mesh[]; upperMassingGroup: Group;
  upperMassingMeshes: Readonly<Record<UpperMassingId, Mesh>>; lights: Tier1ShellLights;
  setUpperMassingVisible: (visible: boolean) => void; dispose: () => void;
}

const namedGroup = (name: string): Group => { const g = new Group(); g.name = name; return g; };

const HONEY_PLANK_TONES = ['#a47140', '#996738', '#a16e3d', '#966436'] as const;
const HONEY_PLANK_JOINTS: ReadonlyArray<readonly number[]> = [
  [84, 344], [208, 456], [62, 286], [152, 364, 476],
  [76, 256], [168, 412], [52, 232, 348], [124, 424],
  [224, 362, 486], [96, 298], [184, 438], [68, 268, 382],
  [156, 452], [48, 236, 368], [138, 304, 464], [212, 404],
];

function strokeGrainWave(ctx: CanvasRenderingContext2D, w: number, baseY: number, amp: number, freq: number, phase: number): void {
  const segs = 8;
  ctx.beginPath();
  for (let s = 0; s <= segs; s += 1) {
    const x = (s / segs) * w;
    const y = baseY + Math.sin((s / segs) * Math.PI * 2 * freq + phase) * amp;
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawHoneyWoodPlanks(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#9e6b3b';
  ctx.fillRect(0, 0, w, h);
  const rowCount = HONEY_PLANK_JOINTS.length;
  const plankH = h / rowCount;
  const [sx, sy] = [w / 512, plankH / 32];
  for (let r = 0; r < rowCount; r += 1) {
    const y0 = r * plankH;
    const joints = HONEY_PLANK_JOINTS[r].map((j) => Math.round(j * sx));
    const stops = [0, ...joints, w];
    const rowTones = [HONEY_PLANK_TONES[r % 4], HONEY_PLANK_TONES[(r + 1 + (r % 2)) % 4], HONEY_PLANK_TONES[(r + 2 + (r % 2)) % 4]];
    for (let b = 0; b < stops.length - 1; b += 1) {
      ctx.fillStyle = b === stops.length - 2 ? rowTones[0] : rowTones[b % 3];
      ctx.fillRect(stops[b], y0, stops[b + 1] - stops[b], plankH);
    }
    ctx.fillStyle = 'rgba(156, 104, 57, 0.72)';
    ctx.fillRect(0, y0, w, plankH);
    ctx.fillStyle = 'rgba(122, 82, 44, 0.10)';
    ctx.fillRect(0, y0 + (6 + (r % 3) * 1.5) * sy, w, 1.4 * sy);
    ctx.fillRect(0, y0 + (20 + ((r + 1) % 3) * 1.5) * sy, w, 1.2 * sy);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(110, 68, 32, 0.11)';
    for (let f = 0; f < 6; f += 1) strokeGrainWave(ctx, w, y0 + (3 + f * 4.8) * sy, (1.1 + ((r + f) % 2) * 0.45) * sy, 1 + ((r + f) % 2), r * 1.7 + f * 1.1);
    ctx.strokeStyle = 'rgba(181, 128, 78, 0.09)';
    for (let f = 0; f < 4; f += 1) strokeGrainWave(ctx, w, y0 + (5.2 + f * 6.4) * sy, (0.9 + ((r + f) % 2) * 0.35) * sy, 1 + (f % 2), r * 2.1 + f * 1.4);
    ctx.strokeStyle = 'rgba(71, 42, 18, 0.24)';
    ctx.beginPath(); ctx.moveTo(0, y0 + 0.5); ctx.lineTo(w, y0 + 0.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(68, 40, 18, 0.22)';
    ctx.beginPath();
    for (const j of joints) { ctx.moveTo(j + 0.5, y0); ctx.lineTo(j + 0.5, y0 + plankH); }
    ctx.stroke();
  }
}

function makeTexture(
  w: number, h: number, hex: string,
  draw: (ctx: CanvasRenderingContext2D, cw: number, ch: number) => void, repeat: readonly [number, number] = [1, 1],
): Texture {
  let ctx: CanvasRenderingContext2D | null = null;
  let canvas: HTMLCanvasElement | null = null;
  const isUnmockedJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)
    && typeof HTMLCanvasElement !== 'undefined' && !('mock' in HTMLCanvasElement.prototype.getContext);
  if (typeof document !== 'undefined' && !isUnmockedJsdom) {
    try { canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h; ctx = canvas.getContext('2d'); } catch { ctx = null; }
  }
  let tex: Texture;
  if (ctx && canvas) {
    draw(ctx, w, h);
    tex = new CanvasTexture(canvas);
  } else {
    const c = new Color(hex);
    tex = new DataTexture(new Uint8Array([Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255), 255]), 1, 1, RGBAFormat);
  }
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.needsUpdate = true;
  return tex;
}

export function createTier1Materials(): Tier1MaterialPalette {
  const textures: Texture[] = [];
  const materials: MeshStandardMaterial[] = [];
  const mat = (opts: ConstructorParameters<typeof MeshStandardMaterial>[0]) => { const m = new MeshStandardMaterial(opts); materials.push(m); return m; };
  const texMat = (w: number, h: number, hex: string, draw: (ctx: CanvasRenderingContext2D, cw: number, ch: number) => void, roughness = 0.78, repeat: readonly [number, number] = [1, 1]) => {
    const map = makeTexture(w, h, hex, draw, repeat); textures.push(map); return mat({ map, roughness, metalness: 0.04 });
  };
  const honeyWoodFloor = texMat(512, 512, TIER1_ROOMS.office.floorColor, drawHoneyWoodPlanks, 0.58, [4, 4]);

  return {
    oakFloor: honeyWoodFloor,
    foyerFloor: honeyWoodFloor,
    garageFloor: texMat(256, 256, TIER1_ROOMS.garage.floorColor, (ctx, w, h) => {
      ctx.fillStyle = TIER1_ROOMS.garage.floorColor; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(110, 118, 126, 0.14)'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    }, 0.78, [3, 3]),
    stairTread: texMat(128, 128, FOYER_STAIRCASE.treadColor, (ctx, w, h) => {
      ctx.fillStyle = FOYER_STAIRCASE.treadColor; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(122, 82, 44, 0.10)';
      for (let y = 16; y < h; y += 24) ctx.fillRect(0, y, w, 2);
      ctx.strokeStyle = 'rgba(68, 40, 18, 0.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h * 0.5 + 0.5); ctx.lineTo(w, h * 0.5 + 0.5); ctx.stroke();
    }, 0.56, [1, 1]),
    trellisRug: texMat(256, 256, '#233654', (ctx, w, h) => {
      ctx.fillStyle = '#233654'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#efeae0'; ctx.lineWidth = 5; ctx.strokeRect(10, 10, w - 20, h - 20);
      for (let i = -w; i < w * 2; i += 48) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.moveTo(i + h, 0); ctx.lineTo(i, h); ctx.stroke(); }
    }, 0.9),
    pastelCirclesRug: texMat(256, 256, '#e8e2d8', (ctx, w, h) => {
      ctx.fillStyle = '#e8e2d8'; ctx.fillRect(0, 0, w, h);
      for (const [cx, cy, r, col] of [[64, 68, 34, '#9ab7b0'], [152, 60, 28, '#d9a992'], [200, 140, 32, '#8da4bc'], [92, 172, 36, '#d2c596']] as const) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }
    }, 0.9),
    wrigleyArt: texMat(256, 160, '#2b4c3f', (ctx, w, h) => {
      ctx.fillStyle = '#f2efe9'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#2b4c3f';
      ctx.fillRect(16, 16, 104, h - 32); ctx.fillRect(136, 16, 104, h - 32); ctx.fillStyle = '#b6342c'; ctx.fillRect(28, 28, 80, 22);
    }, 0.55),
    collectorCardArt: texMat(256, 192, '#1e2229', (ctx, w, h) => {
      ctx.fillStyle = '#1e2229'; ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < 3; r += 1) for (let c = 0; c < 4; c += 1) {
        ctx.fillStyle = '#f4efe4'; ctx.fillRect(16 + c * 58, 14 + r * 56, 46, 46);
        ctx.fillStyle = (r + c) % 2 === 0 ? '#2c4a70' : '#d9b36c'; ctx.fillRect(21 + c * 58, 19 + r * 56, 36, 26);
      }
    }, 0.5),
    brockStudiosSign: texMat(512, 128, '#1c2127', (ctx, w, h) => {
      ctx.fillStyle = '#1c2127'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#7d937c'; ctx.lineWidth = 6; ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = '#f2efe6'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BROCK STUDIOS', w / 2, h / 2);
    }, 0.45),
    officeWall: mat({ color: '#f3efe8', roughness: 0.88 }),
    garageWall: mat({ color: '#eceee9', roughness: 0.88 }),
    foyerSlateWall: mat({ color: '#2c323b', roughness: 0.86 }),
    whiteTrim: mat({ color: '#f8f8f6', roughness: 0.52 }),
    glass: mat({ color: '#9ac7e3', transparent: true, opacity: 0.36, roughness: 0.12, metalness: 0.1 }),
    brushedSteel: mat({ color: '#c8cfd6', roughness: 0.32, metalness: 0.78 }),
    matteBlackIron: mat({ color: FOYER_STAIRCASE.railingColor, roughness: 0.48, metalness: 0.62 }),
    concreteCurb: mat({ color: '#b8bec4', roughness: 0.82 }),
    foyerThreshold: mat({ color: '#3a404a', roughness: 0.76 }),
    upperMassingSouth: mat({ color: UPPER_FLOOR_MASSING.tier2South.color, transparent: true, opacity: 0.38, roughness: 0.7 }),
    upperMassingNorth: mat({ color: UPPER_FLOOR_MASSING.tier3North.color, transparent: true, opacity: 0.38, roughness: 0.7 }),
    textures,
    materials,
    dispose: () => {
      for (const t of new Set(textures)) t.dispose();
      for (const m of new Set(materials)) m.dispose();
    },
  };
}

type PrismFn = (parent: Group, x0: number, x1: number, z0: number, z1: number, yb0: number, yb1: number, yt0: number, yt1: number, mat: MeshStandardMaterial, name?: string) => Mesh;

function buildWallGroup(wall: WallSegmentSpec, palette: Tier1MaterialPalette, addPrism: PrismFn): Group {
  const wg = namedGroup(wall.id);
  const mainMat = wall.id === 'cutaway-south-garage-curb' ? palette.concreteCurb
    : wall.id === 'cutaway-south-foyer-sill' ? palette.foyerThreshold
    : wall.color === '#2c323b' ? palette.foyerSlateWall : wall.color === '#eceee9' ? palette.garageWall : palette.officeWall;
  const zStops = Array.from(new Set([wall.zMin, wall.zMax, ...wall.doorways.flatMap((d: WallDoorwayCutoutSpec) => [d.zMin, d.zMax])])).sort((a: number, b: number) => a - b);
  for (let i = 0; i < zStops.length - 1; i += 1) {
    const [z0, z1] = [zStops[i], zStops[i + 1]];
    if (z1 - z0 < 1e-4) continue;
    const door = wall.doorways.find((d: WallDoorwayCutoutSpec) => (z0 + z1) / 2 > d.zMin && (z0 + z1) / 2 < d.zMax);
    const [h0, h1, yBot] = [wallHeightAtZ(wall, z0), wallHeightAtZ(wall, z1), door ? door.yMax : 0];
    if (Math.min(h0, h1) <= yBot + 0.02) continue;
    const hasTrim = Math.min(h0, h1) >= 1.0;
    const cap = hasTrim ? 0.07 : 0;
    if (wall.foyerSideColor) {
      const xm = (wall.xMin + wall.xMax) / 2;
      addPrism(wg, wall.xMin, xm, z0, z1, yBot, yBot, h0 - cap, h1 - cap, xm < 0 ? mainMat : palette.foyerSlateWall);
      addPrism(wg, xm, wall.xMax, z0, z1, yBot, yBot, h0 - cap, h1 - cap, xm < 0 ? palette.foyerSlateWall : mainMat);
    } else {
      addPrism(wg, wall.xMin, wall.xMax, z0, z1, yBot, yBot, h0 - cap, h1 - cap, mainMat);
    }
    if (hasTrim) {
      addPrism(wg, wall.xMin, wall.xMax, z0, z1, h0 - cap, h1 - cap, h0, h1, palette.whiteTrim, `${wall.id}-cap`);
      if (!door) addPrism(wg, wall.xMin - 0.015, wall.xMax + 0.015, z0, z1, 0, 0, 0.25, 0.25, palette.whiteTrim, `${wall.id}-baseboard`);
    }
  }
  return wg;
}

function applyWorldFloorUVs(geom: BufferGeometry, x0: number, x1: number, z0: number, z1: number): void {
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;
  if (!pos || !uv) return;
  const [cx, cz] = [(x0 + x1) / 2, (z0 + z1) / 2];
  for (let i = 0; i < pos.count; i += 1) {
    const wx = cx + pos.getX(i);
    const wz = cz + pos.getZ(i);
    uv.setXY(i, (wx + 20.0) / 16.0, (wz + 12.6) / 16.0);
  }
  uv.needsUpdate = true;
}

export function buildTier1Shell(palette: Tier1MaterialPalette): Tier1ShellBuildResult {
  const geometries: BufferGeometry[] = [];
  const root = namedGroup('tier1-shell');
  const addPrism: PrismFn = (parent, x0, x1, z0, z1, yb0, yb1, yt0, yt1, mat, name) => {
    const geom = new BoxGeometry(x1 - x0, 1, z1 - z0);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const zNeg = pos.getZ(i) < 0;
      pos.setY(i, pos.getY(i) < 0 ? (zNeg ? yb0 : yb1) : (zNeg ? yt0 : yt1));
    }
    geom.computeVertexNormals(); geom.computeBoundingBox(); geometries.push(geom);
    const mesh = new Mesh(geom, mat);
    if (name) mesh.name = name;
    mesh.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
    return mesh;
  };

  const floorsGroup = namedGroup('tier1-floors');
  addPrism(floorsGroup, -20.5, 24.0, -13.1, 11.3, -0.42, -0.42, -0.2, -0.2, palette.foyerThreshold, 'foundation-plinth');
  const alcoveFloor = addPrism(floorsGroup, -8.6, -3.5, -12.6, -11.0, -0.2, -0.2, 0.0, 0.0, palette.oakFloor, 'floor-office-wetbar-alcove');
  applyWorldFloorUVs(alcoveFloor.geometry, -8.6, -3.5, -12.6, -11.0);
  const mkFloor = (id: RoomId, m: MeshStandardMaterial) => addPrism(floorsGroup, TIER1_ROOMS[id].xMin, TIER1_ROOMS[id].xMax, TIER1_ROOMS[id].zMin, TIER1_ROOMS[id].zMax, -0.2, -0.2, 0, 0, m, `floor-${id}`);
  const floors: Record<RoomId, Mesh> = { office: mkFloor('office', palette.oakFloor), foyer: mkFloor('foyer', palette.foyerFloor), garage: mkFloor('garage', palette.garageFloor) };
  applyWorldFloorUVs(floors.office.geometry, TIER1_ROOMS.office.xMin, TIER1_ROOMS.office.xMax, TIER1_ROOMS.office.zMin, TIER1_ROOMS.office.zMax);
  applyWorldFloorUVs(floors.foyer.geometry, TIER1_ROOMS.foyer.xMin, TIER1_ROOMS.foyer.xMax, TIER1_ROOMS.foyer.zMin, TIER1_ROOMS.foyer.zMax);
  root.add(floorsGroup);

  const wallsGroup = namedGroup('tier1-walls');
  const wallsById: Record<string, Group> = {};
  for (const wall of TIER1_WALLS) { const wg = buildWallGroup(wall, palette, addPrism); wallsById[wall.id] = wg; wallsGroup.add(wg); }
  root.add(wallsGroup);

  const st = FOYER_STAIRCASE;
  const staircaseGroup = namedGroup(st.id);
  staircaseGroup.userData = { hasRearShelves: st.hasRearShelves };
  const stairTreads: Mesh[] = [];

  const lowerRun = (st.zStart - st.zLandingSouth) / st.lowerTreadCount;
  const lowerRise = (st.yLanding - st.yStart) / st.lowerTreadCount;
  for (let i = 0; i < st.lowerTreadCount; i += 1) {
    const zFront = st.zStart - i * lowerRun;
    const zBack = st.zStart - (i + 1) * lowerRun;
    const yPrev = st.yStart + i * lowerRise;
    const yTop = st.yStart + (i + 1) * lowerRise;
    stairTreads.push(addPrism(staircaseGroup, st.xMin, st.xMax, zBack, zFront, yTop - 0.11, yTop - 0.11, yTop, yTop, palette.stairTread, `stair-tread-${i}`));
    addPrism(staircaseGroup, st.xMin + 0.04, st.xMax - 0.08, zBack, zFront - 0.04, yPrev, yPrev, yTop - 0.11, yTop - 0.11, palette.whiteTrim, `stair-riser-${i}`);
    if (i % 3 === 0) {
      const zp = (zFront + zBack) / 2;
      addPrism(staircaseGroup, st.railingX - 0.04, st.railingX + 0.04, zp - 0.04, zp + 0.04, yTop, yTop, yTop + 2.9, yTop + 2.9, palette.matteBlackIron, `stair-post-lower-${i}`);
    }
  }

  addPrism(staircaseGroup, st.xMin, st.xMax, st.zEnd, st.zLandingSouth, st.yLanding - 0.14, st.yLanding - 0.14, st.yLanding, st.yLanding, palette.stairTread, 'stair-landing');
  addPrism(staircaseGroup, st.xMin + 0.04, st.xMax - 0.04, st.zEnd + 0.04, st.zLandingSouth - 0.02, st.yLanding - 0.48, st.yLanding - 0.48, st.yLanding - 0.14, st.yLanding - 0.14, palette.whiteTrim, 'stair-landing-trim');
  addPrism(staircaseGroup, st.railingX - 0.04, st.railingX + 0.04, st.upperRailingZ - 0.04, st.upperRailingZ + 0.04, st.yLanding, st.yLanding, st.yLanding + 2.9, st.yLanding + 2.9, palette.matteBlackIron, 'stair-post-corner');

  const [upperRun, upperRise] = [(st.xTurnEnd - st.xTurnStart) / st.upperTreadCount, (st.yEnd - st.yLanding) / st.upperTreadCount];
  for (let j = 0; j < st.upperTreadCount; j += 1) {
    const [idx, xLeft, xRight] = [st.lowerTreadCount + j, st.xTurnStart + j * upperRun, st.xTurnStart + (j + 1) * upperRun];
    const [yPrev, yTop] = [st.yLanding + j * upperRise, st.yLanding + (j + 1) * upperRise];
    stairTreads.push(addPrism(staircaseGroup, xLeft, xRight, st.turnZMin, st.turnZMax, yTop - 0.11, yTop - 0.11, yTop, yTop, palette.stairTread, `stair-tread-${idx}`));
    addPrism(staircaseGroup, xLeft + 0.04, xRight, st.turnZMin + 0.04, st.turnZMax - 0.04, yPrev, yPrev, yTop - 0.11, yTop - 0.11, palette.whiteTrim, `stair-riser-${idx}`);
    if (j === 1 || j === st.upperTreadCount - 1) {
      const xp = j === st.upperTreadCount - 1 ? st.xTurnEnd - 0.08 : (xLeft + xRight) / 2;
      addPrism(staircaseGroup, xp - 0.04, xp + 0.04, st.upperRailingZ - 0.04, st.upperRailingZ + 0.04, yTop, yTop, yTop + 2.9, yTop + 2.9, palette.matteBlackIron, `stair-post-upper-${j}`);
    }
  }

  const addRailBar = (p0: Vector3, p1: Vector3, isTopRail: boolean, name: string) => {
    const barGeom = new BoxGeometry(isTopRail ? 0.08 : 0.045, isTopRail ? 0.07 : 0.045, p0.distanceTo(p1));
    geometries.push(barGeom);
    const bar = new Mesh(barGeom, palette.matteBlackIron);
    bar.name = name; bar.position.copy(p0).add(p1).multiplyScalar(0.5); bar.lookAt(p1); bar.castShadow = true;
    staircaseGroup.add(bar);
  };

  for (const hOff of [0.8, 1.5, 2.2, 2.9]) {
    const isTop = hOff === 2.9;
    const pLowerStart = new Vector3(st.railingX, st.yStart + lowerRise + hOff, st.zStart - lowerRun * 0.5);
    const pCorner = new Vector3(st.railingX, st.yLanding + hOff, st.upperRailingZ);
    const pUpperEnd = new Vector3(st.xTurnEnd - 0.08, st.yEnd + hOff, st.upperRailingZ);
    addRailBar(pLowerStart, pCorner, isTop, `stair-rail-lower-${hOff}`);
    addRailBar(pCorner, pUpperEnd, isTop, `stair-rail-upper-${hOff}`);
  }
  root.add(staircaseGroup);

  const upperMassingGroup = namedGroup('upper-floor-massing');
  upperMassingGroup.visible = false;
  const mkMass = (id: UpperMassingId, m: MeshStandardMaterial) => {
    const sp = UPPER_FLOOR_MASSING[id];
    return addPrism(upperMassingGroup, sp.xMin, sp.xMax, sp.zMin, sp.zMax, sp.yBase, sp.yBase, sp.yBase + sp.height, sp.yBase + sp.height, m, sp.id);
  };
  const upperMassingMeshes: Record<UpperMassingId, Mesh> = { tier2South: mkMass('tier2South', palette.upperMassingSouth), tier3North: mkMass('tier3North', palette.upperMassingNorth) };
  root.add(upperMassingGroup);

  const lightsGroup = namedGroup('tier1-lights');
  const hemisphere = new HemisphereLight('#fffaf0', '#4a525d', 0.95);
  hemisphere.position.set(0, 24, 0);
  const sun = new DirectionalLight('#fff6e8', 1.35);
  sun.position.set(10, 28, 18); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, bottom: -16, top: 16, near: 1, far: 70 });
  const mkPt = (k: 'officeLight' | 'foyerLight' | 'garageLight', hex: string, inten: number) => {
    const pt = new PointLight(hex, inten, 28, 1.4); pt.position.set(...TIER1_HA_BINDINGS[k].anchor); lightsGroup.add(pt); return pt;
  };
  const roomPoints: Record<RoomId, PointLight> = { office: mkPt('officeLight', '#ffe9c8', 0.85), foyer: mkPt('foyerLight', '#ffe4ba', 0.75), garage: mkPt('garageLight', '#f4f8ff', 0.95) };
  lightsGroup.add(hemisphere, sun, sun.target);
  root.add(lightsGroup);

  return {
    root, floors, wallsById, staircaseGroup, stairTreads, upperMassingGroup, upperMassingMeshes,
    lights: { hemisphere, sun, roomPoints },
    setUpperMassingVisible: (visible: boolean) => { upperMassingGroup.visible = visible; },
    dispose: () => { for (const g of geometries) g.dispose(); },
  };
}
