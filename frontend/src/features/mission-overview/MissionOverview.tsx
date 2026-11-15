import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SampleBadge } from '../common/SampleBadge';
import {
  Compass,
  MapPin,
  Route,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Database,
  Layers,
  Scale,
} from 'lucide-react';

interface MissionOverviewProps {
  onRevertToLanding?: () => void;
}

export const MissionOverview: React.FC<MissionOverviewProps> = ({ onRevertToLanding }) => {
  const {
    selectedRegion,
    selectedSite,
    selectedRoute,
    simulationResult,
    evaConfigParams,
    setActivePage,
  } = useMissionStore();

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1720px] mx-auto w-full select-text font-sans bg-[#111215]">
      {/* Top Mission Briefing Panel */}
      <div className="border border-[#282C37] bg-[#17191E] p-6 md:p-8 rounded-[2px] relative">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] font-semibold text-[#E27B54] bg-[#C85A32]/15 px-2.5 py-0.5 rounded-[2px] border border-[#C85A32]/30">
                NASA SPACE APPS 2026 BLUEPRINT
              </span>
              {onRevertToLanding && (
                <button
                  onClick={onRevertToLanding}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[2px] bg-[#281814] hover:bg-[#3D1E16] border border-[#C85A32]/40 hover:border-[#C85A32] text-[#E27B54] hover:text-[#FAF8F5] text-[9.5px] font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer"
                  title="Return to the Landing Page"
                >
                  <ArrowLeft className="h-2.5 w-2.5 text-[#C85A32]" />
                  <span>Revert to Landing Page</span>
                </button>
              )}
              <span className="text-[#363B4A]">/</span>
              <span className="text-[10px] font-mono text-[#8B909A] tracking-wider">
                EXPLORATION REGION
              </span>
              <span className="text-[#363B4A]">/</span>
              <SampleBadge label="PLANNING PROTOTYPE" />
            </div>
            <h2 className="text-3xl md:text-4xl font-normal text-[#F4F4F2] tracking-wide leading-tight font-editorial">
              {selectedRegion.name}
            </h2>
            <p className="text-sm text-[#C4C7C5] leading-relaxed max-w-3xl font-sans font-light">
              {selectedRegion.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onRevertToLanding && (
              <button
                onClick={onRevertToLanding}
                className="px-4 py-2.5 rounded-[2px] bg-[#281814] hover:bg-[#3D1E16] border border-[#C85A32]/60 hover:border-[#C85A32] text-[#E27B54] hover:text-[#FAF8F5] text-xs font-mono uppercase tracking-[0.14em] flex items-center space-x-2 transition-all duration-150 cursor-pointer shadow-sm"
                title="Go back to the Landing Page"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#C85A32]" />
                <span>REVERT TO LANDING PAGE</span>
              </button>
            )}
            <button
              onClick={() => setActivePage('explorer')}
              className="btn-primary space-x-2"
            >
              <span>OPEN MARS EXPLORER</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setActivePage('traverse')}
              className="btn-secondary space-x-2"
            >
              <span>VIEW TRAVERSE ROUTES</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#8B909A]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Primary Scientific Objective Callout */}
        <div className="mt-6 pt-4 border-t border-[#282C37] flex items-start space-x-2.5 text-xs">
          <Compass className="h-4 w-4 text-[#C85A32] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="space-y-0.5 font-sans">
            <span className="font-semibold text-[#F4F4F2] uppercase text-[10px] font-mono tracking-[0.14em]">
              Primary Exploration Objective:{' '}
            </span>
            <span className="text-[#C4C7C5]">{selectedRegion.science_objective}</span>
          </div>
        </div>
      </div>

      {/* Contiguous Operational Metric Ledger */}
      <div className="border border-[#282C37] bg-[#17191E] rounded-[2px] divide-y sm:divide-y-0 sm:divide-x divide-[#282C37] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Selected Candidate Site */}
        <div
          onClick={() => setActivePage('sites')}
          className="p-5 cursor-pointer hover:bg-[#1D2026] transition-colors duration-150 space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <MapPin className="h-3.5 w-3.5 text-[#8B909A] group-hover:text-[#C85A32] transition-colors" strokeWidth={1.5} />
              <span>Target Exploration Site</span>
            </span>
            {selectedSite && <StatusBadge status={selectedSite.status} size="sm" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F4F4F2] tracking-wide truncate font-editorial">
              {selectedSite ? selectedSite.name : 'None selected'}
            </h3>
            <span className="text-[11px] font-mono text-[#8B909A] mt-0.5 block">
              {selectedSite ? `Score: ${selectedSite.suitability_score.toFixed(1)}/100` : 'Click to inspect candidates'}
            </span>
          </div>
        </div>

        {/* Metric 2: Active Traverse Route */}
        <div
          onClick={() => setActivePage('traverse')}
          className="p-5 cursor-pointer hover:bg-[#1D2026] transition-colors duration-150 space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <Route className="h-3.5 w-3.5 text-[#8B909A] group-hover:text-[#C85A32] transition-colors" strokeWidth={1.5} />
              <span>Planned Traverse</span>
            </span>
            {selectedRoute && <StatusBadge status={selectedRoute.status} size="sm" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F4F4F2] tracking-wide truncate font-editorial">
              {selectedRoute ? selectedRoute.name : 'No route active'}
            </h3>
            <span className="text-[11px] font-mono text-[#8B909A] mt-0.5 block">
              {selectedRoute
                ? `${selectedRoute.total_distance_km.toFixed(1)} km · ${selectedRoute.estimated_duration_hours.toFixed(1)}h EVA`
                : 'Configure route endpoints'}
            </span>
          </div>
        </div>

        {/* Metric 3: EVA Simulation Status */}
        <div
          onClick={() => setActivePage('simulation')}
          className="p-5 cursor-pointer hover:bg-[#1D2026] transition-colors duration-150 space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <Activity className="h-3.5 w-3.5 text-[#8B909A] group-hover:text-[#C85A32] transition-colors" strokeWidth={1.5} />
              <span>Mission Consumables</span>
            </span>
            {simulationResult && (
              <span
                className={`font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] font-semibold ${
                  simulationResult.overall_status === 'PASS'
                    ? 'bg-[#122419] text-[#4E9A68] border border-[#1E3E2B]'
                    : 'bg-[#291516] text-[#C94D4D] border border-[#4F2325]'
                }`}
              >
                {simulationResult.overall_status === 'PASS' ? 'FEASIBLE' : 'DEFICIT'}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F4F4F2] tracking-wide font-editorial">
              {simulationResult ? `${simulationResult.total_duration_hours.toFixed(1)}h Planned EVA` : 'Unmodeled'}
            </h3>
            <span className="text-[11px] font-mono text-[#8B909A] mt-0.5 block">
              O₂: {evaConfigParams.oxygen_consumption_rate_lpm} L/min · Crew: {evaConfigParams.crew_size} · Reserve: {(evaConfigParams.return_reserve_fraction * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Metric 4: Scientific Datasets */}
        <div
          onClick={() => setActivePage('catalogue')}
          className="p-5 cursor-pointer hover:bg-[#1D2026] transition-colors duration-150 space-y-2.5 group"
        >
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <Database className="h-3.5 w-3.5 text-[#8B909A] group-hover:text-[#C85A32] transition-colors" strokeWidth={1.5} />
              <span>NASA Data Baseline</span>
            </span>
            <span className="text-[9px] font-mono text-[#4E9A68] bg-[#122419] border border-[#1E3E2B] px-1.5 py-0.5 rounded-[2px]">
              5 ACTIVE
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F4F4F2] tracking-wide font-editorial">
              Orbital GIS Products
            </h3>
            <span className="text-[11px] font-mono text-[#8B909A] mt-0.5 block">
              HiRISE Ortho, Elevation DTM, Slope, Hazard, MOLA
            </span>
          </div>
        </div>
      </div>

      {/* The 3 Core Architecture Questions from the PDF Blueprint */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.14em] text-[#8B909A] font-semibold">
          <Scale className="h-3.5 w-3.5 text-[#C85A32]" />
          <span>Core Decision-Support Framework (PDF Blueprint Section 1)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Site Suitability */}
          <div
            onClick={() => setActivePage('sites')}
            className="bg-[#17191E] border border-[#282C37] p-5 rounded-[2px] cursor-pointer hover:border-[#C85A32]/60 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A32] font-semibold">
                PILLAR 01
              </span>
              <MapPin className="h-4 w-4 text-[#C85A32]" />
            </div>
            <h3 className="text-base font-semibold text-[#F4F4F2] font-editorial">
              Where should a mission operate?
            </h3>
            <p className="text-xs text-[#8B909A] leading-relaxed font-sans">
              Evaluates landing areas with hard exclusion safety constraints, multi-criteria suitability scoring (terrain, human safety, science, resources, and accessibility), and remote-sensing evidence.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#E27B54] flex items-center space-x-1">
              <span>Inspect candidate sites</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Pillar 2: Traverse Suitability */}
          <div
            onClick={() => setActivePage('traverse')}
            className="bg-[#17191E] border border-[#282C37] p-5 rounded-[2px] cursor-pointer hover:border-[#C85A32]/60 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A32] font-semibold">
                PILLAR 02
              </span>
              <Route className="h-4 w-4 text-[#C85A32]" />
            </div>
            <h3 className="text-base font-semibold text-[#F4F4F2] font-editorial">
              Can a crew travel between locations?
            </h3>
            <p className="text-xs text-[#8B909A] leading-relaxed font-sans">
              Deterministic terrain-aware graph pathfinding (A*) evaluates slope gradients, surface roughness, cliff shadows, walkback thresholds, and generates multi-objective candidate alternatives.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#E27B54] flex items-center space-x-1">
              <span>Plan traverse routes</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Pillar 3: Mission Feasibility */}
          <div
            onClick={() => setActivePage('simulation')}
            className="bg-[#17191E] border border-[#282C37] p-5 rounded-[2px] cursor-pointer hover:border-[#C85A32]/60 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A32] font-semibold">
                PILLAR 03
              </span>
              <Activity className="h-4 w-4 text-[#C85A32]" />
            </div>
            <h3 className="text-base font-semibold text-[#F4F4F2] font-editorial">
              Can the crew complete the activity safely?
            </h3>
            <p className="text-xs text-[#8B909A] leading-relaxed font-sans">
              Models human metabolic expenditure, spacesuit consumables (oxygen, battery, water), communication line-of-sight margins, and verifies mandatory 25% emergency return reserves.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#E27B54] flex items-center space-x-1">
              <span>Simulate mission parameters</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Verification Checklist */}
      <div className="bg-[#17191E] border border-[#282C37] p-6 rounded-[2px] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.14em] text-[#F4F4F2] font-semibold">
            <Layers className="h-4 w-4 text-[#C85A32]" />
            <span>Integrated NASA Planetary Datasets (PDF Blueprint Section 3.1)</span>
          </div>
          <button
            onClick={() => setActivePage('layers')}
            className="btn-tertiary text-xs"
          >
            Manage Layers & Products →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 text-xs">
          {[
            { id: 'HiRISE', name: 'HiRISE Surface Mosaic (Ortho)', inst: 'MRO / UArizona', res: '0.25m / 1.0m', status: 'ACTIVE' },
            { id: 'HiRISE DTM', name: 'Surface Elevation DTM', inst: 'MRO / NASA PDS', res: '1.0m DTM', status: 'ACTIVE' },
            { id: 'SLOPE', name: 'Calculated Slope Gradient', inst: 'Deterministic GIS', res: '1.0m Grid', status: 'ACTIVE' },
            { id: 'HAZARD', name: 'Traverse Hazard Classification', inst: 'Safety Engine', res: '1.0m Raster', status: 'ACTIVE' },
            { id: 'MOLA', name: 'MOLA Regional Elevation Baseline', inst: 'MGS / NASA PDS', res: '463m Regional', status: 'ACTIVE' },
          ].map((d) => (
            <div
              key={d.id}
              className="bg-[#1D2026] border border-[#282C37] p-3 rounded-[2px] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#F4F4F2]">{d.id}</span>
                <span className="font-mono text-[9px] text-[#4E9A68] bg-[#122419] border border-[#1E3E2B] px-1.5 py-0.2 rounded-[2px]">
                  {d.status}
                </span>
              </div>
              <p className="text-[#C4C7C5] truncate font-editorial text-[13px]">{d.name}</p>
              <div className="flex justify-between text-[10px] font-mono text-[#8B909A]">
                <span>{d.inst}</span>
                <span>{d.res}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
