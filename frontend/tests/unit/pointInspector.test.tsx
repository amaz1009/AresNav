import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PointInspector } from '../../src/features/inspector/PointInspector';
import { useMissionStore } from '../../src/store/missionStore';
import { createSampleInspection } from '../../src/features/mock/sampleData';

describe('PointInspector (WP-09 / T-FE-03)', () => {
  beforeEach(() => {
    useMissionStore.setState({
      selectedPoint: null,
      pointInspection: null,
      isLoading: false,
    });
  });

  it('renders prompt when no point is selected', () => {
    render(<PointInspector />);
    expect(screen.getByText('No point selected.')).toBeInTheDocument();
    expect(
      screen.getByText(/Click any location on the Mars map to inspect/i)
    ).toBeInTheDocument();
  });

  it('T-FE-03: renders prominent SAMPLE badge when inspection contains SAMPLE data', () => {
    const sampleInspection = createSampleInspection(-4.75, 137.28);
    useMissionStore.setState({
      selectedPoint: { lat: -4.75, lon: 137.28 },
      pointInspection: sampleInspection,
    });

    render(<PointInspector />);

    // T-FE-03: visible SAMPLE badge
    const badges = screen.getAllByTestId('sample-badge');
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(badges[0]).toBeVisible();
    expect(badges[0]).toHaveTextContent(/SAMPLE DATA/i);

    // Verify coordinates display
    expect(screen.getByText('-4.75000Â°')).toBeInTheDocument();
    expect(screen.getByText('137.28000Â°')).toBeInTheDocument();

    // Verify layer values and confidence
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText(/elevation/i)).toBeInTheDocument();
    expect(screen.getByText(/slope/i)).toBeInTheDocument();
    expect(screen.getByText(/roughness/i)).toBeInTheDocument();
  });

  it('invokes onInspectDataset when source dataset is clicked in evidence chain', () => {
    const onInspect = vi.fn();
    const sampleInspection = createSampleInspection(-4.75, 137.28);
    useMissionStore.setState({
      selectedPoint: { lat: -4.75, lon: 137.28 },
      pointInspection: sampleInspection,
    });

    render(<PointInspector onInspectDataset={onInspect} />);

    const datasetButtons = screen.getAllByRole('button', {
      name: 'HIRISE_DTM_GALE_MOUND',
    });
    expect(datasetButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(datasetButtons[0]);
    expect(onInspect).toHaveBeenCalledWith('HIRISE_DTM_GALE_MOUND');
  });

  it('renders environmental context indicators for radiation and thermal', () => {
    const sampleInspection = createSampleInspection(-4.75, 137.28);
    useMissionStore.setState({
      selectedPoint: { lat: -4.75, lon: 137.28 },
      pointInspection: sampleInspection,
    });

    render(<PointInspector />);

    expect(screen.getByText('RADIATION CONTEXT')).toBeInTheDocument();
    expect(screen.getByText(/235 ÂµGy\/day/i)).toBeInTheDocument();
    expect(screen.getByText('THERMAL CONTEXT')).toBeInTheDocument();
  });
});
