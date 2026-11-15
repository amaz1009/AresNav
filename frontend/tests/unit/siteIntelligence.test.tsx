import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SiteIntelligence } from '../../src/features/site-intelligence/SiteIntelligence';
import { useMissionStore } from '../../src/store/missionStore';
import { GALE_CANDIDATE_SITES } from '../../src/mocks/demoData';

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
    getZoom: vi.fn(() => 10),
  }),
  useMapEvents: () => null,
}));

describe('SiteIntelligence Feature', () => {
  beforeEach(() => {
    markerHandlers = {};
    useMissionStore.setState({
      candidateSites: GALE_CANDIDATE_SITES,
      selectedSite: null,
      selectedPoint: null,
    });
  });

  it('renders top bar with site count and no hardcoded details initially', () => {
    render(<SiteIntelligence />);

    expect(screen.getByText(/Candidate Site Intelligence & Ranking/i)).toBeInTheDocument();
    expect(screen.getByText(/Candidate Sites Ledger/i)).toBeInTheDocument();

    // Site intelligence slot should be in empty awaiting state initially (no site hardcoded)
    const slot = screen.getByTestId('site-intelligence-slot');
    expect(slot).toHaveTextContent(/No candidate site selected/i);
    expect(slot).toHaveTextContent(/Highlighted on map with blue points/i);
  });

  it('displays candidate sites on map with blue point markers', () => {
    render(<SiteIntelligence />);

    const markers = screen.getAllByTestId('map-marker');
    // Markers should be present for candidate sites
    expect(markers.length).toBeGreaterThanOrEqual(GALE_CANDIDATE_SITES.length);
  });

  it('clicking a site card in the ledger reveals site details in the site intelligence slot', () => {
    render(<SiteIntelligence />);

    const firstSite = GALE_CANDIDATE_SITES[0];
    const firstCard = screen.getByTestId(`site-card-${firstSite.site_id}`);

    // Click on the site card
    fireEvent.click(firstCard);

    // Site intelligence slot should now show the full dossier
    const slot = screen.getByTestId('site-intelligence-slot');
    expect(slot).toHaveTextContent(firstSite.name);
    expect(slot).toHaveTextContent(`RADIUS: ${firstSite.radius_m}M`);
    expect(slot).toHaveTextContent(/Multi-Criteria Evaluation Scores/i);
    expect(slot).toHaveTextContent(firstSite.geological_context);
  });

  it('clicking a blue point marker on the map reveals site details in the site intelligence slot', () => {
    render(<SiteIntelligence />);

    const targetSite = GALE_CANDIDATE_SITES[1];
    const key = `${targetSite.point.lat}_${targetSite.point.lon}`;

    // Click marker
    const marker = document.querySelector(`[data-pos="${key}"]`);
    expect(marker).toBeInTheDocument();
    fireEvent.click(marker!);

    // Site intelligence slot should now show targetSite details
    const slot = screen.getByTestId('site-intelligence-slot');
    expect(slot).toHaveTextContent(targetSite.name);
    expect(slot).toHaveTextContent(`RADIUS: ${targetSite.radius_m}M`);
  });

  it('allows deselecting a site to return the site intelligence slot to empty state', () => {
    useMissionStore.setState({ selectedSite: GALE_CANDIDATE_SITES[0] });

    render(<SiteIntelligence />);

    const slot = screen.getByTestId('site-intelligence-slot');
    expect(slot).toHaveTextContent(GALE_CANDIDATE_SITES[0].name);

    // Click DESELECT button
    const deselectBtn = screen.getByTestId('btn-deselect-site');
    fireEvent.click(deselectBtn);

    // Should return to empty state
    expect(slot).toHaveTextContent(/No candidate site selected/i);
  });

  it('filters candidate sites ledger by safety status', () => {
    render(<SiteIntelligence />);

    // Click PASS filter
    const passBtn = screen.getByRole('button', { name: /^PASS$/i });
    fireEvent.click(passBtn);

    const passSites = GALE_CANDIDATE_SITES.filter((s) => s.status === 'PASS');
    expect(screen.getByText(`${passSites.length} of ${GALE_CANDIDATE_SITES.length}`)).toBeInTheDocument();
  });
});
