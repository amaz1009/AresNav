import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { TraversePlanner } from '../../src/features/traverse-planner/TraversePlanner';
import { useMissionStore } from '../../src/store/missionStore';

let capturedMapClickHandler: ((lat: number, lon: number) => void) | undefined;
let markerHandlers: { [key: string]: { click?: () => void } } = {};

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="leaflet-map">{children}</div>
  ),
  ImageOverlay: () => <div data-testid="image-overlay" />,
  Marker: ({
    children,
    eventHandlers,
    position,
  }: {
    children?: React.ReactNode;
    eventHandlers?: { click?: () => void };
    position?: [number, number];
  }) => {
    const key = position ? `${position[0]}_${position[1]}` : 'marker';
    if (eventHandlers) {
      markerHandlers[key] = eventHandlers;
    }
    return (
      <div
        data-testid="map-marker"
        data-pos={key}
        onClick={() => eventHandlers?.click?.()}
      >
        {children}
      </div>
    );
  },
  Popup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map-popup">{children}</div>
  ),
  Polyline: () => <div data-testid="map-polyline" />,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 11),
  }),
  useMapEvents: (handlers: { click?: (e: { latlng: { lat: number; lng: number } }) => void }) => {
    if (handlers.click) {
      capturedMapClickHandler = (lat, lon) => {
        handlers.click!({ latlng: { lat, lng: lon } });
      };
    }
    return null;
  },
}));

describe('TraversePlanner Feature (Two Tabs: Base and Destination)', () => {
  beforeEach(() => {
    capturedMapClickHandler = undefined;
    markerHandlers = {};
    useMissionStore.setState({
      base: null,
      destination: null,
      selectedPoint: null,
    });
  });

  it('renders both Base and Destination tabs without hardcoded route cards', () => {
    render(<TraversePlanner />);

    expect(screen.getByTestId('tab-base')).toBeInTheDocument();
    expect(screen.getByTestId('tab-destination')).toBeInTheDocument();

    // Verify hardcoded route cards (Route A, Route B, Route C) are removed
    expect(screen.queryByText(/Route A:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Route B:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Route C:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Traverse Route Calculation Pending/i)).toBeInTheDocument();
  });

  it('allows user to type coordinates in Base tab and apply them', () => {
    render(<TraversePlanner />);

    const latInput = screen.getByTestId('input-base-lat');
    const lonInput = screen.getByTestId('input-base-lon');
    const applyBtn = screen.getByTestId('btn-apply-base');

    fireEvent.change(latInput, { target: { value: '18.4447' } });
    fireEvent.change(lonInput, { target: { value: '77.4508' } });
    fireEvent.click(applyBtn);

    const storeBase = useMissionStore.getState().base;
    expect(storeBase).not.toBeNull();
    expect(storeBase?.lat).toBe(18.4447);
    expect(storeBase?.lon).toBe(77.4508);
  });

  it('allows user to select base coordinates by clicking on the map while Base tab is active', () => {
    render(<TraversePlanner />);

    // Click map event
    expect(capturedMapClickHandler).toBeDefined();
    act(() => {
      capturedMapClickHandler!(18.4000, 77.5000);
    });

    const storeBase = useMissionStore.getState().base;
    expect(storeBase).toEqual({ lat: 18.4, lon: 77.5 });

    // Verify input fields updated with clicked coordinates
    expect((screen.getByTestId('input-base-lat') as HTMLInputElement).value).toBe('18.40000');
    expect((screen.getByTestId('input-base-lon') as HTMLInputElement).value).toBe('77.50000');
  });

  it('allows switching to Destination tab and typing destination coordinates', () => {
    render(<TraversePlanner />);

    // Switch to Destination tab
    const destTab = screen.getByTestId('tab-destination');
    fireEvent.click(destTab);

    expect(screen.getByText(/Traverse Destination Coordinates/i)).toBeInTheDocument();

    const latInput = screen.getByTestId('input-dest-lat');
    const lonInput = screen.getByTestId('input-dest-lon');
    const applyBtn = screen.getByTestId('btn-apply-dest');

    fireEvent.change(latInput, { target: { value: '18.3845' } });
    fireEvent.change(lonInput, { target: { value: '77.5812' } });
    fireEvent.click(applyBtn);

    const storeDest = useMissionStore.getState().destination;
    expect(storeDest).not.toBeNull();
    expect(storeDest?.lat).toBe(18.3845);
    expect(storeDest?.lon).toBe(77.5812);
  });

  it('allows user to select destination coordinates by clicking on the map while Destination tab is active', () => {
    render(<TraversePlanner />);

    // Switch to Destination tab
    const destTab = screen.getByTestId('tab-destination');
    fireEvent.click(destTab);

    // Click map event
    expect(capturedMapClickHandler).toBeDefined();
    act(() => {
      capturedMapClickHandler!(18.3500, 77.6000);
    });

    const storeDest = useMissionStore.getState().destination;
    expect(storeDest).toEqual({ lat: 18.35, lon: 77.6 });

    // Verify input fields updated with clicked coordinates
    expect((screen.getByTestId('input-dest-lat') as HTMLInputElement).value).toBe('18.35000');
    expect((screen.getByTestId('input-dest-lon') as HTMLInputElement).value).toBe('77.60000');
  });

  it('computes surface distance, bearing, and elevation profile when both Base and Destination are configured', () => {
    useMissionStore.setState({
      base: { lat: 18.4447, lon: 77.4508 },
      destination: { lat: 18.3845, lon: 77.5812 },
    });

    render(<TraversePlanner />);

    // Should display real computed metrics
    expect(screen.getByText(/SURFACE DISTANCE/i)).toBeInTheDocument();
    expect(screen.getByText(/AZIMUTH BEARING/i)).toBeInTheDocument();
    expect(screen.getByText(/ESTIMATED WALK TIME/i)).toBeInTheDocument();
    expect(screen.getByText(/WALK-BACK SAFETY/i)).toBeInTheDocument();

    // Elevation chart section should be displayed
    expect(screen.getByText(/Traverse Surface Cross-Section Elevation & Slope/i)).toBeInTheDocument();
  });

  it('validates invalid latitude and longitude entries', () => {
    render(<TraversePlanner />);

    const latInput = screen.getByTestId('input-base-lat');
    const lonInput = screen.getByTestId('input-base-lon');
    const applyBtn = screen.getByTestId('btn-apply-base');

    // Invalid non-numeric input
    fireEvent.change(latInput, { target: { value: 'invalid_lat' } });
    fireEvent.change(lonInput, { target: { value: '77.5' } });
    fireEvent.click(applyBtn);

    expect(screen.getByText(/Please enter valid numeric latitude and longitude coordinates/i)).toBeInTheDocument();
    expect(useMissionStore.getState().base).toBeNull();
  });

  it('allows selecting candidate site blue marker on the map to set Base or Destination', () => {
    const candidateSites = useMissionStore.getState().candidateSites;
    expect(candidateSites.length).toBeGreaterThan(0);
    const site = candidateSites[0];
    const key = `${site.point.lat}_${site.point.lon}`;

    render(<TraversePlanner />);

    // In Base tab, clicking candidate site marker sets base
    const marker = document.querySelector(`[data-pos="${key}"]`);
    expect(marker).toBeInTheDocument();
    fireEvent.click(marker!);

    expect(useMissionStore.getState().base).toEqual({ lat: site.point.lat, lon: site.point.lon });
    expect((screen.getByTestId('input-base-lat') as HTMLInputElement).value).toBe(site.point.lat.toFixed(5));

    // Switch to Destination tab
    const destTab = screen.getByTestId('tab-destination');
    fireEvent.click(destTab);

    const site2 = candidateSites[1];
    const key2 = `${site2.point.lat}_${site2.point.lon}`;
    const marker2 = document.querySelector(`[data-pos="${key2}"]`);
    expect(marker2).toBeInTheDocument();
    fireEvent.click(marker2!);

    expect(useMissionStore.getState().destination).toEqual({ lat: site2.point.lat, lon: site2.point.lon });
    expect((screen.getByTestId('input-dest-lat') as HTMLInputElement).value).toBe(site2.point.lat.toFixed(5));
  });

  it('supports whitespace trimming and comma decimals in coordinate entry', () => {
    render(<TraversePlanner />);

    const latInput = screen.getByTestId('input-base-lat');
    const lonInput = screen.getByTestId('input-base-lon');
    const applyBtn = screen.getByTestId('btn-apply-base');

    fireEvent.change(latInput, { target: { value: '  18,4447  ' } });
    fireEvent.change(lonInput, { target: { value: '  77,4508  ' } });
    fireEvent.click(applyBtn);

    const storeBase = useMissionStore.getState().base;
    expect(storeBase).not.toBeNull();
    expect(storeBase?.lat).toBe(18.4447);
    expect(storeBase?.lon).toBe(77.4508);
  });

  it('allows clearing base and destination', () => {
    useMissionStore.setState({
      base: { lat: 18.4447, lon: 77.4508 },
      destination: { lat: 18.3845, lon: 77.5812 },
    });

    render(<TraversePlanner />);

    // Clear Base
    const clearBtn = screen.getByRole('button', { name: /^Clear Base$/i });
    fireEvent.click(clearBtn);
    expect(useMissionStore.getState().base).toBeNull();
    expect((screen.getByTestId('input-base-lat') as HTMLInputElement).value).toBe('');

    // Switch to Destination tab
    const destTab = screen.getByTestId('tab-destination');
    fireEvent.click(destTab);

    // Clear Destination
    const clearDestBtn = screen.getByRole('button', { name: /^Clear Destination$/i });
    fireEvent.click(clearDestBtn);
    expect(useMissionStore.getState().destination).toBeNull();
    expect((screen.getByTestId('input-dest-lat') as HTMLInputElement).value).toBe('');
  });

  it('locks Base checkpoint after clicking APPLY BASE COORDINATES and unlocks only on Clear', () => {
    render(<TraversePlanner />);

    const latInput = screen.getByTestId('input-base-lat') as HTMLInputElement;
    const lonInput = screen.getByTestId('input-base-lon') as HTMLInputElement;
    const applyBtn = screen.getByTestId('btn-apply-base') as HTMLButtonElement;

    // Type coordinates and apply
    fireEvent.change(latInput, { target: { value: '18.4447' } });
    fireEvent.change(lonInput, { target: { value: '77.4508' } });
    expect(latInput.disabled).toBe(false);
    expect(lonInput.disabled).toBe(false);

    fireEvent.click(applyBtn);

    // Inputs must now be disabled / locked
    expect(latInput.disabled).toBe(true);
    expect(lonInput.disabled).toBe(true);
    expect(applyBtn.disabled).toBe(true);
    expect(screen.getByText(/BASE COORDINATES LOCKED/i)).toBeInTheDocument();
    expect(screen.getByText(/BASE CHECKPOINT LOCKED/i)).toBeInTheDocument();

    // Map clicks in Base tab must be ignored when locked
    expect(capturedMapClickHandler).toBeDefined();
    act(() => {
      capturedMapClickHandler!(19.0000, 78.0000);
    });
    // Base coordinates in store must NOT change
    expect(useMissionStore.getState().base).toEqual({ lat: 18.4447, lon: 77.4508 });
    expect(latInput.value).toBe('18.44470');

    // Preset buttons must also be disabled when locked
    const presetBtn = screen.getByRole('button', { name: /Butler Landing/i });
    expect(presetBtn).toBeDisabled();

    // Clear Base unlocks the checkpoint
    const clearBtn = screen.getByRole('button', { name: /^Clear Base$/i });
    fireEvent.click(clearBtn);

    expect(useMissionStore.getState().base).toBeNull();
    expect(latInput.disabled).toBe(false);
    expect(lonInput.disabled).toBe(false);
    expect(applyBtn.disabled).toBe(false);

    // Map click now works again
    act(() => {
      capturedMapClickHandler!(18.4000, 77.5000);
    });
    expect(useMissionStore.getState().base).toEqual({ lat: 18.4, lon: 77.5 });
  });

  it('locks Destination checkpoint after clicking APPLY DESTINATION COORDINATES and unlocks only on Clear', () => {
    render(<TraversePlanner />);

    const destTab = screen.getByTestId('tab-destination');
    fireEvent.click(destTab);

    const latInput = screen.getByTestId('input-dest-lat') as HTMLInputElement;
    const lonInput = screen.getByTestId('input-dest-lon') as HTMLInputElement;
    const applyBtn = screen.getByTestId('btn-apply-dest') as HTMLButtonElement;

    // Type destination coordinates and apply
    fireEvent.change(latInput, { target: { value: '18.3845' } });
    fireEvent.change(lonInput, { target: { value: '77.5812' } });
    fireEvent.click(applyBtn);

    // Inputs and apply button must now be locked/disabled
    expect(latInput.disabled).toBe(true);
    expect(lonInput.disabled).toBe(true);
    expect(applyBtn.disabled).toBe(true);
    expect(screen.getByText(/DESTINATION COORDINATES LOCKED/i)).toBeInTheDocument();
    expect(screen.getByText(/DESTINATION CHECKPOINT LOCKED/i)).toBeInTheDocument();

    // Map clicks in Destination tab must be ignored when locked
    expect(capturedMapClickHandler).toBeDefined();
    act(() => {
      capturedMapClickHandler!(19.5000, 79.0000);
    });
    // Destination in store must NOT change
    expect(useMissionStore.getState().destination).toEqual({ lat: 18.3845, lon: 77.5812 });
    expect(latInput.value).toBe('18.38450');

    // Preset buttons must also be disabled when locked
    const presetBtn = screen.getByRole('button', { name: /Delta Scarp Outcrop/i });
    expect(presetBtn).toBeDisabled();

    // Clicking form CLEAR button unlocks Destination
    const clearBtn = screen.getByRole('button', { name: /^CLEAR$/i });
    fireEvent.click(clearBtn);

    expect(useMissionStore.getState().destination).toBeNull();
    expect(latInput.disabled).toBe(false);
    expect(lonInput.disabled).toBe(false);
    expect(applyBtn.disabled).toBe(false);
  });

  it('allows selecting different route alternatives (Route Alpha, Route Bravo, Route Charlie) and preserves selection for 3D view', () => {
    useMissionStore.setState({
      base: { lat: 18.4447, lon: 77.4508 },
      destination: { lat: 18.3845, lon: 77.5812 },
    });

    render(<TraversePlanner />);

    // Route Alpha, Route Bravo, Route Charlie cards are selectable
    const routeCardA = screen.getByTestId('route-card-ROUTE_A');
    const routeCardC = screen.getByTestId('route-card-ROUTE_C');

    fireEvent.click(routeCardA);
    expect(useMissionStore.getState().selectedRoute?.route_id).toBe('ROUTE_A');

    fireEvent.click(routeCardC);
    expect(useMissionStore.getState().selectedRoute?.route_id).toBe('ROUTE_C');

    // Clicking VIEW IN 3D navigates to 3D terrain viewer with the selected route
    const view3DBtn = screen.getByRole('button', { name: /VIEW IN 3D/i });
    fireEvent.click(view3DBtn);

    expect(useMissionStore.getState().activePage).toBe('terrain-3d');
    expect(useMissionStore.getState().selectedRoute?.route_id).toBe('ROUTE_C');
  });

  it('maintains independent lock and clear lifecycle between Base and Destination checkpoints', () => {
    render(<TraversePlanner />);

    // 1. Lock Base
    const baseLatInput = screen.getByTestId('input-base-lat') as HTMLInputElement;
    const baseLonInput = screen.getByTestId('input-base-lon') as HTMLInputElement;
    const applyBaseBtn = screen.getByTestId('btn-apply-base');

    fireEvent.change(baseLatInput, { target: { value: '18.4447' } });
    fireEvent.change(baseLonInput, { target: { value: '77.4508' } });
    fireEvent.click(applyBaseBtn);

    expect(useMissionStore.getState().isBaseLocked).toBe(true);

    // 2. Switch to Destination and lock Destination
    const destTab = screen.getByTestId('tab-destination');
    fireEvent.click(destTab);

    const destLatInput = screen.getByTestId('input-dest-lat') as HTMLInputElement;
    const destLonInput = screen.getByTestId('input-dest-lon') as HTMLInputElement;
    const applyDestBtn = screen.getByTestId('btn-apply-dest');

    fireEvent.change(destLatInput, { target: { value: '18.3845' } });
    fireEvent.change(destLonInput, { target: { value: '77.5812' } });
    fireEvent.click(applyDestBtn);

    expect(useMissionStore.getState().isDestinationLocked).toBe(true);

    // 3. Clear Base while Destination remains locked
    const baseTab = screen.getByTestId('tab-base');
    fireEvent.click(baseTab);

    const clearBaseBtn = screen.getByRole('button', { name: /^Clear Base$/i });
    fireEvent.click(clearBaseBtn);

    expect(useMissionStore.getState().base).toBeNull();
    expect(useMissionStore.getState().isBaseLocked).toBe(false);
    expect(useMissionStore.getState().destination).toEqual({ lat: 18.3845, lon: 77.5812 });
    expect(useMissionStore.getState().isDestinationLocked).toBe(true);
  });
});
