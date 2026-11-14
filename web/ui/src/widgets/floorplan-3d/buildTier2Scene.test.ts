import { Color, Mesh, type MeshStandardMaterial, type Object3D } from 'three';
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

    // Verify world-space UV formula u = (wx + 20.0) / 16.0, v = (wz + 12.6) / 16.0 on livingRoom floor
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

  it('builds cutaway and accent walls with exact colorHex values and 7-tread half-flight stairs to Tier 3', () => {
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

    // Verify forest-green West wall (#1f3b33) and North living room slate accent wall (#38434f)
    const greenWallBody = built.wallsById['primary-west-green-accent'].getObjectByName('primary-west-green-accent-body') as Mesh;
    expect((greenWallBody.material as MeshStandardMaterial).color.getHex()).toBe(0x1f3b33);
    const northSlateBody = built.wallsById['north-living-accent'].getObjectByName('north-living-accent-body') as Mesh;
    expect((northSlateBody.material as MeshStandardMaterial).color.getHex()).toBe(0x38434f);

    // Verify 7-tread stairsUpToTier3 rising -Z with railings, bottom safety gate, and upper Tier 3 Kitchen portal
    expect(built.stairsUpGroup.name).toBe('stairsUpToTier3');
    expect(built.stairsUpGroup.userData.stepCount).toBe(7);
    expect(built.stairsUpGroup.userData.direction).toBe('-z');
    for (let i = 0; i < 7; i += 1) {
      const tread = built.stairsUpGroup.getObjectByName(`tier2-stair-tread-${i}`) as Mesh;
      expect(tread).toBeInstanceOf(Mesh);
      expect(tread.material).toBe(built.materials.woodFloor);
    }
    expect(built.stairsUpGroup.getObjectByName('stairs-safety-gate')).toBeDefined();
    expect(built.stairsUpGroup.getObjectByName('tier3-kitchen-doorway-portal')).toBeDefined();
    expect(built.stairwellVoidGroup.name).toBe('stairwellVoidFromTier1');

    built.dispose();
  });

  it('builds all 29 fixture-<id> groups with required architectural details and disposes all geometries/materials cleanly', () => {
    const built = buildTier2Scene({ background: null });
    expect(built.scene.background).toBeNull();

    const fixtureKeys = Object.keys(TIER2_LAYOUT_SPEC.fixtures) as Tier2FixtureKey[];
    expect(fixtureKeys).toHaveLength(29);

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

    // Check frameless walk-in glass shower opacity 0.32
    const showerGroup = built.fixtures.walkInGlassShower;
    const showerMeshes = showerGroup.children.filter((c: Object3D): c is Mesh => c instanceof Mesh);
    const hasGlassOpacity = showerMeshes.some((m: Mesh) => {
      const mat = m.material as MeshStandardMaterial;
      return mat.transparent && Math.abs(mat.opacity - 0.32) < 1e-3;
    });
    expect(hasGlassOpacity).toBe(true);

    // Check walnutDoubleVanity has 2 round mirrors and 4-globe vanity light
    const vanityGroup = built.fixtures.walnutDoubleVanity;
    expect(vanityGroup.getObjectByName('vanity-mirror-north')).toBeDefined();
    expect(vanityGroup.getObjectByName('vanity-mirror-south')).toBeDefined();
    expect(vanityGroup.getObjectByName('vanity-globe-0')).toBeDefined();
    expect(vanityGroup.getObjectByName('vanity-globe-3')).toBeDefined();

    // Check ceiling fans in Living Room and Primary Bedroom
    expect(built.group.getObjectByName('living-room-ceiling-fan')).toBeDefined();
    expect(built.group.getObjectByName('primary-bedroom-ceiling-fan')).toBeDefined();

    // Verify dispose() cleans up geometries and materials
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
