import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerPanel } from '../../src/features/layers/LayerPanel';
import { useMissionStore } from '../../src/store/missionStore';
import { SAMPLE_LAYERS } from '../../src/features/mock/sampleData';

describe('LayerPanel (WP-09 / T-FE-01)', () => {
  beforeEach(() => {
    useMissionStore.setState({
      layers: SAMPLE_LAYERS,
      activeLayerIds: ['elevation'],
      layerOpacities: { elevation: 1.0 },
      selected_route_id: 'route_test_alpha',
      plan: {
        plan_id: 'plan_123',
        region_id: 'gale_mount_sharp',
        plan_status: 'OK',
        blocking_reason: null,
        routes: [],
        omitted_objectives: [],
        eva_config: {
          base_speed_kmh: 2.7,
          default_work_time_min: 20,
          max_distance_from_base_m: 2000,
          max_eva_hours: 6.0,
          max_slope_deg: 15,
          return_reserve_fraction: 0.25,
          roughness_warning_m: 0.3,
          traverse_time_margin: 1.25,
          warning_slope_deg: 10,
        },
        assumptions: [],
        grid: {
          analysis_crs: 'IAU2000:49900',
          cell_size_m: 10,
          rows: 100,
          cols: 100,
        },
        computed_at: '2026-11-14T09:00:00Z',
        engine_version: '0.1.0',
      },
    });
  });

  it('renders all layers with status and controls', () => {
    render(<LayerPanel />);

    expect(screen.getByText('Map Layers (6)')).toBeInTheDocument();
    expect(screen.getByText('HiRISE Surface Elevation')).toBeInTheDocument();
    expect(screen.getByText('CRISM Mineral Signatures')).toBeInTheDocument();
    expect(screen.getByText('CRISM targeted observation not yet validated in this sector')).toBeInTheDocument();
  });

  it('disables unavailable layers', () => {
    render(<LayerPanel />);

    const unavailableCheckbox = screen.getByRole('checkbox', {
      name: /CRISM Mineral Signatures/i,
    });
    expect(unavailableCheckbox).toBeDisabled();
  });

  it('T-FE-01: toggling map layers keeps selected route and plan unchanged in store', () => {
    render(<LayerPanel />);

    const orthoCheckbox = screen.getByRole('checkbox', {
      name: /HiRISE Optical Basemap/i,
    });
    expect(orthoCheckbox).not.toBeChecked();

    // Toggle ortho layer on
    fireEvent.click(orthoCheckbox);

    const stateAfterToggle = useMissionStore.getState();
    expect(stateAfterToggle.activeLayerIds).toContain('ortho');
    // Critical verification of T-FE-01: route and plan must remain strictly untouched
    expect(stateAfterToggle.selected_route_id).toBe('route_test_alpha');
    expect(stateAfterToggle.plan?.plan_id).toBe('plan_123');
    expect(stateAfterToggle.plan?.plan_status).toBe('OK');
  });

  it('adjusts layer opacity slider without mutating route or plan', () => {
    render(<LayerPanel />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.6' } });

    const state = useMissionStore.getState();
    expect(state.layerOpacities['elevation']).toBe(0.6);
    expect(state.selected_route_id).toBe('route_test_alpha');
  });

  it('calls onInspectDataset when source link is clicked', () => {
    const onInspect = vi.fn();
    render(<LayerPanel onInspectDataset={onInspect} />);

    const sourceBtn = screen.getByRole('button', { name: 'HIRISE_DTM_GALE_MOUND' });
    fireEvent.click(sourceBtn);

    expect(onInspect).toHaveBeenCalledWith('HIRISE_DTM_GALE_MOUND');
  });
});
