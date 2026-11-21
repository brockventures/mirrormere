import './Floorplan3dWidget.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ACESFilmicToneMapping, PCFSoftShadowMap, PerspectiveCamera, Raycaster,
  SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type Object3D,
} from 'three';
import { useWidget } from '../../store/hooks';
import type { WidgetComponentProps } from '../registry';
import { buildTier1Scene, type Tier1EntityMap, type Tier1EntityStateLike } from './buildTier1Scene';
import { buildTier2Scene } from './buildTier2Scene';
import { buildTier3Scene, type Tier3WallMode } from './buildTier3Scene';
import {
  CAMERA_PRESETS, TIER1_FIXTURES, TIER1_HA_BINDINGS, TIER1_ROOMS,
  type CameraPresetId, type HaBindingKey, type RoomId,
} from './tier1LayoutSpec';
import { TIER2_LAYOUT_SPEC, type Tier2RoomId } from './tier2LayoutSpec';
import { TIER3_LAYOUT_SPEC, type Tier3RoomId } from './tier3LayoutSpec';

export type FloorTierId = 1 | 2 | 3;

declare global {
  interface Window {
    __setFloorplanPreset?: (preset: CameraPresetId) => void;
    __setFloorplanTier?: (tier: FloorTierId) => void;
    __floorplanSceneReady?: boolean;
  }
}

const PRESET_PILLS: ReadonlyArray<{ id: Exclude<CameraPresetId, 'stack3Tier'>; label: string }> = [
  { id: 'dollhouse', label: 'Tier 1 Overview' }, { id: 'office', label: 'Office' },
  { id: 'foyer', label: 'Foyer' }, { id: 'garage', label: 'Brock Studios' },
  { id: 'topdown', label: 'Top-Down Audit' },
];
const TIER2_PRESET_PILLS: ReadonlyArray<{ id: Exclude<CameraPresetId, 'stack3Tier'>; label: string }> = [
  { id: 'dollhouse', label: 'Tier 2 Overview' }, { id: 'office', label: 'Living & Play' },
  { id: 'foyer', label: 'Stair & Powder' }, { id: 'garage', label: 'Primary Suite' },
  { id: 'topdown', label: 'Top-Down Audit' },
];
const TIER3_PRESET_PILLS: ReadonlyArray<{ id: Exclude<CameraPresetId, 'stack3Tier'>; label: string }> = [
  { id: 'dollhouse', label: 'Tier 3 Overview' }, { id: 'office', label: 'Kitchen & Nook' },
  { id: 'foyer', label: 'Hall Bath' }, { id: 'garage', label: "Kids' Rooms" },
  { id: 'topdown', label: 'Top-Down Audit' },
];
const ROOM_LIST: readonly RoomId[] = ['office', 'foyer', 'garage'];
const TIER2_ROOM_LIST: readonly Tier2RoomId[] = [
  'livingRoom', 'playNook', 'stairLanding', 'hallway', 'powderRoom', 'primaryBedroom', 'primaryBath',
];
const TIER3_ROOM_LIST: readonly Tier3RoomId[] = [
  'breakfastNook', 'kitchen', 'hallBath', 'upperHall', 'rosieBedroom', 'isaacBedroom',
];
const TIER2_ROOM_TO_PRESET: Readonly<Record<Tier2RoomId, CameraPresetId>> = {
  livingRoom: 'office', playNook: 'office',
  stairLanding: 'foyer', hallway: 'foyer', powderRoom: 'foyer',
  primaryBedroom: 'garage', primaryBath: 'garage',
};
const TIER3_ROOM_TO_PRESET: Readonly<Record<Tier3RoomId, CameraPresetId>> = {
  breakfastNook: 'office', kitchen: 'office',
  hallBath: 'foyer', upperHall: 'foyer',
  rosieBedroom: 'garage', isaacBedroom: 'garage',
};
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

function readInitialTier(): FloorTierId {
  if (typeof window === 'undefined') return 1;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('tier') ?? params.get('floor');
  return raw === '3' ? 3 : raw === '2' ? 2 : 1;
}

function readInitialPreset(): CameraPresetId {
  if (typeof window === 'undefined') return 'dollhouse';
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('floorplanPreset') ?? params.get('view');
  return raw && Object.prototype.hasOwnProperty.call(CAMERA_PRESETS, raw) ? (raw as CameraPresetId) : 'dollhouse';
}

function readKioskMode(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = new URLSearchParams(window.location.search).get('kiosk');
  return raw === '1' || raw === 'true';
}

function readInitialWallMode(): Tier3WallMode {
  if (typeof window === 'undefined') return 'standard';
  return new URLSearchParams(window.location.search).get('walls') === 'half' ? 'half' : 'standard';
}

function canCreateWebgl(): boolean {
  if (typeof document === 'undefined') return false;
  const unmockedJsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)
    && typeof HTMLCanvasElement !== 'undefined' && !('mock' in HTMLCanvasElement.prototype.getContext);
  if (unmockedJsdom) return false;
  try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

function extractEntities(data: unknown): Tier1EntityMap {
  if (!data || typeof data !== 'object') return {};
  const rec = data as Record<string, unknown>;
  return (rec.entities && typeof rec.entities === 'object' ? rec.entities : rec) as Tier1EntityMap;
}

function readEntity(states: Tier1EntityMap, key: HaBindingKey): Tier1EntityStateLike | undefined {
  const raw = states[TIER1_HA_BINDINGS[key].defaultEntityId] ?? states[key];
  return raw === undefined ? undefined : typeof raw === 'string' ? { state: raw } : raw;
}

function buildHudPills(entities: Tier1EntityMap, tier: FloorTierId) {
  if (tier === 2) {
    const fixturesCount = Object.keys(TIER2_LAYOUT_SPEC.fixtures).length;
    return [
      { key: 'rooms', label: '7 Rooms · Wood & Slate', active: true },
      { key: 'living', label: 'Living Room & Play Nook', active: true },
      { key: 'stairs', label: '7-Tread Stairs to Tier 3', active: true },
      { key: 'primary', label: 'Primary Suite & Bath', active: true },
      { key: 'fixtures', label: `${fixturesCount} Fixtures`, active: true },
    ];
  }
  if (tier === 3) {
    const fixturesCount = Object.keys(TIER3_LAYOUT_SPEC.fixtures).length;
    return [
      { key: 'rooms', label: '6 Rooms · Wood & Slate', active: true },
      { key: 'kitchen', label: 'Kitchen & Nook', active: true },
      { key: 'bath', label: 'Hall Bath & Upper Hall', active: true },
      { key: 'kids', label: 'Rosie & Isaac Rooms', active: true },
      { key: 'fixtures', label: `${fixturesCount} Fixtures`, active: true },
    ];
  }
  const temp = readEntity(entities, 'officeTemp');
  const unit = typeof temp?.attributes?.unit_of_measurement === 'string' ? temp.attributes.unit_of_measurement : '°F';
  const lightsOn = (['officeLight', 'foyerLight', 'garageLight'] as const).filter((k) => readEntity(entities, k)?.state.toLowerCase() === 'on').length;
  const washerOn = readEntity(entities, 'washerRunning')?.state.toLowerCase() === 'on';
  const pst = readEntity(entities, 'printerState')?.state.toLowerCase() ?? 'ready';
  const printing = pst === 'printing' || pst === 'heating' || pst === 'active';
  const doorOpen = readEntity(entities, 'garageDoor')?.state.toLowerCase() === 'open';
  return [
    { key: 'temp', label: `Office ${temp ? `${temp.state}${unit}` : '71°F'}`, active: Boolean(temp) },
    { key: 'lights', label: `Lights ${lightsOn > 0 ? `${lightsOn}/3 On` : 'Ambient'}`, active: lightsOn > 0 },
    { key: 'washer', label: `Washer ${washerOn ? 'Running' : 'Idle'}`, active: washerOn },
    { key: 'printer', label: `Ender-3 ${printing ? 'Printing' : 'Ready'}`, active: printing },
    { key: 'curb', label: `Curb ${doorOpen ? 'Open' : 'Flush'}`, active: doorOpen },
  ];
}

function presetTitleLabel(tier: FloorTierId, preset: CameraPresetId): string {
  if (tier === 1) return CAMERA_PRESETS[preset].label;
  if (preset === 'topdown') return 'Top-Down Plan';
  if (tier === 3) {
    if (preset === 'dollhouse') return 'Tier 3 Dollhouse';
    if (preset === 'office') return 'Kitchen & Breakfast Nook';
    if (preset === 'foyer') return 'Hall Bath & Upper Hall';
    if (preset === 'garage') return "Rosie & Isaac's Rooms";
    return CAMERA_PRESETS[preset].label;
  }
  if (preset === 'dollhouse') return 'Tier 2 Dollhouse';
  if (preset === 'office') return 'Living Room & Play Nook';
  if (preset === 'foyer') return 'Stair Landing & Powder Bath';
  if (preset === 'garage') return 'Primary Bedroom & En-Suite Bath';
  return CAMERA_PRESETS[preset].label;
}

interface WebglHandle {
  applyPreset: (preset: CameraPresetId, showUpper: boolean) => void;
  updateEntities: (states: Tier1EntityMap) => void;
  dispose: () => void;
}

function mountWebglViewport(
  container: HTMLDivElement,
  canvas: HTMLCanvasElement,
  tier: FloorTierId,
  wallMode: Tier3WallMode,
  onPresetSelect: (preset: CameraPresetId) => void,
  onFail: () => void,
): WebglHandle | null {
  let renderer: WebGLRenderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); }
  catch { queueMicrotask(onFail); return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const builtTier1 = tier === 1 ? buildTier1Scene({ background: '#141922' }) : null;
  const builtTier2 = tier === 2 ? buildTier2Scene({ background: '#141922' }) : null;
  const builtTier3 = tier === 3 ? buildTier3Scene({ background: '#141922', wallMode }) : null;
  if (builtTier1) {
    builtTier1.lights.sun.shadow.bias = -0.0006;
    builtTier1.lights.sun.shadow.normalBias = 0.02;
  }
  const activeScene = (builtTier1 ?? builtTier2 ?? builtTier3)!.scene;
  const camera = new PerspectiveCamera(40, 16 / 10, 0.25, 220);
  const orbit = { target: new Vector3(1.75, 2.4, -1.0), radius: 42, phi: 0.9, theta: 0 };
  const renderNow = () => renderer.render(activeScene, camera);
  const syncSize = () => {
    const [w, h] = [Math.max(1, container.clientWidth || window.innerWidth || 800), Math.max(1, container.clientHeight || window.innerHeight || 500)];
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); renderNow();
  };
  const applyPreset = (preset: CameraPresetId, showUpper: boolean) => {
    const spec = CAMERA_PRESETS[preset];
    camera.fov = spec.fov; camera.position.set(...spec.position); camera.up.set(...spec.up);
    orbit.target.set(...spec.target);
    const off = camera.position.clone().sub(orbit.target);
    orbit.radius = Math.max(8, off.length());
    orbit.phi = Math.acos(clamp(off.y / orbit.radius, -1, 1));
    orbit.theta = Math.atan2(off.x, off.z);
    camera.lookAt(orbit.target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    builtTier1?.setUpperTiersVisible(showUpper); renderNow();
  };
  const pointers = new Map<number, { x: number; y: number }>();
  const gesture = { startX: 0, startY: 0, moved: false, pinchDist: 0 };
  const raycaster = new Raycaster();
  const zoomBy = (factor: number) => {
    orbit.radius = clamp(orbit.radius * factor, 10, 88);
    camera.position.copy(orbit.target).addScaledVector(camera.position.clone().sub(orbit.target).normalize(), orbit.radius);
    camera.lookAt(orbit.target); renderNow();
  };
  const onPointerDown = (e: PointerEvent) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) Object.assign(gesture, { startX: e.clientX, startY: e.clientY, moved: false });
    else if (pointers.size === 2) { const [a, b] = Array.from(pointers.values()); Object.assign(gesture, { pinchDist: Math.hypot(a.x - b.x, a.y - b.y), moved: true }); }
  };
  const onPointerMove = (e: PointerEvent) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (gesture.pinchDist > 4 && dist > 4) zoomBy(gesture.pinchDist / dist);
      gesture.pinchDist = dist; return;
    }
    if (Math.hypot(e.clientX - gesture.startX, e.clientY - gesture.startY) > 4) gesture.moved = true;
    if (!gesture.moved) return;
    orbit.theta -= (e.clientX - prev.x) * 0.0065;
    orbit.phi = clamp(orbit.phi - (e.clientY - prev.y) * 0.0055, 0.08, Math.PI * 0.46);
    camera.up.set(0, 1, 0);
    camera.position.set(orbit.target.x + orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta), orbit.target.y + orbit.radius * Math.cos(orbit.phi), orbit.target.z + orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta));
    camera.lookAt(orbit.target); renderNow();
  };
  const onPointerUp = (e: PointerEvent) => {
    const wasTap = pointers.has(e.pointerId) && pointers.size === 1 && !gesture.moved;
    pointers.delete(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    if (!wasTap || rect.width <= 0 || rect.height <= 0) return;
    raycaster.setFromCamera(new Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), camera);
    for (const hit of raycaster.intersectObjects(activeScene.children, true)) {
      for (let cur: Object3D | null = hit.object; cur; cur = cur.parent) {
        const r = cur.userData?.room;
        if (r === 'office' || r === 'foyer' || r === 'garage') { onPresetSelect(r); return; }
        const r3 = cur.userData?.roomId as Tier3RoomId | undefined;
        if (tier === 3 && r3 && Object.prototype.hasOwnProperty.call(TIER3_ROOM_TO_PRESET, r3)) {
          onPresetSelect(TIER3_ROOM_TO_PRESET[r3]); return;
        }
        const r2 = cur.userData?.roomId as Tier2RoomId | undefined;
        if (tier === 2 && r2 && Object.prototype.hasOwnProperty.call(TIER2_ROOM_TO_PRESET, r2)) {
          onPresetSelect(TIER2_ROOM_TO_PRESET[r2]); return;
        }
      }
    }
  };
  const onWheel = (e: WheelEvent) => { e.preventDefault(); zoomBy(e.deltaY > 0 ? 1.08 : 0.92); };
  canvas.addEventListener('pointerdown', onPointerDown); canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp); canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
  ro?.observe(container); syncSize(); window.__floorplanSceneReady = true;
  return {
    applyPreset,
    updateEntities: (states) => { builtTier1?.updateEntities(states); renderNow(); },
    dispose: () => {
      delete window.__floorplanSceneReady; ro?.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp); canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      builtTier1?.dispose(); builtTier2?.dispose(); builtTier3?.dispose(); renderer.dispose();
    },
  };
}

export function Floorplan3dWidget({ id, type }: WidgetComponentProps) {
  const entry = useWidget(id);
  const [activeTier, setActiveTier] = useState<FloorTierId>(readInitialTier);
  const [activePreset, setActivePreset] = useState<CameraPresetId>(readInitialPreset);
  const [showUpperMassing, setShowUpperMassing] = useState<boolean>(() => CAMERA_PRESETS[readInitialPreset()].showUpperMassing);
  const [wallMode, setWallMode] = useState<Tier3WallMode>(readInitialWallMode);
  const [webglSupported, setWebglSupported] = useState<boolean>(canCreateWebgl);
  const [isKiosk] = useState<boolean>(readKioskMode);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<WebglHandle | null>(null);
  const entities = useMemo(() => extractEntities(entry.data), [entry.data]);
  const hudPills = useMemo(() => buildHudPills(entities, activeTier), [entities, activeTier]);
  const presetPills = activeTier === 3 ? TIER3_PRESET_PILLS : activeTier === 2 ? TIER2_PRESET_PILLS : PRESET_PILLS;
  const selectPreset = (preset: CameraPresetId) => { setActivePreset(preset); setShowUpperMassing(CAMERA_PRESETS[preset].showUpperMassing); };
  const selectTier = (tier: FloorTierId) => {
    setActiveTier(tier);
    if (tier !== 1 && showUpperMassing) {
      setShowUpperMassing(false);
      if (activePreset === 'stack3Tier') setActivePreset('dollhouse');
    }
  };
  const toggleUpperMassing = () => {
    const next = !showUpperMassing;
    setShowUpperMassing(next);
    if (next) setActivePreset('stack3Tier');
    else if (activePreset === 'stack3Tier') setActivePreset('dollhouse');
  };
  useEffect(() => {
    window.__setFloorplanPreset = (preset: CameraPresetId) => {
      if (Object.prototype.hasOwnProperty.call(CAMERA_PRESETS, preset)) { setActivePreset(preset); setShowUpperMassing(CAMERA_PRESETS[preset].showUpperMassing); }
    };
    window.__setFloorplanTier = (tier: FloorTierId) => {
      if (tier === 1 || tier === 2 || tier === 3) setActiveTier(tier);
    };
    return () => { delete window.__setFloorplanPreset; delete window.__setFloorplanTier; };
  }, []);
  useEffect(() => {
    if (!webglSupported || !viewportRef.current || !canvasRef.current) return undefined;
    const handle = mountWebglViewport(
      viewportRef.current,
      canvasRef.current,
      activeTier,
      wallMode,
      (preset) => { setActivePreset(preset); setShowUpperMassing(false); },
      () => setWebglSupported(false),
    );
    handleRef.current = handle;
    return () => { handle?.dispose(); handleRef.current = null; };
  }, [webglSupported, activeTier, wallMode]);
  useEffect(() => { handleRef.current?.applyPreset(activePreset, showUpperMassing); }, [activePreset, showUpperMassing, webglSupported, activeTier, wallMode]);
  useEffect(() => { handleRef.current?.updateEntities(entities); }, [entities, webglSupported, activeTier]);

  const tierLabel = activeTier === 3 ? 'Hearth Tier 3' : activeTier === 2 ? 'Hearth Tier 2' : 'Hearth Tier 1';
  const presetLabel = presetTitleLabel(activeTier, activePreset);
  const tier2FixturesList = useMemo(() => Object.values(TIER2_LAYOUT_SPEC.fixtures), []);
  const tier3FixturesList = useMemo(() => Object.values(TIER3_LAYOUT_SPEC.fixtures), []);

  return (
    <div
      className="fp3d-widget"
      data-widget-id={id}
      data-widget-type={type}
      data-active-tier={String(activeTier)}
      data-active-preset={activePreset}
      data-upper-massing={showUpperMassing ? 'true' : 'false'}
      data-wall-mode={wallMode}
      data-kiosk={isKiosk ? 'true' : 'false'}
    >
      <div className="fp3d-viewport" ref={viewportRef}>
        {webglSupported ? (
          <canvas className="fp3d-canvas" ref={canvasRef} aria-label={`${tierLabel} 3D Floorplan Canvas`} />
        ) : (
          <div className="fp3d-fallback" role="region" aria-label={`${tierLabel} Floorplan Overview`}>
            {activeTier === 1
              ? ROOM_LIST.map((roomId) => (
                  <button key={roomId} type="button" className="fp3d-fallback-room" onClick={() => selectPreset(roomId)}>
                    <strong>{TIER1_ROOMS[roomId].label}</strong>
                    <div>{TIER1_FIXTURES.filter((f) => f.room === roomId).length} fixtures · {presetLabel}</div>
                  </button>
                ))
              : activeTier === 2
                ? TIER2_ROOM_LIST.map((roomId) => (
                    <button key={roomId} type="button" className="fp3d-fallback-room" data-room-id={roomId} onClick={() => selectPreset(TIER2_ROOM_TO_PRESET[roomId])}>
                      <strong>{TIER2_LAYOUT_SPEC.rooms[roomId].label}</strong>
                      <div>{tier2FixturesList.filter((f) => f.roomId === roomId).length} fixtures · {presetLabel}</div>
                    </button>
                  ))
                : TIER3_ROOM_LIST.map((roomId) => (
                    <button key={roomId} type="button" className="fp3d-fallback-room" data-room-id={roomId} onClick={() => selectPreset(TIER3_ROOM_TO_PRESET[roomId])}>
                      <strong>{TIER3_LAYOUT_SPEC.rooms[roomId].label}</strong>
                      <div>{tier3FixturesList.filter((f) => f.roomId === roomId).length} fixtures · {presetLabel}</div>
                    </button>
                  ))}
          </div>
        )}
      </div>
      <div className="fp3d-hud-top">
        <div className="fp3d-title-chip">{tierLabel} · {presetLabel}</div>
        <div className="fp3d-status-list">
          {activeTier === 3
            ? TIER3_ROOM_LIST.map((roomId) => (
                <span key={roomId} className="fp3d-status-pill" data-room-badge={roomId} data-active="true">
                  <span className="fp3d-status-dot" />{TIER3_LAYOUT_SPEC.rooms[roomId].label}
                </span>
              ))
            : activeTier === 2
              ? TIER2_ROOM_LIST.map((roomId) => (
                  <span key={roomId} className="fp3d-status-pill" data-room-badge={roomId} data-active="true">
                    <span className="fp3d-status-dot" />{TIER2_LAYOUT_SPEC.rooms[roomId].label}
                  </span>
                ))
              : hudPills.map((p) => (
                  <span key={p.key} className="fp3d-status-pill" data-status-key={p.key} data-active={p.active ? 'true' : 'false'}>
                    <span className="fp3d-status-dot" />{p.label}
                  </span>
                ))}
        </div>
      </div>
      <div className="fp3d-controls" role="toolbar" aria-label="Floorplan Camera Controls">
        {([1, 2, 3] as const).map((tierNum) => (
          <button
            key={tierNum}
            type="button"
            className="fp3d-pill"
            data-testid={`floorplan-tier-${tierNum}-btn`}
            data-tier={String(tierNum)}
            data-active={activeTier === tierNum ? 'true' : 'false'}
            aria-pressed={activeTier === tierNum}
            onClick={() => selectTier(tierNum)}
          >
            {`Floor ${tierNum} (Tier ${tierNum})`}
          </button>
        ))}
        <span className="fp3d-divider" aria-hidden="true" />
        {presetPills.map((pill) => (
          <button key={pill.id} type="button" className="fp3d-pill" data-preset={pill.id} data-active={activePreset === pill.id ? 'true' : 'false'} onClick={() => selectPreset(pill.id)}>{pill.label}</button>
        ))}
        <span className="fp3d-divider" aria-hidden="true" />
        {activeTier === 3 && (
          <button
            type="button"
            className="fp3d-pill"
            data-toggle="half-walls"
            aria-pressed={wallMode === 'half'}
            onClick={() => setWallMode((m) => (m === 'half' ? 'standard' : 'half'))}
          >
            Half Walls
          </button>
        )}
        <button type="button" className="fp3d-pill" data-toggle="upper-massing" aria-pressed={showUpperMassing} onClick={toggleUpperMassing}>3-Tier Stack</button>
      </div>
    </div>
  );
}
