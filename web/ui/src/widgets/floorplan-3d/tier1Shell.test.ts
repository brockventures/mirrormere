import { Box3, CanvasTexture, DataTexture, Mesh } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { FOYER_STAIRCASE, TIER1_HA_BINDINGS, TIER1_ROOMS, TIER1_WALLS } from './tier1LayoutSpec';
import {
  buildTier1Shell,
  createTier1Materials,
  type Tier1MaterialPalette,
  type Tier1ShellBuildResult,
  type Tier1ShellLights,
} from './tier1Shell';

describe('tier1Shell — Materials, Cutaway Shell, 13-Step West Staircase, Massing & Lights', () => {
  it('creates procedural material palette with jsdom DataTexture fallback, 2D canvas painters, and dispose()', () => {
    const palette: Tier1MaterialPalette = createTier1Materials();
    expect(palette.textures.length).toBeGreaterThanOrEqual(7);
    expect(palette.textures.every((t) => t instanceof DataTexture)).toBe(true);
    expect(`#${palette.officeWall.color.getHexString()}`).toBe('#f3efe8');
    expect(`#${palette.foyerSlateWall.color.getHexString()}`).toBe('#2c323b');
    expect(palette.glass.transparent).toBe(true);
    expect(palette.brushedSteel.metalness).toBeGreaterThan(0.5);
    expect(palette.matteBlackIron.metalness).toBeGreaterThan(0.5);

    const texSpies = palette.textures.map((t) => vi.spyOn(t, 'dispose'));
    const matSpies = palette.materials.map((m) => vi.spyOn(m, 'dispose'));
    palette.dispose();
    expect(texSpies.every((s) => s.mock.calls.length === 1)).toBe(true);
    expect(matSpies.every((s) => s.mock.calls.length === 1)).toBe(true);

    const stubCtx = {
      fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: 'center', textBaseline: 'middle',
      fillRect: vi.fn(), strokeRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const ctxSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(stubCtx as never);
    try {
      const canvasPalette = createTier1Materials();
      expect(canvasPalette.textures.every((t) => t instanceof CanvasTexture)).toBe(true);
      expect(stubCtx.fillText).toHaveBeenCalledWith('BROCK STUDIOS', 256, 64);
      canvasPalette.dispose();
    } finally {
      ctxSpy.mockRestore();
    }
  });

  it('builds room floor slabs, cutaway walls with doorway cutouts, 13-tread West stairs, lights, and upper massing', () => {
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

    expect(Object.keys(shell.wallsById)).toHaveLength(TIER1_WALLS.length);
    expect(new Box3().setFromObject(shell.wallsById['outer-west-office']).max.y).toBeCloseTo(8.6, 5);
    expect(new Box3().setFromObject(shell.wallsById['cutaway-south-office']).max.y).toBeCloseTo(1.4, 5);

    const curbBox = new Box3().setFromObject(shell.wallsById['cutaway-south-garage-curb']);
    expect(curbBox.max.y).toBeCloseTo(0.18, 5);
    expect(curbBox.min.x).toBeCloseTo(5.5, 5);
    expect(curbBox.max.x).toBeCloseTo(21.5, 5);

    const westPartBox = new Box3().setFromObject(shell.wallsById['interior-west-foyer']);
    expect(westPartBox.max.y).toBeCloseTo(8.6, 5);
    const eastPartMeshes = shell.wallsById['interior-east-foyer'].children.filter((c): c is Mesh => c instanceof Mesh);
    expect(eastPartMeshes.some((m) => m.material === palette.foyerSlateWall)).toBe(true);
    expect(eastPartMeshes.some((m) => new Box3().setFromObject(m).min.y >= 6.79)).toBe(true);

    expect(shell.stairTreads).toHaveLength(13);
    expect(shell.staircaseGroup.userData.hasRearShelves).toBe(false);
    expect(shell.staircaseGroup.children.some((c) => c.name.includes('shelf'))).toBe(false);
    const firstTreadBox = new Box3().setFromObject(shell.stairTreads[0]);
    const lastTreadBox = new Box3().setFromObject(shell.stairTreads[12]);
    expect(firstTreadBox.min.x).toBeCloseTo(FOYER_STAIRCASE.xMin, 5);
    expect(firstTreadBox.max.x).toBeCloseTo(FOYER_STAIRCASE.xMax, 5);
    expect(firstTreadBox.max.z).toBeCloseTo(FOYER_STAIRCASE.zStart, 5);
    expect(lastTreadBox.min.z).toBeCloseTo(FOYER_STAIRCASE.zEnd, 5);
    expect(lastTreadBox.max.y).toBeCloseTo(FOYER_STAIRCASE.yEnd, 5);
    expect(shell.staircaseGroup.children.some((c) => c.name.startsWith('stair-rail-'))).toBe(true);

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
