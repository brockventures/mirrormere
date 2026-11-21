import { Box3, CylinderGeometry, DataTexture, ExtrudeGeometry, Mesh, type MeshStandardMaterial } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { createTier1Materials } from './tier1Shell';
import { buildTier3Fixtures, type Tier3FixturesBuildResult } from './tier3Fixtures';
import { TIER3_LAYOUT_SPEC, type Tier3FixtureKey } from './tier3LayoutSpec';

describe('tier3Fixtures — Floor 3 3D Fixtures (Nook, Kitchen, Hall Bath, Rosie & Isaac Rooms)', () => {
  it('builds all 22 named fixture groups with metadata and meshes inside the Floor 3 envelope', () => {
    const palette = createTier1Materials();
    const built: Tier3FixturesBuildResult = buildTier3Fixtures(palette, TIER3_LAYOUT_SPEC);

    expect(built.root.name).toBe('tier3-fixtures');
    const keys = Object.keys(TIER3_LAYOUT_SPEC.fixtures) as Tier3FixtureKey[];
    expect(keys).toHaveLength(22);

    for (const key of keys) {
      const group = built.fixtures[key];
      const spec = TIER3_LAYOUT_SPEC.fixtures[key];
      expect(group).toBeDefined();
      expect(group.name).toBe(`fixture-${spec.id}`);
      expect(group.userData).toEqual({
        fixtureId: spec.id,
        roomId: spec.roomId,
        label: spec.label,
      });

      let meshCount = 0;
      group.traverse((obj) => {
        if (obj instanceof Mesh) meshCount += 1;
      });
      expect(meshCount).toBeGreaterThan(0);
    }

    const rootBox = new Box3().setFromObject(built.root);
    expect(rootBox.min.x).toBeGreaterThanOrEqual(TIER3_LAYOUT_SPEC.xMin - 0.1);
    expect(rootBox.max.x).toBeLessThanOrEqual(TIER3_LAYOUT_SPEC.xMax + 0.1);
    expect(rootBox.min.z).toBeGreaterThanOrEqual(TIER3_LAYOUT_SPEC.zMin - 0.1);
    expect(rootBox.max.z).toBeLessThanOrEqual(TIER3_LAYOUT_SPEC.zMax + 0.1);
    expect(rootBox.min.y).toBeGreaterThanOrEqual(-0.05);
    expect(rootBox.max.y).toBeLessThanOrEqual(6.6);

    built.dispose();
    palette.dispose();
  });

  it('builds signature Nook, Kitchen, Hall Bath, Rosie, and Isaac fixtures plus both bedroom ceiling fans', () => {
    const palette = createTier1Materials();
    const built = buildTier3Fixtures(palette);

    // Nook: curved-edge dining table, 6 regular chairs (no high chair), white-top buffet, pot rack pans, Hearth display, fiddle-leaf fig
    const tableTop = built.fixtures.diningTableSet.getObjectByName('dining-table-top') as Mesh;
    expect(tableTop).toBeInstanceOf(Mesh);
    expect(tableTop.geometry).toBeInstanceOf(ExtrudeGeometry);
    expect(built.fixtures.diningTableSet.getObjectByName('highchair-navy-pad')).toBeUndefined();
    for (let ci = 0; ci < 6; ci += 1) {
      expect(built.fixtures.diningTableSet.getObjectByName(`dining-chair-seat-${ci}`)).toBeInstanceOf(Mesh);
    }
    expect(built.fixtures.diningTableSet.getObjectByName('dining-chair-seat-6')).toBeUndefined();
    expect(built.fixtures.nookWhiteBuffet.getObjectByName('hanging-pan-0')).toBeInstanceOf(Mesh);
    built.fixtures.nookWhiteBuffet.traverse((obj) => {
      if (obj instanceof Mesh && !obj.name.startsWith('buffet-pull-') && !obj.name.startsWith('pot-') && !obj.name.startsWith('hanging-pan-')) {
        expect(obj.material).toBe(palette.whiteTrim);
      }
    });
    expect(built.fixtures.hearthWallDisplay.getObjectByName('hearth-display-screen')).toBeInstanceOf(Mesh);
    expect(built.fixtures.hearthWallDisplay.getObjectByName('nook-fig-canopy-main')).toBeInstanceOf(Mesh);

    // Kitchen & Upper Hall: DW left of sink, range hood rising to 6.5 ft, fridge magnets, E-W island + 3 south stools + north-east MW + west tower/trash, west-facing pantry
    const dwBox = new Box3().setFromObject(built.fixtures.northKitchenCounters.getObjectByName('dishwasher-front')!);
    const sinkBox = new Box3().setFromObject(built.fixtures.northKitchenCounters.getObjectByName('kitchen-sink-basin')!);
    expect(dwBox.max.x).toBeLessThan(sinkBox.min.x);
    expect(built.fixtures.northKitchenCounters.getObjectByName('sink-blue-mat')).toBeInstanceOf(Mesh);
    const hoodChimney = built.fixtures.eastRangeAndHood.getObjectByName('range-hood-chimney') as Mesh;
    expect(hoodChimney).toBeInstanceOf(Mesh);
    expect(new Box3().setFromObject(hoodChimney).max.y).toBeCloseTo(6.5, 2);
    expect(built.fixtures.stainlessFridge.getObjectByName('fridge-magnet-0')).toBeInstanceOf(Mesh);

    const islandBaseBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-base')!);
    const islandTopBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-quartz-top')!);
    const mwBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-microwave-door')!);
    const stool1Box = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-stool-seat-1')!);
    const towerBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('learning-tower-platform')!);
    const trashBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-trash-can')!);
    expect(islandBaseBox.max.x - islandBaseBox.min.x).toBeCloseTo(7.4, 1);
    expect(islandBaseBox.max.z - islandBaseBox.min.z).toBeCloseTo(3.0, 1);
    expect(islandTopBox.max.z).toBeGreaterThan(islandBaseBox.max.z + 0.5);
    expect(mwBox.min.z).toBeLessThan(islandBaseBox.min.z + 0.05);
    expect(mwBox.min.x).toBeGreaterThan(0);
    expect(built.fixtures.kitchenIsland.getObjectByName('island-stool-seat-2')).toBeInstanceOf(Mesh);
    expect(stool1Box.min.z).toBeGreaterThan(islandBaseBox.max.z);
    expect(towerBox.max.x).toBeLessThan(islandBaseBox.min.x);
    expect(trashBox.max.x).toBeLessThan(islandBaseBox.min.x);
    expect(trashBox.min.z).toBeGreaterThan(towerBox.max.z);
    expect(built.fixtures.playKitchenCorner.getObjectByName('harbor-art-frame')).toBeInstanceOf(Mesh);

    const pantryBodyBox = new Box3().setFromObject(built.fixtures.tallWhitePantry.getObjectByName('pantry-body')!);
    const pantryDoorBox = new Box3().setFromObject(built.fixtures.tallWhitePantry.getObjectByName('pantry-door-ln')!);
    const pantryPullBox = new Box3().setFromObject(built.fixtures.tallWhitePantry.getObjectByName('pantry-pull-0')!);
    expect(pantryDoorBox.max.x).toBeLessThanOrEqual(pantryBodyBox.min.x + 1e-4);
    expect(pantryPullBox.max.x).toBeLessThanOrEqual(pantryDoorBox.min.x + 1e-4);
    expect(built.fixtures.tallWhitePantry.getObjectByName('pantry-door-us')).toBeInstanceOf(Mesh);
    expect(built.fixtures.tallWhitePantry.getObjectByName('pantry-pull-3')).toBeInstanceOf(Mesh);

    // Hall Bath: tub curtain, round mirror, 3-globe vanity light, toilet art
    expect(built.fixtures.hallBathTub.getObjectByName('hall-shower-curtain')).toBeInstanceOf(Mesh);
    expect(built.fixtures.hallBathVanity.getObjectByName('hall-vanity-mirror')).toBeInstanceOf(Mesh);
    expect(built.fixtures.hallBathVanity.getObjectByName('hall-vanity-globe-2')).toBeInstanceOf(Mesh);
    expect(built.fixtures.hallBathToilet.getObjectByName('hall-bath-art-print')).toBeInstanceOf(Mesh);

    // Rosie's Room: rainbow arches, round textured rug, dollhouse
    expect(built.fixtures.rosieRainbowAndMap.getObjectByName('rosie-rainbow-arch-0')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieRainbowAndMap.getObjectByName('rosie-rainbow-arch-2')).toBeInstanceOf(Mesh);
    const rosieRug = built.fixtures.rosieRoundRug.getObjectByName('rosie-round-rug-disc') as Mesh;
    expect(rosieRug).toBeInstanceOf(Mesh);
    expect(rosieRug.geometry).toBeInstanceOf(CylinderGeometry);
    expect((rosieRug.material as MeshStandardMaterial).map).toBeInstanceOf(DataTexture);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-roof')).toBeInstanceOf(Mesh);

    // Isaac's Room: slatted crib, diaper pail, glider + ottoman, star play mat
    expect(built.fixtures.isaacWoodCrib.getObjectByName('crib-slat-e-5')).toBeInstanceOf(Mesh);
    expect(built.fixtures.isaacWalnutDresser.getObjectByName('isaac-diaper-pail')).toBeInstanceOf(Mesh);
    expect(built.fixtures.isaacGliderAndOttoman.getObjectByName('isaac-tufted-ottoman')).toBeInstanceOf(Mesh);
    const starMat = built.fixtures.isaacStarPlayMat.getObjectByName('isaac-star-play-mat') as Mesh;
    expect(starMat).toBeInstanceOf(Mesh);
    expect((starMat.material as MeshStandardMaterial).map).toBeInstanceOf(DataTexture);

    // Ceiling fans in Rosie's and Isaac's bedrooms
    expect(built.ceilingFansGroup.name).toBe('tier3-ceiling-fans');
    expect(built.ceilingFansGroup.getObjectByName('rosie-ceiling-fan')).toBeDefined();
    expect(built.ceilingFansGroup.getObjectByName('isaac-ceiling-fan')).toBeDefined();

    built.dispose();
    palette.dispose();
  });

  it('disposes all locally created geometries, materials, and DataTextures without disposing shared palette materials', () => {
    const palette = createTier1Materials();
    const whiteTrimDispose = vi.spyOn(palette.whiteTrim, 'dispose');
    const built = buildTier3Fixtures(palette);

    const rugMesh = built.fixtures.rosieRoundRug.getObjectByName('rosie-round-rug-disc') as Mesh;
    const starMesh = built.fixtures.isaacStarPlayMat.getObjectByName('isaac-star-play-mat') as Mesh;
    const rugGeoDispose = vi.spyOn(rugMesh.geometry, 'dispose');
    const rugTexDispose = vi.spyOn((rugMesh.material as MeshStandardMaterial).map!, 'dispose');
    const starTexDispose = vi.spyOn((starMesh.material as MeshStandardMaterial).map!, 'dispose');

    built.dispose();

    expect(rugGeoDispose).toHaveBeenCalledTimes(1);
    expect(rugTexDispose).toHaveBeenCalledTimes(1);
    expect(starTexDispose).toHaveBeenCalledTimes(1);
    expect(whiteTrimDispose).not.toHaveBeenCalled();

    palette.dispose();
  });
});
