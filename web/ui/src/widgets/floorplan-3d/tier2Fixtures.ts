import {
  BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, type BufferGeometry,
} from 'three';
import {
  TIER2_LAYOUT_SPEC, type Tier2FixtureKey, type Tier2FixtureSpec, type Tier2LayoutSpec,
} from './tier2LayoutSpec';
import type { Tier1MaterialPalette } from './tier1Shell';

type PartItem = readonly [number, number, number, number, number, number, MeshStandardMaterial];

interface Tier2FixtureMaterialContext {
  palette: Tier1MaterialPalette;
  mat: (color: string | number, roughness?: number, metalness?: number, opacity?: number) => MeshStandardMaterial;
  addBox: (p: Group, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, m: MeshStandardMaterial, name?: string) => Mesh;
  addCyl: (p: Group, cx: number, cy: number, cz: number, rT: number, rB: number, h: number, m: MeshStandardMaterial, name?: string, segs?: number) => Mesh;
  addSphere: (p: Group, cx: number, cy: number, cz: number, r: number, m: MeshStandardMaterial, name?: string) => Mesh;
  parts: (p: Group, spec: Tier2FixtureSpec, items: ReadonlyArray<PartItem>) => void;
}

export interface Tier2FixturesBuildResult {
  root: Group;
  fixtures: Readonly<Record<Tier2FixtureKey, Group>>;
  ceilingFansGroup: Group;
  dispose: () => void;
}

function buildLivingFixtures(c: Tier2FixtureMaterialContext, fixtures: Record<Tier2FixtureKey, Group>, spec: Tier2LayoutSpec): void {
  const f = spec.fixtures;
  const [stone, firebox, ember] = [c.mat('#8a9098', 0.82), c.mat('#181b20', 0.9), c.mat('#d96b27', 0.4)];
  const [warmWood, darkWood, cream, creamCush] = [c.mat('#7c5132', 0.55), c.mat('#3d2b1f', 0.58), c.mat('#ede6da', 0.85), c.mat('#f4efe6', 0.82)];
  const [pillowSage, pillowRust, tvScreen] = [c.mat('#7d937c', 0.8), c.mat('#b86b4b', 0.8), c.mat('#14181f', 0.22, 0.35)];

  c.parts(fixtures.fireplaceHearth, f.fireplaceHearth, [
    [0, 1, 0, 0.08, 0, 1, stone], [0, 0.72, 0.08, 1, 0.04, 0.96, stone],
    [0.54, 0.74, 0.12, 0.52, 0.22, 0.78, firebox], [0.58, 0.70, 0.14, 0.22, 0.32, 0.68, ember],
    [0, 0.88, 0.60, 0.67, 0.02, 0.98, warmWood], [0.72, 0.77, 0.71, 0.96, 0.20, 0.80, c.palette.matteBlackIron],
    [0.77, 0.79, 0.73, 0.94, 0.23, 0.77, c.mat('#5d7a8c', 0.55)],
  ]);

  const tvSpec = f.cornerTvConsole;
  const tvAngled = new Group();
  tvAngled.name = 'corner-tv-angled';
  tvAngled.position.set((tvSpec.xMin + tvSpec.xMax) / 2, 0, (tvSpec.zMin + tvSpec.zMax) / 2);
  tvAngled.rotation.y = Math.PI / 2 - 0.14;
  c.addBox(tvAngled, -1.65, 1.65, 0, 1.8, -0.62, 0.62, darkWood, 'tv-cabinet-body');
  c.addBox(tvAngled, -1.72, 1.72, 1.8, 1.94, -0.66, 0.66, warmWood, 'tv-cabinet-top');
  c.addBox(tvAngled, -1.48, -0.08, 0.2, 1.65, 0.62, 0.67, c.palette.matteBlackIron, 'tv-door-left');
  c.addBox(tvAngled, 0.08, 1.48, 0.2, 1.65, 0.62, 0.67, c.palette.matteBlackIron, 'tv-door-right');
  c.addBox(tvAngled, -0.45, 0.45, 1.94, 2.15, -0.15, 0.15, c.palette.matteBlackIron, 'tv-stand');
  c.addBox(tvAngled, -1.52, 1.52, 2.15, 4.05, -0.06, 0.06, tvScreen, 'tv-panel');
  fixtures.cornerTvConsole.add(tvAngled);

  c.parts(fixtures.livingAreaRug, f.livingAreaRug, [
    [0, 1, 0, 0.5, 0, 1, c.mat('#ded6c8', 0.92)], [0.04, 0.96, 0.5, 1, 0.04, 0.96, c.mat('#ebe5da', 0.9)],
  ]);

  c.parts(fixtures.creamSofa, f.creamSofa, [
    [0.04, 0.96, 0, 0.10, 0.04, 0.96, darkWood], [0, 1, 0.10, 0.36, 0, 1, cream], [0.74, 1, 0.36, 0.96, 0, 1, cream],
    [0.02, 0.98, 0.36, 0.68, 0, 0.11, cream], [0.02, 0.98, 0.36, 0.68, 0.89, 1, cream],
    [0.04, 0.74, 0.36, 0.52, 0.12, 0.39, creamCush], [0.04, 0.74, 0.36, 0.52, 0.40, 0.60, creamCush], [0.04, 0.74, 0.36, 0.52, 0.61, 0.88, creamCush],
    [0.58, 0.74, 0.52, 0.88, 0.13, 0.38, creamCush], [0.58, 0.74, 0.52, 0.88, 0.41, 0.59, creamCush], [0.58, 0.74, 0.52, 0.88, 0.62, 0.87, creamCush],
    [0.36, 0.56, 0.52, 0.78, 0.14, 0.28, pillowSage], [0.36, 0.56, 0.52, 0.78, 0.72, 0.86, pillowRust],
  ]);

  const st = f.sofaSideTable;
  const [stCx, stCz, stR] = [(st.xMin + st.xMax) / 2, (st.zMin + st.zMax) / 2, (st.xMax - st.xMin) * 0.46];
  c.addCyl(fixtures.sofaSideTable, stCx, st.heightFt * 0.92, stCz, stR, stR, st.heightFt * 0.12, warmWood, 'side-table-top');
  c.addCyl(fixtures.sofaSideTable, stCx, st.heightFt * 0.44, stCz, stR * 0.22, stR * 0.38, st.heightFt * 0.84, darkWood, 'side-table-base');

  const art = f.pastelOvalWallArt;
  const canvasFrontZ = Math.max(art.zMin + 0.08, art.zMax - 0.08);
  c.addBox(fixtures.pastelOvalWallArt, art.xMin, art.xMax, 2.0, 4.2, art.zMin, canvasFrontZ, c.palette.whiteTrim, 'pastel-art-canvas');
  for (const [i, hex] of ['#9ab7b0', '#d9a992', '#8da4bc', '#d2c596', '#c59b82'].entries()) {
    const oval = c.addCyl(fixtures.pastelOvalWallArt, art.xMin + 1.1 + i * 1.6, 3.1, canvasFrontZ + 0.02, 0.44, 0.44, 0.04, c.mat(hex, 0.62), `pastel-oval-${i}`, 24);
    oval.rotation.x = Math.PI / 2;
    oval.scale.set(1, 1, 1.65);
  }
}

function buildPlayNookFixtures(c: Tier2FixtureMaterialContext, fixtures: Record<Tier2FixtureKey, Group>, spec: Tier2LayoutSpec): void {
  const f = spec.fixtures;
  const [warmWood, darkWood, cream, creamCush] = [c.mat('#7c5132', 0.55), c.mat('#3d2b1f', 0.58), c.mat('#ede6da', 0.85), c.mat('#f4efe6', 0.82)];
  const [pillowSage, benchCushion, gold] = [c.mat('#7d937c', 0.8), c.mat('#b8bcc2', 0.84), c.mat('#c8a253', 0.35, 0.65)];

  c.parts(fixtures.westWindowBench, f.westWindowBench, [
    [0, 0.94, 0, 0.78, 0, 1, c.palette.whiteTrim], [0.94, 1, 0.06, 0.72, 0.04, 0.48, c.palette.whiteTrim],
    [0.94, 1, 0.06, 0.72, 0.52, 0.96, c.palette.whiteTrim], [0.04, 0.96, 0.78, 1, 0.02, 0.98, benchCushion],
  ]);

  c.parts(fixtures.southWindowBench, f.southWindowBench, [
    [0, 1, 0, 0.78, 0.06, 1, c.palette.whiteTrim], [0.04, 0.48, 0.06, 0.72, 0, 0.06, c.palette.whiteTrim],
    [0.52, 0.96, 0.06, 0.72, 0, 0.06, c.palette.whiteTrim], [0.02, 0.98, 0.78, 1, 0.04, 0.96, benchCushion],
  ]);

  const ac = f.creamArmchair;
  const chairAngled = new Group();
  chairAngled.name = 'cream-armchair-angled';
  chairAngled.position.set((ac.xMin + ac.xMax) / 2, 0, (ac.zMin + ac.zMax) / 2);
  chairAngled.rotation.y = -Math.PI * 0.78;
  c.addBox(chairAngled, -1.05, 1.05, 0, 0.32, -0.95, 0.95, darkWood, 'armchair-legs');
  c.addBox(chairAngled, -1.12, 1.12, 0.32, 1.25, -1.02, 1.02, cream, 'armchair-seat-deck');
  c.addBox(chairAngled, -1.12, 1.12, 1.25, 2.85, -1.02, -0.52, cream, 'armchair-backrest');
  c.addBox(chairAngled, -1.12, -0.76, 1.25, 2.05, -0.52, 0.98, cream, 'armchair-arm-w');
  c.addBox(chairAngled, 0.76, 1.12, 1.25, 2.05, -0.52, 0.98, cream, 'armchair-arm-e');
  c.addBox(chairAngled, -0.74, 0.74, 1.25, 1.65, -0.5, 0.92, creamCush, 'armchair-cushion');
  c.addBox(chairAngled, -0.52, 0.52, 1.65, 2.45, -0.5, -0.14, pillowSage, 'armchair-pillow');
  fixtures.creamArmchair.add(chairAngled);

  c.parts(fixtures.catTree, f.catTree, [
    [0.08, 0.92, 0, 0.08, 0.08, 0.92, cream], [0.24, 0.42, 0.08, 0.68, 0.24, 0.42, c.mat('#c8b79e', 0.88)],
    [0.58, 0.76, 0.08, 0.92, 0.58, 0.76, c.mat('#c8b79e', 0.88)], [0.12, 0.64, 0.36, 0.44, 0.12, 0.64, cream],
    [0.16, 0.72, 0.68, 0.76, 0.16, 0.72, cream], [0.36, 0.92, 0.92, 1, 0.36, 0.92, cream],
  ]);

  const cs = f.cubeStorageShelves;
  c.parts(fixtures.cubeStorageShelves, cs, [
    [0, 1, 0, 0.96, 0.88, 1, c.palette.whiteTrim], [0, 1, 0, 0.07, 0, 1, c.palette.whiteTrim],
    [0, 1, 0.46, 0.53, 0, 0.96, c.palette.whiteTrim], [0, 1, 0.93, 1, 0, 1, c.palette.whiteTrim],
    [0, 0.05, 0, 1, 0, 1, c.palette.whiteTrim], [0.32, 0.36, 0.07, 0.93, 0.02, 0.92, c.palette.whiteTrim],
    [0.64, 0.68, 0.07, 0.93, 0.02, 0.92, c.palette.whiteTrim], [0.95, 1, 0, 1, 0, 1, c.palette.whiteTrim],
    [0.07, 0.30, 0.08, 0.44, 0.06, 0.86, c.mat('#d9cbb8', 0.82)], [0.38, 0.62, 0.54, 0.91, 0.06, 0.86, c.mat('#8da4bc', 0.82)], [0.70, 0.93, 0.08, 0.44, 0.06, 0.86, c.mat('#9ab7b0', 0.82)],
  ]);
  const csMidX = (cs.xMin + cs.xMax) / 2;
  for (const [ri, ry] of [3.05, 3.92].entries()) {
    for (const [ci, rx] of [csMidX - 1.35, csMidX + 0.15].entries()) {
      c.addBox(fixtures.cubeStorageShelves, rx, rx + 1.2, ry, ry + 0.72, cs.zMax - 0.04, cs.zMax + 0.04, gold, `nook-grid-frame-${ri}-${ci}`);
      c.addBox(fixtures.cubeStorageShelves, rx + 0.08, rx + 1.12, ry + 0.08, ry + 0.64, cs.zMax - 0.06, cs.zMax + 0.02, creamCush, `nook-grid-print-${ri}-${ci}`);
    }
  }

  c.parts(fixtures.playNookEastShelves, f.playNookEastShelves, [
    [0.88, 1, 0, 1, 0, 1, c.palette.whiteTrim], [0, 1, 0, 0.08, 0, 1, c.palette.whiteTrim],
    [0, 0.96, 0.46, 0.53, 0, 1, c.palette.whiteTrim], [0, 1, 0.93, 1, 0, 1, c.palette.whiteTrim],
    [0, 1, 0, 1, 0, 0.06, c.palette.whiteTrim], [0.02, 0.94, 0.08, 0.93, 0.32, 0.36, c.palette.whiteTrim],
    [0.02, 0.94, 0.08, 0.93, 0.64, 0.68, c.palette.whiteTrim], [0, 1, 0, 1, 0.94, 1, c.palette.whiteTrim],
    [0.08, 0.84, 0.09, 0.44, 0.08, 0.30, c.mat('#d9cbb8', 0.82)], [0.08, 0.84, 0.54, 0.90, 0.38, 0.62, c.mat('#8da4bc', 0.82)],
    [0.08, 0.84, 0.09, 0.44, 0.70, 0.92, c.mat('#9ab7b0', 0.82)],
  ]);

  const at = f.playNookArtTable;
  c.addBox(fixtures.playNookArtTable, at.xMin + 0.55, at.xMax - 0.55, 1.48, 1.62, at.zMin + 0.12, at.zMax - 0.12, c.palette.whiteTrim, 'art-table-top');
  for (const [li, [lx, lz]] of [[at.xMin + 0.7, at.zMin + 0.25], [at.xMax - 0.7, at.zMin + 0.25], [at.xMin + 0.7, at.zMax - 0.25], [at.xMax - 0.7, at.zMax - 0.25]].entries()) {
    c.addCyl(fixtures.playNookArtTable, lx, 0.74, lz, 0.07, 0.06, 1.48, warmWood, `art-table-leg-${li}`);
  }
  for (const [ci, cx0] of [at.xMin + 0.04, at.xMax - 0.78].entries()) {
    const czMid = (at.zMin + at.zMax) / 2;
    const isWest = ci === 0;
    c.addBox(fixtures.playNookArtTable, cx0, cx0 + 0.74, 0.92, 1.04, czMid - 0.42, czMid + 0.42, c.palette.whiteTrim, `art-chair-seat-${ci}`);
    c.addBox(fixtures.playNookArtTable, cx0 + 0.06, cx0 + 0.68, 0, 0.92, czMid - 0.36, czMid + 0.36, warmWood, `art-chair-base-${ci}`);
    c.addBox(fixtures.playNookArtTable, isWest ? cx0 : cx0 + 0.62, isWest ? cx0 + 0.12 : cx0 + 0.74, 1.04, at.heightFt, czMid - 0.42, czMid + 0.42, c.palette.whiteTrim, `art-chair-back-${ci}`);
  }

  const lp = f.paperLanternArcLamp;
  c.addCyl(fixtures.paperLanternArcLamp, lp.xMax - 0.3, 0.1, lp.zMax - 0.3, 0.42, 0.45, 0.18, c.palette.matteBlackIron, 'lamp-base');
  c.addCyl(fixtures.paperLanternArcLamp, lp.xMax - 0.3, lp.heightFt * 0.48, lp.zMax - 0.3, 0.04, 0.05, lp.heightFt * 0.92, c.palette.matteBlackIron, 'lamp-stem');
  c.addBox(fixtures.paperLanternArcLamp, lp.xMin + 0.45, lp.xMax - 0.3, lp.heightFt * 0.91, lp.heightFt * 0.96, lp.zMin + 0.45, lp.zMax - 0.3, c.palette.matteBlackIron, 'lamp-arc-arm');
  c.addSphere(fixtures.paperLanternArcLamp, lp.xMin + 0.45, lp.heightFt * 0.82, lp.zMin + 0.45, 0.55, c.mat('#fbf8f1', 0.35), 'paper-lantern-globe');
}

function buildLandingAndPowderFixtures(c: Tier2FixtureMaterialContext, fixtures: Record<Tier2FixtureKey, Group>, spec: Tier2LayoutSpec): void {
  const f = spec.fixtures;
  const [espresso, porcelain, warmWood] = [c.mat('#2d221c', 0.62), c.mat('#f8fafc', 0.28, 0.08), c.mat('#8a5a36', 0.55)];

  const ch = f.stairwellChandelier;
  const [chCx, chCz] = [(ch.xMin + ch.xMax) / 2, (ch.zMin + ch.zMax) / 2];
  c.addCyl(fixtures.stairwellChandelier, chCx, ch.heightFt - 0.08, chCz, 0.55, 0.55, 0.12, c.palette.matteBlackIron, 'chandelier-canopy');
  for (const [i, [ox, oz, yh]] of [[-0.42, -0.38, 0.85], [0.42, -0.32, 0.72], [0.0, 0.0, 0.58], [-0.36, 0.40, 0.44], [0.38, 0.36, 0.30]].entries()) {
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

  const hm = f.hallwayCabinetAndMap;
  c.parts(fixtures.hallwayCabinetAndMap, hm, [
    [0.08, 1, 0, 0.88, 0.04, 0.96, c.palette.whiteTrim], [0, 0.08, 0.08, 0.84, 0.06, 0.48, c.palette.whiteTrim],
    [0, 0.08, 0.08, 0.84, 0.52, 0.94, c.palette.whiteTrim], [0, 1, 0.88, 0.96, 0.02, 0.98, warmWood],
  ]);
  c.addBox(fixtures.hallwayCabinetAndMap, hm.xMax - 0.14, hm.xMax - 0.02, 3.0, 4.25, hm.zMin + 0.2, hm.zMax - 0.2, c.palette.matteBlackIron, 'world-map-wall-art');
  c.addBox(fixtures.hallwayCabinetAndMap, hm.xMax - 0.17, hm.xMax - 0.14, 3.08, 4.17, hm.zMin + 0.28, hm.zMax - 0.28, c.mat('#e5dccb', 0.72), 'world-map-canvas');
  c.addBox(fixtures.hallwayCabinetAndMap, hm.xMax - 0.19, hm.xMax - 0.17, 3.35, 3.98, hm.zMin + 0.45, hm.zMin + 1.05, c.mat('#47584f', 0.75), 'world-map-west');
  c.addBox(fixtures.hallwayCabinetAndMap, hm.xMax - 0.19, hm.xMax - 0.17, 3.28, 4.02, hm.zMin + 1.25, hm.zMax - 0.42, c.mat('#47584f', 0.75), 'world-map-east');

  const hc = f.hallwayCloset;
  c.addBox(fixtures.hallwayCloset, hc.xMin, hc.xMax, 0, hc.heightFt, hc.zMin, hc.zMin + 0.14, c.palette.whiteTrim, 'hall-closet-door');
  c.addBox(fixtures.hallwayCloset, hc.xMin + 0.14, hc.xMax - 0.14, 0.25, hc.heightFt - 0.25, hc.zMin - 0.02, hc.zMin, c.palette.whiteTrim, 'hall-closet-door-panel');
  c.addCyl(fixtures.hallwayCloset, hc.xMax - 0.35, 2.9, hc.zMin - 0.08, 0.06, 0.06, 0.14, c.palette.matteBlackIron, 'hall-closet-knob');
  c.addBox(fixtures.hallwayCloset, hc.xMin + 0.1, hc.xMax - 0.1, 3.45, 3.55, hc.zMin + 0.5, hc.zMax - 0.2, c.palette.whiteTrim, 'hall-closet-shelf');

  c.parts(fixtures.powderToilet, f.powderToilet, [
    [0.18, 0.82, 0, 0.54, 0.30, 0.94, porcelain], [0.14, 0.86, 0.54, 0.98, 0.02, 0.36, porcelain],
    [0.04, 0.96, 1.18, 1.25, 0, 0.34, warmWood], [0.04, 0.96, 1.48, 1.55, 0, 0.34, warmWood],
  ]);

  const pv = f.powderVanity;
  c.parts(fixtures.powderVanity, pv, [
    [0.06, 1, 0, 0.78, 0.06, 0.94, c.palette.matteBlackIron], [0, 1, 0.78, 0.86, 0.02, 0.98, porcelain],
    [0.18, 0.76, 0.86, 0.98, 0.24, 0.76, porcelain], [0.74, 0.94, 0.98, 1.08, 0.46, 0.54, c.palette.matteBlackIron],
    [0.88, 0.99, 1.06, 1.38, 0.24, 0.76, c.palette.matteBlackIron], [0.83, 0.88, 1.08, 1.38, 0.27, 0.73, c.palette.glass],
  ]);
  const pvArch = c.addCyl(fixtures.powderVanity, pv.xMax - 0.09, pv.heightFt * 1.38, (pv.zMin + pv.zMax) / 2, 0.52, 0.52, 0.14, c.palette.matteBlackIron, 'powder-mirror-arch');
  pvArch.rotation.z = Math.PI / 2;
}

function buildPrimarySuiteFixtures(c: Tier2FixtureMaterialContext, fixtures: Record<Tier2FixtureKey, Group>, root: Group, spec: Tier2LayoutSpec): void {
  const f = spec.fixtures;
  const [darkWood, walnut, beigeHead, whiteSheet] = [c.mat('#422d20', 0.56), c.mat('#6e472b', 0.52), c.mat('#cfc5b4', 0.82), c.mat('#f7f6f2', 0.78)];
  const [porcelain, gold, showerGlass, plantGreen] = [c.mat('#f8fafc', 0.26, 0.08), c.mat('#d4af37', 0.32, 0.72), c.mat('#a8d5ec', 0.12, 0.1, 0.32), c.mat('#356844', 0.72)];

  c.parts(fixtures.primaryKingBed, f.primaryKingBed, [
    [0.02, 0.98, 0, 0.28, 0.02, 0.96, darkWood], [0.04, 0.96, 0.28, 0.56, 0.04, 0.88, whiteSheet],
    [0.04, 0.96, 0.28, 0.58, 0.04, 0.42, c.mat('#e2dcd0', 0.82)], [0, 1, 0.20, 1, 0.88, 1, beigeHead],
    [0.10, 0.46, 0.56, 0.68, 0.68, 0.86, whiteSheet], [0.54, 0.90, 0.56, 0.68, 0.68, 0.86, whiteSheet],
  ]);

  for (const key of ['westNightstand', 'eastNightstand'] as const) {
    c.parts(fixtures[key], f[key], [
      [0.05, 0.95, 0, 0.68, 0.05, 0.95, darkWood], [0.35, 0.65, 0.68, 0.82, 0.35, 0.65, porcelain], [0.24, 0.76, 0.82, 1, 0.24, 0.76, c.mat('#f5ebd6', 0.45)],
    ]);
  }

  const bs = f.bedsideBassinet;
  c.parts(fixtures.bedsideBassinet, bs, [[0.18, 0.82, 0, 0.48, 0.22, 0.86, darkWood], [0.08, 0.92, 0.48, 0.92, 0.16, 0.92, whiteSheet]]);
  const treeArt = c.addCyl(fixtures.bedsideBassinet, 23.25, 3.35, (bs.zMin + bs.zMax) / 2, 0.95, 0.95, 0.08, gold, 'gold-tree-of-life-art', 28);
  treeArt.rotation.z = Math.PI / 2;

  const rg = f.primaryRoundRug;
  const rugRadius = Math.min(rg.xMax - rg.xMin, rg.zMax - rg.zMin) / 2;
  c.addCyl(fixtures.primaryRoundRug, (rg.xMin + rg.xMax) / 2, rg.heightFt / 2, (rg.zMin + rg.zMax) / 2, rugRadius, rugRadius, rg.heightFt, c.mat('#ede6d8', 0.9), 'primary-round-rug-disc', 32);

  const nd = f.northWoodDresser;
  c.parts(fixtures.northWoodDresser, nd, [
    [0, 1, 0, 0.86, 0, 0.94, darkWood], [0.04, 0.96, 0.08, 0.82, 0.94, 1, darkWood],
    [0.10, 0.54, 0.86, 0.98, 0.14, 0.84, whiteSheet],
    [0.72, 0.88, 0.86, 0.93, 0.28, 0.72, porcelain], [0.68, 0.92, 0.93, 1, 0.22, 0.78, plantGreen],
  ]);
  c.addBox(fixtures.northWoodDresser, nd.xMin + 1.2, nd.xMin + 3.6, 3.15, 4.1, nd.zMin, nd.zMin + 0.08, darkWood, 'changing-dresser-mirror');
  c.addBox(fixtures.northWoodDresser, nd.xMin + 1.28, nd.xMin + 3.52, 3.22, 4.02, nd.zMin + 0.08, nd.zMin + 0.11, c.palette.glass, 'changing-dresser-mirror-glass');
  const capRack = new Group();
  capRack.name = 'baseball-cap-rack';
  c.addBox(capRack, nd.xMin - 1.1, nd.xMin - 0.8, 2.25, 3.85, nd.zMin, nd.zMin + 0.06, c.palette.matteBlackIron, 'cap-rack-strip');
  for (const [ci, col] of ['#1d3557', '#2b4c3f', '#9b2226', '#c89f65'].entries()) {
    c.addSphere(capRack, nd.xMin - 0.95, 2.45 + ci * 0.4, nd.zMin + 0.14, 0.16, c.mat(col, 0.78), `baseball-cap-${ci}`);
  }
  fixtures.northWoodDresser.add(capRack);
  const figPlant = new Group();
  figPlant.name = 'fiddle-leaf-fig-plant';
  c.addCyl(figPlant, nd.xMax + 0.8, 0.48, nd.zMin + 0.9, 0.42, 0.34, 0.96, c.mat('#c8b698', 0.85), 'fig-pot');
  c.addCyl(figPlant, nd.xMax + 0.8, 1.75, nd.zMin + 0.9, 0.06, 0.08, 1.6, darkWood, 'fig-trunk');
  c.addSphere(figPlant, nd.xMax + 0.8, 2.85, nd.zMin + 0.9, 0.62, plantGreen, 'fig-canopy-main');
  c.addSphere(figPlant, nd.xMax + 0.55, 2.45, nd.zMin + 0.7, 0.42, plantGreen, 'fig-canopy-side');
  fixtures.northWoodDresser.add(figPlant);

  const dk = f.bedroomDesk;
  c.parts(fixtures.bedroomDesk, dk, [
    [0.24, 1, 0.92, 1, 0, 1, walnut], [0.28, 0.96, 0, 0.92, 0.04, 0.24, darkWood],
    [0.28, 0.96, 0, 0.92, 0.76, 0.96, darkWood], [0.02, 0.36, 0.54, 0.64, 0.30, 0.70, c.mat('#626d78', 0.75)],
    [0.02, 0.10, 0.64, 0.98, 0.32, 0.68, c.mat('#626d78', 0.75)], [0.14, 0.24, 0, 0.54, 0.45, 0.55, c.palette.matteBlackIron],
  ]);

  const closet = new Group();
  closet.name = 'reach-in-closet';
  c.addBox(closet, 6.4, 8.3, 3.45, 3.55, 3.0, 10.6, c.palette.whiteTrim, 'closet-shelf-west');
  const rodW = c.addCyl(closet, 7.25, 3.22, 6.8, 0.04, 0.04, 7.2, c.palette.brushedSteel, 'closet-rod-west');
  rodW.rotation.x = Math.PI / 2;
  for (const [gi, gCol] of ['#364559', '#d8d0c5', '#556b5d', '#6e5849', '#4a5c6e'].entries()) {
    c.addBox(closet, 6.6, 7.9, 1.7, 3.18, 3.3 + gi * 1.45, 4.35 + gi * 1.45, c.mat(gCol, 0.82), `closet-garment-${gi}`);
  }
  root.add(closet);

  c.parts(fixtures.slidingClosetDoors, f.slidingClosetDoors, [
    [0, 1, 0.96, 1, 0, 1, c.palette.whiteTrim], [0, 0.48, 0, 0.96, 0, 0.52, c.palette.whiteTrim], [0.52, 1, 0, 0.96, 0.48, 1, c.palette.whiteTrim],
  ]);

  const sh = f.walkInGlassShower;
  c.addBox(fixtures.walkInGlassShower, sh.xMin, sh.xMax, 0, 0.14, sh.zMin, sh.zMax, c.mat('#2b3036', 0.84), 'shower-pebble-pan');
  c.addBox(fixtures.walkInGlassShower, sh.xMax - 0.14, sh.xMax, 0, 0.22, sh.zMin, sh.zMax, c.palette.whiteTrim, 'shower-curb-east');
  c.addBox(fixtures.walkInGlassShower, sh.xMin, sh.xMax, 0, 0.22, sh.zMax - 0.14, sh.zMax, c.palette.whiteTrim, 'shower-curb-south');
  c.addBox(fixtures.walkInGlassShower, sh.xMax - 0.06, sh.xMax, 0.22, sh.heightFt - 0.06, sh.zMin, sh.zMax, showerGlass, 'shower-glass-east');
  c.addBox(fixtures.walkInGlassShower, sh.xMin, sh.xMax, 0.22, sh.heightFt - 0.06, sh.zMax - 0.06, sh.zMax, showerGlass, 'shower-glass-south');
  c.addBox(fixtures.walkInGlassShower, sh.xMax - 0.06, sh.xMax, sh.heightFt - 0.06, sh.heightFt, sh.zMin, sh.zMax, c.palette.matteBlackIron, 'shower-header-east');
  c.addBox(fixtures.walkInGlassShower, sh.xMin, sh.xMax, sh.heightFt - 0.06, sh.heightFt, sh.zMax - 0.06, sh.zMax, c.palette.matteBlackIron, 'shower-header-south');
  c.addBox(fixtures.walkInGlassShower, sh.xMin + 1.6, sh.xMin + 2.4, 3.85, 4.05, sh.zMin + 0.1, sh.zMin + 0.9, c.palette.matteBlackIron, 'shower-rain-head');

  c.parts(fixtures.primaryBathToilet, f.primaryBathToilet, [
    [0.18, 0.82, 0, 0.54, 0.36, 0.94, porcelain], [0.14, 0.86, 0.54, 0.98, 0.04, 0.42, porcelain],
  ]);

  const vv = f.walnutDoubleVanity;
  c.parts(fixtures.walnutDoubleVanity, vv, [
    [0.02, 0.98, 0, 0.82, 0, 0.96, walnut], [0, 1, 0.82, 0.90, 0, 1, porcelain],
    [0.14, 0.40, 0.80, 0.91, 0.22, 0.78, c.mat('#e2e8f0', 0.25)], [0.60, 0.86, 0.80, 0.91, 0.22, 0.78, c.mat('#e2e8f0', 0.25)],
    [0.25, 0.29, 0.90, 1, 0.08, 0.24, c.palette.matteBlackIron], [0.71, 0.75, 0.90, 1, 0.08, 0.24, c.palette.matteBlackIron],
  ]);
  for (const [mi, name] of ['vanity-mirror-north', 'vanity-mirror-south'].entries()) {
    const mx = vv.xMin + (vv.xMax - vv.xMin) * (mi === 0 ? 0.27 : 0.73);
    const frame = c.addCyl(fixtures.walnutDoubleVanity, mx, 3.6, vv.zMin + 0.08, 0.85, 0.85, 0.08, c.palette.matteBlackIron, name);
    const glass = c.addCyl(fixtures.walnutDoubleVanity, mx, 3.6, vv.zMin + 0.11, 0.76, 0.76, 0.03, c.palette.glass, `${name}-glass`);
    frame.rotation.x = Math.PI / 2;
    glass.rotation.x = Math.PI / 2;
  }
  for (let i = 0; i < 4; i += 1) {
    c.addSphere(fixtures.walnutDoubleVanity, vv.xMin + 1.15 + i * 1.43, 4.52, vv.zMin + 0.18, 0.14, c.mat('#fff5d6', 0.2), `vanity-globe-${i}`);
  }
}

export function buildTier2Fixtures(palette: Tier1MaterialPalette, spec: Tier2LayoutSpec = TIER2_LAYOUT_SPEC): Tier2FixturesBuildResult {
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

  const addBox: Tier2FixtureMaterialContext['addBox'] = (p, x0, x1, y0, y1, z0, z1, m, name) =>
    trackMesh(p, new BoxGeometry(Math.max(0.02, x1 - x0), Math.max(0.02, y1 - y0), Math.max(0.02, z1 - z0)), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, name);
  const addCyl: Tier2FixtureMaterialContext['addCyl'] = (p, cx, cy, cz, rT, rB, h, m, name, segs = 20) =>
    trackMesh(p, new CylinderGeometry(rT, rB, h, segs), m, cx, cy, cz, name);
  const addSphere: Tier2FixtureMaterialContext['addSphere'] = (p, cx, cy, cz, r, m, name) =>
    trackMesh(p, new SphereGeometry(r, 16, 12), m, cx, cy, cz, name);
  const parts: Tier2FixtureMaterialContext['parts'] = (p, s, items) => {
    const [dx, dy, dz] = [s.xMax - s.xMin, s.heightFt, s.zMax - s.zMin];
    for (const [ux0, ux1, uy0, uy1, uz0, uz1, m] of items) {
      addBox(p, s.xMin + dx * ux0, s.xMin + dx * ux1, dy * uy0, dy * uy1, s.zMin + dz * uz0, s.zMin + dz * uz1, m);
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

  buildLivingFixtures(ctx, fixtures, spec);
  buildPlayNookFixtures(ctx, fixtures, spec);
  buildLandingAndPowderFixtures(ctx, fixtures, spec);
  buildPrimarySuiteFixtures(ctx, fixtures, root, spec);

  const ceilingFansGroup = new Group();
  ceilingFansGroup.name = 'tier2-ceiling-fans';
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
