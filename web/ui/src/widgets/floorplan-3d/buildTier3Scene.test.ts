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

    // 4. Nook west window (full height y 1.8..6.0 inside west-nook-wall cutout) + roller shade valance (y 5.7..6.02)
    const westWall = built.wallsById['west-nook-wall'];
    expect(westWall.getObjectByName('west-nook-wall-sill')).toBeInstanceOf(Mesh);
    expect(westWall.getObjectByName('west-nook-wall-header')).toBeInstanceOf(Mesh);
    const westHeaderBox = new Box3().setFromObject(westWall.getObjectByName('west-nook-wall-header')!);
    expect(westHeaderBox.min.y).toBeCloseTo(6.0, 2);
    expect(westHeaderBox.max.y).toBeCloseTo(6.53, 2);
    const nookWestWin = built.shellGroup.getObjectByName('nook-west-window')!;
    const nwwBox = new Box3().setFromObject(nookWestWin);
    expect(nwwBox.min.z).toBeCloseTo(-1.35, 2);
    expect(nwwBox.max.z).toBeCloseTo(8.35, 2);
    expect(nwwBox.min.y).toBeCloseTo(1.8, 2);
    expect(nwwBox.max.y).toBeCloseTo(6.02, 2);
    const valanceBox = new Box3().setFromObject(nookWestWin.getObjectByName('nook-west-roller-valance')!);
    expect(valanceBox.min.y).toBeCloseTo(5.7, 2);
    expect(valanceBox.max.y).toBeCloseTo(6.02, 2);

    // 5. Rosie north full-height double French patio doors (y 0..6.1, no sill wall) + full-length blush-pink curtains (#d8b6bc)
    const rosieWall = built.wallsById['north-rosie-mint'];
    expect(rosieWall.getObjectByName('north-rosie-mint-sill')).toBeUndefined();
    expect(rosieWall.getObjectByName('north-rosie-mint-header')).toBeInstanceOf(Mesh);
    const rosieDoors = built.shellGroup.getObjectByName('rosie-north-french-doors')!;
    expect(rosieDoors).toBeDefined();
    expect(built.shellGroup.getObjectByName('rosie-north-window')).toBeUndefined();
    const rosieThresholdBox = new Box3().setFromObject(rosieDoors.getObjectByName('rosie-north-french-doors-threshold')!);
    expect(rosieThresholdBox.min.x).toBeCloseTo(14.4, 2);
    expect(rosieThresholdBox.max.x).toBeCloseTo(20.4, 2);
    expect(rosieThresholdBox.min.y).toBeCloseTo(0.0, 2);
    const rosieHeaderBox = new Box3().setFromObject(rosieDoors.getObjectByName('rosie-north-french-doors-header')!);
    expect(rosieHeaderBox.max.y).toBeCloseTo(6.1, 2);
    expect(rosieDoors.getObjectByName('rosie-north-french-doors-glass-w')).toBeInstanceOf(Mesh);
    expect(rosieDoors.getObjectByName('rosie-north-french-doors-glass-e')).toBeInstanceOf(Mesh);
    expect(rosieDoors.getObjectByName('rosie-north-french-doors-mullion-w')).toBeInstanceOf(Mesh);
    expect(rosieDoors.getObjectByName('rosie-north-french-doors-mullion-e')).toBeInstanceOf(Mesh);
    const rosieHandleW = rosieDoors.getObjectByName('rosie-north-french-doors-handle-w-int') as Mesh;
    expect(rosieHandleW).toBeInstanceOf(Mesh);
    expect(rosieHandleW.material).toBe(built.materials.matteBlackIron);
    expect(rosieDoors.getObjectByName('rosie-north-french-doors-handle-e-int')).toBeInstanceOf(Mesh);

    const rosieCurtain = built.shellGroup.getObjectByName('rosie-north-curtain-west') as Mesh;
    expect(rosieCurtain).toBeInstanceOf(Mesh);
    expect((rosieCurtain.material as MeshStandardMaterial).color.getHex()).toBe(0xd8b6bc);
    const rosieCurtainBox = new Box3().setFromObject(rosieCurtain);
    expect(rosieCurtainBox.min.y).toBeCloseTo(0.05, 2);
    expect(rosieCurtainBox.max.y).toBeCloseTo(6.2, 2);
    expect(built.shellGroup.getObjectByName('rosie-north-curtain-east')).toBeInstanceOf(Mesh);

    // 6. Isaac east window + warm peach curtains (#e2b695)
    const isaacCurtain = built.shellGroup.getObjectByName('isaac-east-curtain-north') as Mesh;
    expect(isaacCurtain).toBeInstanceOf(Mesh);
    expect((isaacCurtain.material as MeshStandardMaterial).color.getHex()).toBe(0xe2b695);
    expect(built.shellGroup.getObjectByName('isaac-east-curtain-south')).toBeInstanceOf(Mesh);

    // 7. Kids' bedroom doors (white framed panel + jambs + matte-black lever handles, ~75 deg ajar inward)
    const rosieDoor = built.shellGroup.getObjectByName('rosie-bedroom-door')!;
    expect(rosieDoor).toBeDefined();
    expect(rosieDoor.getObjectByName('rosie-bedroom-door-jamb-n')).toBeInstanceOf(Mesh);
    expect(rosieDoor.getObjectByName('rosie-bedroom-door-jamb-s')).toBeInstanceOf(Mesh);
    expect(rosieDoor.getObjectByName('rosie-bedroom-door-panel')).toBeInstanceOf(Mesh);
    const rosieDoorHandle = rosieDoor.getObjectByName('rosie-bedroom-door-handle-front') as Mesh;
    expect(rosieDoorHandle).toBeInstanceOf(Mesh);
    expect(rosieDoorHandle.material).toBe(built.materials.matteBlackIron);
    const rosieDoorLeaf = rosieDoor.getObjectByName('rosie-bedroom-door-leaf')!;
    expect(rosieDoorLeaf.rotation.y).toBeCloseTo((15 * Math.PI) / 180, 4);
    const rosieDoorBox = new Box3().setFromObject(rosieDoor);
    expect(rosieDoorBox.min.z).toBeCloseTo(-0.4, 2);
    expect(rosieDoorBox.max.z).toBeCloseTo(2.0, 2);
    expect(rosieDoorBox.max.x).toBeGreaterThan(13.5);
    expect(rosieDoorBox.max.y).toBeCloseTo(6.2, 2);

    const isaacDoor = built.shellGroup.getObjectByName('isaac-bedroom-door')!;
    expect(isaacDoor).toBeDefined();
    expect(isaacDoor.getObjectByName('isaac-bedroom-door-jamb-w')).toBeInstanceOf(Mesh);
    expect(isaacDoor.getObjectByName('isaac-bedroom-door-jamb-e')).toBeInstanceOf(Mesh);
    expect(isaacDoor.getObjectByName('isaac-bedroom-door-panel')).toBeInstanceOf(Mesh);
    const isaacDoorHandle = isaacDoor.getObjectByName('isaac-bedroom-door-handle-front') as Mesh;
    expect(isaacDoorHandle).toBeInstanceOf(Mesh);
    expect(isaacDoorHandle.material).toBe(built.materials.matteBlackIron);
    const isaacDoorLeaf = isaacDoor.getObjectByName('isaac-bedroom-door-leaf')!;
    expect(isaacDoorLeaf.rotation.y).toBeCloseTo(-(75 * Math.PI) / 180, 4);
    const isaacDoorBox = new Box3().setFromObject(isaacDoor);
    expect(isaacDoorBox.min.x).toBeCloseTo(8.6, 2);
    expect(isaacDoorBox.max.x).toBeCloseTo(11.8, 2);
    expect(isaacDoorBox.max.z).toBeGreaterThan(6.2);
    expect(isaacDoorBox.max.z).toBeLessThan(7.0);
    expect(isaacDoorBox.max.y).toBeCloseTo(6.2, 2);

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

    // Balanced lighting: 1 HemisphereLight, 1 DirectionalLight with full Floor 3 shadow frustum, 4 PointLights
    const lightsGroup = built.shellGroup.getObjectByName('tier3-lights')!;
    let hemiLight: HemisphereLight | undefined;
    let sunLight: DirectionalLight | undefined;
    let hemiCount = 0;
    let dirCount = 0;
    let pointCount = 0;
    lightsGroup.traverse((obj: Object3D) => {
      if (obj instanceof HemisphereLight) {
        hemiCount += 1;
        hemiLight = obj;
      }
      if (obj instanceof DirectionalLight) {
        dirCount += 1;
        sunLight = obj;
      }
      if (obj instanceof PointLight) pointCount += 1;
    });
    expect(hemiCount).toBe(1);
    expect(dirCount).toBe(1);
    expect(pointCount).toBe(4);
    expect(hemiLight!.intensity).toBeCloseTo(1.05, 4);
    expect(sunLight!.intensity).toBeCloseTo(1.1, 4);
    expect(sunLight!.castShadow).toBe(true);
    expect(sunLight!.shadow.mapSize.x).toBe(2048);
    expect(sunLight!.shadow.mapSize.y).toBe(2048);
    expect(sunLight!.shadow.camera.left).toBe(-28);
    expect(sunLight!.shadow.camera.right).toBe(28);
    expect(sunLight!.shadow.camera.top).toBe(20);
    expect(sunLight!.shadow.camera.bottom).toBe(-20);
    expect(sunLight!.shadow.camera.near).toBe(2);
    expect(sunLight!.shadow.camera.far).toBe(65);
    expect(sunLight!.shadow.bias).toBeCloseTo(-0.0006, 6);
    expect(sunLight!.shadow.normalBias).toBeCloseTo(0.04, 4);
    expect(sunLight!.shadow.radius).toBeCloseTo(2.5, 4);

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

    for (const backId of ['north-nook-patio', 'north-kitchen', 'north-hall-bath', 'north-rosie-mint', 'west-nook-wall', 'east-rosie-mint']) {
      const box = new Box3().setFromObject(built.wallsById[backId]);
      expect(box.max.y).toBeCloseTo(6.6, 2);
    }

    for (const cutawayId of ['south-isaac-cutaway']) {
      const box = new Box3().setFromObject(built.wallsById[cutawayId]);
      expect(box.max.y).toBeCloseTo(1.8, 2);
    }

    for (const halfId of [
      'south-nook-wall', 'south-kitchen-wall', 'east-isaac-navy',
      'kitchen-bath-west', 'hall-bath-south', 'bath-rosie-divider',
      'pantry-north-wall', 'pantry-back-divider',
      'isaac-closet-north',
      'rosie-isaac-divider', 'rosie-closet-west',
    ]) {
      const box = new Box3().setFromObject(built.wallsById[halfId]);
      expect(box.max.y).toBeCloseTo(2.2, 2);
    }

    expect(built.shellGroup.getObjectByName('isaac-east-window')).toBeUndefined();
    expect(built.shellGroup.getObjectByName('isaac-east-curtain-north')).toBeUndefined();
    expect(built.shellGroup.getObjectByName('nook-patio-door')).toBeDefined();
    expect(built.shellGroup.getObjectByName('nook-west-window')).toBeDefined();
    expect(built.shellGroup.getObjectByName('kitchen-sink-window')).toBeDefined();
    expect(built.shellGroup.getObjectByName('rosie-north-french-doors')).toBeDefined();
    expect(new Box3().setFromObject(built.shellGroup.getObjectByName('rosie-bedroom-door')!).max.y).toBeCloseTo(2.2, 2);
    expect(new Box3().setFromObject(built.shellGroup.getObjectByName('isaac-bedroom-door')!).max.y).toBeCloseTo(2.2, 2);
    expect(new Box3().setFromObject(built.stairsDownGroup.getObjectByName('tier3-stair-jamb-w')!).max.y).toBeCloseTo(2.6, 2);

    built.dispose();
  });
});
