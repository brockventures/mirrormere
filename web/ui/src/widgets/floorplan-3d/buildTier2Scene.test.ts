import { Box3, Color, Mesh, type MeshStandardMaterial, type Object3D } from 'three';
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

    // Verify forest-green North primary bedroom wall (#1f3b33) and North living room slate accent wall (#38434f)
    const greenWallBody = built.wallsById['primary-west-green-accent'].getObjectByName('primary-west-green-accent-body') as Mesh;
    expect((greenWallBody.material as MeshStandardMaterial).color.getHex()).toBe(0x1f3b33);
    const northSlateBody = built.wallsById['north-living-accent'].getObjectByName('north-living-accent-body') as Mesh;
    expect((northSlateBody.material as MeshStandardMaterial).color.getHex()).toBe(0x38434f);

    // Verify glazed windows on Living West, Play Nook South (x: -18.5..-12.5), and frosted East window in Primary Bath
    expect(built.shellGroup.getObjectByName('living-west-window')).toBeDefined();
    const southWin = built.shellGroup.getObjectByName('south-bench-window');
    expect(southWin).toBeDefined();
    const southWinBox = new Box3().setFromObject(southWin!);
    expect(southWinBox.min.x).toBeCloseTo(-18.5, 2);
    expect(southWinBox.max.x).toBeCloseTo(-12.5, 2);
    const bathWin = built.shellGroup.getObjectByName('primary-bath-east-window');
    expect(bathWin).toBeDefined();
    const bathWinGlass = built.shellGroup.getObjectByName('primary-bath-east-window-glass') as Mesh;
    expect(bathWinGlass).toBeInstanceOf(Mesh);
    expect(bathWinGlass.position.x).toBeCloseTo(23.4, 2);
    expect((bathWinGlass.material as MeshStandardMaterial).transparent).toBe(true);

    // Verify 7-tread stairsUpToTier3 (without floating Tier 3 portal) and sunken stairwellVoidFromTier1
    expect(built.stairsUpGroup.userData.stepCount).toBe(7);
    expect(built.stairsUpGroup.userData.direction).toBe('-z');
    for (let i = 0; i < 7; i += 1) {
      const tread = built.stairsUpGroup.getObjectByName(`tier2-stair-tread-${i}`) as Mesh;
      expect(tread).toBeInstanceOf(Mesh);
      expect(tread.material).toBe(built.materials.woodFloor);
    }
    expect(built.stairsUpGroup.getObjectByName('stairs-safety-gate')).toBeDefined();
    expect(built.stairsUpGroup.getObjectByName('tier3-kitchen-doorway-portal')).toBeUndefined();

    const vd = TIER2_LAYOUT_SPEC.stairwellVoidFromTier1;
    expect(built.stairwellVoidGroup.getObjectByName('stairwell-void-well')).toBeUndefined();
    const voidBottom = built.stairwellVoidGroup.getObjectByName('stairwell-void-bottom') as Mesh;
    expect(voidBottom).toBeInstanceOf(Mesh);
    expect(new Box3().setFromObject(voidBottom).min.y).toBeCloseTo(-2.2, 2);
    for (let i = 0; i < 4; i += 1) {
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
    expect(eastRail.position.x).toBeCloseTo(vd.xMax, 2);
    expect(built.stairwellVoidGroup.getObjectByName('void-rail-west-0.8')).toBeUndefined();

    built.dispose();
  });

  it('builds all 27 audited fixtures with corrected orientations, open-top glass shower, SW walk-in closet, no ceiling fans, and clean disposal', () => {
    const built = buildTier2Scene({ background: null });
    expect(built.scene.background).toBeNull();

    const fixtureKeys = Object.keys(TIER2_LAYOUT_SPEC.fixtures) as Tier2FixtureKey[];
    expect(fixtureKeys).toHaveLength(27);
    expect(built.group.getObjectByName('fixture-southWindowBench')).toBeUndefined();
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

    // 1. Living & Play Nook: vertical pastel ovals on canvas, South wall 2x2 prints inside wall face, beige/mesh playard (opacity 0.35)
    const oval0 = built.fixtures.pastelOvalWallArt.getObjectByName('pastel-oval-0') as Mesh;
    expect(oval0.rotation.x).toBeCloseTo(Math.PI / 2, 3);
    const nookFrame = built.fixtures.cubeStorageShelves.getObjectByName('nook-grid-frame-0-0') as Mesh;
    expect(nookFrame.position.z).toBeCloseTo(TIER2_LAYOUT_SPEC.fixtures.cubeStorageShelves.zMax, 2);
    expect(new Box3().setFromObject(nookFrame).max.z).toBeLessThanOrEqual(10.78);

    const benchMeshes = built.fixtures.westWindowBench.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
    expect(benchMeshes.some((m) => (m.material as MeshStandardMaterial).color.getHex() === 0xb8bcc2)).toBe(true);

    // 2. Hallway East world-map wall art
    const hm = TIER2_LAYOUT_SPEC.fixtures.hallwayCabinetAndMap;
    const worldMap = built.fixtures.hallwayCabinetAndMap.getObjectByName('world-map-wall-art') as Mesh;
    expect(worldMap.position.x).toBeCloseTo(hm.xMax - 0.08, 2);

    // 3. Primary Bedroom: North green wall gold tree-of-life art, West changing dresser accessories, SW walk-in closet
    const bs = TIER2_LAYOUT_SPEC.fixtures.bedsideBassinet;
    const treeArt = built.fixtures.bedsideBassinet.getObjectByName('gold-tree-of-life-art') as Mesh;
    expect(treeArt.rotation.x).toBeCloseTo(Math.PI / 2, 3);
    expect(treeArt.position.z).toBeCloseTo(bs.zMin + 0.08, 2);
    expect(built.fixtures.northWoodDresser.getObjectByName('changing-dresser-mirror')).toBeDefined();
    expect(built.fixtures.northWoodDresser.getObjectByName('baseball-cap-rack')).toBeDefined();
    expect(built.fixtures.northWoodDresser.getObjectByName('fiddle-leaf-fig-plant')).toBeDefined();
    const closet = built.group.getObjectByName('sw-walk-in-closet');
    expect(closet).toBeDefined();
    const closetBox = new Box3().setFromObject(closet!);
    expect(closetBox.min.x).toBeGreaterThanOrEqual(4.8 - 1e-4);
    expect(closetBox.max.x).toBeLessThanOrEqual(8.2 + 1e-4);
    expect(closetBox.min.z).toBeGreaterThanOrEqual(2.8 - 1e-4);
    expect(closetBox.max.z).toBeLessThanOrEqual(10.6 + 1e-4);

    // 4. Primary Bath: open-top walkInGlassShower (no full ceiling slab; thin 0.06 headers on xMax & zMax) + North double vanity
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
    const eastHeader = showerGroup.getObjectByName('shower-header-east') as Mesh;
    const southHeader = showerGroup.getObjectByName('shower-header-south') as Mesh;
    expect(eastHeader.position.x).toBeCloseTo(sh.xMax - 0.03, 2);
    expect(southHeader.position.z).toBeCloseTo(sh.zMax - 0.03, 2);

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
    expect(floorGeomSpy).toHaveBeenCalledTimes(1);
  });
});
