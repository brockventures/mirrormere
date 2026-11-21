import { Box3, Color, DirectionalLight, HemisphereLight, Mesh, PointLight, type MeshStandardMaterial, type Object3D } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { buildTier3Scene, type BuiltTier3Scene, type Tier3SceneMaterials } from './buildTier3Scene';
import { TIER3_LAYOUT_SPEC, type Tier3FixtureKey, type Tier3RoomId } from './tier3LayoutSpec';

describe('buildTier3Scene — Floor 3 North 3D Scene, Materials, Windows, Safety Gate & Fixtures', () => {
  it('builds tier3-shell, foundation plinth, all 6 room-<id> groups with honey oak and slate-tile floors, and world-space UVs', () => {
    const built: BuiltTier3Scene = buildTier3Scene();
    const materials: Tier3SceneMaterials = built.materials;
    expect(materials.woodFloor).toBe(materials.oakFloor);
    expect(built.shellGroup.name).toBe('tier3-shell');
    expect(built.group.getObjectByName('tier3-shell')).toBe(built.shellGroup);
    expect(built.shellGroup.getObjectByName('tier3-plinth')).toBeInstanceOf(Mesh);

    const roomIds = Object.keys(TIER3_LAYOUT_SPEC.rooms) as Tier3RoomId[];
    expect(roomIds).toHaveLength(6);

    for (const roomId of roomIds) {
      const roomGroup = built.rooms[roomId];
      expect(roomGroup.name).toBe(`room-${roomId}`);
      expect(built.group.getObjectByName(`room-${roomId}`)).toBe(roomGroup);

      const floorMesh = built.roomFloors[roomId];
      expect(floorMesh).toBeInstanceOf(Mesh);
      if (roomId === 'hallBath') {
        expect(floorMesh.material).toBe(built.materials.slateTileFloor);
        const slateHex = (floorMesh.material as MeshStandardMaterial).color.getHexString();
        expect(slateHex).toBe(new Color(0x32363b).getHexString());
      } else {
        expect(floorMesh.material).toBe(built.materials.woodFloor);
      }
    }

    const kitchenFloor = built.roomFloors.kitchen;
    const pos = kitchenFloor.geometry.attributes.position;
    const uv = kitchenFloor.geometry.attributes.uv;
    const bounds = TIER3_LAYOUT_SPEC.rooms.kitchen.bounds;
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

  it('splits exterior siding on perimeter walls, preserves Rosie mint-teal and Isaac slate-navy accents, and cuts all 6 window/door apertures', () => {
    const built = buildTier3Scene();

    for (const wallSpec of TIER3_LAYOUT_SPEC.walls) {
      const wg = built.wallsById[wallSpec.id];
      expect(wg).toBeDefined();
      const bodyMesh = wg.getObjectByName(`${wallSpec.id}-body`) as Mesh;
      expect(bodyMesh).toBeInstanceOf(Mesh);
      if (wallSpec.colorHex !== undefined) {
        expect((bodyMesh.material as MeshStandardMaterial).color.getHex()).toBe(wallSpec.colorHex);
      }
      const extBody = wg.getObjectByName(`${wallSpec.id}-body-ext`) as Mesh | undefined;
      if (wallSpec.exteriorFace) {
        expect(extBody).toBeInstanceOf(Mesh);
        expect(extBody!.material).toBe(built.materials.exteriorSiding);
        if (wallSpec.exteriorFace === 'west') expect(extBody!.position.x).toBeLessThan(bodyMesh.position.x);
        if (wallSpec.exteriorFace === 'east') expect(extBody!.position.x).toBeGreaterThan(bodyMesh.position.x);
        if (wallSpec.exteriorFace === 'north') expect(extBody!.position.z).toBeLessThan(bodyMesh.position.z);
        if (wallSpec.exteriorFace === 'south') expect(extBody!.position.z).toBeGreaterThan(bodyMesh.position.z);
      } else {
        expect(extBody).toBeUndefined();
      }
    }

    // Rosie mint-teal (#42a88c) and Isaac slate-navy (#2f5573)
    const rosieNorthBody = built.wallsById['north-rosie-mint'].getObjectByName('north-rosie-mint-body') as Mesh;
    expect((rosieNorthBody.material as MeshStandardMaterial).color.getHex()).toBe(0x42a88c);
    const isaacEastBody = built.wallsById['east-isaac-navy'].getObjectByName('east-isaac-navy-body') as Mesh;
    expect((isaacEastBody.material as MeshStandardMaterial).color.getHex()).toBe(0x2f5573);

    // 1. Patio sliding glass door on north-nook-patio (y 0..6.1, no sill, header above 6.1, 2 panels, valance, doormat)
    const patioWall = built.wallsById['north-nook-patio'];
    expect(patioWall.getObjectByName('north-nook-patio-sill')).toBeUndefined();
    expect(patioWall.getObjectByName('north-nook-patio-header')).toBeInstanceOf(Mesh);
    const patioDoor = built.shellGroup.getObjectByName('nook-patio-door')!;
    expect(patioDoor).toBeDefined();
    const patioBox = new Box3().setFromObject(patioDoor);
    expect(patioBox.min.x).toBeCloseTo(-18.7, 2);
    expect(patioBox.max.x).toBeCloseTo(-10.3, 2);
    expect(patioBox.max.y).toBeCloseTo(6.16, 2);
    const patioSillBox = new Box3().setFromObject(patioDoor.getObjectByName('nook-patio-door-sill')!);
    expect(patioSillBox.min.x).toBeCloseTo(-18.5, 2);
    expect(patioSillBox.max.x).toBeCloseTo(-10.5, 2);
    expect(patioDoor.getObjectByName('nook-patio-door-mullion-1')).toBeInstanceOf(Mesh);
    expect(patioDoor.getObjectByName('nook-patio-valance')).toBeInstanceOf(Mesh);
    expect(patioDoor.getObjectByName('nook-patio-doormat')).toBeInstanceOf(Mesh);

    // 2. Kitchen sink window (shifted to x -5.0..-1.8 directly over sink)
    const kitchenWin = built.shellGroup.getObjectByName('kitchen-sink-window')!;
    const kwBox = new Box3().setFromObject(kitchenWin);
    expect(kwBox.min.x).toBeCloseTo(-5.0, 2);
    expect(kwBox.max.x).toBeCloseTo(-1.8, 2);
    expect(kwBox.min.y).toBeCloseTo(3.3, 2);
    expect(kwBox.max.y).toBeCloseTo(5.5, 2);
    const kitchenSillBox = new Box3().setFromObject(built.wallsById['north-kitchen'].getObjectByName('north-kitchen-sill')!);
    expect(kitchenSillBox.min.x).toBeCloseTo(-5.0, 2);
    expect(kitchenSillBox.max.x).toBeCloseTo(-1.8, 2);

    // 3. Hall bath frosted clerestory window
    const bathWinGlass = built.shellGroup.getObjectByName('hall-bath-clerestory-window-glass') as Mesh;
    expect(bathWinGlass).toBeInstanceOf(Mesh);
    expect((bathWinGlass.material as MeshStandardMaterial).transparent).toBe(true);
    const bathWinBox = new Box3().setFromObject(built.shellGroup.getObjectByName('hall-bath-clerestory-window')!);
    expect(bathWinBox.min.y).toBeCloseTo(4.2, 2);
    expect(bathWinBox.max.y).toBeCloseTo(5.8, 2);

    // 4. Nook west window + roller shade valance
    const nookWestWin = built.shellGroup.getObjectByName('nook-west-window')!;
    const nwwBox = new Box3().setFromObject(nookWestWin);
    expect(nwwBox.min.z).toBeCloseTo(-1.35, 2);
    expect(nwwBox.max.z).toBeCloseTo(8.35, 2);
    expect(nwwBox.min.y).toBeCloseTo(1.8, 2);
    expect(nwwBox.max.y).toBeCloseTo(4.52, 2);
    expect(nookWestWin.getObjectByName('nook-west-roller-valance')).toBeInstanceOf(Mesh);

    // 5. Rosie north window + blush-pink curtains (#d8b6bc)
    const rosieCurtain = built.shellGroup.getObjectByName('rosie-north-curtain-west') as Mesh;
    expect(rosieCurtain).toBeInstanceOf(Mesh);
    expect((rosieCurtain.material as MeshStandardMaterial).color.getHex()).toBe(0xd8b6bc);
    expect(built.shellGroup.getObjectByName('rosie-north-curtain-east')).toBeInstanceOf(Mesh);

    // 6. Isaac east window + warm peach curtains (#e2b695)
    const isaacCurtain = built.shellGroup.getObjectByName('isaac-east-curtain-north') as Mesh;
    expect(isaacCurtain).toBeInstanceOf(Mesh);
    expect((isaacCurtain.material as MeshStandardMaterial).color.getHex()).toBe(0xe2b695);
    expect(built.shellGroup.getObjectByName('isaac-east-curtain-south')).toBeInstanceOf(Mesh);

    built.dispose();
  });

  it('builds stair arrival doorway with jambs, matte-black child safety gate, 3 descending hint treads, balanced lights, 22 fixtures & clean disposal', () => {
    const built = buildTier3Scene({ background: null });
    expect(built.scene.background).toBeNull();

    // Stair doorway jambs, safety gate (y 0..2.6), and 3 descending treads (z 11.0..12.2)
    const jambW = built.stairsDownGroup.getObjectByName('tier3-stair-jamb-w') as Mesh;
    const jambE = built.stairsDownGroup.getObjectByName('tier3-stair-jamb-e') as Mesh;
    expect(jambW.material).toBe(built.materials.whiteTrim);
    expect(jambE.material).toBe(built.materials.whiteTrim);

    const gate = built.stairsDownGroup.getObjectByName('tier3-safety-gate')!;
    const gateBox = new Box3().setFromObject(gate);
    expect(gateBox.min.y).toBeCloseTo(0.0, 2);
    expect(gateBox.max.y).toBeCloseTo(2.6, 2);

    for (let i = 0; i < 3; i += 1) {
      const tread = built.stairsDownGroup.getObjectByName(`tier3-stair-hint-tread-${i}`) as Mesh;
      expect(tread).toBeInstanceOf(Mesh);
      expect(tread.material).toBe(built.materials.woodFloor);
      const tBox = new Box3().setFromObject(tread);
      expect(tBox.max.y).toBeLessThan(0);
      expect(tBox.min.z).toBeGreaterThanOrEqual(11.0 - 1e-4);
      expect(tBox.max.z).toBeLessThanOrEqual(12.2 + 1e-4);
    }

    // Balanced lighting: 1 HemisphereLight, 1 DirectionalLight, 4 PointLights
    const lightsGroup = built.shellGroup.getObjectByName('tier3-lights')!;
    let hemiCount = 0;
    let dirCount = 0;
    let pointCount = 0;
    lightsGroup.traverse((obj: Object3D) => {
      if (obj instanceof HemisphereLight) hemiCount += 1;
      if (obj instanceof DirectionalLight) dirCount += 1;
      if (obj instanceof PointLight) pointCount += 1;
    });
    expect(hemiCount).toBe(1);
    expect(dirCount).toBe(1);
    expect(pointCount).toBe(4);

    // 22 fixtures reparented into their room groups
    const fixtureKeys = Object.keys(TIER3_LAYOUT_SPEC.fixtures) as Tier3FixtureKey[];
    expect(fixtureKeys).toHaveLength(22);
    for (const key of fixtureKeys) {
      const fg = built.fixtures[key];
      expect(fg).toBeDefined();
      expect(built.rooms[TIER3_LAYOUT_SPEC.fixtures[key].roomId].getObjectByName(`fixture-${key}`)).toBe(fg);
    }
    expect(built.ceilingFansGroup.children).toHaveLength(0);
    expect(built.ceilingFansGroup.getObjectByName('rosie-ceiling-fan')).toBeUndefined();
    expect(built.ceilingFansGroup.getObjectByName('isaac-ceiling-fan')).toBeUndefined();

    const tableMesh = built.fixtures.diningTableSet.getObjectByName('dining-table-top') as Mesh;
    const geomSpy = vi.spyOn(tableMesh.geometry, 'dispose');
    const matSpy = vi.spyOn(tableMesh.material as MeshStandardMaterial, 'dispose');
    const floorGeomSpy = vi.spyOn(built.roomFloors.kitchen.geometry, 'dispose');

    built.dispose();
    expect(geomSpy).toHaveBeenCalled();
    expect(matSpy).toHaveBeenCalled();
    expect(floorGeomSpy).toHaveBeenCalledTimes(1);
  });

  it('supports half-wall mode capping interior, closet, south perimeter, and east-isaac-navy walls to 2.2 ft while keeping north back walls at 6.6 ft and cutaways at 1.8 ft', () => {
    const built = buildTier3Scene({ wallMode: 'half' });

    for (const backId of ['north-nook-patio', 'north-kitchen', 'north-hall-bath', 'north-rosie-mint', 'west-nook-north', 'east-rosie-mint']) {
      const box = new Box3().setFromObject(built.wallsById[backId]);
      expect(box.max.y).toBeCloseTo(6.6, 2);
    }

    for (const cutawayId of ['west-nook-window-cutaway', 'south-isaac-cutaway']) {
      const box = new Box3().setFromObject(built.wallsById[cutawayId]);
      expect(box.max.y).toBeCloseTo(1.8, 2);
    }

    for (const halfId of [
      'south-nook-wall', 'south-kitchen-wall', 'east-isaac-navy',
      'kitchen-bath-west', 'hall-bath-south', 'bath-rosie-divider', 'rosie-hall-west', 'rosie-isaac-divider',
      'rosie-closet-west', 'rosie-closet-north-w', 'rosie-closet-north-e',
      'upper-hall-south', 'pantry-closet-divider', 'pantry-south-return', 'kitchen-play-east',
      'isaac-closet-jamb-n', 'isaac-hall-west',
    ]) {
      const box = new Box3().setFromObject(built.wallsById[halfId]);
      expect(box.max.y).toBeCloseTo(2.2, 2);
    }

    expect(built.shellGroup.getObjectByName('isaac-east-window')).toBeUndefined();
    expect(built.shellGroup.getObjectByName('isaac-east-curtain-north')).toBeUndefined();
    expect(built.shellGroup.getObjectByName('nook-patio-door')).toBeDefined();
    expect(built.shellGroup.getObjectByName('kitchen-sink-window')).toBeDefined();
    expect(new Box3().setFromObject(built.stairsDownGroup.getObjectByName('tier3-stair-jamb-w')!).max.y).toBeCloseTo(2.6, 2);

    built.dispose();
  });
});
