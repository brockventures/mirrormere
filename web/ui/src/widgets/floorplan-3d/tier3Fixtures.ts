import {
  BoxGeometry, CylinderGeometry, DataTexture, ExtrudeGeometry, Group, LinearFilter, Mesh, MeshStandardMaterial,
  RGBAFormat, Shape, SphereGeometry, SRGBColorSpace, TorusGeometry, type BufferGeometry,
} from 'three';
import {
  TIER3_LAYOUT_SPEC, type Tier3FixtureKey, type Tier3FixtureSpec, type Tier3LayoutSpec,
} from './tier3LayoutSpec';
import type { Tier1MaterialPalette } from './tier1Shell';

type PartItem = readonly [number, number, number, number, number, number, MeshStandardMaterial, string?];
type BoxItem = readonly [number, number, number, number, number, number, MeshStandardMaterial, string?];

interface Tier3FixtureContext {
  palette: Tier1MaterialPalette;
  mat: (color: string | number, roughness?: number, metalness?: number, opacity?: number) => MeshStandardMaterial;
  trackMat: (m: MeshStandardMaterial) => MeshStandardMaterial;
  trackTex: (t: DataTexture) => DataTexture;
  addMesh: (p: Group, geom: BufferGeometry, m: MeshStandardMaterial, cx: number, cy: number, cz: number, name?: string) => Mesh;
  addBox: (p: Group, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, m: MeshStandardMaterial, name?: string) => Mesh;
  boxes: (p: Group, items: ReadonlyArray<BoxItem>) => void;
  addCyl: (p: Group, cx: number, cy: number, cz: number, rT: number, rB: number, h: number, m: MeshStandardMaterial, name?: string, segs?: number) => Mesh;
  addSphere: (p: Group, cx: number, cy: number, cz: number, r: number, m: MeshStandardMaterial, name?: string) => Mesh;
  parts: (p: Group, spec: Tier3FixtureSpec, items: ReadonlyArray<PartItem>) => void;
}

export interface Tier3FixturesBuildResult {
  root: Group; fixtures: Readonly<Record<Tier3FixtureKey, Group>>; ceilingFansGroup: Group; dispose: () => void;
}

function makeDataTexture(size: number, pixelFn: (x: number, y: number) => readonly [number, number, number]): DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const [[r, g, b], weave, idx] = [pixelFn(x, y), (x * 3 + y * 5) % 4 === 0 ? -4 : (x + y) % 2 === 0 ? 3 : -2, (y * size + x) * 4];
      data[idx] = Math.max(0, Math.min(255, r + weave));
      data[idx + 1] = Math.max(0, Math.min(255, g + weave));
      data[idx + 2] = Math.max(0, Math.min(255, b + weave));
      data[idx + 3] = 255;
    }
  }
  const tex = new DataTexture(data, size, size, RGBAFormat);
  Object.assign(tex, { colorSpace: SRGBColorSpace, minFilter: LinearFilter, magFilter: LinearFilter, needsUpdate: true });
  return tex;
}

function createRosieRugTexture(): DataTexture {
  const [offWhite, mustard, cream] = [[246, 242, 233], [207, 158, 52], [232, 222, 200]] as const;
  return makeDataTexture(256, (x, y) => {
    const [dx, dy] = [(x - 128) / 128, (y - 128) / 128];
    const [r, sector] = [Math.hypot(dx, dy), (2 * Math.PI) / 14];
    const ang = Math.abs((((Math.atan2(dy, dx) + Math.PI) % sector) + sector) % sector - sector / 2);
    const isRay = r >= 0.30 && r <= 0.76 && ang <= sector * 0.25 * (1 - (r - 0.30) / 0.46);
    if (r <= 0.27 || isRay || (r >= 0.85 && r <= 0.90)) return mustard;
    return Math.floor(r * 24) % 2 === 0 ? offWhite : cream;
  });
}

function createStarPlayMatTexture(): DataTexture {
  const [cream, tan, slate] = [[243, 237, 224], [198, 174, 134], [136, 152, 168]] as const;
  return makeDataTexture(256, (x, y) => {
    const [gx, gy] = [(x % 48) - 24, (y % 48) - 24];
    const isStar = Math.hypot(gx, gy) < 3.2 || (Math.abs(gx) < 1.5 && Math.abs(gy) < 6) || (Math.abs(gy) < 1.5 && Math.abs(gx) < 6);
    return isStar ? (((Math.floor(x / 48) + Math.floor(y / 48)) % 3 === 0) ? slate : tan) : cream;
  });
}

function createCurvedTabletopGeometry(length: number, width: number, thickness: number): ExtrudeGeometry {
  const [hx, hz, r, bow, bevel] = [length / 2, width / 2, 0.68, 0.06, 0.02];
  const s = new Shape().moveTo(-hx + r, -hz)
    .quadraticCurveTo(0, -hz - bow, hx - r, -hz).quadraticCurveTo(hx, -hz, hx, -hz + r)
    .quadraticCurveTo(hx + bow, 0, hx, hz - r).quadraticCurveTo(hx, hz, hx - r, hz)
    .quadraticCurveTo(0, hz + bow, -hx + r, hz).quadraticCurveTo(-hx, hz, -hx, hz - r)
    .quadraticCurveTo(-hx - bow, 0, -hx, -hz + r).quadraticCurveTo(-hx, -hz, -hx + r, -hz);
  const geom = new ExtrudeGeometry(s, { depth: thickness - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 20 });
  geom.rotateX(-Math.PI / 2);
  return geom.center();
}

function buildNookFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec): void {
  const f = spec.fixtures;
  const [walnut, smoked, screen] = [c.mat('#6e472b', 0.52), c.mat('#262b33', 0.16, 0.22, 0.72), c.mat('#1e3a5f', 0.22, 0.1)];
  const plantGreen = c.mat('#356844', 0.72);

  // 1. Curved-edge mid-century walnut dining table + 6 smoked-acrylic chrome cantilever chairs
  const dt = fixtures.diningTableSet;
  c.addMesh(dt, createCurvedTabletopGeometry(4.36, 2.84, 0.16), walnut, -14.0, 2.44, 4.6, 'dining-table-top');
  c.addBox(dt, -15.75, -12.25, 2.20, 2.36, 3.45, 5.75, walnut, 'dining-table-apron');
  for (const [li, [lx, lz]] of [[-15.65, 3.55], [-12.35, 3.55], [-15.65, 5.65], [-12.35, 5.65]].entries()) c.addCyl(dt, lx, 1.10, lz, 0.09, 0.055, 2.20, walnut, `dining-leg-${li}`, 12);
  const chrome = c.mat('#dce2e8', 0.16, 0.90);
  const chairs: ReadonlyArray<readonly [number, number, number, number]> = [
    [-15.0, 2.58, 0, -1], [-13.0, 2.58, 0, -1], [-15.0, 6.62, 0, 1], [-13.0, 6.62, 0, 1], [-16.80, 4.6, -1, 0], [-11.20, 4.6, 1, 0],
  ];
  for (const [ci, [cx, cz, sx, sz]] of chairs.entries()) {
    const [hx, hz, lx, lz, t, lat] = [sx ? 0.46 : 0.54, sz ? 0.46 : 0.54, Math.abs(sz), Math.abs(sx), 0.025, 0.46];
    const [bx, bz, bdx, bdz, rx, rz] = [cx + sx * 0.46, cz + sz * 0.46, sx ? 0.05 : hx, sz ? 0.05 : hz, cx + sx * 0.42, cz + sz * 0.42];
    const span = (dEnd: number, axis: number): readonly [number, number] =>
      axis ? [Math.min(-axis * 0.40, axis * dEnd) - t, Math.max(-axis * 0.40, axis * dEnd) + t] : [-t, t];
    const [[dx0, dx1], [dz0, dz1], [ux0, ux1], [uz0, uz1]] = [span(0.42, sx), span(0.42, sz), span(0.36, sx), span(0.36, sz)];
    const items: BoxItem[] = [
      [sx ? rx - t : rx - lat - t, sx ? rx + t : rx + lat + t, 0, 0.05, sz ? rz - t : rz - lat - t, sz ? rz + t : rz + lat + t, chrome, `dining-chair-crossbar-${ci}`],
      [cx - hx, cx + hx, 1.48, 1.58, cz - hz, cz + hz, smoked, `dining-chair-seat-${ci}`],
      [bx - bdx, bx + bdx, 1.58, 2.84, bz - bdz, bz + bdz, smoked, `dining-chair-back-${ci}`],
    ];
    for (const side of [-1, 1] as const) {
      const [ox, oz, tag, fx, fz] = [lx * lat * side, lz * lat * side, side > 0 ? 'r' : 'l', cx - sx * 0.40 + lx * lat * side, cz - sz * 0.40 + lz * lat * side];
      items.push(
        [fx - t, fx + t, 0, 1.48, fz - t, fz + t, chrome, `dining-chair-upright-${ci}-${tag}`],
        [cx + ox + dx0, cx + ox + dx1, 0, 0.05, cz + oz + dz0, cz + oz + dz1, chrome, `dining-chair-rail-${ci}-${tag}`],
        [cx + ox + ux0, cx + ox + ux1, 1.43, 1.48, cz + oz + uz0, cz + oz + uz1, chrome, `dining-chair-arm-${ci}-${tag}`],
      );
    }
    c.boxes(dt, items);
  }

  // 2. White sideboard buffet (including white top & plinth) + wall-mounted black pot/pan rack with hanging stainless pans
  const nb = fixtures.nookWhiteBuffet;
  c.parts(nb, f.nookWhiteBuffet, [
    [0.06, 0.94, 0, 0.06, 0.04, 0.96, c.palette.whiteTrim], [0.02, 0.96, 0.06, 0.52, 0.01, 0.99, c.palette.whiteTrim],
    [0.96, 1.0, 0.08, 0.50, 0.03, 0.32, c.palette.whiteTrim], [0.96, 1.0, 0.08, 0.50, 0.35, 0.65, c.palette.whiteTrim],
    [0.96, 1.0, 0.08, 0.50, 0.68, 0.97, c.palette.whiteTrim], [0, 1, 0.52, 0.55, 0, 1, c.palette.whiteTrim],
  ]);
  for (const pz of [-8.0, -6.9, -5.8]) c.addBox(nb, -18.04, -17.98, 1.9, 2.35, pz - 0.03, pz + 0.03, c.palette.matteBlackIron, `buffet-pull-${pz}`);
  c.addBox(nb, -19.75, -18.90, 4.68, 4.82, -8.7, -5.1, c.palette.matteBlackIron, 'pot-rack-shelf');
  for (const [pi, pz] of [-8.2, -7.25, -6.35, -5.45].entries()) {
    c.addCyl(nb, -19.25, 4.35, pz, 0.02, 0.02, 0.65, c.palette.matteBlackIron, `pot-hook-${pi}`, 8);
    c.addCyl(nb, -19.25, 3.85, pz, 0.32, 0.32, 0.09, c.palette.brushedSteel, `hanging-pan-${pi}`, 18).rotation.z = Math.PI / 2;
  }

  // 3. Hearth wall display + framed city print + fiddle-leaf fig plant in SW corner
  const hw = fixtures.hearthWallDisplay;
  c.boxes(hw, [
    [-13.9, -12.0, 2.0, 4.38, 10.62, 10.76, c.palette.whiteTrim, 'hearth-display-frame'], [-13.76, -12.14, 2.14, 4.24, 10.58, 10.63, screen, 'hearth-display-screen'],
    [-13.66, -12.24, 3.88, 4.14, 10.55, 10.58, c.mat('#3b82f6', 0.3), 'hearth-ui-card-0'], [-13.66, -12.98, 2.95, 3.78, 10.55, 10.58, c.mat('#f8fafc', 0.3), 'hearth-ui-card-1'],
    [-12.90, -12.24, 2.95, 3.78, 10.55, 10.58, c.mat('#e6b97a', 0.3), 'hearth-ui-card-2'], [-13.66, -12.24, 2.26, 2.85, 10.55, 10.58, c.mat('#93c5fd', 0.3), 'hearth-ui-card-3'],
    [-16.5, -14.4, 2.2, 4.15, 10.64, 10.76, c.palette.matteBlackIron, 'city-print-frame'], [-16.36, -14.54, 2.34, 4.01, 10.61, 10.65, c.mat('#ece8df', 0.72), 'city-print-mat'],
    [-16.1, -15.65, 2.5, 3.55, 10.58, 10.61, c.mat('#475569', 0.7), 'city-tower-1'], [-15.6, -15.15, 2.5, 3.78, 10.58, 10.61, c.mat('#334155', 0.7), 'city-tower-2'],
    [-15.1, -14.75, 2.5, 3.35, 10.58, 10.61, c.mat('#64748b', 0.7), 'city-tower-3'],
  ]);
  c.addCyl(hw, -18.3, 0.52, 9.9, 0.50, 0.38, 1.04, c.mat('#c8b698', 0.84), 'nook-fig-pot');
  c.addCyl(hw, -18.3, 2.1, 9.9, 0.06, 0.08, 2.2, walnut, 'nook-fig-trunk');
  c.addSphere(hw, -18.3, 3.45, 9.9, 0.72, plantGreen, 'nook-fig-canopy-main');
  c.addSphere(hw, -17.85, 3.05, 9.65, 0.48, plantGreen, 'nook-fig-canopy-side');
}

function buildKitchenAndHallFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>): void {
  const [quartz, subway, ovenGlass, barBrown, playBirch, blueRug, creamBorder, seamMat] = [
    c.mat('#f4f3ef', 0.26, 0.04), c.mat('#4c545c', 0.46, 0.06), c.mat('#1a1e24', 0.2, 0.35),
    c.mat('#4a3222', 0.65), c.mat('#dfd4c2', 0.66), c.mat('#4a7294', 0.9), c.mat('#ebe4d6', 0.92), c.mat('#cbd5e1', 0.78),
  ];
  const [wt, bs, bk] = [c.palette.whiteTrim, c.palette.brushedSteel, c.palette.matteBlackIron];

  // 4. North Kitchen Counters, Dishwasher (x -7..-5) + Sink (-4.6..-2.2) + Upper/Lower Pulls & Sink Rug
  const nk = fixtures.northKitchenCounters;
  c.boxes(nk, [
    [-9.4, 5.7, 0, 2.92, -10.75, -8.98, wt, 'north-lower-cabinets'], [-7.0, -5.0, 0.18, 2.86, -8.98, -8.88, bs, 'dishwasher-front'],
    [-6.8, -5.2, 2.66, 2.74, -8.88, -8.80, bk, 'dishwasher-handle'], [-9.4, 5.7, 2.92, 3.06, -10.78, -8.86, quartz, 'north-quartz-top'],
    [-9.4, 5.7, 3.06, 4.45, -10.78, -10.68, subway, 'north-subway-backsplash'], [-4.6, -2.2, 2.90, 3.08, -10.32, -9.16, bs, 'kitchen-sink-basin'],
    [-3.44, -3.36, 3.08, 4.08, -10.54, -10.44, bk, 'faucet-stem'], [-3.44, -3.36, 3.98, 4.08, -10.44, -9.96, bk, 'faucet-arm'],
    [-9.4, -5.4, 4.45, 6.20, -10.75, -9.65, wt, 'north-upper-cabs-w'], [-1.5, 5.7, 4.45, 6.20, -10.75, -9.65, wt, 'north-upper-cabs-e'],
    [4.6, 5.7, 4.45, 6.20, -9.65, -8.80, wt, 'north-upper-corner-e'],
    [-5.0, -1.8, 0, 0.032, -8.76, -6.96, creamBorder, 'sink-blue-mat-border'], [-4.88, -1.92, 0.008, 0.042, -8.64, -7.08, blueRug, 'sink-blue-mat'],
    [-3.42, -3.38, 0.16, 2.82, -8.99, -8.96, seamMat, 'north-sink-seam'], [-1.02, -0.98, 0.16, 2.82, -8.99, -8.96, seamMat, 'north-east-base-seam'],
    [-7.42, -7.38, 4.52, 6.14, -9.66, -9.63, seamMat, 'north-upper-w-seam'], [0.48, 0.52, 4.52, 6.14, -9.66, -9.63, seamMat, 'north-upper-e-seam-0'],
    [2.58, 2.62, 4.52, 6.14, -9.66, -9.63, seamMat, 'north-upper-e-seam-1'],
  ]);
  for (const [si, py] of [0.56, 1.46, 2.40].entries()) c.boxes(nk, [[-8.45, -7.95, py - 0.03, py + 0.03, -8.98, -8.92, bk, `north-west-drawer-pull-${si}`], [0.65, 1.15, py - 0.03, py + 0.03, -8.98, -8.92, bk, `north-east-drawer-pull-${si}`]]);
  for (const px of [-3.56, -3.24, -1.16, -0.84, 2.45, 2.75]) c.addBox(nk, px - 0.03, px + 0.03, 2.15, 2.55, -8.98, -8.92, bk, `north-lower-pull-${px}`);
  for (const px of [-7.56, -7.24, -0.60, 0.34, 0.66, 2.44, 2.76]) c.addBox(nk, px - 0.03, px + 0.03, 4.65, 5.10, -9.65, -9.59, bk, `north-upper-pull-${px}`);

  // 5. East Kitchen Wall: Corner Cab (-8.8..-7.9), 30" Range & Hood (-7.9..-5.4), Full 2.1 ft Cab Bank (-5.4..-3.3)
  const er = fixtures.eastRangeAndHood;
  c.boxes(er, [
    [3.65, 5.7, 0, 2.92, -8.80, -7.90, wt, 'east-lower-cab-n'], [3.65, 5.7, 0, 2.92, -5.40, -3.30, wt, 'east-lower-cab-s'],
    [3.6, 5.7, 2.92, 3.06, -8.86, -7.90, quartz, 'east-top-n'], [3.6, 5.7, 2.92, 3.06, -5.40, -3.30, quartz, 'east-top-s'],
    [5.60, 5.7, 3.06, 4.45, -8.80, -3.30, subway, 'east-subway-backsplash'], [4.6, 5.7, 4.45, 6.20, -8.80, -7.95, wt, 'east-upper-cab-n'],
    [4.6, 5.7, 4.45, 6.20, -5.30, -3.35, wt, 'east-upper-cab-s'], [4.58, 4.61, 4.52, 6.14, -4.34, -4.31, seamMat, 'east-upper-s-seam'],
    [3.63, 3.66, 0.16, 2.82, -4.40, -4.36, seamMat, 'east-lower-s-seam'], [3.59, 3.65, 2.15, 2.55, -4.54, -4.48, bk, 'east-lower-s-door-pull'],
    [4.54, 4.60, 4.65, 5.10, -4.44, -4.38, bk, 'east-upper-s-pull-0'], [4.54, 4.60, 4.65, 5.10, -4.27, -4.21, bk, 'east-upper-s-pull-1'],
    [4.54, 4.60, 4.65, 5.10, -8.16, -8.10, bk, 'east-upper-n-pull'], [3.35, 5.7, 0, 3.08, -7.90, -5.40, bs, 'double-oven-range'],
    [3.31, 3.37, 1.78, 2.58, -7.70, -5.60, ovenGlass, 'range-upper-door'], [3.31, 3.37, 0.42, 1.48, -7.70, -5.60, ovenGlass, 'range-lower-door'],
    [3.55, 5.45, 3.08, 3.18, -7.75, -5.55, bk, 'range-grates'], [3.55, 5.7, 4.70, 5.20, -7.85, -5.45, bs, 'range-hood-canopy'],
    [4.25, 5.7, 5.20, 5.60, -7.35, -5.95, bs, 'range-hood-taper'], [4.75, 5.7, 5.60, 6.50, -7.10, -6.20, bs, 'range-hood-chimney'],
  ]);
  for (const [di, py] of [0.56, 1.46, 2.40].entries()) c.addBox(er, 3.59, 3.65, py - 0.03, py + 0.03, -4.06, -3.66, bk, `east-lower-drawer-pull-${di}`);

  // 6. Stainless 36" French-Door Refrigerator + Double-Door Upper Cabinet (z -3.30..-0.45, flush with Hall Bath SW)
  const fr = fixtures.stainlessFridge;
  c.boxes(fr, [
    [2.9, 5.7, 5.32, 6.20, -3.30, -0.45, wt, 'fridge-upper-cabinet'], [2.88, 2.91, 5.36, 6.16, -1.89, -1.86, seamMat, 'fridge-upper-seam'],
    [2.84, 2.90, 5.45, 5.85, -1.99, -1.93, bk, 'fridge-upper-pull-0'], [2.84, 2.90, 5.45, 5.85, -1.82, -1.76, bk, 'fridge-upper-pull-1'],
    [2.82, 5.65, 0.08, 5.30, -3.26, -0.50, bs, 'fridge-body'], [2.78, 2.84, 1.72, 1.78, -3.26, -0.50, bk, 'fridge-freezer-seam'],
    [2.78, 2.84, 1.78, 5.28, -1.91, -1.85, bk, 'fridge-center-seam'], [2.72, 2.80, 2.55, 4.45, -2.15, -2.07, bk, 'fridge-handle-n'],
    [2.72, 2.80, 2.55, 4.45, -1.69, -1.61, bk, 'fridge-handle-s'], [2.72, 2.80, 1.38, 1.46, -2.68, -1.08, bk, 'fridge-freezer-handle'],
  ]);
  for (const [mi, [my, mz, col]] of ([[4.6, -2.85, '#e63946'], [4.2, -2.50, '#457b9d'], [3.8, -2.90, '#f4a261'], [4.4, -1.15, '#2a9d8f'], [3.9, -0.90, '#e9c46a']] as const).entries()) c.addBox(fr, 2.79, 2.83, my, my + 0.22, mz, mz + 0.18, c.mat(col, 0.6), `fridge-magnet-${mi}`);

  // 7. Elongated E-W Kitchen Island (shifted 1.1 ft west) + North Pulls + 3 Pedestal Barstools + Learning Tower (W) & Trash Can (SW)
  const ki = fixtures.kitchenIsland;
  c.boxes(ki, [
    [-6.6, 0.8, 0, 2.94, -3.5, -0.5, wt, 'island-base'], [-6.75, 0.88, 2.94, 3.10, -3.62, 0.45, quartz, 'island-quartz-top'],
    [-1.2, 0.4, 1.42, 2.52, -3.58, -3.49, bs, 'island-microwave-bezel'], [-1.05, 0.25, 1.54, 2.40, -3.60, -3.54, ovenGlass, 'island-microwave-door'],
    [-3.98, -3.94, 0.16, 2.82, -3.52, -3.49, seamMat, 'island-n-seam-w'], [-1.32, -1.28, 0.16, 2.82, -3.52, -3.49, seamMat, 'island-n-seam-e'],
    [-2.66, -2.62, 0.16, 2.08, -3.52, -3.49, seamMat, 'island-n-center-seam'], [-0.65, -0.15, 1.02, 1.08, -3.57, -3.51, bk, 'island-mw-drawer-pull'],
    [-2.90, -2.38, 2.44, 2.50, -3.57, -3.51, bk, 'island-center-drawer-pull'], [-2.80, -2.74, 1.45, 1.90, -3.57, -3.51, bk, 'island-center-door-pull-0'],
    [-2.54, -2.48, 1.45, 1.90, -3.57, -3.51, bk, 'island-center-door-pull-1'], [-8.15, -7.05, 0, 2.05, -1.65, -0.65, bs, 'island-trash-can'],
    [-8.17, -7.03, 2.05, 2.16, -1.67, -0.63, bk, 'island-trash-lid'], [-8.25, -6.85, 1.35, 1.47, -3.45, -2.15, wt, 'learning-tower-platform'],
    [-8.25, -6.85, 2.82, 2.95, -3.45, -2.15, wt, 'learning-tower-rail'],
  ]);
  for (const [di, py] of [0.56, 1.44, 2.44].entries()) c.addBox(ki, -5.50, -4.95, py - 0.03, py + 0.03, -3.57, -3.51, bk, `island-west-drawer-pull-${di}`);
  for (const [si, sx] of [-4.8, -2.7, -0.6].entries()) {
    c.addCyl(ki, sx, 0.025, 0.85, 0.42, 0.42, 0.05, bk, `island-stool-base-${si}`, 20);
    c.addCyl(ki, sx, 1.03, 0.85, 0.07, 0.07, 1.98, bk, `island-stool-column-${si}`, 14);
    c.addMesh(ki, new TorusGeometry(0.24, 0.022, 8, 20), bk, sx, 0.72, 0.85, `island-stool-footrest-${si}`).rotation.x = Math.PI / 2;
    c.boxes(ki, [
      [sx - 0.24, sx + 0.24, 0.70, 0.74, 0.83, 0.87, bk, `island-stool-strut-${si}`], [sx - 0.54, sx + 0.54, 2.02, 2.18, 0.34, 1.36, barBrown, `island-stool-seat-${si}`],
      [sx - 0.54, sx + 0.54, 2.18, 2.74, 1.24, 1.38, barBrown, `island-stool-back-${si}`], [sx - 0.54, sx - 0.42, 2.18, 2.54, 0.94, 1.24, barBrown, `island-stool-wrap-w-${si}`],
      [sx + 0.42, sx + 0.54, 2.18, 2.54, 0.94, 1.24, barBrown, `island-stool-wrap-e-${si}`],
    ]);
  }
  for (const [pi, [px, pz]] of [[-8.18, -3.38], [-6.92, -3.38], [-8.18, -2.22], [-6.92, -2.22]].entries()) c.addBox(ki, px - 0.07, px + 0.07, 0, 2.95, pz - 0.07, pz + 0.07, wt, `learning-tower-post-${pi}`);

  // 8. Kids Play Kitchen Corner + Blue Rug + Framed Harbor Art
  c.boxes(fixtures.playKitchenCorner, [
    [1.35, 4.55, 0, 1.85, 9.45, 10.66, wt, 'play-kitchen-base'], [1.30, 4.60, 1.85, 1.96, 9.40, 10.68, playBirch, 'play-kitchen-counter'],
    [1.35, 4.55, 1.96, 3.15, 10.22, 10.66, playBirch, 'play-kitchen-upper'], [0.9, 4.9, 0, 0.04, 8.25, 9.35, blueRug, 'play-kitchen-rug'],
    [1.55, 4.35, 3.35, 4.38, 10.58, 10.70, playBirch, 'harbor-art-frame'], [1.67, 4.23, 3.82, 4.26, 10.55, 10.59, c.mat('#8eb2c9', 0.72), 'harbor-art-sky'],
    [1.67, 4.23, 3.47, 3.82, 10.55, 10.59, c.mat('#355978', 0.72), 'harbor-art-water'],
  ]);

  // 9. Tall White Hall Pantry (z 4.0..10.8, x 6.1..8.4, 4 tall white shaker doors & matte-black pulls facing WEST)
  const tp = fixtures.tallWhitePantry;
  c.boxes(tp, [
    [6.26, 8.40, 0, 6.2, 4.00, 10.78, wt, 'pantry-body'],
    [6.16, 6.26, 0.16, 6.04, 4.06, 5.66, wt, 'pantry-door-0'], [6.16, 6.26, 0.16, 6.04, 5.72, 7.32, wt, 'pantry-door-1'],
    [6.16, 6.26, 0.16, 6.04, 7.46, 9.06, wt, 'pantry-door-2'], [6.16, 6.26, 0.16, 6.04, 9.12, 10.72, wt, 'pantry-door-3'],
    [6.22, 6.26, 0.16, 6.04, 5.67, 5.71, seamMat, 'pantry-seam-0'], [6.22, 6.26, 0.16, 6.04, 7.36, 7.42, seamMat, 'pantry-seam-1'],
    [6.22, 6.26, 0.16, 6.04, 9.07, 9.11, seamMat, 'pantry-seam-2'],
  ]);
  for (const [pi, pz] of [5.53, 5.85, 8.93, 9.25].entries()) c.addBox(tp, 6.10, 6.16, 2.55, 3.55, pz - 0.03, pz + 0.03, bk, `pantry-pull-${pi}`);
}

function buildHallBathFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec): void {
  const f = spec.fixtures;
  const [porcelain, subwayTile, curtainGray, curtainStripe, walnut, brass] = [
    c.mat('#f8fafc', 0.26, 0.08), c.mat('#eef1f4', 0.34, 0.04), c.mat('#aeb5bd', 0.85),
    c.mat('#6c757d', 0.85), c.mat('#6e472b', 0.55), c.mat('#c8a253', 0.32, 0.72),
  ];

  // 10. Alcove Tub/Shower + Subway Surround + Black Rod + Gray Patterned Curtain
  const tb = fixtures.hallBathTub;
  c.boxes(tb, [
    [6.24, 11.56, 0, 1.45, -10.76, -7.95, porcelain, 'hall-tub-apron'], [6.55, 11.25, 1.38, 1.47, -10.45, -8.25, c.mat('#d9e5ee', 0.22), 'hall-tub-basin'],
    [6.22, 11.58, 1.45, 5.65, -10.78, -10.68, subwayTile, 'hall-tub-tile-north'], [6.22, 6.32, 1.45, 5.65, -10.78, -7.95, subwayTile, 'hall-tub-tile-west'],
    [11.48, 11.58, 1.45, 5.65, -10.78, -7.95, subwayTile, 'hall-tub-tile-east'], [6.24, 11.56, 5.60, 5.68, -7.86, -7.78, c.palette.matteBlackIron, 'hall-shower-rod'],
    [6.32, 9.05, 0.22, 5.58, -7.90, -7.74, curtainGray, 'hall-shower-curtain'],
  ]);
  for (const sx of [6.65, 7.45, 8.25]) c.addBox(tb, sx, sx + 0.16, 0.24, 5.56, -7.92, -7.72, curtainStripe, `hall-curtain-stripe-${sx}`);

  // 11. Walnut Single Vanity + White Top + Round Black Mirror + 3-Globe Brass Light
  const hv = fixtures.hallBathVanity;
  c.parts(hv, f.hallBathVanity, [
    [0.04, 0.94, 0, 0.49, 0.04, 0.96, walnut], [0.02, 0.98, 0.49, 0.52, 0.02, 0.98, porcelain],
    [0.18, 0.76, 0.50, 0.54, 0.22, 0.78, c.mat('#e2e8f0', 0.25)], [0.08, 0.24, 0.52, 0.62, 0.47, 0.53, c.palette.matteBlackIron],
  ]);
  c.addCyl(hv, 6.28, 3.92, -5.0, 0.84, 0.84, 0.08, c.palette.matteBlackIron, 'hall-vanity-mirror').rotation.z = Math.PI / 2;
  c.addCyl(hv, 6.31, 3.92, -5.0, 0.76, 0.76, 0.03, c.palette.glass, 'hall-vanity-mirror-glass').rotation.z = Math.PI / 2;
  c.addBox(hv, 6.24, 6.36, 5.18, 5.30, -5.85, -4.15, brass, 'hall-vanity-light-bar');
  for (const [gi, gz] of [-5.65, -5.0, -4.35].entries()) c.addSphere(hv, 6.46, 5.38, gz, 0.15, c.mat('#fff5d6', 0.2), `hall-vanity-globe-${gi}`);

  // 12. White Toilet + Framed Print on West Wall
  const ht = fixtures.hallBathToilet;
  c.boxes(ht, [
    [6.24, 6.76, 1.32, 2.52, -2.28, -1.12, porcelain, 'hall-toilet-tank'], [6.21, 6.80, 2.52, 2.62, -2.32, -1.08, porcelain, 'hall-toilet-tank-lid'],
    [6.76, 6.84, 2.34, 2.40, -2.20, -2.02, c.palette.brushedSteel, 'hall-toilet-flush-lever'], [6.38, 7.02, 0, 1.32, -1.94, -1.46, porcelain, 'hall-toilet-trapway'],
    [6.22, 6.30, 2.85, 4.15, -2.45, -0.95, c.palette.matteBlackIron, 'hall-bath-art-frame'], [6.29, 6.33, 2.98, 4.02, -2.32, -1.08, c.mat('#6b8b88', 0.7), 'hall-bath-art-print'],
  ]);
  c.addCyl(ht, 7.12, 0.48, -1.70, 0.28, 0.38, 0.96, porcelain, 'hall-toilet-pedestal', 20);
  c.addCyl(ht, 7.20, 1.15, -1.70, 0.46, 0.28, 0.52, porcelain, 'hall-toilet-bowl', 24).scale.set(1.22, 1, 0.86);
  c.addCyl(ht, 7.20, 1.44, -1.70, 0.48, 0.48, 0.06, c.mat('#e2e8f0', 0.35), 'hall-toilet-seat', 24).scale.set(1.22, 1, 0.86);
  c.addCyl(ht, 7.20, 1.50, -1.70, 0.45, 0.47, 0.06, porcelain, 'hall-toilet-lid', 24).scale.set(1.22, 1, 0.86);
}

function buildRosieFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec): void {
  const f = spec.fixtures;
  const [warmWood, whiteSheet, stripePink, cream] = [c.mat('#7c5132', 0.55), c.mat('#f7f6f2', 0.78), c.mat('#dfa8ae', 0.8), c.mat('#f4efe6', 0.82)];

  // 13. Rosie Twin Bed (headboard east) + Striped Bedding + White North-Side Nightstand + Glowing Lamp
  c.parts(fixtures.rosieTwinBed, f.rosieTwinBed, [
    [0.02, 0.98, 0, 0.28, 0.30, 0.98, warmWood, 'rosie-bed-frame'], [0.92, 1.0, 0.22, 1.0, 0.30, 0.98, warmWood, 'rosie-bed-headboard'],
    [0.04, 0.92, 0.28, 0.56, 0.33, 0.95, whiteSheet, 'rosie-bed-mattress'], [0.06, 0.44, 0.54, 0.60, 0.33, 0.95, stripePink, 'rosie-bed-blanket'],
    [0.72, 0.90, 0.56, 0.68, 0.42, 0.86, whiteSheet, 'rosie-bed-pillow'], [0.76, 0.98, 0, 0.58, 0.02, 0.27, c.palette.whiteTrim, 'rosie-nightstand'],
    [0.84, 0.92, 0.58, 0.74, 0.10, 0.19, c.palette.whiteTrim, 'rosie-lamp-base'], [0.80, 0.96, 0.74, 0.94, 0.06, 0.23, c.mat('#fff3d4', 0.3), 'rosie-lamp-shade'],
  ]);

  // 14. Rainbow Mural Arches + Framed World Map Art + White 6-Cube (3x2) Storage Shelf on East Wall
  const [rm, wt] = [fixtures.rosieRainbowAndMap, c.palette.whiteTrim];
  for (const [ri, [rad, hex]] of ([[1.85, '#e0919c'], [1.54, '#e6b97a'], [1.23, '#88b8c9']] as const).entries()) {
    c.addMesh(rm, new TorusGeometry(rad, 0.14, 10, 28, Math.PI), c.mat(hex, 0.72), 23.22, 3.35, -5.3, `rosie-rainbow-arch-${ri}`).rotation.y = Math.PI / 2;
  }
  c.boxes(rm, [
    [23.14, 23.27, 2.55, 4.35, -2.45, 0.0, warmWood, 'rosie-map-frame'], [23.10, 23.15, 2.67, 4.23, -2.33, -0.12, cream, 'rosie-map-canvas'],
    [23.07, 23.11, 3.05, 3.88, -2.10, -1.35, c.mat('#88b8c9', 0.72), 'rosie-map-west'], [23.07, 23.11, 2.95, 3.96, -1.10, -0.30, c.mat('#7ea89b', 0.72), 'rosie-map-east'],
    [22.00, 23.25, 2.10, 2.18, -3.30, -0.24, wt, 'rosie-six-cube-frame-top'], [22.00, 23.25, 0.00, 0.08, -3.30, -0.24, wt, 'rosie-six-cube-frame-bottom'],
    [22.00, 23.25, 0.00, 2.18, -3.30, -3.22, wt, 'rosie-six-cube-frame-n'], [22.00, 23.25, 0.00, 2.18, -0.32, -0.24, wt, 'rosie-six-cube-frame-s'],
    [23.19, 23.25, 0.00, 2.18, -3.30, -0.24, wt, 'rosie-six-cube-frame-back'], [22.02, 23.19, 1.06, 1.12, -3.22, -0.32, wt, 'rosie-six-cube-shelf-mid'],
    [22.02, 23.19, 0.08, 2.10, -2.29, -2.23, wt, 'rosie-six-cube-div-0'], [22.02, 23.19, 0.08, 2.10, -1.31, -1.25, wt, 'rosie-six-cube-div-1'],
    [22.08, 23.12, 0.08, 0.94, -3.16, -2.35, c.mat('#e5c3c6', 0.86), 'rosie-six-cube-bin-0'], [22.08, 23.12, 0.08, 0.94, -2.17, -1.37, c.mat('#d9c3a3', 0.86), 'rosie-six-cube-bin-1'],
    [22.08, 23.12, 0.08, 0.94, -1.19, -0.38, c.mat('#b9d2d8', 0.86), 'rosie-six-cube-bin-2'], [22.14, 22.98, 1.12, 1.88, -3.08, -2.54, c.mat('#88b8c9', 0.78), 'rosie-six-cube-books-0'],
    [22.14, 22.98, 1.12, 1.80, -2.08, -1.52, c.mat('#e6b97a', 0.78), 'rosie-six-cube-books-1'], [22.14, 22.98, 1.12, 1.84, -1.08, -0.52, c.mat('#e0919c', 0.78), 'rosie-six-cube-books-2'],
  ]);

  // 15. Round White & Mustard-Yellow Geometric Rug
  const rr = f.rosieRoundRug;
  const rugMat = c.trackMat(new MeshStandardMaterial({ map: c.trackTex(createRosieRugTexture()), roughness: 0.9, metalness: 0.02 }));
  const rRad = Math.min(rr.xMax - rr.xMin, rr.zMax - rr.zMin) / 2;
  c.addCyl(fixtures.rosieRoundRug, (rr.xMin + rr.xMax) / 2, rr.heightFt / 2, (rr.zMin + rr.zMax) / 2, rRad, rRad, rr.heightFt, rugMat, 'rosie-round-rug-disc', 32);

  // 16. White Dresser on West Wall
  c.parts(fixtures.rosieWhiteDresser, f.rosieWhiteDresser, [
    [0.02, 0.96, 0.06, 0.95, 0.02, 0.98, wt], [0, 1, 0.95, 1, 0, 1, wt],
    [0.96, 1, 0.12, 0.48, 0.05, 0.47, wt], [0.96, 1, 0.12, 0.48, 0.53, 0.95, wt],
    [0.96, 1, 0.54, 0.90, 0.05, 0.47, wt], [0.96, 1, 0.54, 0.90, 0.53, 0.95, wt],
  ]);

  // 17. Framed South Closet (sliding white doors) + Single White Gable-Roofed House Bookshelf (x 15.20..16.80, z 1.04..1.80)
  const [rc, softCream] = [fixtures.rosieClosetAndDollhouse, c.mat('#f6ebe1', 0.78)];
  c.boxes(rc, [
    [17.76, 23.28, 4.26, 4.36, 0.00, 0.24, wt, 'rosie-closet-track'], [17.78, 20.62, 0, 4.26, 0.02, 0.11, wt, 'rosie-closet-door-w'],
    [20.44, 23.28, 0, 4.26, 0.13, 0.22, wt, 'rosie-closet-door-e'], [17.95, 18.03, 1.90, 2.28, 0.00, 0.03, c.palette.matteBlackIron, 'rosie-closet-pull-w'],
    [23.03, 23.11, 1.90, 2.28, 0.11, 0.14, c.palette.matteBlackIron, 'rosie-closet-pull-e'], [17.80, 23.24, 3.55, 3.66, 0.68, 1.80, wt, 'rosie-closet-shelf'],
    [17.80, 23.24, 3.22, 3.28, 1.06, 1.12, c.palette.brushedSteel, 'rosie-closet-rod'], [15.20, 16.80, 0, 3.05, 1.73, 1.80, wt, 'rosie-dollhouse-body'],
    [15.27, 16.73, 0.12, 3.00, 1.69, 1.73, softCream, 'rosie-dollhouse-interior'], [15.20, 15.27, 0, 3.05, 1.04, 1.80, wt, 'rosie-dollhouse-side-w'],
    [16.73, 16.80, 0, 3.05, 1.04, 1.80, wt, 'rosie-dollhouse-side-e'], [15.20, 16.80, 0, 0.12, 1.04, 1.80, wt, 'rosie-dollhouse-base'],
    [15.27, 16.73, 1.06, 1.13, 1.06, 1.73, wt, 'rosie-dollhouse-tier-1'], [15.27, 16.73, 2.05, 2.12, 1.06, 1.73, wt, 'rosie-dollhouse-tier-2'],
    [15.97, 16.03, 0.12, 2.05, 1.12, 1.73, wt, 'rosie-dollhouse-divider'], [15.34, 15.90, 0.12, 0.72, 1.18, 1.66, c.mat('#d9c3a3', 0.86), 'rosie-dollhouse-basket'],
    [15.34, 15.51, 1.13, 1.72, 1.20, 1.66, c.mat('#88b8c9', 0.78), 'rosie-dollhouse-books-0'], [15.52, 15.69, 1.13, 1.64, 1.20, 1.66, c.mat('#e6b97a', 0.78), 'rosie-dollhouse-books-1'],
    [15.70, 15.86, 1.13, 1.68, 1.20, 1.66, c.mat('#dfa8ae', 0.78), 'rosie-dollhouse-books-2'],
  ]);
  const gableTri = (hw: number, h: number, d: number): ExtrudeGeometry =>
    new ExtrudeGeometry(new Shape().moveTo(-hw, 0).lineTo(0, h).lineTo(hw, 0).closePath(), { depth: d, bevelEnabled: false });
  c.addMesh(rc, gableTri(0.80, 0.96, 0.07), wt, 16.00, 3.05, 1.73, 'rosie-dollhouse-gable');
  c.addMesh(rc, gableTri(0.71, 0.84, 0.03), softCream, 16.00, 3.05, 1.69, 'rosie-dollhouse-gable-interior');
  const slopeAngle = Math.atan2(0.96, 0.80);
  c.addMesh(rc, new BoxGeometry(1.37, 0.07, 0.80), wt, 15.55, 3.52, 1.42, 'rosie-dollhouse-roof-w').rotation.z = slopeAngle;
  c.addMesh(rc, new BoxGeometry(1.37, 0.07, 0.80), wt, 16.45, 3.52, 1.42, 'rosie-dollhouse-roof-e').rotation.z = -slopeAngle;
  for (const [ci, col] of ['#e0919c', '#f4efe6', '#88b8c9', '#e6b97a'].entries()) c.addBox(rc, 18.25 + ci * 1.15, 18.97 + ci * 1.15, 1.55, 3.22, 0.74, 1.44, c.mat(col, 0.82), `rosie-closet-clothes-${ci}`);
}

function buildIsaacFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec, root: Group): void {
  const f = spec.fixtures;
  const [darkWalnut, cream, gliderGray, mustard, olive, stripeNavy] = [
    c.mat('#4d3221', 0.56), c.mat('#f4efe6', 0.82), c.mat('#8c949e', 0.82), c.mat('#c9a23f', 0.8), c.mat('#5e6b4c', 0.86), c.mat('#2f5573', 0.8),
  ];

  // 18. Dark Wood Slatted Rectangular Crib (~2.4 ft deep x ~4.4 ft long)
  const cr = fixtures.isaacWoodCrib;
  c.boxes(cr, [
    [12.14, 16.46, 0.58, 0.82, 8.34, 10.66, darkWalnut, 'crib-platform'], [12.28, 16.32, 0.82, 1.36, 8.48, 10.52, cream, 'crib-mattress'],
    [12.18, 16.42, 3.16, 3.34, 8.36, 8.50, darkWalnut, 'crib-rail-n'], [12.18, 16.42, 3.16, 3.34, 10.50, 10.64, darkWalnut, 'crib-rail-s'],
    [12.18, 12.32, 3.16, 3.34, 8.36, 10.64, darkWalnut, 'crib-rail-w'], [16.28, 16.42, 3.16, 3.34, 8.36, 10.64, darkWalnut, 'crib-rail-e'],
  ]);
  for (const [pi, [px, pz]] of [[12.22, 8.42], [16.38, 8.42], [12.22, 10.58], [16.38, 10.58]].entries()) c.addBox(cr, px - 0.08, px + 0.08, 0, 3.38, pz - 0.08, pz + 0.08, darkWalnut, `crib-post-${pi}`);
  for (let i = 0; i < 6; i += 1) c.boxes(cr, [[12.20, 12.30, 0.82, 3.16, 8.61 + i * 0.34, 8.69 + i * 0.34, darkWalnut, `crib-slat-w-${i}`], [16.30, 16.40, 0.82, 3.16, 8.61 + i * 0.34, 8.69 + i * 0.34, darkWalnut, `crib-slat-e-${i}`]]);
  for (let i = 0; i < 10; i += 1) c.boxes(cr, [[12.56 + i * 0.38, 12.64 + i * 0.38, 0.82, 3.16, 8.38, 8.48, darkWalnut, `crib-slat-n-${i}`], [12.56 + i * 0.38, 12.64 + i * 0.38, 0.82, 3.16, 10.52, 10.62, darkWalnut, `crib-slat-s-${i}`]]);

  // 19. Walnut 6-Drawer Dresser + Framed Art + Stainless Diaper Pail + Striped Hamper (aligned south of z 2.0 divider)
  const id = fixtures.isaacWalnutDresser;
  c.boxes(id, [
    [14.2, 18.0, 0.14, 2.86, 2.24, 3.98, darkWalnut, 'isaac-walnut-dresser'], [14.8, 17.4, 2.86, 3.16, 2.45, 3.78, cream, 'isaac-changing-pad'],
    [17.45, 17.95, 2.86, 3.58, 2.34, 2.44, darkWalnut, 'isaac-dresser-art-frame'], [17.52, 17.88, 2.93, 3.51, 2.42, 2.46, cream, 'isaac-dresser-art-mat'],
    [18.25, 19.15, 0, 1.95, 2.45, 3.65, cream, 'isaac-striped-hamper'], [18.23, 19.17, 0.72, 1.18, 2.43, 3.67, stripeNavy, 'isaac-hamper-stripe'],
  ]);
  c.addCyl(id, 13.55, 1.05, 3.08, 0.44, 0.42, 2.1, c.palette.brushedSteel, 'isaac-diaper-pail');

  // 20. Gray Nursery Glider Armchair (45 deg facing SW) + Yellow Pillow + Round Mustard-Yellow Ottoman
  const [ig, glider] = [fixtures.isaacGliderAndOttoman, new Group()];
  glider.name = 'isaac-glider-chair';
  glider.position.set(21.48, 0, 3.76);
  glider.rotation.y = -Math.PI / 4;
  c.boxes(glider, [
    [-1.02, 1.02, 0, 0.36, -1.00, 1.00, darkWalnut, 'isaac-glider-base'], [-1.10, 1.10, 0.36, 1.38, -1.05, 1.05, gliderGray, 'isaac-glider-seat'],
    [-1.10, 1.10, 1.38, 3.08, -1.05, -0.38, gliderGray, 'isaac-glider-back'], [-1.10, -0.76, 1.38, 2.18, -0.38, 0.98, gliderGray, 'isaac-glider-arm-n'],
    [0.76, 1.10, 1.38, 2.18, -0.38, 0.98, gliderGray, 'isaac-glider-arm-s'], [-0.54, 0.54, 1.42, 2.25, -0.36, -0.02, mustard, 'isaac-glider-yellow-pillow'],
  ]);
  ig.add(glider);
  c.addCyl(ig, 20.26, 0.66, 4.98, 0.64, 0.62, 1.32, mustard, 'isaac-tufted-ottoman');

  // 21. Olive-Green Foldable Floor Play Couch + 22. Cream Star-Patterned Floor Play Mat
  c.parts(fixtures.isaacPlayCouch, f.isaacPlayCouch, [
    [0, 1, 0, 0.26, 0, 1, olive], [0, 1, 0.27, 0.52, 0.02, 0.98, olive], [0.02, 0.98, 0.52, 0.98, 0.62, 0.98, olive],
    [0.02, 0.16, 0.52, 0.84, 0.06, 0.62, olive], [0.84, 0.98, 0.52, 0.84, 0.06, 0.62, olive],
  ]);
  const sm = f.isaacStarPlayMat;
  const starMat = c.trackMat(new MeshStandardMaterial({ map: c.trackTex(createStarPlayMatTexture()), roughness: 0.9, metalness: 0.02 }));
  c.addBox(fixtures.isaacStarPlayMat, sm.xMin, sm.xMax, 0, sm.heightFt, sm.zMin, sm.zMax, starMat, 'isaac-star-play-mat');

  // Isaac's SW Closet Interior (E-W along south back wall facing north closet door at z 7.2, heights <= 2.12 ft)
  const ic = new Group();
  ic.name = 'isaac-closet';
  c.boxes(ic, [
    [8.85, 11.55, 2.02, 2.12, 9.55, 10.75, c.palette.whiteTrim, 'isaac-closet-shelf'],
    [8.85, 11.55, 1.82, 1.88, 9.95, 10.01, c.palette.brushedSteel, 'isaac-closet-rod'],
    [10.88, 11.52, 0, 0.66, 9.25, 10.45, c.mat('#c8b698', 0.84), 'isaac-closet-bin'],
  ]);
  for (const [ci, col] of ['#2f5573', '#d9a992', '#5e6b4c'].entries()) c.addBox(ic, 8.95 + ci * 0.65, 9.52 + ci * 0.65, 0.72, 1.82, 9.62, 10.32, c.mat(col, 0.82), `isaac-closet-clothes-${ci}`);
  root.add(ic);
}

export function buildTier3Fixtures(palette: Tier1MaterialPalette, spec: Tier3LayoutSpec = TIER3_LAYOUT_SPEC): Tier3FixturesBuildResult {
  const [geometries, localMats, localTexs, cache] = [[] as BufferGeometry[], [] as MeshStandardMaterial[], [] as DataTexture[], new Map<string, MeshStandardMaterial>()];
  const trackMat = (m: MeshStandardMaterial): MeshStandardMaterial => { localMats.push(m); return m; };
  const trackTex = (t: DataTexture): DataTexture => { localTexs.push(t); return t; };
  const mat = (color: string | number, roughness = 0.72, metalness = 0.06, opacity = 1): MeshStandardMaterial => {
    const key = `${String(color)}|${roughness}|${metalness}|${opacity}`;
    const existing = cache.get(key) ?? trackMat(new MeshStandardMaterial({ color, roughness, metalness, transparent: opacity < 1, opacity }));
    cache.set(key, existing);
    return existing;
  };
  const trackMesh = (parent: Group, geom: BufferGeometry, material: MeshStandardMaterial, cx: number, cy: number, cz: number, name?: string): Mesh => {
    geometries.push(geom);
    const mesh = new Mesh(geom, material);
    if (name) mesh.name = name;
    mesh.position.set(cx, cy, cz);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const addBox: Tier3FixtureContext['addBox'] = (p, x0, x1, y0, y1, z0, z1, m, name) =>
    trackMesh(p, new BoxGeometry(Math.max(0.02, x1 - x0), Math.max(0.02, y1 - y0), Math.max(0.02, z1 - z0)), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, name);
  const boxes: Tier3FixtureContext['boxes'] = (p, items) => { for (const [x0, x1, y0, y1, z0, z1, m, name] of items) addBox(p, x0, x1, y0, y1, z0, z1, m, name); };
  const addCyl: Tier3FixtureContext['addCyl'] = (p, cx, cy, cz, rT, rB, h, m, name, segs = 20) => trackMesh(p, new CylinderGeometry(rT, rB, h, segs), m, cx, cy, cz, name);
  const addSphere: Tier3FixtureContext['addSphere'] = (p, cx, cy, cz, r, m, name) => trackMesh(p, new SphereGeometry(r, 16, 12), m, cx, cy, cz, name);
  const parts: Tier3FixtureContext['parts'] = (p, s, items) => {
    const [dx, dy, dz] = [s.xMax - s.xMin, s.heightFt, s.zMax - s.zMin];
    for (const [ux0, ux1, uy0, uy1, uz0, uz1, m, name] of items) addBox(p, s.xMin + dx * ux0, s.xMin + dx * ux1, dy * uy0, dy * uy1, s.zMin + dz * uz0, s.zMin + dz * uz1, m, name);
  };
  const ctx: Tier3FixtureContext = { palette, mat, trackMat, trackTex, addMesh: trackMesh, addBox, boxes, addCyl, addSphere, parts };
  const [root, fixtures, ceilingFansGroup] = [new Group(), {} as Record<Tier3FixtureKey, Group>, new Group()];
  [root.name, ceilingFansGroup.name] = ['tier3-fixtures', 'tier3-ceiling-fans'];
  for (const key of Object.keys(spec.fixtures) as Tier3FixtureKey[]) {
    const [fSpec, g] = [spec.fixtures[key], new Group()];
    [g.name, g.userData] = [`fixture-${fSpec.id}`, { fixtureId: fSpec.id, roomId: fSpec.roomId, label: fSpec.label }];
    fixtures[key] = g;
    root.add(g);
  }
  buildNookFixtures(ctx, fixtures, spec);
  buildKitchenAndHallFixtures(ctx, fixtures);
  buildHallBathFixtures(ctx, fixtures, spec);
  buildRosieFixtures(ctx, fixtures, spec);
  buildIsaacFixtures(ctx, fixtures, spec, root);
  root.add(ceilingFansGroup);
  return {
    root, fixtures, ceilingFansGroup,
    dispose: () => { for (const g of geometries) g.dispose(); for (const m of localMats) m.dispose(); for (const t of localTexs) t.dispose(); },
  };
}
