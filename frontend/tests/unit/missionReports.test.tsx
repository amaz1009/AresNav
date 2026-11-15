import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MissionReports } from '../../src/features/mission-reports/MissionReports';
import { useMissionStore } from '../../src/store/missionStore';
import { reportService } from '../../src/services/reportService';
import { GALE_REGION, GALE_CANDIDATE_SITES, GALE_ROUTES } from '../../src/mocks/demoData';

vi.mock('../../src/services/reportService', () => {
  return {
    reportService: {
      generateBriefing: vi.fn((region, site, route, sim, config) => ({
        title: `Mission Briefing — ${region.name}`,
        generated_at: new Date().toISOString(),
        disclaimer: 'DISCLAIMER',
        region,
        site,
        route,
        simulation: sim,
        config,
        markdown: '# AresNav Briefing',
      })),
      downloadMarkdown: vi.fn(),
      downloadDocx: vi.fn().mockResolvedValue(undefined),
      downloadPdf: vi.fn(),
    },
  };
});

describe('MissionReports Feature — Multi-Format Export (.md, .docx, .pdf)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMissionStore.setState({
      selectedRegion: GALE_REGION,
      candidateSites: GALE_CANDIDATE_SITES,
      selectedSite: GALE_CANDIDATE_SITES[0],
      routes: GALE_ROUTES,
      selectedRoute: GALE_ROUTES[0],
      simulationResult: {
        total_duration_hours: 4.8,
        oxygen_used_liters: 940,
        oxygen_margin_percent: 42,
        battery_used_wh: 1250,
        battery_margin_percent: 54,
        water_used_liters: 3.2,
        turn_back_distance_km: 3.6,
        turn_back_elapsed_min: 144,
        walkback_radius_m: 4200,
        overall_status: 'PASS',
        timeline: [],
        checks: [
          { id: 'chk-1', label: 'Oxygen Reserve Margin', status: 'PASS', detail: '42% remaining' },
          { id: 'chk-2', label: 'Battery Capacity', status: 'PASS', detail: '54% remaining' },
        ],
      },
      base: { lat: -4.6, lon: 137.4 },
      destination: { lat: -4.68, lon: 137.38 },
    });
  });

  it('renders prompt when no traverse path is configured', () => {
    useMissionStore.setState({
      base: null,
      destination: null,
      selectedRoute: null,
    });

    render(<MissionReports />);

    expect(screen.getByText(/No Traverse Path Defined/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Traverse Planner/i)).toBeInTheDocument();
  });

  it('renders mission briefing dossier and all export options (.md, .docx, .pdf)', () => {
    render(<MissionReports />);

    expect(screen.getByText(/Mission Briefing & Scientific Evidence Report/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /COPY MD/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EXPORT \.MD/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EXPORT \.DOCX/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EXPORT \.PDF/i })).toBeInTheDocument();
  });

  it('triggers downloadMarkdown when EXPORT .MD button is clicked', () => {
    render(<MissionReports />);

    const exportMdBtn = screen.getByRole('button', { name: /EXPORT \.MD/i });
    fireEvent.click(exportMdBtn);

    expect(reportService.downloadMarkdown).toHaveBeenCalledTimes(1);
  });

  it('triggers downloadDocx when EXPORT .DOCX button is clicked', async () => {
    render(<MissionReports />);

    const exportDocxBtn = screen.getByRole('button', { name: /EXPORT \.DOCX/i });
    fireEvent.click(exportDocxBtn);

    expect(reportService.downloadDocx).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(exportDocxBtn).not.toBeDisabled();
    });
  });

  it('triggers downloadPdf when EXPORT .PDF button is clicked', () => {
    render(<MissionReports />);

    const exportPdfBtn = screen.getByRole('button', { name: /EXPORT \.PDF/i });
    fireEvent.click(exportPdfBtn);

    expect(reportService.downloadPdf).toHaveBeenCalledTimes(1);
  });
});
