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
    expect(islandBaseBox.min.x).toBeCloseTo(-6.6, 2);
    expect(islandBaseBox.max.x).toBeCloseTo(0.8, 2);
    expect(islandBaseBox.max.x - islandBaseBox.min.x).toBeCloseTo(7.4, 1);
    expect(islandBaseBox.max.z - islandBaseBox.min.z).toBeCloseTo(3.0, 1);
    expect(islandTopBox.max.z).toBeGreaterThan(islandBaseBox.max.z + 0.5);
    expect(mwBox.min.z).toBeLessThan(islandBaseBox.min.z + 0.05);
    expect(mwBox.min.x).toBeCloseTo(-1.05, 2);
    expect(mwBox.max.x).toBeCloseTo(0.25, 2);
    expect(towerBox.min.x).toBeGreaterThanOrEqual(-8.3);
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

    // Rosie's Room: rainbow arches, world map, 6-cube storage shelf, round mustard-sun rug, framed south closet sliding doors, single white gable-roofed house bookshelf
    expect(built.fixtures.rosieRainbowAndMap.getObjectByName('rosie-rainbow-arch-0')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieRainbowAndMap.getObjectByName('rosie-rainbow-arch-2')).toBeInstanceOf(Mesh);
    const mapFrameBox = new Box3().setFromObject(built.fixtures.rosieRainbowAndMap.getObjectByName('rosie-map-frame')!);
    const sixCubeParts = [
      'rosie-six-cube-frame-top',
      'rosie-six-cube-frame-bottom',
      'rosie-six-cube-frame-n',
      'rosie-six-cube-frame-s',
      'rosie-six-cube-frame-back',
      'rosie-six-cube-shelf-mid',
      'rosie-six-cube-div-0',
      'rosie-six-cube-div-1',
    ];
    const sixCubeBox = new Box3();
    for (const partName of sixCubeParts) {
      const partMesh = built.fixtures.rosieRainbowAndMap.getObjectByName(partName) as Mesh;
      expect(partMesh).toBeInstanceOf(Mesh);
      sixCubeBox.expandByObject(partMesh);
    }
    expect(sixCubeBox.min.x).toBeCloseTo(22.0, 2);
    expect(sixCubeBox.max.x).toBeCloseTo(23.25, 2);
    expect(sixCubeBox.min.y).toBeCloseTo(0.0, 2);
    expect(sixCubeBox.max.y).toBeCloseTo(2.18, 2);
    expect(sixCubeBox.min.z).toBeCloseTo(-3.3, 2);
    expect(sixCubeBox.max.z).toBeCloseTo(-0.24, 2);
    expect(sixCubeBox.max.y).toBeLessThan(mapFrameBox.min.y);
    for (let ci = 0; ci < 3; ci += 1) {
      const binMesh = built.fixtures.rosieRainbowAndMap.getObjectByName(`rosie-six-cube-bin-${ci}`) as Mesh;
      const booksMesh = built.fixtures.rosieRainbowAndMap.getObjectByName(`rosie-six-cube-books-${ci}`) as Mesh;
      expect(binMesh).toBeInstanceOf(Mesh);
      expect(booksMesh).toBeInstanceOf(Mesh);
      const binBox = new Box3().setFromObject(binMesh);
      const booksBox = new Box3().setFromObject(booksMesh);
      expect(binBox.max.y).toBeLessThan(1.1);
      expect(booksBox.min.y).toBeGreaterThanOrEqual(1.1);
      expect(booksBox.max.y).toBeLessThanOrEqual(2.1);
    }
    const rosieRug = built.fixtures.rosieRoundRug.getObjectByName('rosie-round-rug-disc') as Mesh;
    expect(rosieRug).toBeInstanceOf(Mesh);
    expect(rosieRug.geometry).toBeInstanceOf(CylinderGeometry);
    const rosieRugTex = (rosieRug.material as MeshStandardMaterial).map as DataTexture;
    expect(rosieRugTex).toBeInstanceOf(DataTexture);
    const texData = rosieRugTex.image.data as Uint8Array;
    const centerIdx = (128 * 256 + 128) * 4;
    expect(texData[centerIdx]).toBeGreaterThan(190);
    expect(texData[centerIdx + 1]).toBeGreaterThan(140);
    expect(texData[centerIdx + 2]).toBeLessThan(80);
    let rayTransitions = 0;
    let prevIsMustard = false;
    for (let a = 0; a <= 360; a += 1) {
      const rad = (a * Math.PI) / 180;
      const px = Math.round(128 + 64 * Math.cos(rad));
      const py = Math.round(128 + 64 * Math.sin(rad));
      const idx = (py * 256 + px) * 4;
      const isMustard = texData[idx + 2] < 100;
      if (a > 0 && isMustard !== prevIsMustard) rayTransitions += 1;
      prevIsMustard = isMustard;
    }
    expect(rayTransitions).toBeGreaterThanOrEqual(24);
    expect(rayTransitions).toBeLessThanOrEqual(32);

    const rosieDoorW = new Box3().setFromObject(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-closet-door-w')!);
    const rosieDoorE = new Box3().setFromObject(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-closet-door-e')!);
    const rosieRoofW = built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-roof-w') as Mesh;
    const rosieRoofE = built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-roof-e') as Mesh;
    const rosieGable = built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-gable') as Mesh;
    const rosieDollhouseBody = new Box3().setFromObject(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-body')!);
    const rosieDollhouseBase = new Box3().setFromObject(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-base')!);
    const rosieDollhouseBox = new Box3().setFromObject(rosieRoofE);
    expect(rosieDoorW.min.x).toBeGreaterThanOrEqual(17.7);
    expect(rosieDoorE.max.x).toBeLessThanOrEqual(23.3);
    expect(rosieDoorW.min.z).toBeGreaterThanOrEqual(0.0);
    expect(rosieDoorE.max.z).toBeLessThanOrEqual(0.25);
    expect(rosieRoofW.material).toBe(palette.whiteTrim);
    expect(rosieRoofE.material).toBe(palette.whiteTrim);
    expect(rosieRoofW.rotation.z).toBeGreaterThan(0.5);
    expect(rosieRoofE.rotation.z).toBeLessThan(-0.5);
    expect(rosieGable.geometry).toBeInstanceOf(ExtrudeGeometry);
    expect(rosieDollhouseBody.min.x).toBeCloseTo(15.2, 2);
    expect(rosieDollhouseBody.max.x).toBeCloseTo(16.8, 2);
    expect(rosieDollhouseBase.min.z).toBeCloseTo(1.04, 2);
    expect(rosieDollhouseBase.max.z).toBeCloseTo(1.8, 2);
    expect(rosieDollhouseBox.max.x).toBeLessThanOrEqual(17.4);
    expect(rosieDollhouseBox.max.z).toBeLessThanOrEqual(1.85);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-bookshelf-back')).toBeUndefined();
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-bookshelf-top')).toBeUndefined();
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-bookshelf-basket')).toBeUndefined();
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-bookshelf-books-0')).toBeUndefined();
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-tier-1')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-interior')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-basket')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-books-0')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-dollhouse-books-2')).toBeInstanceOf(Mesh);
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-cube-shelf')).toBeUndefined();
    expect(built.fixtures.rosieClosetAndDollhouse.getObjectByName('rosie-cube-bin-1')).toBeUndefined();
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
    for (const removed of [
      'isaac-closet-door',
      'isaac-closet-header',
      'isaac-closet-door-n',
      'isaac-closet-door-s',
      'isaac-closet-pull-n',
      'isaac-closet-pull-s',
    ]) {
      expect(built.root.getObjectByName(removed)).toBeUndefined();
    }
    const isaacCloset = built.root.getObjectByName('isaac-closet')!;
    expect(isaacCloset).toBeDefined();
    const isaacClosetBox = new Box3().setFromObject(isaacCloset);
    expect(isaacClosetBox.min.x).toBeGreaterThanOrEqual(8.85 - 1e-4);
    expect(isaacClosetBox.max.x).toBeLessThanOrEqual(11.55 + 1e-4);
    expect(isaacClosetBox.min.z).toBeGreaterThanOrEqual(9.2 - 1e-4);
    expect(isaacClosetBox.max.z).toBeLessThanOrEqual(10.75 + 1e-4);
    expect(isaacClosetBox.max.y).toBeLessThanOrEqual(2.12 + 1e-4);
    const shelfBox = new Box3().setFromObject(isaacCloset.getObjectByName('isaac-closet-shelf')!);
    expect(shelfBox.max.x - shelfBox.min.x).toBeGreaterThan(shelfBox.max.z - shelfBox.min.z);
    expect(isaacCloset.getObjectByName('isaac-closet-rod')).toBeInstanceOf(Mesh);
    expect(isaacCloset.getObjectByName('isaac-closet-bin')).toBeInstanceOf(Mesh);
    for (let ci = 0; ci < 3; ci += 1) {
      expect(isaacCloset.getObjectByName(`isaac-closet-clothes-${ci}`)).toBeInstanceOf(Mesh);
    }

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
