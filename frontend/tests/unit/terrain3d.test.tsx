import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Terrain3DViewer } from '../../src/features/terrain-3d/Terrain3DViewer';
import { useMissionStore } from '../../src/store/missionStore';
import { GALE_ROUTES } from '../../src/mocks/demoData';

describe('3D Surface Topography Viewer (WebGL / Three.js)', () => {
  beforeEach(() => {
    // Mock canvas getContext for jsdom environment
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId: string) => {
      if (contextId === '2d') {
        return {
          createImageData: () => ({ data: new Uint8ClampedArray(1024 * 1024 * 4) }),
          putImageData: () => {},
        };
      }
      if (contextId === 'webgl' || contextId === 'experimental-webgl') {
        return {
          getExtension: () => null,
          getParameter: () => 16,
          createTexture: () => ({}),
          bindTexture: () => {},
          texParameteri: () => {},
          texImage2D: () => {},
          clearColor: () => {},
          clearDepth: () => {},
          clear: () => {},
          viewport: () => {},
          enable: () => {},
          disable: () => {},
        };
      }
      return null;
    });

    useMissionStore.setState({
      selectedRoute: GALE_ROUTES[0],
      routes: GALE_ROUTES,
      activePage: 'terrain-3d',
    });
  });

  it('renders 3D viewer header with elevation mesh badge and route objectives', () => {
    render(<Terrain3DViewer />);

    expect(screen.getByText(/3D SURFACE TOPOGRAPHY \/\/ WEBGL VIEWER/i)).toBeInTheDocument();
    expect(screen.getByText(/ELEVATION MESH/i)).toBeInTheDocument();
    expect(screen.getAllByText(/LOWEST RISK/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/BALANCED/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders camera view mode controls (Orbit, Flythrough, Ortho 2D)', () => {
    render(<Terrain3DViewer />);

    const orbitBtn = screen.getByRole('button', { name: /ORBIT 3D/i });
    const flythroughBtn = screen.getByRole('button', { name: /FLYTHROUGH/i });
    const orthoBtn = screen.getByRole('button', { name: /ORTHO 2D/i });

    expect(orbitBtn).toBeInTheDocument();
    expect(flythroughBtn).toBeInTheDocument();
    expect(orthoBtn).toBeInTheDocument();

    fireEvent.click(flythroughBtn);
    fireEvent.click(orthoBtn);
    fireEvent.click(orbitBtn);
  });

  it('renders CTX/HiRISE optical texture layer and confirms DEM TINT and SLOPE HAZARD options are removed', () => {
    render(<Terrain3DViewer />);

    expect(screen.getByRole('button', { name: /CTX\/HiRISE/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /DEM TINT/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /SLOPE HAZARD/i })).not.toBeInTheDocument();
  });

  it('confirms elevation exaggeration slider is removed and camera reset is available', () => {
    render(<Terrain3DViewer />);

    expect(screen.queryByText(/EXAGGERATION:/i)).not.toBeInTheDocument();
    // Verify only the timeline scrubber exists, exaggeration slider is gone
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(1);
    expect(sliders[0]).toHaveAttribute('aria-label', 'Route Flythrough Scrubber');
    expect(screen.getByTitle(/Reset 3D Camera/i)).toBeInTheDocument();
  });

  it('toggles flythrough route simulation playback', () => {
    render(<Terrain3DViewer />);

    const playBtn = screen.getByRole('button', { name: /FLY ALONG ROUTE/i });
    expect(playBtn).toBeInTheDocument();

    fireEvent.click(playBtn);
    expect(screen.getByRole('button', { name: /PAUSE/i })).toBeInTheDocument();

    const pauseBtn = screen.getByRole('button', { name: /PAUSE/i });
    fireEvent.click(pauseBtn);
    expect(screen.getByRole('button', { name: /RESUME/i })).toBeInTheDocument();
  });

  it('allows switching active route in 3D viewer and dynamically updates distance and telemetry', () => {
    render(<Terrain3DViewer />);

    const balancedBtn = screen.getByRole('button', { name: /BALANCED/i });
    fireEvent.click(balancedBtn);

    const storeState = useMissionStore.getState();
    expect(storeState.selectedRoute?.objective).toBe('BALANCED');
    // Verify distance for Route Bravo (9.1 km) is dynamically displayed
    expect(screen.getByText(/9.10 km/i)).toBeInTheDocument();
  });

  it('dynamically displays the exact path configured in Traverse Planner rather than hardcoded route', () => {
    // Configure specific base and destination from Traverse Planner
    useMissionStore.setState({
      base: { lat: 18.4447, lon: 77.4508 },
      destination: { lat: 18.3845, lon: 77.5812 },
      selectedRoute: null,
      routes: GALE_ROUTES,
      activePage: 'terrain-3d',
    });

    render(<Terrain3DViewer />);

    // Should display the Traverse Planner route with calculated distance ~8.14 km
    expect(screen.getAllByText(/8.14 km/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/PLANNER PATH/i)).toBeInTheDocument();
    expect(screen.getByText(/Traverse Planner Vector/i)).toBeInTheDocument();
    expect(screen.getAllByText(/18.4447/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/18.3845/i).length).toBeGreaterThanOrEqual(1);

    // Switch to another route (Lowest Risk = 7.40 km)
    const lowestRiskBtn = screen.getByRole('button', { name: /LOWEST RISK/i });
    fireEvent.click(lowestRiskBtn);
    expect(screen.getByText(/7.40 km/i)).toBeInTheDocument();

    // Switch back to PLANNER PATH button
    const plannerBtn = screen.getByRole('button', { name: /PLANNER PATH/i });
    fireEvent.click(plannerBtn);
    expect(screen.getAllByText(/8.14 km/i).length).toBeGreaterThanOrEqual(1);
  });

  it('updates 3D viewer dynamically when Base or Destination coordinates change', () => {
    // Different pair of coordinates: Séítah Base Station (18.3710, 77.5695) to Neretva Vallis (18.4230, 77.5210)
    useMissionStore.setState({
      base: { lat: 18.3710, lon: 77.5695 },
      destination: { lat: 18.4230, lon: 77.5210 },
      selectedRoute: null,
      routes: GALE_ROUTES,
      activePage: 'terrain-3d',
    });

    render(<Terrain3DViewer />);

    // Calculated distance between these points is ~4.11 km
    expect(screen.getAllByText(/4.11 km/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/18.3710/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/18.4230/i).length).toBeGreaterThanOrEqual(1);
  });

  it('displays Route B (Balanced) or Route C when selected in planner, even if base and destination exist', () => {
    // Both base and destination exist, but user explicitly selected Route Bravo (Balanced) in Traverse Planner
    useMissionStore.setState({
      base: { lat: 18.4447, lon: 77.4508 },
      destination: { lat: 18.3845, lon: 77.5812 },
      selectedRoute: GALE_ROUTES[1], // Route B
      routes: GALE_ROUTES,
      activePage: 'terrain-3d',
    });

    render(<Terrain3DViewer />);

    // Must display Route Bravo's telemetry (9.10 km), NOT planner route (~8.14 km)
    expect(screen.getAllByText(/9.10 km/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/8.14 km/i)).not.toBeInTheDocument();

    // Now click MAX SCIENCE button (Route Charlie: 12.80 km)
    const maxScienceBtn = screen.getByRole('button', { name: /MAX SCIENCE/i });
    fireEvent.click(maxScienceBtn);
    expect(screen.getAllByText(/12.80 km/i).length).toBeGreaterThanOrEqual(1);
    expect(useMissionStore.getState().selectedRoute?.route_id).toBe('ROUTE_C');
  });
});
