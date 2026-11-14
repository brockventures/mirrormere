import { Box3, Color, Mesh, type MeshStandardMaterial, type Object3D } from 'three';
import { describe, expect, it, vi } from 'vitest';
import {
  buildTier1Scene,
  type BuildTier1SceneOptions,
  type Tier1EntityMap,
  type Tier1EntityStateLike,
  type Tier1SceneBuildResult,
} from './buildTier1Scene';
import {
  buildTier1Fixtures,
  type Tier1FixtureIndicators,
  type Tier1FixturesBuildResult,
} from './tier1Fixtures';
import { TIER1_FIXTURES, fixtureToBox3, type FixtureSpec } from './tier1LayoutSpec';
import { createTier1Materials } from './tier1Shell';

describe('tier1Fixtures & buildTier1Scene — Multi-Part 3D Fixtures, HA Entities & Lifecycle', () => {
  it('builds all 41 fixtures strictly inside spec AABBs and enforces 3D walkthrough geometry', () => {
    const palette = createTier1Materials();
    const built: Tier1FixturesBuildResult = buildTier1Fixtures(palette);
    const indicators: Tier1FixtureIndicators = built.indicators;
    built.root.updateMatrixWorld(true);

    expect(TIER1_FIXTURES).toHaveLength(41);
    expect(Object.keys(built.fixtures)).toHaveLength(TIER1_FIXTURES.length);
    expect(indicators.printerStatusMat.emissiveIntensity).toBeGreaterThan(0);

    for (const spec of TIER1_FIXTURES) {
      const group = built.fixtures[spec.id];
      expect(group.userData.fixtureId).toBe(spec.id);
      expect(group.userData.room).toBe(spec.room);
      const meshes = group.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
      if (spec.id === 'foyer-staircase') {
        expect(meshes).toHaveLength(1);
      } else {
        expect(meshes.length).toBeGreaterThanOrEqual(2);
      }

      const worldBox = new Box3().setFromObject(group);
      const specBox = fixtureToBox3(spec);
      expect(worldBox.min.x).toBeGreaterThanOrEqual(specBox.min.x - 1e-4);
      expect(worldBox.max.x).toBeLessThanOrEqual(specBox.max.x + 1e-4);
      expect(worldBox.min.y).toBeGreaterThanOrEqual(specBox.min.y - 1e-4);
      expect(worldBox.max.y).toBeLessThanOrEqual(specBox.max.y + 1e-4);
      expect(worldBox.min.z).toBeGreaterThanOrEqual(specBox.min.z - 1e-4);
      expect(worldBox.max.z).toBeLessThanOrEqual(specBox.max.z + 1e-4);
    }

    // Walkthrough Fix #2 & #3 & #4 mesh-level checks
    expect(built.fixtures['foyer-staircase'].userData.hasRearShelves).toBe(false);
    const stairTrimBox = new Box3().setFromObject(built.fixtures['foyer-staircase']);
    expect(stairTrimBox.max.x).toBeLessThanOrEqual(-3.4);
    expect('foyer-runner-rug' in built.fixtures).toBe(false);
    expect(TIER1_FIXTURES.some((f: FixtureSpec) => f.room === 'foyer' && f.mount === 'rug')).toBe(false);
    expect(built.fixtures['office-trellis-rug']).toBeDefined();
    expect(built.fixtures['garage-pastel-rug']).toBeDefined();
    const thresholdBox = new Box3().setFromObject(built.fixtures['garage-south-threshold']);
    expect(thresholdBox.max.y).toBeLessThanOrEqual(0.1801);

    const sofaMeshes = built.fixtures['garage-charcoal-sofa'].children.filter(
      (c: Object3D): c is Mesh => c instanceof Mesh,
    );
    const sofaMidZ = (7.4 + 10.2) / 2;
    const southMaxY = Math.max(
      ...sofaMeshes.filter((m: Mesh) => m.position.z > sofaMidZ).map((m: Mesh) => new Box3().setFromObject(m).max.y),
    );
    const northSeatOnlyMaxY = Math.max(
      ...sofaMeshes
        .filter((m: Mesh) => new Box3().setFromObject(m).max.z < sofaMidZ)
        .map((m: Mesh) => new Box3().setFromObject(m).max.y),
    );
    expect(southMaxY).toBeGreaterThan(2.8);
    expect(northSeatOnlyMaxY).toBeLessThan(2.2);

    const signMeshes = built.fixtures['garage-brock-studios-sign'].children.filter(
      (c: Object3D): c is Mesh => c instanceof Mesh,
    );
    expect(signMeshes.some((m: Mesh) => m.material === palette.brockStudiosSign)).toBe(true);

    const lockerBox = new Box3().setFromObject(built.fixtures['garage-locker-left']);
    const washerBox = new Box3().setFromObject(built.fixtures['garage-washer-dryer']);
    const benchBox = new Box3().setFromObject(built.fixtures['garage-workbench']);
    expect(Math.abs(lockerBox.min.x - washerBox.max.x)).toBeLessThanOrEqual(0.05);
    expect(benchBox.max.x - benchBox.min.x).toBeCloseTo(6.4, 3);

    // Chunk 2 polish checks: walnut TV table beneath wall TV, SE 6-drawer dresser, spin bike, and Kraft box stack
    const consoleGroup = built.fixtures['office-media-console'];
    const tvGroup = built.fixtures['office-wall-tv'];
    const dresserGroup = built.fixtures['office-se-dresser'];
    const bikeGroup = built.fixtures['garage-exercise-bike'];
    const boxesGroup = built.fixtures['garage-cardboard-boxes'];

    const consoleMeshes = consoleGroup.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
    const dresserMeshes = dresserGroup.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
    const bikeMeshes = bikeGroup.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
    const boxesMeshes = boxesGroup.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);

    expect(consoleMeshes.length).toBeGreaterThanOrEqual(12);
    expect(dresserMeshes.length).toBeGreaterThanOrEqual(16);
    expect(bikeMeshes.length).toBeGreaterThanOrEqual(16);
    expect(boxesMeshes.length).toBeGreaterThanOrEqual(12);

    const consoleBox = new Box3().setFromObject(consoleGroup);
    const tvBox = new Box3().setFromObject(tvGroup);
    expect(consoleBox.max.y).toBeCloseTo(2.2, 3);
    expect(tvBox.min.y).toBeGreaterThan(consoleBox.max.y);
    expect(consoleBox.min.x).toBeLessThan(tvBox.min.x);
    expect(tvBox.max.x).toBeLessThan(-3.68);

    const expectedCalipersHex = new Color('#d93829').getHexString();
    expect(
      bikeMeshes.some((m: Mesh) => (m.material as MeshStandardMaterial).color.getHexString() === expectedCalipersHex),
    ).toBe(true);

    const boxesBox = new Box3().setFromObject(boxesGroup);
    expect(boxesBox.max.y).toBeCloseTo(2.5, 3);

    built.dispose();
    palette.dispose();
  });

  it('composes Tier 1 scene, modulates room PointLights & fixture status indicators via updateEntities, toggles upper massing, and disposes cleanly', () => {
    const dimOfficeState: Tier1EntityStateLike = { state: 'on', attributes: { brightness: 128 } };
    const options: BuildTier1SceneOptions = {
      showUpperTiers: false,
      background: null,
      entityBindings: { foyerLight: 'light.custom_foyer' },
      initialEntities: { 'light.office_lights': dimOfficeState },
    };
    const composed: Tier1SceneBuildResult = buildTier1Scene(options);
    expect(composed.scene.background).toBeNull();
    expect(composed.rooms.office.userData.room).toBe('office');
    expect(composed.lights.roomPoints.office.intensity).toBeCloseTo(0.64, 2);

    const statesOff: Tier1EntityMap = {
      'light.office_lights': { state: 'off' },
      'light.custom_foyer': 'off',
      'light.garage_studio_lights': { state: 'on', attributes: { brightness: 255 } },
      'sensor.office_temperature': { state: '71.4', attributes: { unit_of_measurement: '°F' } },
      'binary_sensor.washer_running': { state: 'on' },
      'sensor.washer_power': { state: '420' },
      'sensor.ender3_v2_print_status': { state: 'printing' },
      'cover.garage_door': { state: 'open' },
    };
    composed.updateEntities(statesOff);
    expect(composed.lights.roomPoints.office.intensity).toBe(0);
    expect(composed.lights.roomPoints.foyer.intensity).toBe(0);
    expect(composed.lights.roomPoints.garage.intensity).toBeGreaterThan(1.2);
    expect(composed.rooms.office.userData.temperature).toBe('71.4°F');
    expect(composed.fixtures['garage-washer-dryer'].userData.status).toBe('running');
    expect(composed.fixtures['garage-ender3-printer'].userData.status).toBe('printing');
    expect(composed.fixtures['garage-south-threshold'].userData.status).toBe('open');

    composed.updateEntities({
      washerRunning: 'off',
      washerPower: '0',
      printerState: 'idle',
      garageDoor: 'closed',
      'light.custom_foyer': 'on',
    });
    expect(composed.lights.roomPoints.foyer.intensity).toBeGreaterThan(1.0);
    expect(composed.fixtures['garage-washer-dryer'].userData.status).toBe('idle');
    expect(composed.fixtures['garage-ender3-printer'].userData.status).toBe('idle');
    expect(composed.fixtures['garage-south-threshold'].userData.status).toBe('closed');

    expect(composed.upperTiersGroup.visible).toBe(false);
    composed.setUpperTiersVisible(true);
    expect(composed.upperTiersGroup.visible).toBe(true);
    composed.setUpperTiersVisible(false);
    expect(composed.upperTiersGroup.visible).toBe(false);

    const deskMesh = composed.fixtures['office-desk'].children[0] as Mesh;
    const geomSpy = vi.spyOn(deskMesh.geometry, 'dispose');
    const matSpy = vi.spyOn(deskMesh.material as MeshStandardMaterial, 'dispose');
    const floorGeomSpy = vi.spyOn(composed.rooms.garage.geometry, 'dispose');

    composed.dispose();
    expect(geomSpy).toHaveBeenCalledTimes(1);
    expect(matSpy).toHaveBeenCalledTimes(1);
    expect(floorGeomSpy).toHaveBeenCalledTimes(1);
  });
});
