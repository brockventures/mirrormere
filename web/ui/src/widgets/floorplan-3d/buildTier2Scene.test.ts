import { Box3, Color, DataTexture, Mesh, type MeshStandardMaterial, type Object3D } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { buildTier2Scene, type BuiltTier2Scene, type Tier2SceneMaterials } from './buildTier2Scene';
import { TIER2_LAYOUT_SPEC, type Tier2FixtureKey, type Tier2RoomId } from './tier2LayoutSpec';

describe('buildTier2Scene & tier2Fixtures — Floor 2 South 3D Scene, Materials, Stairs & Fixtures', () => {
  it('builds tier2-shell, all 7 room-<id> groups with honey oak and slate-tile floors, and world-space UVs', () => {
    const built: BuiltTier2Scene = buildTier2Scene();
    const materials: Tier2SceneMaterials = built.materials;
    expect(materials.woodFloor).toBe(materials.oakFloor);
    expect(built.shellGroup.name).toBe('tier2-shell');
    expect(built.group.getObjectByName('tier2-shell')).toBe(built.shellGroup);

    const roomIds = Object.keys(TIER2_LAYOUT_SPEC.rooms) as Tier2RoomId[];
    expect(roomIds).toHaveLength(7);

    for (const roomId of roomIds) {
      const roomGroup = built.rooms[roomId];
      expect(roomGroup.name).toBe(`room-${roomId}`);
      expect(built.group.getObjectByName(`room-${roomId}`)).toBe(roomGroup);

      const floorMesh = built.roomFloors[roomId];
      expect(floorMesh).toBeInstanceOf(Mesh);
      if (roomId === 'primaryBath') {
        expect(floorMesh.material).toBe(built.materials.slateTileFloor);
        const slateHex = (floorMesh.material as MeshStandardMaterial).color.getHexString();
        expect(slateHex).toBe(new Color(0x32363b).getHexString());
      } else {
        expect(floorMesh.material).toBe(built.materials.woodFloor);
        expect(built.materials.woodFloor).toBe(built.materials.oakFloor);
      }
    }

    const livingFloor = built.roomFloors.livingRoom;
    const pos = livingFloor.geometry.attributes.position;
    const uv = livingFloor.geometry.attributes.uv;
    const bounds = TIER2_LAYOUT_SPEC.rooms.livingRoom.bounds;
    const cx = (bounds.xMin + bounds.xMax) / 2;
    const cz = (bounds.zMin + bounds.zMax) / 2;
    for (let i = 0; i < pos.count; i += 1) {
      const wx = cx + pos.getX(i);
      const wz = cz + pos.getZ(i);
      expect(uv.getX(i)).toBeCloseTo((wx + 20.0) / 16.0, 4);
      expect(uv.getY(i)).toBeCloseTo((wz + 12.6) / 16.0, 4);
    }

    built.dispose();
  });

  it('builds cutaway/accent walls, glazed/frosted windows, 7-tread stairs, and stairwell void South & East railings', () => {
    const built = buildTier2Scene();

    for (const wallSpec of TIER2_LAYOUT_SPEC.walls) {
      const wg = built.wallsById[wallSpec.id];
      expect(wg).toBeDefined();
      const bodyMesh = wg.getObjectByName(`${wallSpec.id}-body`) as Mesh;
      expect(bodyMesh).toBeInstanceOf(Mesh);
      if (wallSpec.colorHex !== undefined) {
        const mat = bodyMesh.material as MeshStandardMaterial;
        expect(mat.color.getHex()).toBe(wallSpec.colorHex);
      }
    }

    // Verify forest-green East primary bedroom wall (#1f3b33), North living room slate accent wall (#38434f),
    // stairwell slate (#353d47), primary bath marble (#ebeef2), and gray-blue exteriorSiding on perimeter walls
    const greenWallBody = built.wallsById['primary-east-green-accent'].getObjectByName('primary-east-green-accent-body') as Mesh;
    expect((greenWallBody.material as MeshStandardMaterial).color.getHex()).toBe(0x1f3b33);
    const northSlateBody = built.wallsById['north-living-accent'].getObjectByName('north-living-accent-body') as Mesh;
    expect((northSlateBody.material as MeshStandardMaterial).color.getHex()).toBe(0x38434f);
    const stairSlateBody = built.wallsById['stairwell-north-accent'].getObjectByName('stairwell-north-accent-body') as Mesh;
    expect((stairSlateBody.material as MeshStandardMaterial).color.getHex()).toBe(0x353d47);
    const bathNorthBody = built.wallsById['primary-bath-north-marble'].getObjectByName('primary-bath-north-marble-body') as Mesh;
    expect((bathNorthBody.material as MeshStandardMaterial).color.getHex()).toBe(0xebeef2);

    for (const wallSpec of TIER2_LAYOUT_SPEC.walls) {
      const wg = built.wallsById[wallSpec.id];
      const extBody = wg.getObjectByName(`${wallSpec.id}-body-ext`) as Mesh | undefined;
      const intBody = wg.getObjectByName(`${wallSpec.id}-body`) as Mesh;
      if (wallSpec.exteriorFace) {
        expect(extBody).toBeInstanceOf(Mesh);
        expect(extBody!.material).toBe(built.materials.exteriorSiding);
        if (wallSpec.exteriorFace === 'west') expect(extBody!.position.x).toBeLessThan(intBody.position.x);
        if (wallSpec.exteriorFace === 'east') expect(extBody!.position.x).toBeGreaterThan(intBody.position.x);
        if (wallSpec.exteriorFace === 'north') expect(extBody!.position.z).toBeLessThan(intBody.position.z);
        if (wallSpec.exteriorFace === 'south') expect(extBody!.position.z).toBeGreaterThan(intBody.position.z);
      } else {
        expect(extBody).toBeUndefined();
      }
    }

    // Verify 6.6 ft back perimeter wall heights, Floor 3 stair doorway, and upper header on primary-bath-east-marble aperture
    for (const tallId of [
      'west-living-north',
      'north-living-accent',
      'stairwell-north-accent',
      'primary-bath-north-marble',
      'primary-bath-east-marble',
    ]) {
      const box = new Box3().setFromObject(built.wallsById[tallId]);
      expect(box.max.y).toBeCloseTo(6.6, 2);
    }
    expect(new Box3().setFromObject(built.wallsById['primary-east-green-accent']).max.y).toBeCloseTo(4.8, 2);

    const stairNorthWall = built.wallsById['stairwell-north-accent'];
    const jambW = stairNorthWall.getObjectByName('tier3-doorway-jamb-w') as Mesh;
    const jambE = stairNorthWall.getObjectByName('tier3-doorway-jamb-e') as Mesh;
    expect(jambW).toBeInstanceOf(Mesh);
    expect(jambE).toBeInstanceOf(Mesh);
    expect(jambW.material).toBe(built.materials.whiteTrim);
    expect(jambE.material).toBe(built.materials.whiteTrim);
    expect(new Box3().setFromObject(jambW).min.y).toBeCloseTo(4.55, 2);
    expect(new Box3().setFromObject(jambW).max.y).toBeCloseTo(6.6, 2);
    expect(new Box3().setFromObject(jambE).min.y).toBeCloseTo(4.55, 2);
    expect(new Box3().setFromObject(jambE).max.y).toBeCloseTo(6.6, 2);
    expect(stairNorthWall.getObjectByName('stairwell-north-accent-cap')).toBeUndefined();
    expect(stairNorthWall.getObjectByName('stairwell-north-accent-cap-west')).toBeInstanceOf(Mesh);
    expect(stairNorthWall.getObjectByName('stairwell-north-accent-cap-east')).toBeInstanceOf(Mesh);

    const bathEastWall = built.wallsById['primary-bath-east-marble'];
    for (const part of ['body', 'body-south', 'sill', 'header']) {
      const intPart = bathEastWall.getObjectByName(`primary-bath-east-marble-${part}`) as Mesh;
      const extPart = bathEastWall.getObjectByName(`primary-bath-east-marble-${part}-ext`) as Mesh;
      expect((intPart.material as MeshStandardMaterial).color.getHex()).toBe(0xebeef2);
      expect(extPart.material).toBe(built.materials.exteriorSiding);
      expect(extPart.position.x).toBeGreaterThan(intPart.position.x);
    }
    const bathHeaderBox = new Box3().setFromObject(bathEastWall.getObjectByName('primary-bath-east-marble-header')!);
    expect(bathHeaderBox.min.y).toBeCloseTo(4.4, 2);
    expect(bathHeaderBox.max.y).toBeCloseTo(6.53, 2);

    // Verify glazed windows on Living West, South Living (3-panel), Primary Bedroom South (+ curtains), and frosted East Bath window
    const westWin = built.shellGroup.getObjectByName('living-west-window');
    expect(westWin).toBeDefined();
    const westWinBox = new Box3().setFromObject(westWin!);
    expect(westWinBox.min.z).toBeCloseTo(2.4, 2);
    expect(westWinBox.max.z).toBeCloseTo(9.4, 2);
    expect(westWinBox.min.y).toBeCloseTo(1.8, 2);
    expect(westWinBox.max.y).toBeCloseTo(4.5, 2);

    const southWin = built.shellGroup.getObjectByName('south-bench-window');
    expect(southWin).toBeDefined();
    const southWinBox = new Box3().setFromObject(southWin!);
    expect(southWinBox.min.x).toBeCloseTo(-18.8, 2);
    expect(southWinBox.max.x).toBeCloseTo(-9.4, 2);
    expect(southWinBox.min.y).toBeCloseTo(1.8, 2);
    expect(southWinBox.max.y).toBeCloseTo(4.5, 2);
    expect(built.shellGroup.getObjectByName('south-bench-window-mullion-1')).toBeDefined();
    expect(built.shellGroup.getObjectByName('south-bench-window-mullion-2')).toBeDefined();

    const primaryWin = built.shellGroup.getObjectByName('primary-south-window');
    expect(primaryWin).toBeDefined();
    const primaryWinBox = new Box3().setFromObject(primaryWin!);
    expect(primaryWinBox.min.x).toBeLessThanOrEqual(11.8);
    expect(primaryWinBox.max.x).toBeGreaterThanOrEqual(19.2);
    expect(built.shellGroup.getObjectByName('primary-south-curtain-west')).toBeDefined();
    expect(built.shellGroup.getObjectByName('primary-south-curtain-east')).toBeDefined();

    const bathWin = built.shellGroup.getObjectByName('primary-bath-east-window');
    expect(bathWin).toBeDefined();
    const bathWinGlass = built.shellGroup.getObjectByName('primary-bath-east-window-glass') as Mesh;
    expect(bathWinGlass).toBeInstanceOf(Mesh);
    expect(bathWinGlass.position.x).toBeCloseTo(23.5, 2);
    expect((bathWinGlass.material as MeshStandardMaterial).transparent).toBe(true);

    // Verify 7-tread stairsUpToTier3 (no bottom gate) and U/L-turn stairwellVoidFromTier1
    expect(built.stairsUpGroup.userData.stepCount).toBe(7);
    expect(built.stairsUpGroup.userData.direction).toBe('-z');
    for (let i = 0; i < 7; i += 1) {
      const tread = built.stairsUpGroup.getObjectByName(`tier2-stair-tread-${i}`) as Mesh;
      expect(tread).toBeInstanceOf(Mesh);
      expect(tread.material).toBe(built.materials.woodFloor);
    }
    expect(built.stairsUpGroup.getObjectByName('stairs-safety-gate')).toBeUndefined();
    expect(built.stairsUpGroup.getObjectByName('tier3-kitchen-doorway-portal')).toBeUndefined();
    const topThreshold = built.stairsUpGroup.getObjectByName('tier2-stair-top-threshold') as Mesh;
    expect(topThreshold).toBeInstanceOf(Mesh);
    expect(topThreshold.material).toBe(built.materials.woodFloor);
    const topThresholdBox = new Box3().setFromObject(topThreshold);
    expect(topThresholdBox.min.x).toBeCloseTo(-3.35, 2);
    expect(topThresholdBox.max.x).toBeCloseTo(-0.35, 2);
    expect(topThresholdBox.max.y).toBeCloseTo(4.55, 2);
    expect(topThresholdBox.min.z).toBeCloseTo(-11.22, 2);
    expect(topThresholdBox.max.z).toBeCloseTo(TIER2_LAYOUT_SPEC.stairsUpToTier3.zMin, 2);
    const postTop = built.stairsUpGroup.getObjectByName('stairs-post-top') as Mesh;
    expect(new Box3().setFromObject(postTop).max.y).toBeLessThanOrEqual(6.55 + 1e-4);

    const vd = TIER2_LAYOUT_SPEC.stairwellVoidFromTier1;
    expect(built.stairwellVoidGroup.getObjectByName('stairwell-void-well')).toBeUndefined();
    const voidBottom = built.stairwellVoidGroup.getObjectByName('stairwell-void-bottom') as Mesh;
    expect(voidBottom).toBeInstanceOf(Mesh);
    expect(new Box3().setFromObject(voidBottom).min.y).toBeCloseTo(-2.6, 2);
    const dividerCore = built.stairwellVoidGroup.getObjectByName('stairwell-void-divider-core') as Mesh;
    expect(dividerCore).toBeInstanceOf(Mesh);
    const dividerBox = new Box3().setFromObject(dividerCore);
    expect(dividerBox.min.x).toBeCloseTo(2.3, 2);
    expect(dividerBox.max.x).toBeCloseTo(3.1, 2);
    for (let i = 0; i < 10; i += 1) {
      const descTread = built.stairwellVoidGroup.getObjectByName(`stairwell-void-tread-${i}`) as Mesh;
      expect(descTread).toBeInstanceOf(Mesh);
      expect(descTread.position.y).toBeLessThan(0);
    }

    // Verify stairLanding floor slabs do not cover stairwellVoidFromTier1
    const stairLandingFloorBox = new Box3().setFromObject(built.roomFloors.stairLanding);
    expect(stairLandingFloorBox.min.z).toBeCloseTo(vd.zMax, 2);
    for (const slabName of ['floor-stairLanding', 'floor-stairLanding-west', 'floor-stairLanding-north', 'floor-stairLanding-east']) {
      const slab = built.rooms.stairLanding.getObjectByName(slabName) as Mesh;
      expect(slab).toBeInstanceOf(Mesh);
      const b = new Box3().setFromObject(slab);
      const overlapsVoidX = b.min.x + 1e-4 < vd.xMax && b.max.x - 1e-4 > vd.xMin;
      const overlapsVoidZ = b.min.z + 1e-4 < vd.zMax && b.max.z - 1e-4 > vd.zMin;
      expect(overlapsVoidX && overlapsVoidZ).toBe(false);
    }

    const southRail = built.stairwellVoidGroup.getObjectByName('void-rail-south-0.8') as Mesh;
    const eastRail = built.stairwellVoidGroup.getObjectByName('void-rail-east-0.8') as Mesh;
    expect(southRail).toBeInstanceOf(Mesh);
    expect(eastRail).toBeInstanceOf(Mesh);
    expect(southRail.position.z).toBeCloseTo(vd.zMax, 2);
    const southRailBox = new Box3().setFromObject(southRail);
    expect(southRailBox.min.x).toBeCloseTo(vd.xMin, 2);
    expect(southRailBox.max.x).toBeCloseTo(3.1, 2);
    expect(eastRail.position.x).toBeCloseTo(vd.xMax, 2);
    expect(built.stairwellVoidGroup.getObjectByName('void-rail-west-0.8')).toBeUndefined();

    built.dispose();
  });

  it('builds all 31 audited fixtures with corrected orientations, open-top glass shower, reach-in closet, no ceiling fans, and clean disposal', () => {
    const built = buildTier2Scene({ background: null });
    expect(built.scene.background).toBeNull();

    const fixtureKeys = Object.keys(TIER2_LAYOUT_SPEC.fixtures) as Tier2FixtureKey[];
    expect(fixtureKeys).toHaveLength(31);
    expect(built.group.getObjectByName('fixture-southWindowBench')).toBeDefined();
    expect(built.group.getObjectByName('fixture-bathLinenCloset')).toBeUndefined();

    for (const key of fixtureKeys) {
      const fg = built.fixtures[key];
      expect(fg).toBeDefined();
      expect(fg.name).toBe(`fixture-${key}`);
      expect(built.group.getObjectByName(`fixture-${key}`)).toBe(fg);

      const meshes: Mesh[] = [];
      fg.traverse((obj: Object3D) => {
        if (obj instanceof Mesh) meshes.push(obj);
      });
      expect(meshes.length).toBeGreaterThanOrEqual(1);
    }

    // 1. Living & Play Nook: full-height 6.6 ft fireplace chimney, vertical pastel ovals on canvas, South wall 2x2 prints inside wall face, blue/white patterned DataTexture rug
    const hearthBox = new Box3().setFromObject(built.fixtures.fireplaceHearth);
    expect(hearthBox.max.y).toBeCloseTo(6.6, 2);
    const oval0 = built.fixtures.pastelOvalWallArt.getObjectByName('pastel-oval-0') as Mesh;
    expect(oval0.rotation.x).toBeCloseTo(Math.PI / 2, 3);
    const rugTop = built.fixtures.livingAreaRug.getObjectByName('living-area-rug-top') as Mesh;
    expect(rugTop).toBeInstanceOf(Mesh);
    const rugTopMat = rugTop.material as MeshStandardMaterial;
    expect(rugTopMat.map).toBeInstanceOf(DataTexture);
    const rugTex = rugTopMat.map as DataTexture;
    expect(rugTex.image.width).toBe(256);
    expect(rugTex.image.height).toBe(256);
    const rugTexSpy = vi.spyOn(rugTex, 'dispose');
    const nookFrame = built.fixtures.cubeStorageShelves.getObjectByName('nook-grid-frame-0-0') as Mesh;
    expect(nookFrame.position.z).toBeCloseTo(TIER2_LAYOUT_SPEC.fixtures.cubeStorageShelves.zMax, 2);
    expect(new Box3().setFromObject(nookFrame).max.z).toBeLessThanOrEqual(10.78);

    const benchMeshes = built.fixtures.westWindowBench.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
    expect(benchMeshes.some((m) => (m.material as MeshStandardMaterial).color.getHex() === 0xb8bcc2)).toBe(true);

    // 2. Hallway East world-map wall art
    const hm = TIER2_LAYOUT_SPEC.fixtures.hallwayCabinetAndMap;
    const worldMap = built.fixtures.hallwayCabinetAndMap.getObjectByName('world-map-wall-art') as Mesh;
    expect(worldMap.position.x).toBeCloseTo(hm.xMax - 0.08, 2);

    // 3. Primary Bedroom: East green wall gold tree-of-life art, oval open-top bassinet, North changing dresser accessories, reach-in closet
    const bassinetGroup = built.fixtures.bedsideBassinet;
    for (let i = 0; i < 4; i += 1) {
      expect(bassinetGroup.getObjectByName(`bassinet-leg-${i}`)).toBeInstanceOf(Mesh);
    }
    expect(bassinetGroup.getObjectByName('bassinet-lower-shelf')).toBeInstanceOf(Mesh);
    expect(bassinetGroup.getObjectByName('bassinet-cradle-mesh')).toBeInstanceOf(Mesh);
    expect(bassinetGroup.getObjectByName('bassinet-mattress')).toBeInstanceOf(Mesh);
    expect(bassinetGroup.getObjectByName('bassinet-blanket')).toBeInstanceOf(Mesh);
    expect(bassinetGroup.getObjectByName('bassinet-top-rail')).toBeInstanceOf(Mesh);
    expect(bassinetGroup.getObjectByName('bassinet-canopy')).toBeInstanceOf(Mesh);
    const treeArt = bassinetGroup.getObjectByName('gold-tree-of-life-art') as Mesh;
    expect(treeArt.rotation.z).toBeCloseTo(Math.PI / 2, 3);
    expect(treeArt.position.x).toBeCloseTo(23.25, 2);
    expect(built.fixtures.northWoodDresser.getObjectByName('changing-dresser-mirror')).toBeDefined();
    expect(built.fixtures.northWoodDresser.getObjectByName('baseball-cap-rack')).toBeDefined();
    expect(built.fixtures.northWoodDresser.getObjectByName('fiddle-leaf-fig-plant')).toBeDefined();
    const closet = built.group.getObjectByName('reach-in-closet');
    expect(closet).toBeDefined();
    const closetBox = new Box3().setFromObject(closet!);
    expect(closetBox.min.x).toBeGreaterThanOrEqual(6.2 - 1e-4);
    expect(closetBox.max.x).toBeLessThanOrEqual(8.5 + 1e-4);
    expect(closetBox.min.z).toBeGreaterThanOrEqual(2.8 - 1e-4);
    expect(closetBox.max.z).toBeLessThanOrEqual(11.0 + 1e-4);

    // 4. Primary Bath: open-top full-span walkInGlassShower (no south glass/header/curb; east glass & header span to -2.7) + handle
    const sh = TIER2_LAYOUT_SPEC.fixtures.walkInGlassShower;
    const showerGroup = built.fixtures.walkInGlassShower;
    const showerMeshes = showerGroup.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
    expect(showerMeshes.some((m) => {
      const mat = m.material as MeshStandardMaterial;
      return mat.transparent && Math.abs(mat.opacity - 0.32) < 1e-3;
    })).toBe(true);
    // Verify no opaque roof slab covers top of shower (y > 4.0) across full X & Z span
    const hasSolidRoof = showerMeshes.some((m) => {
      const box = new Box3().setFromObject(m);
      return box.min.y > 4.0 && (box.max.x - box.min.x) > 1.0 && (box.max.z - box.min.z) > 1.0;
    });
    expect(hasSolidRoof).toBe(false);
    expect(showerGroup.getObjectByName('shower-glass-south')).toBeUndefined();
    expect(showerGroup.getObjectByName('shower-header-south')).toBeUndefined();
    expect(showerGroup.getObjectByName('shower-curb-south')).toBeUndefined();
    const eastGlass = showerGroup.getObjectByName('shower-glass-east') as Mesh;
    const eastHeader = showerGroup.getObjectByName('shower-header-east') as Mesh;
    expect(eastHeader.position.x).toBeCloseTo(sh.xMax - 0.03, 2);
    expect(new Box3().setFromObject(eastGlass).max.z).toBeCloseTo(-2.7, 2);
    expect(new Box3().setFromObject(eastHeader).max.z).toBeCloseTo(-2.7, 2);
    expect(showerGroup.getObjectByName('shower-door-handle')).toBeInstanceOf(Mesh);

    const vv = TIER2_LAYOUT_SPEC.fixtures.walnutDoubleVanity;
    const vanityGroup = built.fixtures.walnutDoubleVanity;
    const mNorth = vanityGroup.getObjectByName('vanity-mirror-north') as Mesh;
    const mSouth = vanityGroup.getObjectByName('vanity-mirror-south') as Mesh;
    expect(mNorth.rotation.x).toBeCloseTo(Math.PI / 2, 3);
    expect(mSouth.rotation.x).toBeCloseTo(Math.PI / 2, 3);
    expect(mNorth.position.z).toBeCloseTo(vv.zMin + 0.08, 2);
    expect(vanityGroup.getObjectByName('vanity-globe-0')).toBeDefined();
    expect(vanityGroup.getObjectByName('vanity-globe-3')).toBeDefined();

    // Ceiling fans removed + dispose check
    expect(built.group.getObjectByName('living-room-ceiling-fan')).toBeUndefined();
    expect(built.group.getObjectByName('primary-bedroom-ceiling-fan')).toBeUndefined();
    const ceilingFansGroup = built.group.getObjectByName('tier2-ceiling-fans');
    expect(ceilingFansGroup).toBeDefined();
    expect(ceilingFansGroup?.children).toHaveLength(0);

    const sofaMesh = built.fixtures.creamSofa.children[0] as Mesh;
    const geomSpy = vi.spyOn(sofaMesh.geometry, 'dispose');
    const matSpy = vi.spyOn(sofaMesh.material as MeshStandardMaterial, 'dispose');
    const floorGeomSpy = vi.spyOn(built.roomFloors.livingRoom.geometry, 'dispose');

    built.dispose();
    expect(geomSpy).toHaveBeenCalled();
    expect(matSpy).toHaveBeenCalled();
    expect(rugTexSpy).toHaveBeenCalledTimes(1);
    expect(floorGeomSpy).toHaveBeenCalledTimes(1);
  });
});
