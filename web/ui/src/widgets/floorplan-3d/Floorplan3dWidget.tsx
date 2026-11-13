import './Floorplan3dWidget.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ACESFilmicToneMapping, PCFSoftShadowMap, PerspectiveCamera, Raycaster,
  SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type Object3D,
} from 'three';
import { useWidget } from '../../store/hooks';
import type { WidgetComponentProps } from '../registry';
import { buildTier1Scene, type Tier1EntityMap, type Tier1EntityStateLike } from './buildTier1Scene';
import {
  CAMERA_PRESETS, TIER1_FIXTURES, TIER1_HA_BINDINGS, TIER1_ROOMS,
  type CameraPresetId, type HaBindingKey, type RoomId,
} from './tier1LayoutSpec';

declare global {
  interface Window {
    __setFloorplanPreset?: (preset: CameraPresetId) => void;
    __floorplanSceneReady?: boolean;
  }
}

const PRESET_PILLS: ReadonlyArray<{ id: Exclude<CameraPresetId, 'stack3Tier'>; label: string }> = [
  { id: 'dollhouse', label: 'Tier 1 Overview' }, { id: 'office', label: 'Office' },
  { id: 'foyer', label: 'Foyer' }, { id: 'garage', label: 'Brock Studios' },
  { id: 'topdown', label: 'Top-Down Audit' },
];
const ROOM_LIST: readonly RoomId[] = ['office', 'foyer', 'garage'];
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

function readInitialPreset(): CameraPresetId {
  if (typeof window === 'undefined') return 'dollhouse';
  const raw = new URLSearchParams(window.location.search).get('floorplanPreset');
  return raw && Object.prototype.hasOwnProperty.call(CAMERA_PRESETS, raw) ? (raw as CameraPresetId) : 'dollhouse';
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

function buildHudPills(entities: Tier1EntityMap) {
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

interface WebglHandle {
  applyPreset: (preset: CameraPresetId, showUpper: boolean) => void;
  updateEntities: (states: Tier1EntityMap) => void;
  dispose: () => void;
}

function mountWebglViewport(container: HTMLDivElement, canvas: HTMLCanvasElement, onRoomSelect: (room: RoomId) => void, onFail: () => void): WebglHandle | null {
  let renderer: WebGLRenderer;
  try { renderer = new WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); }
  catch { queueMicrotask(onFail); return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const built = buildTier1Scene({ background: '#141922' });
  built.lights.sun.shadow.bias = -0.0006;
  built.lights.sun.shadow.normalBias = 0.02;
  const camera = new PerspectiveCamera(40, 16 / 10, 0.25, 220);
  const orbit = { target: new Vector3(1.75, 2.4, -1.0), radius: 42, phi: 0.9, theta: 0 };
  const renderNow = () => renderer.render(built.scene, camera);
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
    built.setUpperTiersVisible(showUpper); renderNow();
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
    for (const hit of raycaster.intersectObjects(built.scene.children, true)) {
      for (let cur: Object3D | null = hit.object; cur; cur = cur.parent) {
        const r = cur.userData?.room;
        if (r === 'office' || r === 'foyer' || r === 'garage') { onRoomSelect(r); return; }
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
    updateEntities: (states) => { built.updateEntities(states); renderNow(); },
    dispose: () => {
      delete window.__floorplanSceneReady; ro?.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp); canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel); built.dispose(); renderer.dispose();
    },
  };
}

export function Floorplan3dWidget({ id, type }: WidgetComponentProps) {
  const entry = useWidget(id);
  const [activePreset, setActivePreset] = useState<CameraPresetId>(readInitialPreset);
  const [showUpperMassing, setShowUpperMassing] = useState<boolean>(() => CAMERA_PRESETS[readInitialPreset()].showUpperMassing);
  const [webglSupported, setWebglSupported] = useState<boolean>(canCreateWebgl);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<WebglHandle | null>(null);
  const entities = useMemo(() => extractEntities(entry.data), [entry.data]);
  const hudPills = useMemo(() => buildHudPills(entities), [entities]);
  const selectPreset = (preset: CameraPresetId) => { setActivePreset(preset); setShowUpperMassing(CAMERA_PRESETS[preset].showUpperMassing); };
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
    return () => { delete window.__setFloorplanPreset; };
  }, []);
  useEffect(() => {
    if (!webglSupported || !viewportRef.current || !canvasRef.current) return undefined;
    const handle = mountWebglViewport(viewportRef.current, canvasRef.current, (room) => { setActivePreset(room); setShowUpperMassing(false); }, () => setWebglSupported(false));
    handleRef.current = handle;
    return () => { handle?.dispose(); handleRef.current = null; };
  }, [webglSupported]);
  useEffect(() => { handleRef.current?.applyPreset(activePreset, showUpperMassing); }, [activePreset, showUpperMassing, webglSupported]);
  useEffect(() => { handleRef.current?.updateEntities(entities); }, [entities, webglSupported]);

  return (
    <div className="fp3d-widget" data-widget-id={id} data-widget-type={type} data-active-preset={activePreset} data-upper-massing={showUpperMassing ? 'true' : 'false'}>
      <div className="fp3d-viewport" ref={viewportRef}>
        {webglSupported ? (
          <canvas className="fp3d-canvas" ref={canvasRef} aria-label="Hearth Tier 1 3D Floorplan Canvas" />
        ) : (
          <div className="fp3d-fallback" role="region" aria-label="Hearth Tier 1 Floorplan Overview">
            {ROOM_LIST.map((roomId) => (
              <button key={roomId} type="button" className="fp3d-fallback-room" onClick={() => selectPreset(roomId)}>
                <strong>{TIER1_ROOMS[roomId].label}</strong>
                <div>{TIER1_FIXTURES.filter((f) => f.room === roomId).length} fixtures · {CAMERA_PRESETS[activePreset].label}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="fp3d-hud-top">
        <div className="fp3d-title-chip">Hearth Tier 1 · {CAMERA_PRESETS[activePreset].label}</div>
        <div className="fp3d-status-list">
          {hudPills.map((p) => (
            <span key={p.key} className="fp3d-status-pill" data-status-key={p.key} data-active={p.active ? 'true' : 'false'}>
              <span className="fp3d-status-dot" />{p.label}
            </span>
          ))}
        </div>
      </div>
      <div className="fp3d-controls" role="toolbar" aria-label="Floorplan Camera Controls">
        {PRESET_PILLS.map((pill) => (
          <button key={pill.id} type="button" className="fp3d-pill" data-preset={pill.id} data-active={activePreset === pill.id ? 'true' : 'false'} onClick={() => selectPreset(pill.id)}>{pill.label}</button>
        ))}
        <span className="fp3d-divider" aria-hidden="true" />
        <button type="button" className="fp3d-pill" data-toggle="upper-massing" aria-pressed={showUpperMassing} onClick={toggleUpperMassing}>3-Tier Stack</button>
      </div>
    </div>
  );
}
