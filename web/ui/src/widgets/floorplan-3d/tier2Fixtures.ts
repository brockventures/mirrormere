import {
  BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry,
  type BufferGeometry,
} from 'three';
import {
  TIER2_LAYOUT_SPEC, type Tier2FixtureKey, type Tier2FixtureSpec, type Tier2LayoutSpec,
} from './tier2LayoutSpec';
import type { Tier1MaterialPalette } from './tier1Shell';

interface Tier2FixtureMaterialContext {
  palette: Tier1MaterialPalette;
  mat: (color: string | number, roughness?: number, metalness?: number, opacity?: number) => MeshStandardMaterial;
  addBox: (
    parent: Group, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number,
    material: MeshStandardMaterial, name?: string,
  ) => Mesh;
  addCyl: (
    parent: Group, cx: number, cy: number, cz: number, rTop: number, rBot: number, height: number,
    material: MeshStandardMaterial, name?: string, segs?: number,
  ) => Mesh;
  addSphere: (
    parent: Group, cx: number, cy: number, cz: number, radius: number,
    material: MeshStandardMaterial, name?: string,
  ) => Mesh;
  parts: (
    parent: Group, spec: Tier2FixtureSpec,
    items: ReadonlyArray<readonly [number, number, number, number, number, number, MeshStandardMaterial]>,
  ) => void;
}

export interface Tier2FixturesBuildResult {
  root: Group;
  fixtures: Readonly<Record<Tier2FixtureKey, Group>>;
  ceilingFansGroup: Group;
  dispose: () => void;
}

type PartItem = readonly [number, number, number, number, number, number, MeshStandardMaterial];

function addCeilingFan(c: Tier2FixtureMaterialContext, parent: Group, cx: number, cy: number, cz: number, name: string): Group {
  const fg = new Group();
  fg.name = name;
  const [wood, iron, lightMat] = [c.mat('#7b5233', 0.55), c.palette.matteBlackIron, c.mat('#fff6df', 0.25, 0.05)];
  c.addCyl(fg, cx, cy + 0.45, cz, 0.06, 0.06, 0.9, iron, `${name}-downrod`);
  c.addCyl(fg, cx, cy, cz, 0.42, 0.38, 0.24, iron, `${name}-motor`);
  c.addCyl(fg, cx, cy - 0.14, cz, 0.28, 0.22, 0.12, lightMat, `${name}-light`);
  c.addBox(fg, cx - 2.2, cx + 2.2, cy - 0.03, cy + 0.03, cz - 0.22, cz + 0.22, wood, `${name}-blade-ew`);
  c.addBox(fg, cx - 0.22, cx + 0.22, cy - 0.03, cy + 0.03, cz - 2.2, cz + 2.2, wood, `${name}-blade-ns`);
  parent.add(fg);
  return fg;
}

function buildLivingAndPlayFixtures(
  c: Tier2FixtureMaterialContext,
  fixtures: Record<Tier2FixtureKey, Group>,
  spec: Tier2LayoutSpec,
): void {
  const f = spec.fixtures;
  const [stone, firebox, ember] = [c.mat('#8a9098', 0.82), c.mat('#181b20', 0.9), c.mat('#d96b27', 0.4)];
  const [warmWood, darkWood, cream, creamCush] = [c.mat('#7c5132', 0.55), c.mat('#3d2b1f', 0.58), c.mat('#ede6da', 0.85), c.mat('#f4efe6', 0.82)];
  const [pillowSage, pillowRust, tvScreen, gold] = [c.mat('#7d937c', 0.8), c.mat('#b86b4b', 0.8), c.mat('#14181f', 0.22, 0.35), c.mat('#c8a253', 0.35, 0.65)];

  c.parts(fixtures.fireplaceHearth, f.fireplaceHearth, [
    [0, 1, 0, 0.08, 0, 1, stone], [0, 0.72, 0.08, 0.68, 0.06, 0.94, stone],
    [0.45, 0.74, 0.12, 0.52, 0.24, 0.76, firebox], [0.52, 0.68, 0.14, 0.22, 0.34, 0.66, ember],
    [0, 0.88, 0.68, 0.75, 0.02, 0.98, warmWood], [0.05, 0.22, 0.77, 0.99, 0.20, 0.80, c.palette.matteBlackIron],
    [0.22, 0.26, 0.79, 0.97, 0.23, 0.77, c.mat('#5d7a8c', 0.6)],
  ]);

  c.parts(fixtures.cornerTvConsole, f.cornerTvConsole, [
    [0.05, 0.95, 0, 0.42, 0.08, 0.92, darkWood], [0.02, 0.98, 0.42, 0.46, 0.05, 0.95, warmWood],
    [0.12, 0.46, 0.08, 0.38, 0.88, 0.94, c.palette.matteBlackIron], [0.54, 0.88, 0.08, 0.38, 0.88, 0.94, c.palette.matteBlackIron],
    [0.36, 0.64, 0.46, 0.52, 0.36, 0.64, c.palette.matteBlackIron], [0.14, 0.86, 0.52, 0.98, 0.44, 0.54, tvScreen],
  ]);

  c.parts(fixtures.livingAreaRug, f.livingAreaRug, [
    [0, 1, 0, 0.5, 0, 1, c.mat('#ded6c8', 0.92)], [0.04, 0.96, 0.5, 1, 0.04, 0.96, c.mat('#ebe5da', 0.9)],
  ]);

  c.parts(fixtures.creamSofa, f.creamSofa, [
    [0.04, 0.96, 0, 0.10, 0.04, 0.96, darkWood], [0, 1, 0.10, 0.36, 0, 1, cream],
    [0.74, 1, 0.36, 0.96, 0, 1, cream], [0.02, 0.98, 0.36, 0.68, 0, 0.11, cream],
    [0.02, 0.98, 0.36, 0.68, 0.89, 1, cream], [0.04, 0.74, 0.36, 0.52, 0.12, 0.39, creamCush],
    [0.04, 0.74, 0.36, 0.52, 0.40, 0.60, creamCush], [0.04, 0.74, 0.36, 0.52, 0.61, 0.88, creamCush],
    [0.58, 0.74, 0.52, 0.88, 0.13, 0.38, creamCush], [0.58, 0.74, 0.52, 0.88, 0.41, 0.59, creamCush],
    [0.58, 0.74, 0.52, 0.88, 0.62, 0.87, creamCush], [0.36, 0.56, 0.52, 0.78, 0.14, 0.28, pillowSage],
    [0.36, 0.56, 0.52, 0.78, 0.72, 0.86, pillowRust],
  ]);

  const st = f.sofaSideTable;
  const [stCx, stCz, stR] = [(st.xMin + st.xMax) / 2, (st.zMin + st.zMax) / 2, (st.xMax - st.xMin) * 0.46];
  c.addCyl(fixtures.sofaSideTable, stCx, st.heightFt * 0.92, stCz, stR, stR, st.heightFt * 0.12, warmWood, 'side-table-top');
  c.addCyl(fixtures.sofaSideTable, stCx, st.heightFt * 0.44, stCz, stR * 0.22, stR * 0.38, st.heightFt * 0.84, darkWood, 'side-table-base');

  c.parts(fixtures.creamArmchair, f.creamArmchair, [
    [0.08, 0.92, 0, 0.12, 0.08, 0.92, darkWood], [0.04, 0.96, 0.12, 0.44, 0.04, 0.96, cream],
    [0.04, 0.28, 0.44, 0.96, 0.04, 0.96, cream], [0.04, 0.94, 0.44, 0.72, 0.04, 0.20, cream],
    [0.04, 0.94, 0.44, 0.72, 0.80, 0.96, cream], [0.24, 0.90, 0.44, 0.58, 0.20, 0.80, creamCush],
    [0.26, 0.48, 0.58, 0.86, 0.24, 0.76, pillowSage],
  ]);

  const art = f.pastelOvalWallArt;
  c.addBox(fixtures.pastelOvalWallArt, art.xMin, art.xMax, 2.1, 4.1, art.zMin, art.zMin + 0.12, c.palette.whiteTrim, 'pastel-art-canvas');
  for (const [i, hex] of ['#9ab7b0', '#d9a992', '#8da4bc', '#d2c596', '#c59b82'].entries()) {
    c.addCyl(fixtures.pastelOvalWallArt, art.xMin + 0.8 + i * 1.45, 3.1, art.zMin + 0.15, 0.48, 0.48, 0.06, c.mat(hex, 0.65), `pastel-oval-${i}`);
  }

  c.parts(fixtures.southWindowBench, f.southWindowBench, [
    [0, 1, 0, 0.82, 0, 1, c.palette.whiteTrim], [0, 1, 0.82, 1, 0, 1, creamCush],
    [0.06, 0.34, 0.12, 0.74, 0.02, 0.98, c.mat('#d6cec2', 0.8)],
    [0.36, 0.64, 0.12, 0.74, 0.02, 0.98, c.mat('#d6cec2', 0.8)],
    [0.66, 0.94, 0.12, 0.74, 0.02, 0.98, c.mat('#d6cec2', 0.8)],
  ]);

  c.parts(fixtures.cubeStorageShelves, f.cubeStorageShelves, [
    [0.10, 0.95, 0, 0.96, 0, 1, c.palette.whiteTrim],
    [0.04, 0.88, 0.08, 0.44, 0.08, 0.46, c.mat('#d9cbb8', 0.82)],
    [0.04, 0.88, 0.52, 0.88, 0.54, 0.92, c.mat('#8da4bc', 0.82)],
  ]);
  const cs = f.cubeStorageShelves;
  for (const [ry, rz] of [[3.2, 4.5], [3.2, 6.8], [4.1, 4.5], [4.1, 6.8]] as const) {
    c.addBox(fixtures.cubeStorageShelves, cs.xMax - 0.18, cs.xMax - 0.04, ry, ry + 0.7, rz, rz + 1.2, gold, 'nook-grid-frame');
  }

  c.parts(fixtures.babyPlayard, f.babyPlayard, [
    [0, 1, 0, 0.12, 0, 1, c.mat('#c7c2b8', 0.8)],
    [0.04, 0.96, 0.12, 0.88, 0.04, 0.96, c.mat('#e5e7eb', 0.6, 0.05, 0.42)],
    [0, 1, 0.88, 1, 0, 0.08, c.palette.matteBlackIron], [0, 1, 0.88, 1, 0.92, 1, c.palette.matteBlackIron],
    [0, 0.08, 0.88, 1, 0.08, 0.92, c.palette.matteBlackIron], [0.92, 1, 0.88, 1, 0.08, 0.92, c.palette.matteBlackIron],
  ]);

  c.parts(fixtures.catTree, f.catTree, [
    [0.08, 0.92, 0, 0.08, 0.08, 0.92, cream], [0.24, 0.42, 0.08, 0.68, 0.24, 0.42, c.mat('#c8b79e', 0.88)],
    [0.58, 0.76, 0.08, 0.92, 0.58, 0.76, c.mat('#c8b79e', 0.88)], [0.12, 0.64, 0.36, 0.44, 0.12, 0.64, cream],
    [0.16, 0.72, 0.68, 0.76, 0.16, 0.72, cream], [0.36, 0.92, 0.92, 1, 0.36, 0.92, cream],
  ]);

  const lp = f.paperLanternArcLamp;
  c.addCyl(fixtures.paperLanternArcLamp, lp.xMax - 0.3, 0.1, lp.zMax - 0.3, 0.42, 0.45, 0.18, c.palette.matteBlackIron, 'lamp-base');
  c.addCyl(fixtures.paperLanternArcLamp, lp.xMax - 0.3, lp.heightFt * 0.48, lp.zMax - 0.3, 0.04, 0.05, lp.heightFt * 0.92, c.palette.matteBlackIron, 'lamp-stem');
  c.addSphere(fixtures.paperLanternArcLamp, lp.xMin + 0.45, lp.heightFt * 0.82, lp.zMin + 0.45, 0.55, c.mat('#fbf8f1', 0.35), 'paper-lantern-globe');
}

function buildLandingAndPowderFixtures(
  c: Tier2FixtureMaterialContext,
  fixtures: Record<Tier2FixtureKey, Group>,
  spec: Tier2LayoutSpec,
): void {
  const f = spec.fixtures;
  const [espresso, porcelain, warmWood] = [c.mat('#2d221c', 0.62), c.mat('#f8fafc', 0.28, 0.08), c.mat('#8a5a36', 0.55)];

  const ch = f.stairwellChandelier;
  const [chCx, chCz] = [(ch.xMin + ch.xMax) / 2, (ch.zMin + ch.zMax) / 2];
  c.addCyl(fixtures.stairwellChandelier, chCx, ch.heightFt - 0.08, chCz, 0.55, 0.55, 0.12, c.palette.matteBlackIron, 'chandelier-canopy');
  const globeOffsets = [[-0.42, -0.38, 0.85], [0.42, -0.32, 0.72], [0.0, 0.0, 0.58], [-0.36, 0.40, 0.44], [0.38, 0.36, 0.30]] as const;
  for (let i = 0; i < globeOffsets.length; i += 1) {
    const [ox, oz, yh] = globeOffsets[i];
    const gy = ch.heightFt * yh;
    c.addCyl(fixtures.stairwellChandelier, chCx + ox, (ch.heightFt + gy) / 2, chCz + oz, 0.015, 0.015, ch.heightFt - gy, c.palette.matteBlackIron, `chandelier-cord-${i}`);
    c.addSphere(fixtures.stairwellChandelier, chCx + ox, gy, chCz + oz, 0.22, c.mat('#fff5d6', 0.2, 0.1), `chandelier-globe-${i}`);
  }

  const bookCols = ['#c95b42', '#3b6ea5', '#d8a648', '#5a8a6f', '#d9cbb8'];
  const shelfItems: PartItem[] = [
    [0, 1, 0, 1, 0, 0.14, espresso], [0, 0.06, 0, 1, 0.14, 1, espresso], [0.94, 1, 0, 1, 0.14, 1, espresso],
    [0.06, 0.94, 0, 0.08, 0.14, 1, espresso], [0.06, 0.94, 0.48, 0.54, 0.14, 0.96, espresso], [0.06, 0.94, 0.92, 1, 0.14, 1, espresso],
  ];
  for (let i = 0; i < 4; i += 1) {
    shelfItems.push([0.12 + i * 0.2, 0.26 + i * 0.2, 0.08, 0.42, 0.24, 0.86, c.mat(bookCols[i], 0.75)]);
    shelfItems.push([0.14 + i * 0.2, 0.28 + i * 0.2, 0.54, 0.86, 0.24, 0.86, c.mat(bookCols[(i + 2) % 5], 0.75)]);
  }
  c.parts(fixtures.landingBookcase, f.landingBookcase, shelfItems);

  c.parts(fixtures.hallwayCabinetAndMap, f.hallwayCabinetAndMap, [
    [0.04, 0.96, 0, 0.86, 0.08, 0.94, c.palette.whiteTrim], [0.06, 0.48, 0.08, 0.82, 0.94, 1, c.palette.whiteTrim],
    [0.52, 0.94, 0.08, 0.82, 0.94, 1, c.palette.whiteTrim], [0, 1, 0.86, 0.94, 0.04, 1, warmWood],
  ]);
  const hm = f.hallwayCabinetAndMap;
  c.addBox(fixtures.hallwayCabinetAndMap, hm.xMin + 0.15, hm.xMax - 0.15, 3.1, 4.3, hm.zMin, hm.zMin + 0.12, c.palette.matteBlackIron, 'world-map-wall-art');

  c.parts(fixtures.powderToilet, f.powderToilet, [
    [0.18, 0.82, 0, 0.54, 0.36, 0.94, porcelain], [0.14, 0.86, 0.54, 0.98, 0.04, 0.42, porcelain],
    [0.05, 0.95, 1.15, 1.22, 0.02, 0.36, warmWood], [0.05, 0.95, 1.45, 1.52, 0.02, 0.36, warmWood],
  ]);

  c.parts(fixtures.powderVanity, f.powderVanity, [
    [0.06, 0.96, 0, 0.78, 0.06, 0.94, c.palette.matteBlackIron], [0.02, 1, 0.78, 0.86, 0.02, 0.98, porcelain],
    [0.20, 0.80, 0.86, 0.98, 0.26, 0.74, porcelain], [0.68, 0.92, 0.98, 1.10, 0.46, 0.54, c.palette.matteBlackIron],
    [0.84, 0.98, 1.12, 1.62, 0.15, 0.85, c.palette.matteBlackIron], [0.78, 0.84, 1.16, 1.58, 0.20, 0.80, c.palette.glass],
  ]);
}

function buildPrimarySuiteFixtures(
  c: Tier2FixtureMaterialContext,
  fixtures: Record<Tier2FixtureKey, Group>,
  spec: Tier2LayoutSpec,
): void {
  const f = spec.fixtures;
  const [darkWood, walnut, beigeHead, whiteSheet] = [c.mat('#422d20', 0.56), c.mat('#6e472b', 0.52), c.mat('#cfc5b4', 0.82), c.mat('#f7f6f2', 0.78)];
  const [porcelain, gold, showerGlass] = [c.mat('#f8fafc', 0.26, 0.08), c.mat('#d4af37', 0.32, 0.72), c.mat('#a8d5ec', 0.12, 0.1, 0.32)];

  c.parts(fixtures.primaryKingBed, f.primaryKingBed, [
    [0.02, 0.98, 0, 0.28, 0.02, 0.96, darkWood], [0.04, 0.96, 0.28, 0.56, 0.04, 0.88, whiteSheet],
    [0.04, 0.96, 0.28, 0.58, 0.04, 0.42, c.mat('#e2dcd0', 0.82)], [0, 1, 0.20, 1, 0.88, 1, beigeHead],
    [0.10, 0.46, 0.56, 0.68, 0.68, 0.86, whiteSheet], [0.54, 0.90, 0.56, 0.68, 0.68, 0.86, whiteSheet],
  ]);

  for (const key of ['westNightstand', 'eastNightstand'] as const) {
    c.parts(fixtures[key], f[key], [
      [0.05, 0.95, 0, 0.68, 0.05, 0.95, darkWood], [0.35, 0.65, 0.68, 0.82, 0.35, 0.65, porcelain],
      [0.24, 0.76, 0.82, 1, 0.24, 0.76, c.mat('#f5ebd6', 0.45)],
    ]);
  }

  c.parts(fixtures.bedsideBassinet, f.bedsideBassinet, [
    [0.18, 0.82, 0, 0.48, 0.18, 0.82, darkWood], [0.08, 0.92, 0.48, 0.92, 0.08, 0.92, whiteSheet],
  ]);
  const bs = f.bedsideBassinet;
  c.addCyl(fixtures.bedsideBassinet, bs.xMin - 0.12, 3.3, (bs.zMin + bs.zMax) / 2, 0.95, 0.95, 0.08, gold, 'gold-tree-of-life-art');

  const rg = f.primaryRoundRug;
  c.addCyl(
    fixtures.primaryRoundRug, (rg.xMin + rg.xMax) / 2, rg.heightFt / 2, (rg.zMin + rg.zMax) / 2,
    (rg.xMax - rg.xMin) / 2, (rg.xMax - rg.xMin) / 2, rg.heightFt, c.mat('#ede6d8', 0.9), 'primary-round-rug-disc', 32,
  );

  c.parts(fixtures.northWoodDresser, f.northWoodDresser, [
    [0, 1, 0, 0.86, 0, 1, darkWood], [0.72, 0.88, 0.86, 0.98, 0.28, 0.72, porcelain],
    [0.68, 0.92, 0.98, 1.18, 0.22, 0.78, c.mat('#3f6b4e', 0.75)],
  ]);

  c.parts(fixtures.eastChangingDresser, f.eastChangingDresser, [
    [0, 1, 0, 0.86, 0, 1, darkWood], [0.12, 0.88, 0.86, 1, 0.18, 0.82, whiteSheet],
  ]);

  c.parts(fixtures.slidingClosetDoors, f.slidingClosetDoors, [
    [0, 0.48, 0, 1, 0, 0.52, c.palette.whiteTrim], [0.52, 1, 0, 1, 0.48, 1, c.palette.whiteTrim],
  ]);

  c.parts(fixtures.walkInGlassShower, f.walkInGlassShower, [
    [0, 1, 0, 0.05, 0, 1, c.mat('#26292e', 0.82)], [0, 1, 0.05, 0.09, 0.94, 1, c.palette.whiteTrim],
    [0, 0.04, 0.05, 0.98, 0, 1, showerGlass], [0, 1, 0.05, 0.98, 0.96, 1, showerGlass],
    [0, 1, 0.96, 1, 0, 1, c.palette.matteBlackIron], [0.42, 0.58, 0.88, 0.96, 0.08, 0.24, c.palette.matteBlackIron],
    [0.32, 0.68, 0.52, 0.68, 0, 0.06, c.palette.matteBlackIron],
  ]);

  c.parts(fixtures.primaryBathToilet, f.primaryBathToilet, [
    [0.18, 0.82, 0, 0.54, 0.36, 0.94, porcelain], [0.14, 0.86, 0.54, 0.98, 0.04, 0.42, porcelain],
  ]);

  const vv = f.walnutDoubleVanity;
  c.parts(fixtures.walnutDoubleVanity, vv, [
    [0.06, 0.98, 0, 0.82, 0.02, 0.98, walnut], [0, 1, 0.82, 0.90, 0, 1, porcelain],
    [0.18, 0.76, 0.80, 0.91, 0.14, 0.40, c.mat('#e2e8f0', 0.25)], [0.18, 0.76, 0.80, 0.91, 0.60, 0.86, c.mat('#e2e8f0', 0.25)],
    [0.76, 0.92, 0.90, 1, 0.25, 0.29, c.palette.matteBlackIron], [0.76, 0.92, 0.90, 1, 0.71, 0.75, c.palette.matteBlackIron],
  ]);
  const [vMidZ1, vMidZ2] = [vv.zMin + (vv.zMax - vv.zMin) * 0.27, vv.zMin + (vv.zMax - vv.zMin) * 0.73];
  c.addCyl(fixtures.walnutDoubleVanity, vv.xMax - 0.08, 3.6, vMidZ1, 0.85, 0.85, 0.08, c.palette.matteBlackIron, 'vanity-mirror-north');
  c.addCyl(fixtures.walnutDoubleVanity, vv.xMax - 0.08, 3.6, vMidZ2, 0.85, 0.85, 0.08, c.palette.matteBlackIron, 'vanity-mirror-south');
  for (let i = 0; i < 4; i += 1) {
    c.addSphere(fixtures.walnutDoubleVanity, vv.xMax - 0.16, 4.45, vv.zMin + 0.9 + i * 1.45, 0.14, c.mat('#fff5d6', 0.2), `vanity-globe-${i}`);
  }

  c.parts(fixtures.bathLinenCloset, f.bathLinenCloset, [
    [0, 1, 0, 1, 0, 0.92, c.palette.officeWall], [0.06, 0.94, 0.04, 0.96, 0.92, 1, c.palette.whiteTrim],
  ]);
}

export function buildTier2Fixtures(
  palette: Tier1MaterialPalette,
  spec: Tier2LayoutSpec = TIER2_LAYOUT_SPEC,
): Tier2FixturesBuildResult {
  const geometries: BufferGeometry[] = [];
  const localMats: MeshStandardMaterial[] = [];
  const cache = new Map<string, MeshStandardMaterial>();

  const mat = (color: string | number, roughness = 0.72, metalness = 0.06, opacity = 1): MeshStandardMaterial => {
    const key = `${String(color)}|${roughness}|${metalness}|${opacity}`;
    const existing = cache.get(key);
    if (existing) return existing;
    const created = new MeshStandardMaterial({ color, roughness, metalness, transparent: opacity < 1, opacity });
    localMats.push(created);
    cache.set(key, created);
    return created;
  };

  const addBox: Tier2FixtureMaterialContext['addBox'] = (parent, x0, x1, y0, y1, z0, z1, material, name) => {
    const geom = new BoxGeometry(Math.max(0.02, x1 - x0), Math.max(0.02, y1 - y0), Math.max(0.02, z1 - z0));
    geometries.push(geom);
    const mesh = new Mesh(geom, material);
    if (name) mesh.name = name;
    mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const addCyl: Tier2FixtureMaterialContext['addCyl'] = (parent, cx, cy, cz, rTop, rBot, height, material, name, segs = 20) => {
    const geom = new CylinderGeometry(rTop, rBot, height, segs);
    geometries.push(geom);
    const mesh = new Mesh(geom, material);
    if (name) mesh.name = name;
    mesh.position.set(cx, cy, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const addSphere: Tier2FixtureMaterialContext['addSphere'] = (parent, cx, cy, cz, radius, material, name) => {
    const geom = new SphereGeometry(radius, 16, 12);
    geometries.push(geom);
    const mesh = new Mesh(geom, material);
    if (name) mesh.name = name;
    mesh.position.set(cx, cy, cz);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const parts: Tier2FixtureMaterialContext['parts'] = (parent, s, items) => {
    const [dx, dy, dz] = [s.xMax - s.xMin, s.heightFt, s.zMax - s.zMin];
    for (const [ux0, ux1, uy0, uy1, uz0, uz1, m] of items) {
      addBox(parent, s.xMin + dx * ux0, s.xMin + dx * ux1, dy * uy0, dy * uy1, s.zMin + dz * uz0, s.zMin + dz * uz1, m);
    }
  };

  const ctx: Tier2FixtureMaterialContext = { palette, mat, addBox, addCyl, addSphere, parts };
  const root = new Group();
  root.name = 'tier2-fixtures';

  const fixtures = {} as Record<Tier2FixtureKey, Group>;
  for (const key of Object.keys(spec.fixtures) as Tier2FixtureKey[]) {
    const fSpec = spec.fixtures[key];
    const g = new Group();
    g.name = `fixture-${fSpec.id}`;
    g.userData = { fixtureId: fSpec.id, roomId: fSpec.roomId, label: fSpec.label };
    fixtures[key] = g;
    root.add(g);
  }

  buildLivingAndPlayFixtures(ctx, fixtures, spec);
  buildLandingAndPowderFixtures(ctx, fixtures, spec);
  buildPrimarySuiteFixtures(ctx, fixtures, spec);

  const ceilingFansGroup = new Group();
  ceilingFansGroup.name = 'tier2-ceiling-fans';
  addCeilingFan(ctx, ceilingFansGroup, -11.8, 7.6, -4.2, 'living-room-ceiling-fan');
  addCeilingFan(ctx, ceilingFansGroup, 14.9, 7.6, 5.2, 'primary-bedroom-ceiling-fan');
  root.add(ceilingFansGroup);

  return {
    root,
    fixtures,
    ceilingFansGroup,
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const m of localMats) m.dispose();
    },
  };
}
