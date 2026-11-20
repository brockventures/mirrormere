import {
  Box3,
  CanvasTexture,
  DataTexture,
  Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type Texture,
} from 'three';
import { describe, expect, it, vi } from 'vitest';
import { FOYER_STAIRCASE, TIER1_HA_BINDINGS, TIER1_ROOMS, TIER1_WALLS } from './tier1LayoutSpec';
import {
  buildTier1Shell,
  createTier1Materials,
  type Tier1MaterialPalette,
  type Tier1ShellBuildResult,
  type Tier1ShellLights,
} from './tier1Shell';

describe('tier1Shell — Honey-Wood Materials, Cutaway Shell, L-Turn Staircase, Massing & Lights', () => {
  it('creates shared 512x512 darker honey-wood floor material, jsdom DataTexture fallback, 2D canvas painters, and deduplicated dispose()', () => {
    const palette: Tier1MaterialPalette = createTier1Materials();
    expect(palette.textures.length).toBeGreaterThanOrEqual(8);
    expect(palette.textures.every((t: Texture) => t instanceof DataTexture)).toBe(true);
    expect(palette.foyerFloor).toBe(palette.oakFloor);
    expect(palette.oakFloor.roughness).toBeCloseTo(0.58, 5);
    expect(palette.oakFloor.map?.repeat.toArray()).toEqual([4, 4]);
    expect(`#${palette.officeWall.color.getHexString()}`).toBe('#f3efe8');
    expect(`#${palette.foyerSlateWall.color.getHexString()}`).toBe('#2c323b');
    expect(palette.exteriorSiding.map).toBeInstanceOf(DataTexture);
    expect(palette.exteriorSiding.roughness).toBeCloseTo(0.78, 5);
    expect(palette.exteriorSiding.map?.repeat.toArray()).toEqual([3, 3]);
    expect(palette.glass.transparent).toBe(true);
    expect(palette.brushedSteel.metalness).toBeGreaterThan(0.5);
    expect(palette.matteBlackIron.metalness).toBeGreaterThan(0.5);

    // Verify safe deduplication even if a shared texture/material reference is pushed twice
    palette.textures.push(palette.textures[0]);
    palette.materials.push(palette.oakFloor);
    const uniqueTexSpies = Array.from(new Set(palette.textures)).map((t: Texture) => vi.spyOn(t, 'dispose'));
    const uniqueMatSpies = Array.from(new Set(palette.materials)).map((m: MeshStandardMaterial) => vi.spyOn(m, 'dispose'));
    palette.dispose();
    for (const spy of uniqueTexSpies) {
      expect(spy).toHaveBeenCalledTimes(1);
    }
    for (const spy of uniqueMatSpies) {
      expect(spy).toHaveBeenCalledTimes(1);
    }

    const fillStylesSeen: string[] = [];
    const strokeStylesSeen: string[] = [];
    let currentFill = '';
    let currentStroke = '';
    const stubCtx = {
      get fillStyle() { return currentFill; },
      set fillStyle(v: string) { currentFill = v; fillStylesSeen.push(v); },
      get strokeStyle() { return currentStroke; },
      set strokeStyle(v: string) { currentStroke = v; strokeStylesSeen.push(v); },
      lineWidth: 1, font: '', textAlign: 'center', textBaseline: 'middle',
      fillRect: vi.fn(), strokeRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const ctxSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(stubCtx as never);
    try {
      const canvasPalette = createTier1Materials();
      expect(canvasPalette.textures.every((t: Texture) => t instanceof CanvasTexture)).toBe(true);
      const honeyCanvas = (canvasPalette.oakFloor.map as CanvasTexture).image as HTMLCanvasElement;
      expect(honeyCanvas.width).toBe(512);
      expect(honeyCanvas.height).toBe(512);
      expect(fillStylesSeen).toContain('#9e6b3b');
      expect(fillStylesSeen).toContain('#a47140');
      expect(fillStylesSeen).toContain('#996738');
      expect(fillStylesSeen).toContain('#a16e3d');
      expect(fillStylesSeen).toContain('#966436');
      expect(fillStylesSeen).toContain('rgba(156, 104, 57, 0.72)');
      expect(fillStylesSeen).toContain('rgba(122, 82, 44, 0.10)');
      expect(fillStylesSeen).toContain('#a57242');
      expect(strokeStylesSeen).toContain('rgba(110, 68, 32, 0.11)');
      expect(strokeStylesSeen).toContain('rgba(181, 128, 78, 0.09)');
      expect(strokeStylesSeen).toContain('rgba(71, 42, 18, 0.24)');
      expect(strokeStylesSeen).toContain('rgba(68, 40, 18, 0.22)');
      expect(stubCtx.fillText).toHaveBeenCalledWith('BROCK STUDIOS', 256, 64);
      expect(canvasPalette.exteriorSiding.map).toBeInstanceOf(CanvasTexture);
      expect(fillStylesSeen).toContain('#5f7283');
      expect(fillStylesSeen).toContain('#66798a');
      expect(fillStylesSeen).toContain('rgba(200, 216, 230, 0.14)');
      expect(fillStylesSeen).toContain('rgba(32, 44, 56, 0.26)');
      canvasPalette.dispose();
    } finally {
      ctxSpy.mockRestore();
    }
  });

  it('builds shared honey-wood Office/Foyer floors, cutaway walls, L-turn 13-tread staircase + corner landing, L-railing, lights, and upper massing', () => {
    const palette = createTier1Materials();
    const shell: Tier1ShellBuildResult = buildTier1Shell(palette);
    shell.root.updateMatrixWorld(true);

    for (const roomId of ['office', 'foyer', 'garage'] as const) {
      const box = new Box3().setFromObject(shell.floors[roomId]);
      const spec = TIER1_ROOMS[roomId];
      expect(box.min.x).toBeCloseTo(spec.xMin, 5);
      expect(box.max.x).toBeCloseTo(spec.xMax, 5);
      expect(box.min.z).toBeCloseTo(spec.zMin, 5);
      expect(box.max.z).toBeCloseTo(spec.zMax, 5);
      expect(box.max.y).toBeCloseTo(0.0, 5);
    }
    expect(shell.floors.office.material).toBe(palette.oakFloor);
    expect(shell.floors.foyer.material).toBe(palette.foyerFloor);
    expect(shell.floors.foyer.material).toBe(shell.floors.office.material);

    const measureUvSpan = (mesh: Mesh) => {
      const uv = mesh.geometry.attributes.uv;
      let [uMin, uMax, vMin, vMax] = [Infinity, -Infinity, Infinity, -Infinity];
      for (let i = 0; i < uv.count; i += 1) {
        const [u, v] = [uv.getX(i), uv.getY(i)];
        uMin = Math.min(uMin, u);
        uMax = Math.max(uMax, u);
        vMin = Math.min(vMin, v);
        vMax = Math.max(vMax, v);
      }
      return { uSpan: uMax - uMin, vSpan: vMax - vMin };
    };

    for (const roomId of ['office', 'foyer'] as const) {
      const spec = TIER1_ROOMS[roomId];
      const { uSpan, vSpan } = measureUvSpan(shell.floors[roomId]);
      expect(uSpan).toBeCloseTo((spec.xMax - spec.xMin) / 16.0, 5);
      expect(vSpan).toBeCloseTo((spec.zMax - spec.zMin) / 16.0, 5);
      expect(uSpan / vSpan).toBeCloseTo((spec.xMax - spec.xMin) / (spec.zMax - spec.zMin), 5);
    }

    const alcoveMesh = shell.root.getObjectByName('floor-office-wetbar-alcove') as Mesh | undefined;
    expect(alcoveMesh).toBeDefined();
    const alcoveUv = measureUvSpan(alcoveMesh!);
    expect(alcoveUv.uSpan / alcoveUv.vSpan).toBeCloseTo((-3.5 - -8.6) / (-11.0 - -12.6), 5);

    expect(Object.keys(shell.wallsById)).toHaveLength(TIER1_WALLS.length);
    expect(new Box3().setFromObject(shell.wallsById['outer-west-office']).max.y).toBeCloseTo(8.6, 5);
    expect(new Box3().setFromObject(shell.wallsById['cutaway-south-office']).max.y).toBeCloseTo(1.4, 5);

    const curbBox = new Box3().setFromObject(shell.wallsById['cutaway-south-garage-curb']);
    expect(curbBox.max.y).toBeCloseTo(0.18, 5);
    expect(curbBox.min.x).toBeCloseTo(5.5, 5);
    expect(curbBox.max.x).toBeCloseTo(21.5, 5);

    const westPartBox = new Box3().setFromObject(shell.wallsById['interior-west-foyer']);
    expect(westPartBox.max.y).toBeCloseTo(8.6, 5);
    const eastPartMeshes = shell.wallsById['interior-east-foyer'].children.filter(
      (c: Object3D): c is Mesh => c instanceof Mesh,
    );
    expect(eastPartMeshes.some((m: Mesh) => m.material === palette.foyerSlateWall)).toBe(true);
    expect(eastPartMeshes.some((m: Mesh) => new Box3().setFromObject(m).min.y >= 6.79)).toBe(true);
    expect(eastPartMeshes.some((m: Mesh) => m.material === palette.exteriorSiding)).toBe(false);

    // Exterior perimeter walls split into gray-blue lap siding outside + preserved interior color inside
    const expectedExteriorWalls: ReadonlyArray<{ id: string; interiorMat: MeshStandardMaterial; side: 'west' | 'east' | 'north' | 'south' }> = [
      { id: 'outer-west-office', interiorMat: palette.officeWall, side: 'west' },
      { id: 'outer-north-office-main', interiorMat: palette.officeWall, side: 'north' },
      { id: 'outer-north-wetbar-west-cheek', interiorMat: palette.officeWall, side: 'west' },
      { id: 'outer-north-wetbar-back', interiorMat: palette.officeWall, side: 'north' },
      { id: 'outer-north-wetbar-east-cheek', interiorMat: palette.officeWall, side: 'east' },
      { id: 'outer-north-foyer', interiorMat: palette.foyerSlateWall, side: 'north' },
      { id: 'outer-north-garage', interiorMat: palette.garageWall, side: 'north' },
      { id: 'outer-east-garage', interiorMat: palette.garageWall, side: 'east' },
      { id: 'cutaway-south-office', interiorMat: palette.officeWall, side: 'south' },
    ];
    for (const { id, interiorMat, side } of expectedExteriorWalls) {
      const wg = shell.wallsById[id];
      const extMesh = wg.getObjectByName(`${id}-exterior`) as Mesh | undefined;
      const intMesh = wg.getObjectByName(`${id}-interior`) as Mesh | undefined;
      const baseboard = wg.getObjectByName(`${id}-baseboard`) as Mesh | undefined;
      expect(extMesh).toBeDefined();
      expect(intMesh).toBeDefined();
      expect(baseboard).toBeDefined();
      expect(extMesh!.material).toBe(palette.exteriorSiding);
      expect(intMesh!.material).toBe(interiorMat);
      const extBox = new Box3().setFromObject(extMesh!);
      const intBox = new Box3().setFromObject(intMesh!);
      const baseBox = new Box3().setFromObject(baseboard!);
      if (side === 'west') {
        expect(extBox.max.x).toBeCloseTo(intBox.min.x, 5);
        expect(baseBox.min.x).toBeGreaterThan(extBox.min.x);
      } else if (side === 'east') {
        expect(extBox.min.x).toBeCloseTo(intBox.max.x, 5);
        expect(baseBox.max.x).toBeLessThan(extBox.max.x);
      } else if (side === 'north') {
        expect(extBox.max.z).toBeCloseTo(intBox.min.z, 5);
        expect(baseBox.min.z).toBeGreaterThan(extBox.min.z);
      } else {
        expect(extBox.min.z).toBeCloseTo(intBox.max.z, 5);
        expect(baseBox.max.z).toBeLessThan(extBox.max.z);
      }
    }
    for (const nonExtId of ['interior-west-foyer', 'interior-east-foyer', 'cutaway-south-foyer-sill', 'cutaway-south-garage-curb']) {
      const meshes = shell.wallsById[nonExtId].children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
      expect(meshes.some((m: Mesh) => m.material === palette.exteriorSiding)).toBe(false);
    }

    // L-shaped 13-tread staircase + corner landing
    expect(shell.stairTreads).toHaveLength(13);
    expect(shell.stairTreads.every((t: Mesh) => t.material === palette.stairTread)).toBe(true);
    expect(shell.staircaseGroup.userData.hasRearShelves).toBe(false);
    expect(shell.staircaseGroup.children.some((c: Object3D) => c.name.includes('shelf'))).toBe(false);

    const firstTreadBox = new Box3().setFromObject(shell.stairTreads[0]);
    const tenthTreadBox = new Box3().setFromObject(shell.stairTreads[9]);
    const eleventhTreadBox = new Box3().setFromObject(shell.stairTreads[10]);
    const lastTreadBox = new Box3().setFromObject(shell.stairTreads[12]);

    // Lower 10 treads climb North from z = 4.6 to z = -8.4 (y = 0 -> 6.45)
    expect(firstTreadBox.min.x).toBeCloseTo(FOYER_STAIRCASE.xMin, 5);
    expect(firstTreadBox.max.x).toBeCloseTo(FOYER_STAIRCASE.xMax, 5);
    expect(firstTreadBox.max.z).toBeCloseTo(FOYER_STAIRCASE.zStart, 5);
    expect(tenthTreadBox.min.z).toBeCloseTo(FOYER_STAIRCASE.zLandingSouth, 5);
    expect(tenthTreadBox.max.y).toBeCloseTo(FOYER_STAIRCASE.yLanding, 5);

    // Corner landing at x in [-3.5, -0.5], z in [-11.0, -8.4], y = 6.45
    const landingMesh = shell.staircaseGroup.children.find(
      (c: Object3D): c is Mesh => c instanceof Mesh && c.name === 'stair-landing',
    );
    expect(landingMesh).toBeDefined();
    const landingBox = new Box3().setFromObject(landingMesh!);
    expect(landingBox.min.x).toBeCloseTo(-3.5, 5);
    expect(landingBox.max.x).toBeCloseTo(-0.5, 5);
    expect(landingBox.min.z).toBeCloseTo(-11.0, 5);
    expect(landingBox.max.z).toBeCloseTo(-8.4, 5);
    expect(landingBox.max.y).toBeCloseTo(6.45, 5);

    // Upper 3 treads turn 90 degrees right (+X) from x = -0.5 to 3.3, z in [-11.0, -8.55], y = 6.45 -> 8.4
    expect(eleventhTreadBox.min.x).toBeCloseTo(FOYER_STAIRCASE.xTurnStart, 5);
    expect(eleventhTreadBox.min.z).toBeCloseTo(FOYER_STAIRCASE.turnZMin, 5);
    expect(eleventhTreadBox.max.z).toBeCloseTo(FOYER_STAIRCASE.turnZMax, 5);
    expect(lastTreadBox.max.x).toBeCloseTo(FOYER_STAIRCASE.xTurnEnd, 5);
    expect(lastTreadBox.min.z).toBeCloseTo(FOYER_STAIRCASE.turnZMin, 5);
    expect(lastTreadBox.max.z).toBeCloseTo(FOYER_STAIRCASE.turnZMax, 5);
    expect(lastTreadBox.max.z).toBeLessThan(-8.5);
    expect(lastTreadBox.max.y).toBeCloseTo(FOYER_STAIRCASE.yEnd, 5);

    // Matte-black L-railing routed along x = -0.55 on lower flight and z = -8.55 on upper turn
    const lowerRails = shell.staircaseGroup.children.filter((c: Object3D) => c.name.startsWith('stair-rail-lower-'));
    const upperRails = shell.staircaseGroup.children.filter((c: Object3D) => c.name.startsWith('stair-rail-upper-'));
    expect(lowerRails.length).toBeGreaterThanOrEqual(4);
    expect(upperRails.length).toBeGreaterThanOrEqual(4);
    for (const r of lowerRails) {
      expect(r.position.x).toBeCloseTo(-0.55, 5);
    }
    for (const r of upperRails) {
      expect(r.position.z).toBeCloseTo(-8.55, 5);
      expect(new Box3().setFromObject(r).max.z).toBeLessThan(-8.5);
    }

    const lights: Tier1ShellLights = shell.lights;
    expect(lights.hemisphere.intensity).toBeGreaterThan(0);
    expect(lights.sun.castShadow).toBe(true);
    expect(lights.sun.shadow.mapSize.x).toBe(2048);
    expect(lights.sun.shadow.mapSize.y).toBe(2048);
    expect(lights.sun.shadow.camera.left).toBe(-26);
    expect(lights.sun.shadow.camera.right).toBe(26);
    expect(lights.sun.shadow.camera.bottom).toBe(-16);
    expect(lights.sun.shadow.camera.top).toBe(16);
    expect(lights.roomPoints.office.position.toArray()).toEqual([...TIER1_HA_BINDINGS.officeLight.anchor]);
    expect(lights.roomPoints.foyer.position.toArray()).toEqual([...TIER1_HA_BINDINGS.foyerLight.anchor]);
    expect(lights.roomPoints.garage.position.toArray()).toEqual([...TIER1_HA_BINDINGS.garageLight.anchor]);

    expect(shell.upperMassingGroup.visible).toBe(false);
    expect(new Box3().setFromObject(shell.upperMassingMeshes.tier2South).min.y).toBeCloseTo(9.5, 5);
    expect(new Box3().setFromObject(shell.upperMassingMeshes.tier3North).min.y).toBeCloseTo(14.0, 5);
    shell.setUpperMassingVisible(true);
    expect(shell.upperMassingGroup.visible).toBe(true);
    shell.setUpperMassingVisible(false);
    expect(shell.upperMassingGroup.visible).toBe(false);

    const geomSpy = vi.spyOn(shell.floors.office.geometry, 'dispose');
    shell.dispose();
    palette.dispose();
    expect(geomSpy).toHaveBeenCalledTimes(1);
  });
});
