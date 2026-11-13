import {
  BoxGeometry, CanvasTexture, Color, DataTexture, DirectionalLight, Group, HemisphereLight,
  Mesh, MeshStandardMaterial, PointLight, RepeatWrapping, RGBAFormat, SRGBColorSpace, Vector3,
  type BufferGeometry, type Texture,
} from 'three';
import {
  FOYER_STAIRCASE, TIER1_HA_BINDINGS, TIER1_ROOMS, TIER1_WALLS, UPPER_FLOOR_MASSING, wallHeightAtZ,
  type RoomId, type UpperMassingId, type WallSegmentSpec,
} from './tier1LayoutSpec';

export interface Tier1MaterialPalette {
  oakFloor: MeshStandardMaterial; foyerFloor: MeshStandardMaterial; garageFloor: MeshStandardMaterial;
  trellisRug: MeshStandardMaterial; foyerRunner: MeshStandardMaterial; pastelCirclesRug: MeshStandardMaterial;
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

function makeTexture(w: number, h: number, hex: string, draw: (ctx: CanvasRenderingContext2D, cw: number, ch: number) => void, repeat: readonly [number, number] = [1, 1]): Texture {
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
    const map = makeTexture(w, h, hex, draw, repeat);
    textures.push(map);
    return mat({ map, roughness, metalness: 0.04 });
  };
  return {
    oakFloor: texMat(256, 256, '#c69b68', (ctx, w, h) => {
      ctx.fillStyle = '#c69b68'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#8f683d'; ctx.lineWidth = 2;
      for (let r = 0; r < 8; r += 1) { ctx.fillStyle = r % 2 === 0 ? '#cca270' : '#be925e'; ctx.fillRect(0, r * 32, w, 30); ctx.strokeRect(0, r * 32, w, 32); }
    }, 0.62, [6, 6]),
    foyerFloor: mat({ color: TIER1_ROOMS.foyer.floorColor, roughness: 0.74 }),
    garageFloor: mat({ color: TIER1_ROOMS.garage.floorColor, roughness: 0.78 }),
    trellisRug: texMat(256, 256, '#233654', (ctx, w, h) => {
      ctx.fillStyle = '#233654'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#efeae0'; ctx.lineWidth = 5; ctx.strokeRect(10, 10, w - 20, h - 20);
      for (let i = -w; i < w * 2; i += 48) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.moveTo(i + h, 0); ctx.lineTo(i, h); ctx.stroke(); }
    }, 0.9),
    foyerRunner: texMat(256, 512, '#8d6e57', (ctx, w, h) => {
      ctx.fillStyle = '#8d6e57'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#dfd7ca'; ctx.lineWidth = 8; ctx.strokeRect(18, 18, w - 36, h - 36);
      for (let y = 80; y < h - 60; y += 96) ctx.strokeRect(w / 2 - 36, y - 24, 72, 48);
    }, 0.88),
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
    matteBlackIron: mat({ color: '#1b1e23', roughness: 0.48, metalness: 0.62 }),
    concreteCurb: mat({ color: '#b8bec4', roughness: 0.82 }),
    foyerThreshold: mat({ color: '#3a404a', roughness: 0.76 }),
    upperMassingSouth: mat({ color: UPPER_FLOOR_MASSING.tier2South.color, transparent: true, opacity: 0.38, roughness: 0.7 }),
    upperMassingNorth: mat({ color: UPPER_FLOOR_MASSING.tier3North.color, transparent: true, opacity: 0.38, roughness: 0.7 }),
    textures, materials,
    dispose: () => { for (const t of textures) t.dispose(); for (const m of materials) m.dispose(); },
  };
}

type PrismFn = (parent: Group, x0: number, x1: number, z0: number, z1: number, yb0: number, yb1: number, yt0: number, yt1: number, mat: MeshStandardMaterial, name?: string) => Mesh;

function buildWallGroup(wall: WallSegmentSpec, palette: Tier1MaterialPalette, addPrism: PrismFn): Group {
  const wg = namedGroup(wall.id);
  const mainMat = wall.id === 'cutaway-south-garage-curb' ? palette.concreteCurb
    : wall.id === 'cutaway-south-foyer-sill' ? palette.foyerThreshold
    : wall.color === '#2c323b' ? palette.foyerSlateWall : wall.color === '#eceee9' ? palette.garageWall : palette.officeWall;
  const zStops = Array.from(new Set([wall.zMin, wall.zMax, ...wall.doorways.flatMap((d) => [d.zMin, d.zMax])])).sort((a, b) => a - b);
  for (let i = 0; i < zStops.length - 1; i += 1) {
    const [z0, z1] = [zStops[i], zStops[i + 1]];
    if (z1 - z0 < 1e-4) continue;
    const door = wall.doorways.find((d) => (z0 + z1) / 2 > d.zMin && (z0 + z1) / 2 < d.zMax);
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
  addPrism(floorsGroup, -8.6, -3.5, -12.6, -11.0, -0.2, -0.2, 0.0, 0.0, palette.oakFloor, 'floor-office-wetbar-alcove');
  const mkFloor = (id: RoomId, m: MeshStandardMaterial) => addPrism(floorsGroup, TIER1_ROOMS[id].xMin, TIER1_ROOMS[id].xMax, TIER1_ROOMS[id].zMin, TIER1_ROOMS[id].zMax, -0.2, -0.2, 0, 0, m, `floor-${id}`);
  const floors: Record<RoomId, Mesh> = { office: mkFloor('office', palette.oakFloor), foyer: mkFloor('foyer', palette.foyerFloor), garage: mkFloor('garage', palette.garageFloor) };
  root.add(floorsGroup);

  const wallsGroup = namedGroup('tier1-walls');
  const wallsById: Record<string, Group> = {};
  for (const wall of TIER1_WALLS) { const wg = buildWallGroup(wall, palette, addPrism); wallsById[wall.id] = wg; wallsGroup.add(wg); }
  root.add(wallsGroup);

  const st = FOYER_STAIRCASE;
  const staircaseGroup = namedGroup(st.id);
  staircaseGroup.userData = { hasRearShelves: st.hasRearShelves };
  const stairTreads: Mesh[] = [];
  const [stepRun, stepRise] = [(st.zStart - st.zEnd) / st.treadCount, (st.yEnd - st.yStart) / st.treadCount];
  for (let i = 0; i < st.treadCount; i += 1) {
    const [zFront, zBack, yTop] = [st.zStart - i * stepRun, st.zStart - (i + 1) * stepRun, st.yStart + (i + 1) * stepRise];
    stairTreads.push(addPrism(staircaseGroup, st.xMin, st.xMax, zBack, zFront, yTop - 0.11, yTop - 0.11, yTop, yTop, palette.oakFloor, `stair-tread-${i}`));
    addPrism(staircaseGroup, st.xMin + 0.04, st.xMax - 0.08, zBack, zFront - 0.04, i * stepRise, i * stepRise, yTop - 0.11, yTop - 0.11, palette.whiteTrim, `stair-riser-${i}`);
    if (i % 3 === 0 || i === st.treadCount - 1) {
      const zp = (zFront + zBack) / 2;
      addPrism(staircaseGroup, st.railingX - 0.04, st.railingX + 0.04, zp - 0.04, zp + 0.04, yTop, yTop, yTop + 3.0, yTop + 3.0, palette.matteBlackIron, `stair-post-${i}`);
    }
  }
  for (const hOff of [0.85, 1.55, 2.25, 3.0]) {
    const p0 = new Vector3(st.railingX, stepRise + hOff, st.zStart - stepRun * 0.5);
    const p1 = new Vector3(st.railingX, st.yEnd + hOff, st.zEnd + stepRun * 0.5);
    const barGeom = new BoxGeometry(hOff === 3.0 ? 0.09 : 0.045, hOff === 3.0 ? 0.07 : 0.045, p0.distanceTo(p1));
    geometries.push(barGeom);
    const bar = new Mesh(barGeom, palette.matteBlackIron);
    bar.name = `stair-rail-${hOff}`; bar.position.copy(p0).add(p1).multiplyScalar(0.5);
    bar.lookAt(p1); bar.castShadow = true; staircaseGroup.add(bar);
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
  sun.position.set(10, 28, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, bottom: -16, top: 16, near: 1, far: 70 });
  const mkPt = (k: 'officeLight' | 'foyerLight' | 'garageLight', hex: string, inten: number) => {
    const pt = new PointLight(hex, inten, 28, 1.4);
    pt.position.set(...TIER1_HA_BINDINGS[k].anchor);
    lightsGroup.add(pt);
    return pt;
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
