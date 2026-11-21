import { Box3, CylinderGeometry, DataTexture, ExtrudeGeometry, Mesh, TorusGeometry, type MeshStandardMaterial } from 'three';
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

  it('builds signature Nook, Kitchen, Hall Bath, Rosie, and Isaac fixtures with zero ceiling fans', () => {
    const palette = createTier1Materials();
    const built = buildTier3Fixtures(palette);

    // Nook: curved-edge dining table, 6 regular chairs (no high chair), white-top buffet, pot rack pans, Hearth display, fiddle-leaf fig
    const tableTop = built.fixtures.diningTableSet.getObjectByName('dining-table-top') as Mesh;
    expect(tableTop).toBeInstanceOf(Mesh);
    expect(tableTop.geometry).toBeInstanceOf(ExtrudeGeometry);
    expect(built.fixtures.diningTableSet.getObjectByName('highchair-navy-pad')).toBeUndefined();
    for (let ci = 0; ci < 6; ci += 1) {
      expect(built.fixtures.diningTableSet.getObjectByName(`dining-chair-seat-${ci}`)).toBeInstanceOf(Mesh);
      const uprightL = built.fixtures.diningTableSet.getObjectByName(`dining-chair-upright-${ci}-l`) as Mesh;
      const railL = built.fixtures.diningTableSet.getObjectByName(`dining-chair-rail-${ci}-l`) as Mesh;
      expect(uprightL).toBeInstanceOf(Mesh);
      expect(railL).toBeInstanceOf(Mesh);
      const uBox = new Box3().setFromObject(uprightL);
      expect(Math.min(uBox.max.x - uBox.min.x, uBox.max.z - uBox.min.z)).toBeCloseTo(0.05, 2);
      expect(new Box3().setFromObject(railL).max.y).toBeCloseTo(0.05, 2);
      expect(built.fixtures.diningTableSet.getObjectByName(`dining-chair-crossbar-${ci}`)).toBeInstanceOf(Mesh);
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

    // Kitchen & Upper Hall: DW left of sink, north pulls, east corner cab (-8.8..-7.9), 30" range (-7.9..-5.4), full ~2.1 ft range-to-fridge cab (-5.4..-3.3), fridge (-3.3..-0.45)
    const dwBox = new Box3().setFromObject(built.fixtures.northKitchenCounters.getObjectByName('dishwasher-front')!);
    const sinkBox = new Box3().setFromObject(built.fixtures.northKitchenCounters.getObjectByName('kitchen-sink-basin')!);
    expect(dwBox.max.x).toBeLessThan(sinkBox.min.x);
    expect(built.fixtures.northKitchenCounters.getObjectByName('north-west-drawer-pull-2')).toBeInstanceOf(Mesh);
    expect(built.fixtures.northKitchenCounters.getObjectByName('north-east-drawer-pull-2')).toBeInstanceOf(Mesh);
    expect(built.fixtures.northKitchenCounters.getObjectByName('north-upper-pull--7.56')).toBeInstanceOf(Mesh);
    expect(built.fixtures.northKitchenCounters.getObjectByName('sink-blue-mat')).toBeInstanceOf(Mesh);
    const rangeBox = new Box3().setFromObject(built.fixtures.eastRangeAndHood);
    expect(rangeBox.min.z).toBeGreaterThanOrEqual(-8.86 - 1e-4);
    expect(rangeBox.max.z).toBeLessThanOrEqual(-3.3 + 1e-4);
    const rangeMeshBox = new Box3().setFromObject(built.fixtures.eastRangeAndHood.getObjectByName('double-oven-range')!);
    expect(rangeMeshBox.min.z).toBeCloseTo(-7.9, 2);
    expect(rangeMeshBox.max.z).toBeCloseTo(-5.4, 2);
    const eastLowerSBox = new Box3().setFromObject(built.fixtures.eastRangeAndHood.getObjectByName('east-lower-cab-s')!);
    expect(eastLowerSBox.max.z - eastLowerSBox.min.z).toBeCloseTo(2.1, 2);
    const eastUpperSBox = new Box3().setFromObject(built.fixtures.eastRangeAndHood.getObjectByName('east-upper-cab-s')!);
    expect(eastUpperSBox.min.z).toBeCloseTo(-5.3, 2);
    expect(eastUpperSBox.max.z).toBeCloseTo(-3.35, 2);
    expect(built.fixtures.eastRangeAndHood.getObjectByName('east-upper-s-pull-1')).toBeInstanceOf(Mesh);
    expect(built.fixtures.eastRangeAndHood.getObjectByName('east-lower-drawer-pull-2')).toBeInstanceOf(Mesh);
    const hoodChimney = built.fixtures.eastRangeAndHood.getObjectByName('range-hood-chimney') as Mesh;
    expect(hoodChimney).toBeInstanceOf(Mesh);
    expect(new Box3().setFromObject(hoodChimney).max.y).toBeCloseTo(6.5, 2);
    const fridgeBox = new Box3().setFromObject(built.fixtures.stainlessFridge);
    expect(fridgeBox.min.z).toBeGreaterThanOrEqual(-3.3 - 1e-4);
    expect(fridgeBox.max.z).toBeLessThanOrEqual(-0.45 + 1e-4);
    expect(built.fixtures.stainlessFridge.getObjectByName('fridge-upper-pull-1')).toBeInstanceOf(Mesh);
    expect(built.fixtures.stainlessFridge.getObjectByName('fridge-magnet-0')).toBeInstanceOf(Mesh);

    const islandBaseBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-base')!);
    const islandTopBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-quartz-top')!);
    const mwBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-microwave-door')!);
    const stool1Box = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-stool-seat-1')!);
    const stoolBase0 = built.fixtures.kitchenIsland.getObjectByName('island-stool-base-0') as Mesh;
    const stoolCol0 = built.fixtures.kitchenIsland.getObjectByName('island-stool-column-0') as Mesh;
    const stoolRing0 = built.fixtures.kitchenIsland.getObjectByName('island-stool-footrest-0') as Mesh;
    const towerBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('learning-tower-platform')!);
    const trashBox = new Box3().setFromObject(built.fixtures.kitchenIsland.getObjectByName('island-trash-can')!);
    expect(islandBaseBox.max.x - islandBaseBox.min.x).toBeCloseTo(7.4, 1);
    expect(islandBaseBox.max.z - islandBaseBox.min.z).toBeCloseTo(3.0, 1);
    expect(islandTopBox.max.z).toBeGreaterThan(islandBaseBox.max.z + 0.5);
    expect(mwBox.min.z).toBeLessThan(islandBaseBox.min.z + 0.05);
    expect(mwBox.min.x).toBeGreaterThan(0);
    expect(built.fixtures.kitchenIsland.getObjectByName('island-mw-drawer-pull')).toBeInstanceOf(Mesh);
    expect(built.fixtures.kitchenIsland.getObjectByName('island-west-drawer-pull-2')).toBeInstanceOf(Mesh);
    expect(built.fixtures.kitchenIsland.getObjectByName('island-center-door-pull-1')).toBeInstanceOf(Mesh);
    expect(stoolBase0.geometry).toBeInstanceOf(CylinderGeometry);
    expect(stoolCol0.geometry).toBeInstanceOf(CylinderGeometry);
    expect(stoolRing0.geometry).toBeInstanceOf(TorusGeometry);
    expect(new Box3().setFromObject(stoolRing0).min.y).toBeCloseTo(0.7, 1);
    expect(built.fixtures.kitchenIsland.getObjectByName('island-stool-seat-2')).toBeInstanceOf(Mesh);
    expect(stool1Box.min.z).toBeGreaterThan(islandBaseBox.max.z);
    expect(towerBox.max.x).toBeLessThan(islandBaseBox.min.x);
    expect(trashBox.max.x).toBeLessThan(islandBaseBox.min.x);
    expect(trashBox.min.z).toBeGreaterThan(towerBox.max.z);
    expect(built.fixtures.playKitchenCorner.getObjectByName('harbor-art-frame')).toBeInstanceOf(Mesh);

    const pantryBodyBox = new Box3().setFromObject(built.fixtures.tallWhitePantry.getObjectByName('pantry-body')!);
    const pantryDoorBox = new Box3().setFromObject(built.fixtures.tallWhitePantry.getObjectByName('pantry-door-0')!);
    const pantryPullBox = new Box3().setFromObject(built.fixtures.tallWhitePantry.getObjectByName('pantry-pull-0')!);
    expect(pantryBodyBox.min.x).toBeGreaterThanOrEqual(6.1);
    expect(pantryBodyBox.max.x).toBeLessThanOrEqual(8.45);
    expect(pantryBodyBox.min.z).toBeGreaterThanOrEqual(3.98);
    expect(pantryBodyBox.max.z).toBeLessThanOrEqual(10.8);
    expect(pantryDoorBox.max.x).toBeLessThanOrEqual(pantryBodyBox.min.x + 1e-4);
    expect(pantryPullBox.max.x).toBeLessThanOrEqual(pantryDoorBox.min.x + 1e-4);
    expect(built.fixtures.tallWhitePantry.getObjectByName('pantry-door-3')).toBeInstanceOf(Mesh);
    expect(built.fixtures.tallWhitePantry.getObjectByName('pantry-pull-3')).toBeInstanceOf(Mesh);

    // Hall Bath: tub curtain, round mirror, 3-globe vanity light, toilet art cleanly north of z = -0.6
    expect(built.fixtures.hallBathTub.getObjectByName('hall-shower-curtain')).toBeInstanceOf(Mesh);
    expect(built.fixtures.hallBathVanity.getObjectByName('hall-vanity-mirror')).toBeInstanceOf(Mesh);
    expect(built.fixtures.hallBathVanity.getObjectByName('hall-vanity-globe-2')).toBeInstanceOf(Mesh);
    const toiletBox = new Box3().setFromObject(built.fixtures.hallBathToilet);
    expect(toiletBox.max.z).toBeLessThanOrEqual(-0.6 + 1e-4);
    expect(built.fixtures.hallBathToilet.getObjectByName('hall-bath-art-print')).toBeInstanceOf(Mesh);

    // Rosie's Room: rainbow arches, round textured rug, framed south closet sliding doors (x 17.7..23.3, z 0.0..0.2) & interior, dollhouse west of closet wall
    expect(built.fixtures.rosieRainbowAndMap.getObjectByName('rosie-rainbow-arch-0')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieRainbowAndMap.getObjectByName('rosie-rainbow-arch-2')).toBeInstanceOf(Mesh);
    const rosieRug = built.fixtures.rosieRoundRug.getObjectByName('rosie-round-rug-disc') as Mesh;
    expect(rosieRug).toBeInstanceOf(Mesh);
    expect(rosieRug.geometry).toBeInstanceOf(CylinderGeometry);
    expect((rosieRug.material as MeshStandardMaterial).map).toBeInstanceOf(DataTexture);
    const rosieDoorW = new Box3().setFromObject(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-closet-door-w')!);
    const rosieDoorE = new Box3().setFromObject(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-closet-door-e')!);
    const rosieDollhouse = new Box3().setFromObject(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-roof')!);
    expect(rosieDoorW.min.x).toBeGreaterThanOrEqual(17.7);
    expect(rosieDoorE.max.x).toBeLessThanOrEqual(23.3);
    expect(rosieDoorW.min.z).toBeGreaterThanOrEqual(0.0);
    expect(rosieDoorE.max.z).toBeLessThanOrEqual(0.25);
    expect(rosieDollhouse.max.x).toBeLessThanOrEqual(17.3);
    expect(rosieDollhouse.max.z).toBeLessThanOrEqual(1.85);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-closet-shelf')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-closet-rod')).toBeInstanceOf(Mesh);

    // Isaac's Room: rectangular slatted crib (~4.4 x 2.4 ft), dresser & glider inside z 2.0..11.0, north-facing closet door on z 7.2 & interior, star play mat
    const cribBox = new Box3().setFromObject(built.fixtures.isaacWoodCrib);
    expect(cribBox.max.x - cribBox.min.x).toBeCloseTo(4.32, 1);
    expect(cribBox.max.z - cribBox.min.z).toBeCloseTo(2.32, 1);
    expect(built.fixtures.isaacWoodCrib.getObjectByName('crib-slat-e-5')).toBeInstanceOf(Mesh);
    expect(built.fixtures.isaacWoodCrib.getObjectByName('crib-slat-n-9')).toBeInstanceOf(Mesh);
    const isaacDresserBox = new Box3().setFromObject(built.fixtures.isaacWalnutDresser);
    expect(isaacDresserBox.min.z).toBeGreaterThanOrEqual(2.0);
    expect(isaacDresserBox.max.z).toBeLessThanOrEqual(4.2);
    expect(built.fixtures.isaacWalnutDresser.getObjectByName('isaac-diaper-pail')).toBeInstanceOf(Mesh);
    const gliderChair = built.fixtures.isaacGliderAndOttoman.getObjectByName('isaac-glider-chair')!;
    expect(gliderChair).toBeDefined();
    expect(gliderChair.rotation.y).toBeCloseTo(-Math.PI / 4, 4);
    const chairBox = new Box3().setFromObject(gliderChair);
    expect(chairBox.min.z).toBeGreaterThanOrEqual(2.0);
    const ottomanMesh = built.fixtures.isaacGliderAndOttoman.getObjectByName('isaac-tufted-ottoman') as Mesh;
    const ottomanBox = new Box3().setFromObject(ottomanMesh);
    expect(ottomanMesh).toBeInstanceOf(Mesh);
    expect((ottomanBox.min.x + ottomanBox.max.x) / 2).toBeLessThan((chairBox.min.x + chairBox.max.x) / 2);
    expect((ottomanBox.min.z + ottomanBox.max.z) / 2).toBeGreaterThan((chairBox.min.z + chairBox.max.z) / 2);
    const starMat = built.fixtures.isaacStarPlayMat.getObjectByName('isaac-star-play-mat') as Mesh;
    expect(starMat).toBeInstanceOf(Mesh);
    expect((starMat.material as MeshStandardMaterial).map).toBeInstanceOf(DataTexture);
    const isaacClosetDoor = new Box3().setFromObject(built.root.getObjectByName('isaac-closet-door')!);
    expect(isaacClosetDoor.min.x).toBeGreaterThanOrEqual(8.6);
    expect(isaacClosetDoor.max.x).toBeLessThanOrEqual(11.8);
    expect(isaacClosetDoor.min.z).toBeLessThan(7.2);
    expect(isaacClosetDoor.max.z).toBeGreaterThan(7.2);
    expect(built.root.getObjectByName('isaac-closet-shelf')).toBeInstanceOf(Mesh);
    expect(built.root.getObjectByName('isaac-closet-rod')).toBeInstanceOf(Mesh);

    // Ceiling fans removed from Floor 3
    expect(built.ceilingFansGroup.name).toBe('tier3-ceiling-fans');
    expect(built.ceilingFansGroup.children).toHaveLength(0);
    expect(built.ceilingFansGroup.getObjectByName('rosie-ceiling-fan')).toBeUndefined();
    expect(built.ceilingFansGroup.getObjectByName('isaac-ceiling-fan')).toBeUndefined();

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
