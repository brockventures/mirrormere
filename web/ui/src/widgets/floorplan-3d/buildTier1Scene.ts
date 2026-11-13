import { Color, Scene, type Group, type Mesh } from 'three';
import { buildTier1Fixtures } from './tier1Fixtures';
import { TIER1_HA_BINDINGS, TIER1_ROOMS, type FixtureId, type HaBindingKey, type RoomId } from './tier1LayoutSpec';
import { buildTier1Shell, createTier1Materials, type Tier1ShellLights } from './tier1Shell';

export interface Tier1EntityStateLike {
  state: string;
  attributes?: Record<string, unknown>;
}

export type Tier1EntityMap = Readonly<Record<string, Tier1EntityStateLike | string | undefined>>;

export interface BuildTier1SceneOptions {
  showUpperTiers?: boolean;
  background?: string | null;
  entityBindings?: Partial<Readonly<Record<HaBindingKey, string>>>;
  initialEntities?: Tier1EntityMap;
}

export interface Tier1SceneBuildResult {
  scene: Scene;
  rooms: Readonly<Record<RoomId, Mesh>>;
  fixtures: Readonly<Record<FixtureId, Group>>;
  lights: Tier1ShellLights;
  upperTiersGroup: Group;
  setUpperTiersVisible: (visible: boolean) => void;
  updateEntities: (states: Tier1EntityMap) => void;
  dispose: () => void;
}

const BASE_ROOM_INTENSITY: Readonly<Record<RoomId, number>> = { office: 0.85, foyer: 0.75, garage: 0.95 };
const ROOM_LIGHT_KEYS: ReadonlyArray<readonly [RoomId, HaBindingKey]> = [
  ['office', 'officeLight'],
  ['foyer', 'foyerLight'],
  ['garage', 'garageLight'],
];

function resolveState(
  states: Tier1EntityMap,
  key: HaBindingKey,
  overrides?: Partial<Readonly<Record<HaBindingKey, string>>>,
): Tier1EntityStateLike | undefined {
  const raw = states[overrides?.[key] ?? TIER1_HA_BINDINGS[key].defaultEntityId] ?? states[key];
  if (raw === undefined) return undefined;
  return typeof raw === 'string' ? { state: raw } : raw;
}

export function buildTier1Scene(options: BuildTier1SceneOptions = {}): Tier1SceneBuildResult {
  const palette = createTier1Materials();
  const shell = buildTier1Shell(palette);
  const fixturesBuilt = buildTier1Fixtures(palette);

  const scene = new Scene();
  scene.name = 'hearth-tier1-scene';
  scene.background = options.background === null ? null : new Color(options.background ?? '#13171e');
  for (const roomId of ['office', 'foyer', 'garage'] as const) {
    shell.floors[roomId].userData = { room: roomId, label: TIER1_ROOMS[roomId].label };
  }
  scene.add(shell.root, fixturesBuilt.root);
  shell.setUpperMassingVisible(Boolean(options.showUpperTiers));
  scene.updateMatrixWorld(true);

  const { indicators } = fixturesBuilt;
  const updateEntities = (states: Tier1EntityMap): void => {
    for (const [roomId, bindingKey] of ROOM_LIGHT_KEYS) {
      const entry = resolveState(states, bindingKey, options.entityBindings);
      if (!entry) continue;
      const isOn = entry.state.toLowerCase() === 'on';
      const rawBri = entry.attributes?.brightness;
      const bri = typeof rawBri === 'number' ? Math.max(0.1, Math.min(1, rawBri / 255)) : 1;
      shell.lights.roomPoints[roomId].intensity = isOn ? Number((BASE_ROOM_INTENSITY[roomId] * 1.5 * bri).toFixed(3)) : 0;
      if (roomId === 'office') indicators.officeScreenMat.emissiveIntensity = isOn ? 0.65 : 0.12;
    }

    const temp = resolveState(states, 'officeTemp', options.entityBindings);
    if (temp) {
      const unit = typeof temp.attributes?.unit_of_measurement === 'string' ? temp.attributes.unit_of_measurement : '';
      shell.floors.office.userData.temperature = `${temp.state}${unit}`;
    }

    const washerRun = resolveState(states, 'washerRunning', options.entityBindings);
    const washerPow = resolveState(states, 'washerPower', options.entityBindings);
    if (washerRun || washerPow) {
      const watts = washerPow ? Number.parseFloat(washerPow.state) : 0;
      const active = washerRun?.state.toLowerCase() === 'on' || (Number.isFinite(watts) && watts > 5);
      indicators.washerStatusMat.color.set(active ? '#39d353' : '#4b535d');
      indicators.washerStatusMat.emissiveIntensity = active ? 0.85 : 0.05;
      fixturesBuilt.fixtures['garage-washer-dryer'].userData.status = active ? 'running' : 'idle';
    }

    const printer = resolveState(states, 'printerState', options.entityBindings);
    if (printer) {
      const st = printer.state.toLowerCase();
      const printing = st === 'printing' || st === 'heating' || st === 'active' || st === 'on';
      indicators.printerStatusMat.color.set(printing ? '#38bdf8' : '#334155');
      indicators.printerStatusMat.emissiveIntensity = printing ? 0.9 : 0.08;
      fixturesBuilt.fixtures['garage-ender3-printer'].userData.status = st;
    }

    const garageDoor = resolveState(states, 'garageDoor', options.entityBindings);
    if (garageDoor) {
      const open = garageDoor.state.toLowerCase() === 'open' || garageDoor.state.toLowerCase() === 'opening';
      indicators.garageThresholdStatusMat.color.set(open ? '#f59e0b' : '#2b3038');
      indicators.garageThresholdStatusMat.emissive.set(open ? '#d97706' : '#000000');
      indicators.garageThresholdStatusMat.emissiveIntensity = open ? 0.75 : 0;
      fixturesBuilt.fixtures['garage-south-threshold'].userData.status = garageDoor.state.toLowerCase();
    }
  };

  if (options.initialEntities) updateEntities(options.initialEntities);

  return {
    scene,
    rooms: shell.floors,
    fixtures: fixturesBuilt.fixtures,
    lights: shell.lights,
    upperTiersGroup: shell.upperMassingGroup,
    setUpperTiersVisible: shell.setUpperMassingVisible,
    updateEntities,
    dispose: () => {
      shell.dispose();
      fixturesBuilt.dispose();
      palette.dispose();
    },
  };
}
