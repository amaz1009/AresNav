import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MissionSimulation } from '../../src/features/mission-simulation/MissionSimulation';
import { useMissionStore } from '../../src/store/missionStore';
import { GALE_ROUTES, DEFAULT_EVA_CONFIG } from '../../src/mocks/demoData';
import type { TraverseRoute } from '../../src/types/models';

describe('MissionSimulation Feature (Backend Aligned & Route-Driven)', () => {
  beforeEach(() => {
    // Reset store
    useMissionStore.setState({
      selectedRoute: null,
      selected_route_id: null,
      simulationResult: null,
      evaConfigParams: DEFAULT_EVA_CONFIG,
      activePage: 'simulation',
    });
  });

  it('renders clean empty state with prompt when no traverse route is planned', () => {
    render(<MissionSimulation />);

    expect(screen.getByText(/No Active Traverse Route Planned/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Traverse Planner/i)).toBeInTheDocument();
    expect(screen.queryByText(/Route A \(Lowest Risk\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Route B \(Balanced\)/i)).not.toBeInTheDocument();
  });

  it('clicking Open Traverse Planner in empty state navigates to planner', () => {
    render(<MissionSimulation />);

    const openPlannerBtn = screen.getByRole('button', { name: /Open Traverse Planner/i });
    fireEvent.click(openPlannerBtn);

    expect(useMissionStore.getState().activePage).toBe('traverse');
  });

  it('renders dynamic life-support metrics and HUD when a route is configured', () => {
    const customRoute: TraverseRoute = {
      route_id: 'TRAVERSE_PLANNER_ROUTE',
      name: 'Custom Traverse Route (Base → Destination)',
      region_id: 'gale_mount_sharp',
      objective: 'LOWEST_RISK',
      status: 'PASS',
      total_distance_km: 1.85,
      surface_distance_km: 1.92,
      estimated_duration_hours: 0.85,
      walking_time_hours: 0.71,
      science_time_hours: 0.33,
      ascent_m: 45,
      descent_m: 12,
      max_slope_deg: 8.4,
      average_slope_deg: 4.2,
      fraction_above_warning_slope: 0.0,
      max_distance_from_base_m: 1720,
      return_reserve_feasibility: 'PASS',
      science_stops: [],
      waypoints: [
        { lat: -4.8, lon: 137.3 },
        { lat: -4.82, lon: 137.33 },
      ],
      elevation_profile: [
        { distance_m: 0, elevation_m: -4450, slope_deg: 2.1, roughness_m: 0.05, point: { lat: -4.8, lon: 137.3 } },
        { distance_m: 960, elevation_m: -4420, slope_deg: 4.2, roughness_m: 0.07, point: { lat: -4.81, lon: 137.315 } },
        { distance_m: 1920, elevation_m: -4405, slope_deg: 3.5, roughness_m: 0.06, point: { lat: -4.82, lon: 137.33 } },
      ],
      hazard_intersections: [],
      limitations: [],
    };

    useMissionStore.getState().setSelectedRoute(customRoute);

    render(<MissionSimulation />);

    // Verify Active Route HUD
    expect(screen.getByText(/Custom Traverse Route \(Base → Destination\)/i)).toBeInTheDocument();
    expect(screen.getByText(/1.92 km/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg 4.2° \/ Max 8.4°/i)).toBeInTheDocument();

    // Verify 4 metric ledger cells
    expect(screen.getByText(/Oxygen Reserve Margin/i)).toBeInTheDocument();
    expect(screen.getByText(/Battery Power/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Turn-Back/i)).toBeInTheDocument();
    expect(screen.getByText(/Walk-Back Reach/i)).toBeInTheDocument();

    // Verify 7 backend safety check criteria
    expect(screen.getByText(/Peak Terrain Slope Ceiling/i)).toBeInTheDocument();
    expect(screen.getByText(/Hazard & Impassable Surface Avoidance/i)).toBeInTheDocument();
    expect(screen.getByText(/High-Resolution DTM Spatial Coverage/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Mission Duration Ceiling/i)).toBeInTheDocument();
    expect(screen.getByText(/Contingency Return Reserve Margin/i)).toBeInTheDocument();
    expect(screen.getByText(/Residual Surface Roughness Ceiling/i)).toBeInTheDocument();
    expect(screen.getByText(/Walk-Back Radius Limit \(Apollo Reference\)/i)).toBeInTheDocument();

    // Verify research disclaimer
    expect(screen.getByText(/RESEARCH DISCLAIMER/i)).toBeInTheDocument();
  });

  it('updates simulation dynamically when the active route changes', () => {
    const route1 = GALE_ROUTES[0];
    const route2 = GALE_ROUTES[1];

    useMissionStore.getState().setSelectedRoute(route1);
    const { rerender } = render(<MissionSimulation />);

    expect(screen.getByText(/Route Alpha/i)).toBeInTheDocument();

    // Switch route
    useMissionStore.getState().setSelectedRoute(route2);
    rerender(<MissionSimulation />);

    expect(screen.getByText(/Route Bravo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Route Alpha/i)).not.toBeInTheDocument();
  });

  it('updates life-support simulation when EVA parameters change', () => {
    const route = GALE_ROUTES[0];
    useMissionStore.getState().setSelectedRoute(route);

    render(<MissionSimulation />);

    // Adjust crew size
    const crewSlider = screen.getByDisplayValue(String(DEFAULT_EVA_CONFIG.crew_size));
    fireEvent.change(crewSlider, { target: { value: '4' } });

    expect(useMissionStore.getState().evaConfigParams.crew_size).toBe(4);
    expect(useMissionStore.getState().simulationResult).not.toBeNull();
  });
});
