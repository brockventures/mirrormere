import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDisplayStore } from '../../store';
import { widgetComponentFor } from '../registry';
import { Floorplan3dWidget } from './Floorplan3dWidget';

let webglMode: 'real' | 'stub' | 'throw' = 'real';
const renderSpy = vi.fn();
const disposeSpy = vi.fn();

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  class MockWebGLRenderer {
    outputColorSpace = '';
    toneMapping = 0;
    toneMappingExposure = 1;
    shadowMap = { enabled: false, type: 0 };
    constructor(opts?: unknown) {
      if (webglMode === 'throw') throw new Error('WebGL context rejected');
      if (webglMode === 'real') return new actual.WebGLRenderer(opts as never) as unknown as MockWebGLRenderer;
    }
    setPixelRatio = vi.fn();
    setSize = vi.fn();
    render = renderSpy;
    dispose = disposeSpy;
  }
  return { ...actual, WebGLRenderer: MockWebGLRenderer };
});

const ptr = (type: string, pointerId: number, clientX: number, clientY: number): Event =>
  Object.assign(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY }), { pointerId });

afterEach(() => {
  cleanup();
  webglMode = 'real';
  renderSpy.mockClear();
  disposeSpy.mockClear();
  vi.restoreAllMocks();
  window.history.replaceState({}, '', '/');
  useDisplayStore.setState((s) => ({ ...s, widgets: {} }));
});

describe('Floorplan3dWidget', () => {
  it('auto-registers floorplan-3d in widget registry and renders non-WebGL fallback, presets, 3-Tier Stack, and HA status pills', () => {
    expect(widgetComponentFor('floorplan-3d')).toBe(Floorplan3dWidget);
    window.history.replaceState({}, '', '/?floorplanPreset=topdown');
    useDisplayStore.setState((s) => ({
      ...s,
      widgets: {
        fp1: {
          state: 'ok',
          timestamp: '2026-11-13T10:00:00Z',
          data: {
            entities: {
              'sensor.office_temperature': { state: '72.4', attributes: { unit_of_measurement: '°F' } },
              'light.office_lights': { state: 'on' },
              'binary_sensor.washer_running': { state: 'on' },
              'sensor.ender3_v2_print_status': { state: 'printing' },
              'cover.garage_door': { state: 'open' },
            },
          },
        },
      },
    }));

    const { container } = render(<Floorplan3dWidget id="fp1" type="floorplan-3d" />);
    const root = container.querySelector('.fp3d-widget') as HTMLElement;
    expect(root.dataset.activePreset).toBe('topdown');
    expect(screen.getByRole('region', { name: /Hearth Tier 1 Floorplan Overview/i })).toBeTruthy();
    expect(screen.getByText(/Office 72.4°F/)).toBeTruthy();
    expect(screen.getByText(/Lights 1\/3 On/)).toBeTruthy();
    expect(screen.getByText(/Washer Running/)).toBeTruthy();
    expect(screen.getByText(/Ender-3 Printing/)).toBeTruthy();
    expect(screen.getByText(/Curb Open/)).toBeTruthy();

    fireEvent.click(container.querySelector('[data-preset="garage"]') as HTMLElement);
    expect(root.dataset.activePreset).toBe('garage');

    const stackBtn = container.querySelector('[data-toggle="upper-massing"]') as HTMLButtonElement;
    fireEvent.click(stackBtn);
    expect(stackBtn.getAttribute('aria-pressed')).toBe('true');
    expect(root.dataset.activePreset).toBe('stack3Tier');
    expect(root.dataset.upperMassing).toBe('true');

    fireEvent.click(stackBtn);
    expect(stackBtn.getAttribute('aria-pressed')).toBe('false');
    expect(root.dataset.activePreset).toBe('dollhouse');

    fireEvent.click(screen.getByRole('button', { name: /Office & Guest Suite/i }));
    expect(root.dataset.activePreset).toBe('office');

    act(() => { window.__setFloorplanPreset?.('foyer'); });
    expect(root.dataset.activePreset).toBe('foyer');
  });

  it('mounts WebGL viewport with orbit, pinch/wheel zoom, raycast room focus, and falls back cleanly on renderer throw', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((kind: string) => (kind === '2d' ? null : {})) as never);
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    webglMode = 'stub';

    const { container, unmount } = render(<Floorplan3dWidget id="fp-gl" type="floorplan-3d" />);
    const canvas = container.querySelector('canvas.fp3d-canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    expect(window.__floorplanSceneReady).toBe(true);
    expect(renderSpy).toHaveBeenCalled();

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: 800, bottom: 500, width: 800, height: 500, x: 0, y: 0, toJSON: () => ({}),
    });
    act(() => {
      canvas.dispatchEvent(ptr('pointerdown', 1, 180, 260));
      canvas.dispatchEvent(ptr('pointerup', 1, 180, 260));
      canvas.dispatchEvent(ptr('pointerdown', 2, 400, 250));
      canvas.dispatchEvent(ptr('pointermove', 2, 440, 270));
      canvas.dispatchEvent(ptr('pointerdown', 3, 500, 300));
      canvas.dispatchEvent(ptr('pointermove', 3, 530, 320));
      canvas.dispatchEvent(ptr('pointerup', 3, 530, 320));
      canvas.dispatchEvent(ptr('pointerup', 2, 440, 270));
      canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -120 }));
    });
    expect((container.querySelector('.fp3d-widget') as HTMLElement).dataset.activePreset).toBe('office');
    unmount();
    expect(disposeSpy).toHaveBeenCalledTimes(1);

    webglMode = 'throw';
    render(<Floorplan3dWidget id="fp-fail" type="floorplan-3d" />);
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByRole('region', { name: /Hearth Tier 1 Floorplan Overview/i })).toBeTruthy();
  });
});
