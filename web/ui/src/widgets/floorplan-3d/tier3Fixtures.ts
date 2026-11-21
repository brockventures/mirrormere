import {
  BoxGeometry, CylinderGeometry, DataTexture, Group, LinearFilter, Mesh, MeshStandardMaterial,
  RGBAFormat, SphereGeometry, SRGBColorSpace, TorusGeometry, type BufferGeometry,
} from 'three';
import {
  TIER3_LAYOUT_SPEC, type Tier3FixtureKey, type Tier3FixtureSpec, type Tier3LayoutSpec,
} from './tier3LayoutSpec';
import type { Tier1MaterialPalette } from './tier1Shell';

type PartItem = readonly [number, number, number, number, number, number, MeshStandardMaterial];
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
  root: Group;
  fixtures: Readonly<Record<Tier3FixtureKey, Group>>;
  ceilingFansGroup: Group;
  dispose: () => void;
}

function makeDataTexture(size: number, pixelFn: (x: number, y: number) => readonly [number, number, number]): DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const [r, g, b] = pixelFn(x, y);
      const weave = (x * 3 + y * 5) % 4 === 0 ? -4 : (x + y) % 2 === 0 ? 3 : -2;
      const idx = (y * size + x) * 4;
      data[idx] = Math.max(0, Math.min(255, r + weave));
      data[idx + 1] = Math.max(0, Math.min(255, g + weave));
      data[idx + 2] = Math.max(0, Math.min(255, b + weave));
      data[idx + 3] = 255;
    }
  }
  const tex = new DataTexture(data, size, size, RGBAFormat);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function createRosieRugTexture(): DataTexture {
  const [white, mustard, cream] = [[245, 242, 234], [201, 162, 63], [228, 217, 194]] as const;
  return makeDataTexture(256, (x, y) => {
    const [dx, dy] = [(x - 128) / 128, (y - 128) / 128];
    const r = Math.hypot(dx, dy);
    if (r > 0.88 || (r > 0.56 && r < 0.62) || (r > 0.24 && r < 0.29)) return mustard;
    const diamond = Math.abs(dx) + Math.abs(dy);
    if (Math.abs(diamond - 0.72) < 0.045 || Math.abs(diamond - 0.36) < 0.035) return mustard;
    return r > 0.72 ? cream : white;
  });
}

function createStarPlayMatTexture(): DataTexture {
  const [cream, tan, slate] = [[243, 237, 224], [198, 174, 134], [136, 152, 168]] as const;
  return makeDataTexture(256, (x, y) => {
    const [gx, gy] = [(x % 48) - 24, (y % 48) - 24];
    if (Math.hypot(gx, gy) < 3.2 || (Math.abs(gx) < 1.5 && Math.abs(gy) < 6) || (Math.abs(gy) < 1.5 && Math.abs(gx) < 6)) {
      return ((Math.floor(x / 48) + Math.floor(y / 48)) % 3 === 0) ? slate : tan;
    }
    return cream;
  });
}

function buildNookFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec): void {
  const f = spec.fixtures;
  const [walnut, smoked, navy, screen] = [c.mat('#6e472b', 0.52), c.mat('#262b33', 0.16, 0.22, 0.72), c.mat('#1e3a5f', 0.78), c.mat('#1e3a5f', 0.22, 0.1)];
  const plantGreen = c.mat('#356844', 0.72);

  // 1. Dining table + 4 smoked-acrylic chrome chairs + white/navy toddler high chair
  const dt = fixtures.diningTableSet;
  c.boxes(dt, [
    [-16.0, -11.5, 2.38, 2.52, 3.1, 6.1, walnut, 'dining-table-top'], [-15.8, -11.7, 2.20, 2.38, 3.3, 5.9, walnut, 'dining-table-apron'],
    [-17.05, -16.25, 0, 1.72, 4.18, 5.02, c.palette.whiteTrim, 'highchair-legs'], [-17.08, -16.22, 1.72, 2.68, 4.15, 5.05, c.palette.whiteTrim, 'highchair-shell'],
    [-16.95, -16.32, 1.82, 2.54, 4.25, 4.95, navy, 'highchair-navy-pad'], [-16.36, -15.96, 2.15, 2.24, 4.12, 5.08, c.palette.whiteTrim, 'highchair-tray'],
  ]);
  for (const [li, [lx, lz]] of [[-15.7, 3.35], [-11.8, 3.35], [-15.7, 5.85], [-11.8, 5.85]].entries()) {
    c.addCyl(dt, lx, 1.11, lz, 0.09, 0.055, 2.22, walnut, `dining-leg-${li}`, 12);
  }
  for (const [ci, [cx, cz, backZ]] of [[-14.7, 2.58, 2.12], [-12.7, 2.58, 2.12], [-14.7, 6.62, 7.08], [-12.7, 6.62, 7.08]].entries()) {
    c.boxes(dt, [
      [cx - 0.52, cx + 0.52, 0, 1.48, cz - 0.44, cz - 0.36, c.palette.brushedSteel, `dining-chair-frame-n-${ci}`],
      [cx - 0.52, cx + 0.52, 0, 1.48, cz + 0.36, cz + 0.44, c.palette.brushedSteel, `dining-chair-frame-s-${ci}`],
      [cx - 0.56, cx + 0.56, 1.48, 1.58, cz - 0.48, cz + 0.48, smoked, `dining-chair-seat-${ci}`],
      [cx - 0.56, cx + 0.56, 1.58, 2.84, backZ - 0.05, backZ + 0.05, smoked, `dining-chair-back-${ci}`],
    ]);
  }

  // 2. White sideboard buffet + wall-mounted black pot/pan rack with hanging stainless pans
  const nb = fixtures.nookWhiteBuffet;
  c.parts(nb, f.nookWhiteBuffet, [
    [0.06, 0.94, 0, 0.06, 0.04, 0.96, walnut], [0.02, 0.96, 0.06, 0.52, 0.01, 0.99, c.palette.whiteTrim],
    [0.96, 1.0, 0.08, 0.50, 0.03, 0.32, c.palette.whiteTrim], [0.96, 1.0, 0.08, 0.50, 0.35, 0.65, c.palette.whiteTrim],
    [0.96, 1.0, 0.08, 0.50, 0.68, 0.97, c.palette.whiteTrim], [0, 1, 0.52, 0.55, 0, 1, walnut],
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

function buildKitchenAndHallFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec): void {
  const f = spec.fixtures;
  const [quartz, subway, ovenGlass, barBrown, playBirch, blueRug] = [
    c.mat('#f4f3ef', 0.26, 0.04), c.mat('#4c545c', 0.46, 0.06), c.mat('#1a1e24', 0.2, 0.35),
    c.mat('#4a3222', 0.65), c.mat('#dfd4c2', 0.66), c.mat('#4a7294', 0.9),
  ];

  // 4. North Kitchen Counters, Sink, Dishwasher & Blue Mat
  const nk = fixtures.northKitchenCounters;
  c.boxes(nk, [
    [-9.4, 5.7, 0, 2.92, -10.75, -8.98, c.palette.whiteTrim, 'north-lower-cabinets'], [-2.6, -0.6, 0.18, 2.86, -8.98, -8.88, c.palette.brushedSteel, 'dishwasher-front'],
    [-2.4, -0.8, 2.66, 2.74, -8.88, -8.80, c.palette.matteBlackIron, 'dishwasher-handle'], [-9.4, 5.7, 2.92, 3.06, -10.78, -8.86, quartz, 'north-quartz-top'],
    [-9.4, 5.7, 3.06, 4.45, -10.78, -10.68, subway, 'north-subway-backsplash'], [-5.4, -3.2, 2.90, 3.08, -10.32, -9.16, c.palette.brushedSteel, 'kitchen-sink-basin'],
    [-4.34, -4.26, 3.08, 4.08, -10.54, -10.44, c.palette.matteBlackIron, 'faucet-stem'], [-4.34, -4.26, 3.98, 4.08, -10.44, -9.96, c.palette.matteBlackIron, 'faucet-arm'],
    [-9.4, -6.2, 4.45, 6.20, -10.75, -9.65, c.palette.whiteTrim, 'north-upper-cabs-w'], [-2.0, 5.7, 4.45, 6.20, -10.75, -9.65, c.palette.whiteTrim, 'north-upper-cabs-e'],
    [-5.5, -3.1, 0, 0.04, -8.80, -8.42, blueRug, 'sink-blue-mat'],
  ]);
  for (const px of [-8.8, -7.2, -6.6, -1.6, 0.2, 2.2, 4.4]) c.addBox(nk, px - 0.03, px + 0.03, 2.35, 2.72, -8.98, -8.92, c.palette.matteBlackIron, `north-lower-pull-${px}`);

  // 5. East Range, Cabinets & Pyramid Chimney Hood
  c.boxes(fixtures.eastRangeAndHood, [
    [3.65, 5.7, 0, 2.92, -8.4, -5.65, c.palette.whiteTrim, 'east-lower-cab-n'], [3.65, 5.7, 0, 2.92, -2.85, -0.2, c.palette.whiteTrim, 'east-lower-cab-s'],
    [3.6, 5.7, 2.92, 3.06, -8.4, -5.65, quartz, 'east-top-n'], [3.6, 5.7, 2.92, 3.06, -2.85, -0.2, quartz, 'east-top-s'],
    [5.60, 5.7, 3.06, 4.45, -8.4, -0.2, subway, 'east-subway-backsplash'], [4.6, 5.7, 4.45, 6.20, -8.4, -5.9, c.palette.whiteTrim, 'east-upper-cab-n'],
    [4.6, 5.7, 4.45, 6.20, -2.6, -0.2, c.palette.whiteTrim, 'east-upper-cab-s'], [3.35, 5.7, 0, 3.08, -5.65, -2.85, c.palette.brushedSteel, 'double-oven-range'],
    [3.31, 3.37, 1.78, 2.58, -5.45, -3.05, ovenGlass, 'range-upper-door'], [3.31, 3.37, 0.42, 1.48, -5.45, -3.05, ovenGlass, 'range-lower-door'],
    [3.55, 5.45, 3.08, 3.18, -5.50, -3.00, c.palette.matteBlackIron, 'range-grates'], [3.55, 5.7, 4.70, 5.20, -5.60, -2.90, c.palette.brushedSteel, 'range-hood-canopy'],
    [4.25, 5.7, 5.20, 5.60, -5.05, -3.45, c.palette.brushedSteel, 'range-hood-taper'], [4.75, 5.7, 5.60, 6.50, -4.75, -3.75, c.palette.brushedSteel, 'range-hood-chimney'],
  ]);

  // 6. Stainless French-Door Refrigerator + Magnets + Upper Cabinet
  const fr = fixtures.stainlessFridge;
  c.boxes(fr, [
    [2.9, 5.7, 5.32, 6.20, 0.25, 3.55, c.palette.whiteTrim, 'fridge-upper-cabinet'], [2.82, 5.65, 0.08, 5.30, 0.35, 3.45, c.palette.brushedSteel, 'fridge-body'],
    [2.78, 2.84, 1.72, 1.78, 0.35, 3.45, c.palette.matteBlackIron, 'fridge-freezer-seam'], [2.78, 2.84, 1.78, 5.28, 1.87, 1.93, c.palette.matteBlackIron, 'fridge-center-seam'],
    [2.72, 2.80, 2.55, 4.45, 1.62, 1.70, c.palette.matteBlackIron, 'fridge-handle-n'], [2.72, 2.80, 2.55, 4.45, 2.10, 2.18, c.palette.matteBlackIron, 'fridge-handle-s'],
    [2.72, 2.80, 1.38, 1.46, 1.0, 2.8, c.palette.matteBlackIron, 'fridge-freezer-handle'],
  ]);
  for (const [mi, [my, mz, col]] of ([[4.6, 0.9, '#e63946'], [4.2, 1.25, '#457b9d'], [3.8, 0.85, '#f4a261'], [4.4, 2.7, '#2a9d8f'], [3.9, 2.95, '#e9c46a']] as const).entries()) {
    c.addBox(fr, 2.79, 2.83, my, my + 0.22, mz, mz + 0.18, c.mat(col, 0.6), `fridge-magnet-${mi}`);
  }

  // 7. Kitchen Island + Microwave + 2 Dark Brown Barstools + Trash Can + Toddler Learning Tower
  const ki = fixtures.kitchenIsland;
  c.boxes(ki, [
    [-4.4, 0.4, 0, 2.94, -3.1, 1.4, c.palette.whiteTrim, 'island-base'], [-5.0, 0.55, 2.94, 3.10, -3.3, 1.6, quartz, 'island-quartz-top'],
    [0.36, 0.45, 1.42, 2.52, -1.5, 0.1, c.palette.brushedSteel, 'island-microwave-bezel'], [0.41, 0.47, 1.54, 2.40, -1.35, -0.05, ovenGlass, 'island-microwave-door'],
    [-1.35, -0.25, 0, 2.05, 1.72, 2.68, c.palette.brushedSteel, 'island-trash-can'], [-1.37, -0.23, 2.05, 2.16, 1.70, 2.70, c.palette.matteBlackIron, 'island-trash-lid'],
    [-4.12, -2.58, 1.35, 1.47, 1.67, 2.75, c.palette.whiteTrim, 'learning-tower-platform'], [-4.12, -2.58, 2.82, 2.95, 1.67, 2.75, c.palette.whiteTrim, 'learning-tower-rail'],
  ]);
  for (const [si, sz] of [-1.95, 0.15].entries()) {
    c.boxes(ki, [
      [-6.25, -5.15, 0, 2.02, sz - 0.52, sz + 0.52, c.palette.matteBlackIron, `island-stool-base-${si}`],
      [-6.32, -5.08, 2.02, 2.22, sz - 0.56, sz + 0.56, barBrown, `island-stool-seat-${si}`],
      [-6.36, -6.14, 2.22, 2.95, sz - 0.56, sz + 0.56, barBrown, `island-stool-back-${si}`],
    ]);
  }
  for (const [pi, [px, pz]] of [[-4.05, 1.74], [-2.65, 1.74], [-4.05, 2.68], [-2.65, 2.68]].entries()) {
    c.addBox(ki, px - 0.07, px + 0.07, 0, 2.95, pz - 0.07, pz + 0.07, c.palette.whiteTrim, `learning-tower-post-${pi}`);
  }

  // 8. Kids Play Kitchen Corner + Blue Rug + Framed Harbor Art
  c.boxes(fixtures.playKitchenCorner, [
    [1.35, 4.55, 0, 1.85, 9.45, 10.66, c.palette.whiteTrim, 'play-kitchen-base'], [1.30, 4.60, 1.85, 1.96, 9.40, 10.68, playBirch, 'play-kitchen-counter'],
    [1.35, 4.55, 1.96, 3.15, 10.22, 10.66, playBirch, 'play-kitchen-upper'], [0.9, 4.9, 0, 0.04, 8.25, 9.35, blueRug, 'play-kitchen-rug'],
    [1.55, 4.35, 3.35, 4.38, 10.58, 10.70, playBirch, 'harbor-art-frame'], [1.67, 4.23, 3.82, 4.26, 10.55, 10.59, c.mat('#8eb2c9', 0.72), 'harbor-art-sky'],
    [1.67, 4.23, 3.47, 3.82, 10.55, 10.59, c.mat('#355978', 0.72), 'harbor-art-water'],
  ]);

  // 9. Tall White Hall Pantry
  c.parts(fixtures.tallWhitePantry, f.tallWhitePantry, [
    [0.02, 0.98, 0, 1, 0.32, 0.99, c.palette.whiteTrim], [0.04, 0.48, 0.03, 0.46, 0.29, 0.32, c.palette.whiteTrim],
    [0.52, 0.96, 0.03, 0.46, 0.29, 0.32, c.palette.whiteTrim], [0.04, 0.48, 0.48, 0.97, 0.29, 0.32, c.palette.whiteTrim], [0.52, 0.96, 0.48, 0.97, 0.29, 0.32, c.palette.whiteTrim],
  ]);
  for (const px of [7.55, 8.05]) c.addBox(fixtures.tallWhitePantry, px - 0.03, px + 0.03, 2.3, 3.6, 8.32, 8.38, c.palette.matteBlackIron, `pantry-pull-${px}`);
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
  c.parts(ht, f.hallBathToilet, [[0.06, 0.42, 0.30, 0.58, 0.24, 0.76, porcelain], [0.24, 0.94, 0, 0.30, 0.26, 0.74, porcelain]]);
  c.boxes(ht, [[6.22, 6.30, 2.85, 4.15, -2.45, -0.95, c.palette.matteBlackIron, 'hall-bath-art-frame'], [6.29, 6.33, 2.98, 4.02, -2.32, -1.08, c.mat('#6b8b88', 0.7), 'hall-bath-art-print']]);
}

function buildRosieFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec): void {
  const f = spec.fixtures;
  const [warmWood, whiteSheet, stripePink, cream] = [c.mat('#7c5132', 0.55), c.mat('#f7f6f2', 0.78), c.mat('#dfa8ae', 0.8), c.mat('#f4efe6', 0.82)];

  // 13. Rosie Twin Bed (headboard east) + Striped Bedding + Nightstand + Glowing Lamp
  c.parts(fixtures.rosieTwinBed, f.rosieTwinBed, [
    [0.02, 0.98, 0, 0.28, 0.02, 0.70, warmWood], [0.92, 1.0, 0.22, 1.0, 0.02, 0.70, warmWood],
    [0.04, 0.92, 0.28, 0.56, 0.05, 0.67, whiteSheet], [0.06, 0.44, 0.54, 0.60, 0.05, 0.67, stripePink],
    [0.72, 0.90, 0.56, 0.68, 0.14, 0.58, whiteSheet], [0.76, 0.98, 0, 0.58, 0.73, 0.98, warmWood],
    [0.84, 0.92, 0.58, 0.74, 0.81, 0.90, c.palette.whiteTrim], [0.80, 0.96, 0.74, 0.94, 0.77, 0.94, c.mat('#fff3d4', 0.3)],
  ]);

  // 14. Rainbow Mural Arches + Framed World Map Art on East Wall
  const rm = fixtures.rosieRainbowAndMap;
  for (const [ri, [rad, hex]] of ([[1.85, '#e0919c'], [1.54, '#e6b97a'], [1.23, '#88b8c9']] as const).entries()) {
    c.addMesh(rm, new TorusGeometry(rad, 0.14, 10, 28, Math.PI), c.mat(hex, 0.72), 23.22, 3.35, -5.3, `rosie-rainbow-arch-${ri}`).rotation.y = Math.PI / 2;
  }
  c.boxes(rm, [
    [23.14, 23.27, 2.55, 4.35, -2.45, 0.0, warmWood, 'rosie-map-frame'], [23.10, 23.15, 2.67, 4.23, -2.33, -0.12, cream, 'rosie-map-canvas'],
    [23.07, 23.11, 3.05, 3.88, -2.10, -1.35, c.mat('#88b8c9', 0.72), 'rosie-map-west'], [23.07, 23.11, 2.95, 3.96, -1.10, -0.30, c.mat('#7ea89b', 0.72), 'rosie-map-east'],
  ]);

  // 15. Round White & Mustard-Yellow Geometric Rug
  const rr = f.rosieRoundRug;
  const rugMat = c.trackMat(new MeshStandardMaterial({ map: c.trackTex(createRosieRugTexture()), roughness: 0.9, metalness: 0.02 }));
  const rRad = Math.min(rr.xMax - rr.xMin, rr.zMax - rr.zMin) / 2;
  c.addCyl(fixtures.rosieRoundRug, (rr.xMin + rr.xMax) / 2, rr.heightFt / 2, (rr.zMin + rr.zMax) / 2, rRad, rRad, rr.heightFt, rugMat, 'rosie-round-rug-disc', 32);

  // 16. White Dresser on West Wall
  c.parts(fixtures.rosieWhiteDresser, f.rosieWhiteDresser, [
    [0.02, 0.96, 0.06, 0.95, 0.02, 0.98, c.palette.whiteTrim], [0, 1, 0.95, 1, 0, 1, c.palette.whiteTrim],
    [0.96, 1, 0.12, 0.48, 0.05, 0.47, c.palette.whiteTrim], [0.96, 1, 0.12, 0.48, 0.53, 0.95, c.palette.whiteTrim],
    [0.96, 1, 0.54, 0.90, 0.05, 0.47, c.palette.whiteTrim], [0.96, 1, 0.54, 0.90, 0.53, 0.95, c.palette.whiteTrim],
  ]);

  // 17. Sliding Closet Doors + Tall White Wooden Dollhouse + Low Cube Toy Shelf
  c.boxes(fixtures.rosieClosetAndDollhouse, [
    [19.0, 21.15, 0, 4.45, 0.06, 0.24, c.palette.whiteTrim, 'rosie-closet-door-w'], [21.05, 23.18, 0, 4.45, -0.04, 0.14, c.palette.whiteTrim, 'rosie-closet-door-e'],
    [16.5, 18.7, 0, 3.65, -0.95, 0.25, c.palette.whiteTrim, 'rosie-dollhouse-body'], [16.65, 18.55, 0.25, 3.45, -0.98, -0.10, c.mat('#f6ebe1', 0.78), 'rosie-dollhouse-interior'],
    [16.4, 18.8, 3.65, 4.35, -1.0, 0.28, c.mat('#e0919c', 0.72), 'rosie-dollhouse-roof'], [14.85, 16.35, 0, 2.05, -0.98, 0.25, c.palette.whiteTrim, 'rosie-cube-shelf'],
    [14.95, 15.55, 0.15, 0.95, -1.02, 0.15, c.mat('#e6b97a', 0.8), 'rosie-cube-bin-1'], [15.65, 16.25, 0.15, 0.95, -1.02, 0.15, c.mat('#88b8c9', 0.8), 'rosie-cube-bin-2'],
  ]);
}

function buildIsaacFixtures(c: Tier3FixtureContext, fixtures: Record<Tier3FixtureKey, Group>, spec: Tier3LayoutSpec): void {
  const f = spec.fixtures;
  const [darkWalnut, cream, gliderGray, mustard, olive, stripeNavy] = [
    c.mat('#4d3221', 0.56), c.mat('#f4efe6', 0.82), c.mat('#8c949e', 0.82),
    c.mat('#c9a23f', 0.8), c.mat('#5e6b4c', 0.86), c.mat('#2f5573', 0.8),
  ];

  // 18. Dark Wood Slatted Crib + Small Wooden Bookcase
  const cr = fixtures.isaacWoodCrib;
  c.boxes(cr, [
    [12.15, 13.5, 0, 2.75, 5.45, 6.45, darkWalnut, 'isaac-small-bookcase'], [12.35, 13.35, 1.5, 2.45, 5.55, 6.35, c.mat('#d9a992', 0.75), 'isaac-bookcase-books'],
    [12.15, 15.25, 0.58, 0.82, 6.65, 10.15, darkWalnut, 'crib-platform'], [12.28, 15.12, 0.82, 1.38, 6.78, 10.02, cream, 'crib-mattress'],
    [12.18, 15.22, 3.16, 3.34, 6.68, 6.82, darkWalnut, 'crib-rail-n'], [12.18, 15.22, 3.16, 3.34, 9.98, 10.12, darkWalnut, 'crib-rail-s'],
    [12.18, 12.32, 3.16, 3.34, 6.68, 10.12, darkWalnut, 'crib-rail-w'], [15.08, 15.22, 3.16, 3.34, 6.68, 10.12, darkWalnut, 'crib-rail-e'],
  ]);
  for (const [pi, [px, pz]] of [[12.22, 6.72], [15.18, 6.72], [12.22, 10.08], [15.18, 10.08]].entries()) {
    c.addBox(cr, px - 0.08, px + 0.08, 0, 3.38, pz - 0.08, pz + 0.08, darkWalnut, `crib-post-${pi}`);
  }
  for (let i = 0; i < 6; i += 1) {
    const sz = 7.05 + i * 0.54;
    c.addBox(cr, 15.10, 15.20, 0.82, 3.16, sz - 0.04, sz + 0.04, darkWalnut, `crib-slat-e-${i}`);
  }

  // 19. Walnut 6-Drawer Dresser + Framed Art + Stainless Diaper Pail + Striped Hamper
  const id = fixtures.isaacWalnutDresser;
  c.boxes(id, [
    [14.2, 18.0, 0.14, 2.86, 0.84, 2.58, darkWalnut, 'isaac-walnut-dresser'], [14.8, 17.4, 2.86, 3.16, 1.05, 2.38, cream, 'isaac-changing-pad'],
    [15.0, 17.2, 3.35, 4.35, 0.82, 0.92, darkWalnut, 'isaac-dresser-art-frame'], [15.14, 17.06, 3.49, 4.21, 0.90, 0.95, cream, 'isaac-dresser-art-mat'],
    [18.25, 19.15, 0, 1.95, 1.05, 2.25, cream, 'isaac-striped-hamper'], [18.23, 19.17, 0.72, 1.18, 1.03, 2.27, stripeNavy, 'isaac-hamper-stripe'],
  ]);
  c.addCyl(id, 13.55, 1.05, 1.68, 0.44, 0.42, 2.1, c.palette.brushedSteel, 'isaac-diaper-pail');

  // 20. Gray Nursery Glider Armchair + Yellow Pillow + Round Mustard-Yellow Ottoman
  const ig = fixtures.isaacGliderAndOttoman;
  c.boxes(ig, [
    [19.9, 22.9, 0, 0.36, 1.1, 3.3, darkWalnut, 'isaac-glider-base'], [19.8, 23.0, 0.36, 1.38, 1.05, 3.35, gliderGray, 'isaac-glider-seat'],
    [21.8, 23.0, 1.38, 3.08, 1.05, 3.35, gliderGray, 'isaac-glider-back'], [19.85, 22.0, 1.38, 2.18, 1.05, 1.45, gliderGray, 'isaac-glider-arm-n'],
    [19.85, 22.0, 1.38, 2.18, 2.95, 3.35, gliderGray, 'isaac-glider-arm-s'], [21.0, 21.75, 1.42, 2.25, 1.65, 2.75, mustard, 'isaac-glider-yellow-pillow'],
  ]);
  c.addCyl(ig, 20.7, 0.68, 4.05, 0.72, 0.70, 1.32, mustard, 'isaac-tufted-ottoman');

  // 21. Olive-Green Foldable Floor Play Couch
  c.parts(fixtures.isaacPlayCouch, f.isaacPlayCouch, [
    [0, 1, 0, 0.26, 0, 1, olive], [0, 1, 0.27, 0.52, 0.02, 0.98, olive], [0.02, 0.98, 0.52, 0.98, 0.62, 0.98, olive],
    [0.02, 0.16, 0.52, 0.84, 0.06, 0.62, olive], [0.84, 0.98, 0.52, 0.84, 0.06, 0.62, olive],
  ]);

  // 22. Cream Star-Patterned Floor Play Mat
  const sm = f.isaacStarPlayMat;
  const starMat = c.trackMat(new MeshStandardMaterial({ map: c.trackTex(createStarPlayMatTexture()), roughness: 0.9, metalness: 0.02 }));
  c.addBox(fixtures.isaacStarPlayMat, sm.xMin, sm.xMax, 0, sm.heightFt, sm.zMin, sm.zMax, starMat, 'isaac-star-play-mat');
}

function addCeilingFan(parent: Group, name: string, cx: number, y: number, cz: number, c: Tier3FixtureContext): void {
  const fan = new Group();
  fan.name = name;
  c.addCyl(fan, cx, y - 0.18, cz, 0.14, 0.14, 0.36, c.palette.whiteTrim, `${name}-rod`, 12);
  c.addCyl(fan, cx, y - 0.44, cz, 0.42, 0.38, 0.24, c.palette.whiteTrim, `${name}-hub`, 16);
  c.addSphere(fan, cx, y - 0.62, cz, 0.22, c.mat('#fff5d6', 0.22), `${name}-light`);
  for (let b = 0; b < 4; b += 1) {
    const angle = (b * Math.PI) / 2 + Math.PI / 4;
    c.addMesh(fan, new BoxGeometry(2.1, 0.05, 0.42), c.palette.whiteTrim, cx + Math.cos(angle) * 1.15, y - 0.44, cz + Math.sin(angle) * 1.15, `${name}-blade-${b}`).rotation.y = -angle;
  }
  parent.add(fan);
}

export function buildTier3Fixtures(palette: Tier1MaterialPalette, spec: Tier3LayoutSpec = TIER3_LAYOUT_SPEC): Tier3FixturesBuildResult {
  const geometries: BufferGeometry[] = [];
  const localMats: MeshStandardMaterial[] = [];
  const localTexs: DataTexture[] = [];
  const cache = new Map<string, MeshStandardMaterial>();

  const trackMat = (m: MeshStandardMaterial): MeshStandardMaterial => { localMats.push(m); return m; };
  const trackTex = (t: DataTexture): DataTexture => { localTexs.push(t); return t; };
  const mat = (color: string | number, roughness = 0.72, metalness = 0.06, opacity = 1): MeshStandardMaterial => {
    const key = `${String(color)}|${roughness}|${metalness}|${opacity}`;
    const existing = cache.get(key);
    if (existing) return existing;
    const created = trackMat(new MeshStandardMaterial({ color, roughness, metalness, transparent: opacity < 1, opacity }));
    cache.set(key, created);
    return created;
  };
  const trackMesh = (parent: Group, geom: BufferGeometry, material: MeshStandardMaterial, cx: number, cy: number, cz: number, name?: string): Mesh => {
    geometries.push(geom);
    const mesh = new Mesh(geom, material);
    if (name) mesh.name = name;
    mesh.position.set(cx, cy, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const addBox: Tier3FixtureContext['addBox'] = (p, x0, x1, y0, y1, z0, z1, m, name) =>
    trackMesh(p, new BoxGeometry(Math.max(0.02, x1 - x0), Math.max(0.02, y1 - y0), Math.max(0.02, z1 - z0)), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, name);
  const boxes: Tier3FixtureContext['boxes'] = (p, items) => {
    for (const [x0, x1, y0, y1, z0, z1, m, name] of items) addBox(p, x0, x1, y0, y1, z0, z1, m, name);
  };
  const addCyl: Tier3FixtureContext['addCyl'] = (p, cx, cy, cz, rT, rB, h, m, name, segs = 20) =>
    trackMesh(p, new CylinderGeometry(rT, rB, h, segs), m, cx, cy, cz, name);
  const addSphere: Tier3FixtureContext['addSphere'] = (p, cx, cy, cz, r, m, name) =>
    trackMesh(p, new SphereGeometry(r, 16, 12), m, cx, cy, cz, name);
  const parts: Tier3FixtureContext['parts'] = (p, s, items) => {
    const [dx, dy, dz] = [s.xMax - s.xMin, s.heightFt, s.zMax - s.zMin];
    for (const [ux0, ux1, uy0, uy1, uz0, uz1, m] of items) {
      addBox(p, s.xMin + dx * ux0, s.xMin + dx * ux1, dy * uy0, dy * uy1, s.zMin + dz * uz0, s.zMin + dz * uz1, m);
    }
  };

  const ctx: Tier3FixtureContext = { palette, mat, trackMat, trackTex, addMesh: trackMesh, addBox, boxes, addCyl, addSphere, parts };
  const root = new Group();
  root.name = 'tier3-fixtures';

  const fixtures = {} as Record<Tier3FixtureKey, Group>;
  for (const key of Object.keys(spec.fixtures) as Tier3FixtureKey[]) {
    const fSpec = spec.fixtures[key];
    const g = new Group();
    g.name = `fixture-${fSpec.id}`;
    g.userData = { fixtureId: fSpec.id, roomId: fSpec.roomId, label: fSpec.label };
    fixtures[key] = g;
    root.add(g);
  }

  buildNookFixtures(ctx, fixtures, spec);
  buildKitchenAndHallFixtures(ctx, fixtures, spec);
  buildHallBathFixtures(ctx, fixtures, spec);
  buildRosieFixtures(ctx, fixtures, spec);
  buildIsaacFixtures(ctx, fixtures, spec);

  const ceilingFansGroup = new Group();
  ceilingFansGroup.name = 'tier3-ceiling-fans';
  addCeilingFan(ceilingFansGroup, 'rosie-ceiling-fan', 17.65, 6.25, -5.25, ctx);
  addCeilingFan(ceilingFansGroup, 'isaac-ceiling-fan', 17.65, 6.25, 5.75, ctx);
  root.add(ceilingFansGroup);

  return {
    root,
    fixtures,
    ceilingFansGroup,
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const m of localMats) m.dispose();
      for (const t of localTexs) t.dispose();
    },
  };
}
