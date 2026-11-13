import { BoxGeometry, Group, Mesh, MeshStandardMaterial, type BufferGeometry } from 'three';
import { TIER1_FIXTURES, type FixtureId, type FixtureSpec } from './tier1LayoutSpec';
import type { Tier1MaterialPalette } from './tier1Shell';

export interface Tier1FixtureIndicators {
  washerStatusMat: MeshStandardMaterial;
  printerStatusMat: MeshStandardMaterial;
  garageThresholdStatusMat: MeshStandardMaterial;
  officeScreenMat: MeshStandardMaterial;
}

export interface Tier1FixturesBuildResult {
  root: Group;
  fixtures: Readonly<Record<FixtureId, Group>>;
  indicators: Tier1FixtureIndicators;
  dispose: () => void;
}

type PartTuple = readonly [number, number, number, number, number, number, MeshStandardMaterial];

interface FixtureCtx {
  p: Tier1MaterialPalette;
  ind: Tier1FixtureIndicators;
  mat: (color: string, roughness?: number, metalness?: number) => MeshStandardMaterial;
  parts: (g: Group, s: FixtureSpec, items: readonly PartTuple[]) => void;
}

function buildBookcase(c: FixtureCtx, g: Group, s: FixtureSpec): void {
  const f = c.mat(s.primaryColor, 0.65);
  const cols = ['#c95b42', '#3b6ea5', '#d8a648', '#5a8a6f', '#e5dfd3'];
  const items: PartTuple[] = [[0, 0.12, 0, 1, 0, 1, f], [0.12, 1, 0, 1, 0, 0.06, f], [0.12, 1, 0, 1, 0.94, 1, f]];
  const shelves = [0.02, 0.22, 0.42, 0.62, 0.80, 0.96];
  for (let i = 0; i < shelves.length; i += 1) {
    const y = shelves[i];
    items.push([0.12, 1, y, y + 0.035, 0.06, 0.94, f]);
    if (i < shelves.length - 1) {
      items.push(
        [0.22, 0.88, y + 0.035, y + 0.16, 0.12, 0.38, c.mat(cols[i % cols.length], 0.75)],
        [0.24, 0.86, y + 0.035, y + 0.14, 0.42, 0.76, c.mat(cols[(i + 2) % cols.length], 0.75)],
      );
    }
  }
  c.parts(g, s, items);
}

function buildLocker(c: FixtureCtx, g: Group, s: FixtureSpec): void {
  const [body, door, iron] = [c.mat(s.primaryColor, 0.56, 0.25), c.mat('#869c85', 0.52, 0.28), c.p.matteBlackIron];
  c.parts(g, s, [
    [0, 1, 0, 0.04, 0, 0.92, c.mat(s.accentColor ?? '#2b312c', 0.7)], [0, 1, 0.04, 1, 0, 0.91, body],
    [0.03, 0.485, 0.06, 0.97, 0.91, 0.97, door], [0.515, 0.97, 0.06, 0.97, 0.91, 0.97, door],
    [0.10, 0.42, 0.84, 0.90, 0.97, 0.99, iron], [0.58, 0.90, 0.84, 0.90, 0.97, 0.99, iron],
    [0.43, 0.47, 0.44, 0.56, 0.97, 1, iron], [0.53, 0.57, 0.44, 0.56, 0.97, 1, iron],
  ]);
}

const buildRug = (c: FixtureCtx, g: Group, s: FixtureSpec, top: MeshStandardMaterial) =>
  c.parts(g, s, [[0, 1, 0, 0.45, 0, 1, c.mat(s.accentColor ?? '#e8e2d8', 0.92)], [0.015, 0.985, 0.45, 1, 0.015, 0.985, top]]);

const buildLedge = (c: FixtureCtx, g: Group, s: FixtureSpec) => {
  const oak = c.mat(s.primaryColor, 0.62);
  c.parts(g, s, [[0.12, 1, 0, 0.72, 0, 1, oak], [0, 0.14, 0, 1, 0, 1, oak], [0.86, 1, 0.72, 0.96, 0.08, 0.92, c.p.matteBlackIron]]);
};

const BUILDERS: Readonly<Record<FixtureId, (c: FixtureCtx, g: Group, s: FixtureSpec) => void>> = {
  'office-bath-door': (c, g, s) => c.parts(g, s, [
    [0, 1, 0, 1, 0, 0.45, c.p.whiteTrim], [0.06, 0.94, 0.01, 0.96, 0.25, 0.76, c.mat(s.primaryColor, 0.55)],
    [0.16, 0.84, 0.54, 0.88, 0.76, 0.90, c.p.whiteTrim], [0.16, 0.84, 0.10, 0.44, 0.76, 0.90, c.p.whiteTrim], [0.78, 0.88, 0.46, 0.50, 0.76, 1, c.p.matteBlackIron],
  ]),
  'office-barn-door': (c, g, s) => c.parts(g, s, [
    [0, 1, 0, 0.95, 0.15, 0.62, c.mat(s.primaryColor, 0.58)], [0, 1, 0.86, 0.95, 0.62, 0.80, c.p.whiteTrim], [0, 1, 0.44, 0.52, 0.62, 0.80, c.p.whiteTrim],
    [0, 1, 0.02, 0.11, 0.62, 0.80, c.p.whiteTrim], [0.12, 0.18, 0.78, 1, 0.58, 0.92, c.p.matteBlackIron], [0.82, 0.88, 0.78, 1, 0.58, 0.92, c.p.matteBlackIron], [0.82, 0.86, 0.40, 0.58, 0.62, 1, c.p.matteBlackIron],
  ]),
  'office-barn-door-track': (c, g, s) => c.parts(g, s, [
    [0, 1, 0.25, 0.65, 0.35, 0.65, c.p.matteBlackIron], ...[0.04, 0.27, 0.5, 0.73, 0.96].map((u): PartTuple => [u - 0.02, u + 0.02, 0.3, 0.6, 0, 0.35, c.p.matteBlackIron]),
    [0.28, 0.34, 0.05, 1, 0.28, 0.82, c.p.matteBlackIron], [0.66, 0.72, 0.05, 1, 0.28, 0.82, c.p.matteBlackIron],
  ]),
  'office-wetbar-counter': (c, g, s) => {
    const q = c.mat(s.primaryColor, 0.35);
    c.parts(g, s, [[0, 1, 0, 0.68, 0, 1, q], [0, 1, 0.68, 1, 0, 0.10, q], [0.12, 0.44, 0.66, 0.74, 0.22, 0.74, c.p.brushedSteel]]);
  },
  'office-wetbar-cabinet-sink': (c, g, s) => {
    const [cab, door] = [c.mat(s.primaryColor, 0.68), c.mat('#777e87', 0.64)];
    c.parts(g, s, [[0, 1, 0, 0.08, 0, 0.85, c.p.matteBlackIron], [0, 1, 0.08, 0.94, 0, 0.92, cab], [0.04, 0.48, 0.11, 0.90, 0.92, 0.97, door], [0.52, 0.96, 0.11, 0.90, 0.92, 0.97, door], [0.46, 0.54, 0.94, 1, 0.16, 0.30, c.p.brushedSteel], [0.43, 0.57, 0.52, 0.66, 0.97, 1, c.p.brushedSteel]]);
  },
  'office-wetbar-fridge': (c, g, s) => c.parts(g, s, [[0.02, 0.98, 0, 0.98, 0, 0.88, c.mat(s.primaryColor, 0.5, 0.3)], [0.04, 0.96, 0.04, 0.96, 0.88, 0.95, c.p.brushedSteel], [0.14, 0.86, 0.48, 0.52, 0.60, 0.88, c.p.brushedSteel], [0.12, 0.88, 0.10, 0.90, 0.95, 0.99, c.p.glass], [0.08, 0.14, 0.55, 0.88, 0.95, 1, c.p.brushedSteel]]),
  'office-wetbar-shelves': (c, g, s) => {
    const w = c.mat(s.primaryColor, 0.58);
    c.parts(g, s, [[0, 1, 0, 0.10, 0, 1, w], [0, 1, 0.58, 0.68, 0, 1, w], [0.14, 0.36, 0.10, 0.36, 0.25, 0.72, c.p.glass], [0.58, 0.82, 0.68, 0.98, 0.25, 0.72, c.p.glass]]);
  },
  'office-bookcase-nw': buildBookcase,
  'office-guest-bed': (c, g, s) => {
    const navy = c.mat(s.accentColor ?? '#2d3e56', 0.85);
    c.parts(g, s, [[0, 0.09, 0.06, 1, 0, 1, c.mat('#3d4451', 0.78)], [0.04, 0.98, 0, 0.28, 0.02, 0.98, c.mat('#6a4a31', 0.65)], [0.09, 0.97, 0.28, 0.52, 0.04, 0.96, c.mat(s.primaryColor, 0.88)], [0.72, 0.98, 0.30, 0.55, 0.03, 0.97, navy], [0.10, 0.26, 0.52, 0.68, 0.08, 0.46, c.p.whiteTrim], [0.10, 0.26, 0.52, 0.68, 0.54, 0.92, c.p.whiteTrim], [0.22, 0.34, 0.52, 0.65, 0.22, 0.78, navy]]);
  },
  'office-card-grid-art': (c, g, s) => c.parts(g, s, [[0, 0.65, 0, 1, 0, 1, c.p.matteBlackIron], [0.65, 1, 0.04, 0.96, 0.03, 0.97, c.p.collectorCardArt]]),
  'office-trellis-rug': (c, g, s) => buildRug(c, g, s, c.p.trellisRug),
  'office-bookcase-sw': buildBookcase,
  'office-wrigley-prints': (c, g, s) => c.parts(g, s, [[0, 0.65, 0, 1, 0.02, 0.47, c.p.matteBlackIron], [0.65, 1, 0.05, 0.95, 0.05, 0.44, c.p.wrigleyArt], [0, 0.65, 0, 1, 0.53, 0.98, c.p.matteBlackIron], [0.65, 1, 0.05, 0.95, 0.56, 0.95, c.p.wrigleyArt]]),
  'office-south-window-sill': (c, g, s) => c.parts(g, s, [[0, 1, 0, 0.68, 0, 1, c.p.whiteTrim], [0.02, 0.98, 0.68, 1, 0.35, 0.65, c.p.matteBlackIron]]),
  'office-desk': (c, g, s) => c.parts(g, s, [[0.03, 0.09, 0, 0.78, 0.08, 0.92, c.p.matteBlackIron], [0.91, 0.97, 0, 0.78, 0.08, 0.92, c.p.matteBlackIron], [0, 1, 0.78, 0.85, 0, 1, c.mat(s.primaryColor, 0.56)], [0.32, 0.68, 0.85, 0.87, 0.18, 0.52, c.p.matteBlackIron], [0.36, 0.64, 0.87, 1, 0.62, 0.68, c.ind.officeScreenMat]]),
  'office-task-chair': (c, g, s) => {
    const d = c.mat(s.primaryColor, 0.62);
    c.parts(g, s, [[0.15, 0.85, 0, 0.07, 0.44, 0.56, c.p.matteBlackIron], [0.44, 0.56, 0, 0.07, 0.15, 0.85, c.p.matteBlackIron], [0.45, 0.55, 0.07, 0.44, 0.45, 0.55, c.p.matteBlackIron], [0.18, 0.82, 0.44, 0.52, 0.20, 0.82, d], [0.12, 0.20, 0.52, 0.68, 0.30, 0.74, d], [0.80, 0.88, 0.52, 0.68, 0.30, 0.74, d], [0.20, 0.80, 0.52, 1, 0.12, 0.24, d]]);
  },
  'office-media-console': (c, g, s) => c.parts(g, s, [[0.08, 0.96, 0, 0.14, 0.04, 0.96, c.p.matteBlackIron], [0.05, 1, 0.14, 0.92, 0, 1, c.mat(s.primaryColor, 0.58)], [0, 1, 0.92, 1, 0, 1, c.mat('#6e472b', 0.58)], [0, 0.05, 0.18, 0.88, 0.04, 0.96, c.mat('#2a2e36', 0.65)]]),
  'office-wall-tv': (c, g, s) => c.parts(g, s, [[0.55, 1, 0.25, 0.75, 0.25, 0.75, c.p.matteBlackIron], [0.15, 0.55, 0, 1, 0, 1, c.mat(s.primaryColor, 0.35)], [0, 0.15, 0.04, 0.96, 0.03, 0.97, c.ind.officeScreenMat]]),
  'office-foyer-doorway': (c, g, s) => c.parts(g, s, [[0, 1, 0, 1, 0, 0.06, c.p.whiteTrim], [0, 1, 0, 1, 0.94, 1, c.p.whiteTrim], [0, 1, 0.95, 1, 0.06, 0.94, c.p.whiteTrim]]),
  'foyer-staircase': (c, g, s) => {
    g.userData.hasRearShelves = false;
    c.parts(g, s, [[0, 0.03, 0, 0.08, 0, 1, c.p.oakFloor], [0, 0.98, 0, 0.02, 0.95, 1, c.p.oakFloor], [0, 0.98, 0.98, 1, 0, 0.06, c.p.oakFloor]]);
  },
  'foyer-runner-rug': (c, g, s) => buildRug(c, g, s, c.p.foyerRunner),
  'foyer-wood-ledge-lower': buildLedge,
  'foyer-wood-ledge-upper': buildLedge,
  'foyer-garage-door': (c, g, s) => c.parts(g, s, [[0, 1, 0, 1, 0, 0.06, c.p.whiteTrim], [0, 1, 0, 1, 0.94, 1, c.p.whiteTrim], [0.28, 0.72, 0.01, 0.96, 0.06, 0.94, c.mat(s.primaryColor, 0.56)], [0.05, 0.95, 0.46, 0.50, 0.14, 0.24, c.p.matteBlackIron]]),
  'garage-utility-sink': (c, g, s) => c.parts(g, s, [[0.04, 0.12, 0, 0.52, 0.06, 0.14, c.p.brushedSteel], [0.88, 0.96, 0, 0.52, 0.06, 0.14, c.p.brushedSteel], [0.04, 0.12, 0, 0.52, 0.86, 0.94, c.p.brushedSteel], [0.88, 0.96, 0, 0.52, 0.86, 0.94, c.p.brushedSteel], [0, 1, 0.52, 0.88, 0, 1, c.p.brushedSteel], [0.08, 0.92, 0.86, 0.89, 0.14, 0.90, c.mat(s.accentColor ?? '#8e969e', 0.45, 0.6)], [0, 1, 0.88, 0.96, 0, 0.10, c.p.brushedSteel], [0.45, 0.55, 0.88, 1, 0.08, 0.28, c.p.brushedSteel]]),
  'garage-washer-dryer': (c, g, s) => {
    const b = c.mat(s.primaryColor, 0.42, 0.15);
    c.parts(g, s, [
      [0, 1, 0.91, 1, 0, 1, c.p.whiteTrim], [0.02, 0.48, 0, 0.91, 0.03, 0.91, b], [0.04, 0.46, 0.76, 0.88, 0.91, 0.95, c.p.matteBlackIron], [0.13, 0.37, 0.22, 0.68, 0.91, 0.97, c.p.matteBlackIron], [0.17, 0.33, 0.28, 0.62, 0.97, 1, c.p.glass],
      [0.52, 0.98, 0, 0.91, 0.03, 0.91, b], [0.54, 0.96, 0.76, 0.88, 0.91, 0.95, c.p.matteBlackIron], [0.63, 0.87, 0.22, 0.68, 0.91, 0.97, c.p.matteBlackIron], [0.67, 0.83, 0.28, 0.62, 0.97, 1, c.p.glass], [0.38, 0.44, 0.79, 0.85, 0.95, 0.99, c.ind.washerStatusMat],
    ]);
  },
  'garage-locker-left': buildLocker,
  'garage-workbench': (c, g, s) => {
    const sage = c.mat(s.accentColor ?? '#7d937c', 0.56, 0.25);
    c.parts(g, s, [[0, 1, 0.90, 1, 0, 1, c.mat(s.primaryColor, 0.58)], [0.01, 0.05, 0, 0.90, 0.04, 0.96, c.p.matteBlackIron], [0.95, 0.99, 0, 0.90, 0.04, 0.96, c.p.matteBlackIron], [0.05, 0.36, 0.12, 0.89, 0.06, 0.94, sage], [0.11, 0.30, 0.68, 0.72, 0.94, 0.99, c.p.brushedSteel], [0.11, 0.30, 0.40, 0.44, 0.94, 0.99, c.p.brushedSteel], [0.64, 0.95, 0.12, 0.89, 0.06, 0.94, sage], [0.70, 0.89, 0.68, 0.72, 0.94, 0.99, c.p.brushedSteel], [0.70, 0.89, 0.40, 0.44, 0.94, 0.99, c.p.brushedSteel]]);
  },
  'garage-ender3-printer': (c, g, s) => c.parts(g, s, [[0.08, 0.92, 0, 0.14, 0.08, 0.92, c.p.matteBlackIron], [0.20, 0.80, 0.14, 0.20, 0.20, 0.80, c.mat('#2e333a', 0.5)], [0.40, 0.60, 0.20, 0.40, 0.40, 0.60, c.mat(s.accentColor ?? '#2a7de1', 0.45)], [0.12, 0.20, 0.14, 0.90, 0.44, 0.56, c.p.matteBlackIron], [0.80, 0.88, 0.14, 0.90, 0.44, 0.56, c.p.matteBlackIron], [0.12, 0.88, 0.84, 0.92, 0.44, 0.56, c.p.matteBlackIron], [0.38, 0.62, 0.92, 1, 0.42, 0.58, c.p.whiteTrim], [0.82, 0.98, 0.14, 0.30, 0.74, 0.98, c.ind.printerStatusMat]]),
  'garage-cad-monitor': (c, g, s) => c.parts(g, s, [[0.36, 0.64, 0, 0.06, 0.14, 0.52, c.p.matteBlackIron], [0.46, 0.54, 0.06, 0.44, 0.18, 0.28, c.p.matteBlackIron], [0.04, 0.96, 0.24, 1, 0.26, 0.36, c.mat(s.primaryColor, 0.4)], [0.07, 0.93, 0.28, 0.96, 0.36, 0.40, c.mat(s.accentColor ?? '#4da3ff', 0.25)], [0.22, 0.78, 0, 0.05, 0.62, 0.92, c.p.matteBlackIron]]),
  'garage-brock-studios-sign': (c, g, s) => c.parts(g, s, [[0, 1, 0, 1, 0, 0.65, c.p.matteBlackIron], [0.02, 0.98, 0.06, 0.94, 0.65, 1, c.p.brockStudiosSign]]),
  'garage-overhead-wire-rack': (c, g, s) => c.parts(g, s, [[0, 1, 0, 0.14, 0, 1, c.p.brushedSteel], [0, 1, 0.14, 0.26, 0.92, 1, c.p.brushedSteel], [0, 0.04, 0.14, 1, 0, 0.12, c.p.brushedSteel], [0.48, 0.52, 0.14, 1, 0, 0.12, c.p.brushedSteel], [0.96, 1, 0.14, 1, 0, 0.12, c.p.brushedSteel], [0.10, 0.42, 0.14, 0.78, 0.18, 0.84, c.mat('#343941', 0.75)], [0.54, 0.88, 0.14, 0.78, 0.18, 0.84, c.mat('#7d937c', 0.7)]]),
  'garage-locker-right': buildLocker,
  'garage-pegboard-bins': (c, g, s) => c.parts(g, s, [[0.72, 1, 0, 1, 0, 1, c.p.whiteTrim], ...['#d97b38', '#3b78b8', '#d8a63a', '#7d937c'].flatMap((hex, i): PartTuple[] => [[0.08, 0.72, 0.18, 0.36, 0.08 + i * 0.22, 0.24 + i * 0.22, c.mat(hex, 0.55)], [0.22, 0.72, 0.56, 0.78, 0.10 + i * 0.22, 0.22 + i * 0.22, c.p.matteBlackIron]])]),
  'garage-wood-gear-rack': (c, g, s) => {
    const w = c.mat(s.primaryColor, 0.68);
    c.parts(g, s, [[0.04, 0.96, 0, 1, 0, 0.08, w], [0.04, 0.96, 0, 1, 0.92, 1, w], ...[0.06, 0.36, 0.66, 0.94].map((y): PartTuple => [0, 1, y, y + 0.05, 0, 1, w]), [0.12, 0.88, 0.11, 0.33, 0.16, 0.84, c.mat('#3b424c', 0.75)], [0.12, 0.88, 0.41, 0.63, 0.20, 0.80, c.mat('#7d937c', 0.7)]]);
  },
  'garage-grey-cubbies': (c, g, s) => {
    const gr = c.mat(s.primaryColor, 0.72);
    c.parts(g, s, [[0.90, 1, 0, 1, 0, 1, gr], ...[0, 0.47, 0.93].map((y): PartTuple => [0, 0.90, y, y + 0.07, 0, 1, gr]), ...[0, 0.24, 0.48, 0.72, 0.96].map((z): PartTuple => [0, 0.90, 0.07, 0.93, z, z + 0.04, gr]), [0.06, 0.88, 0.08, 0.45, 0.05, 0.23, c.mat('#cfc8bc', 0.85)], [0.06, 0.88, 0.55, 0.91, 0.53, 0.71, c.mat('#4d535c', 0.85)]]);
  },
  'garage-pastel-rug': (c, g, s) => buildRug(c, g, s, c.p.pastelCirclesRug),
  'garage-charcoal-sofa': (c, g, s) => {
    const [fab, cush] = [c.mat(s.primaryColor, 0.86), c.mat('#363b44', 0.84)];
    c.parts(g, s, [[0.02, 0.98, 0, 0.12, 0.06, 0.96, c.p.matteBlackIron], [0, 1, 0.12, 0.36, 0.02, 1, fab], [0, 0.09, 0.12, 0.74, 0.02, 1, fab], [0.91, 1, 0.12, 0.74, 0.02, 1, fab], [0, 1, 0.36, 1, 0.78, 1, fab], ...([[0.095, 0.39], [0.398, 0.602], [0.61, 0.905]] as const).flatMap(([x0, x1]): PartTuple[] => [[x0, x1, 0.36, 0.56, 0.02, 0.78, cush], [x0, x1, 0.56, 0.96, 0.64, 0.78, cush]]), [0.11, 0.23, 0.56, 0.82, 0.46, 0.66, c.mat('#7d937c', 0.82)]]);
  },
  'garage-south-threshold': (c, g, s) => c.parts(g, s, [[0, 1, 0, 0.86, 0, 1, c.p.concreteCurb], [0.01, 0.99, 0.86, 1, 0.42, 0.58, c.ind.garageThresholdStatusMat]]),
};

export function buildTier1Fixtures(palette: Tier1MaterialPalette): Tier1FixturesBuildResult {
  const geometries: BufferGeometry[] = [];
  const localMats: MeshStandardMaterial[] = [];
  const cache = new Map<string, MeshStandardMaterial>();
  const mkMat = (opts: ConstructorParameters<typeof MeshStandardMaterial>[0]) => {
    const m = new MeshStandardMaterial(opts);
    localMats.push(m);
    return m;
  };
  const indicators: Tier1FixtureIndicators = {
    washerStatusMat: mkMat({ color: '#39d353', emissive: '#1e7e34', emissiveIntensity: 0.4, roughness: 0.3 }),
    printerStatusMat: mkMat({ color: '#2a7de1', emissive: '#1e5bb8', emissiveIntensity: 0.55, roughness: 0.3 }),
    garageThresholdStatusMat: mkMat({ color: '#2b3038', emissive: '#000000', emissiveIntensity: 0, roughness: 0.55 }),
    officeScreenMat: mkMat({ color: '#1b2b44', emissive: '#2b6cb0', emissiveIntensity: 0.45, roughness: 0.25 }),
  };
  const ctx: FixtureCtx = {
    p: palette,
    ind: indicators,
    mat: (color, roughness = 0.72, metalness = 0.06) => {
      const k = `${color}|${roughness}|${metalness}`;
      const hit = cache.get(k) ?? mkMat({ color, roughness, metalness });
      cache.set(k, hit);
      return hit;
    },
    parts: (g, s, items) => {
      const [dx, dy, dz] = [s.xMax - s.xMin, s.yMax - s.yMin, s.zMax - s.zMin];
      for (const [ux0, ux1, uy0, uy1, uz0, uz1, m] of items) {
        const geom = new BoxGeometry(dx * (ux1 - ux0), dy * (uy1 - uy0), dz * (uz1 - uz0));
        geometries.push(geom);
        const mesh = new Mesh(geom, m);
        mesh.position.set(s.xMin + dx * ((ux0 + ux1) / 2), s.yMin + dy * ((uy0 + uy1) / 2), s.zMin + dz * ((uz0 + uz1) / 2));
        mesh.castShadow = s.mount !== 'rug' && s.mount !== 'threshold';
        mesh.receiveShadow = true;
        mesh.userData = { fixtureId: s.id, room: s.room };
        g.add(mesh);
      }
    },
  };
  const root = new Group();
  root.name = 'tier1-fixtures';
  const fixtures = {} as Record<FixtureId, Group>;
  for (const spec of TIER1_FIXTURES) {
    const group = new Group();
    group.name = spec.id;
    group.userData = { fixtureId: spec.id, room: spec.room, label: spec.label, category: spec.category };
    BUILDERS[spec.id](ctx, group, spec);
    fixtures[spec.id] = group;
    root.add(group);
  }
  return {
    root,
    fixtures,
    indicators,
    dispose: () => {
      for (const geom of geometries) geom.dispose();
      for (const m of localMats) m.dispose();
    },
  };
}
