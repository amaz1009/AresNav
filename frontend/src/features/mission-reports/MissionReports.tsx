import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { reportService } from '../../services/reportService';
import { SampleBadge } from '../common/SampleBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Download,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react';

export const MissionReports: React.FC = () => {
  const {
    selectedRegion,
    selectedSite,
    selectedRoute,
    simulationResult,
    evaConfigParams,
    candidateSites,
    routes,
    base,
    destination,
    setActivePage,
  } = useMissionStore();

  const [copied, setCopied] = useState(false);

  const site = selectedSite || candidateSites[0];
  const isPathConfigured = Boolean((base && destination) || selectedRoute);
  const route = isPathConfigured ? (selectedRoute || routes[0]) : null;
  const sim = isPathConfigured ? simulationResult : null;

  if (!isPathConfigured || !route || !sim) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1280px] mx-auto w-full select-text font-sans bg-[#050507]">
        {/* Header Panel */}
        <div className="border border-[#181A22] bg-[#0A0B0E] p-6 md:p-8 rounded-[2px] flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <FileText className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold">
                EXPLAINABLE MISSION BRIEFING (PDF SECTION 10.6)
              </span>
              <span className="text-[#222530]">/</span>
              <SampleBadge label="GENERATED DOSSIER" />
            </div>
            <h2 className="text-3xl font-normal text-[#F4F4F2] tracking-wide font-editorial">
              Mission Briefing & Scientific Evidence Report
            </h2>
            <p className="text-xs text-[#8B909A] font-mono">
              IAU2000:49900 Compliant Planetary Dossier
            </p>
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="border border-[#181A22] bg-[#0A0B0E] p-10 md:p-14 rounded-[2px] flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center">
            <FileText className="h-7 w-7 text-[#C85A32]" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-normal text-[#F4F4F2] font-editorial tracking-wide">
              No Traverse Path Defined
            </h3>
            <p className="text-xs text-[#8B909A] leading-relaxed font-sans font-light">
              Mission briefings, safety audits, and feasibility dossiers are compiled dynamically from the planned traverse route and simulation. Please configure both starting point (Base) and destination checkpoints in the Traverse Planner first.
            </p>
          </div>
          <button
            onClick={() => setActivePage('traverse')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#D6653C] text-[#F4F4F2] text-xs font-mono font-medium rounded-[2px] transition-colors uppercase tracking-wider"
          >
            <span>Open Traverse Planner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const briefing = reportService.generateBriefing(
    selectedRegion,
    site,
    route,
    sim,
    evaConfigParams
  );

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(briefing.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([briefing.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ARESNAV_MISSION_BRIEFING_${selectedRegion.region_id.toUpperCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1280px] mx-auto w-full select-text font-sans bg-[#050507]">
      {/* Header & Export Actions */}
      <div className="border border-[#181A22] bg-[#0A0B0E] p-6 md:p-8 rounded-[2px] flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <FileText className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold">
              EXPLAINABLE MISSION BRIEFING (PDF SECTION 10.6)
            </span>
            <span className="text-[#222530]">/</span>
            <SampleBadge label="GENERATED DOSSIER" />
          </div>
          <h2 className="text-3xl font-normal text-[#F4F4F2] tracking-wide font-editorial">
            Mission Briefing & Scientific Evidence Report
          </h2>
          <p className="text-xs text-[#8B909A] font-mono">
            Generated: {new Date(briefing.generated_at).toLocaleString()} • Model v0.1.0 • PDS IAU2000:49900 Compliant
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary space-x-2 text-[10px] tracking-[0.14em]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#4E9A68]" strokeWidth={1.5} /> : <Copy className="h-3.5 w-3.5 text-[#8B909A]" strokeWidth={1.5} />}
            <span>{copied ? 'COPIED!' : 'COPY MD'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="btn-primary space-x-2 text-[10px] tracking-[0.14em]"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>EXPORT BRIEFING (.MD)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Safety Alert Callout */}
      <div className="border border-[#4C3B20] bg-[#282114] p-4 rounded-[2px] flex items-start space-x-3 text-xs text-[#D4A359]">
        <AlertTriangle className="h-4 w-4 text-[#D4A359] shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="space-y-1">
          <strong className="text-[#F4F4F2] block font-mono text-[11px] uppercase tracking-[0.14em] font-semibold">
            SCIENTIFIC PLANNING PROTOTYPE — NOT A CERTIFIED ASTRONAUT SAFETY SYSTEM
          </strong>
          <p className="text-[#D4A359]/90 leading-relaxed text-[11px] font-sans">
            All numerical analyses, slopes, and traverse costs are computed deterministically from NASA orbital remote sensing products.
            Ground-truth verification and formal human-rating reviews are required before operational deployment.
          </p>
        </div>
      </div>

      {/* Rendered Technical Document */}
      <article className="bg-[#0A0B0E] border border-[#181A22] p-8 md:p-10 rounded-[2px] space-y-7 text-[#C4C7C5] text-xs leading-relaxed">
        {/* Section 1: Executive Overview */}
        <section className="space-y-3.5 border-b border-[#181A22] pb-7">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold block">Section 01</span>
          <h3 className="text-base font-semibold text-[#F4F4F2] tracking-wide uppercase font-editorial">Executive Mission Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            <div className="bg-[#0A0B0E] p-4 rounded-[2px] border border-[#181A22]">
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.14em] font-semibold">Exploration Region</span>
              <strong className="text-[#F4F4F2] text-lg block mt-0.5 font-editorial">{selectedRegion.name}</strong>
              <p className="text-[#8B909A] text-[11px] mt-0.5 font-sans">{selectedRegion.sub_heading}</p>
            </div>
            <div className="bg-[#0A0B0E] p-4 rounded-[2px] border border-[#181A22]">
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.14em] font-semibold">Overall Feasibility Assessment</span>
              <div className="flex items-center space-x-2 mt-1.5">
                <StatusBadge status={sim.overall_status} />
                <span className="text-[#F4F4F2] font-mono text-[11px]">
                  {sim.overall_status === 'PASS' ? 'All Operational Constraints Satisfied' : 'Review Required'}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#0A0B0E] p-4 rounded-[2px] border border-[#181A22] mt-2">
            <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.14em] font-semibold">Primary Science Objective</span>
            <p className="text-[#F4F4F2] mt-1 leading-relaxed font-sans">{selectedRegion.science_objective}</p>
          </div>
        </section>

        {/* Section 2: Candidate Site Selection */}
        <section className="space-y-3.5 border-b border-[#181A22] pb-7">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold block">Section 02</span>
          <h3 className="text-base font-semibold text-[#F4F4F2] tracking-wide uppercase font-editorial">Candidate Site Selection Rationale</h3>
          <div className="bg-[#0A0B0E] p-5 rounded-[2px] border border-[#181A22] space-y-2.5">
            <div className="flex items-center justify-between">
              <strong className="text-[#F4F4F2] text-lg font-editorial">{site.name}</strong>
              <span className="font-mono text-[#F4F4F2] text-xs">
                Suitability Score: <strong className="text-[#C85A32]">{site.suitability_score.toFixed(1)}/100</strong>
              </span>
            </div>
            <p className="text-[#C4C7C5] leading-relaxed font-sans">{site.geological_context}</p>
            <div className="text-[11px] text-[#C85A32] font-mono pt-1">
              Coordinates: {site.point.lat.toFixed(4)}°N, {site.point.lon.toFixed(4)}°E (Planetocentric, East-Positive)
            </div>
          </div>
        </section>

        {/* Section 3: Human Traverse Route Metrics */}
        <section className="space-y-3.5 border-b border-[#181A22] pb-7">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold block">Section 03</span>
          <h3 className="text-base font-semibold text-[#F4F4F2] tracking-wide uppercase font-editorial">Human Traverse Route Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono bg-[#0A0B0E] p-5 rounded-[2px] border border-[#181A22]">
            <div>
              <span className="text-[#8B909A] block text-[10px] uppercase tracking-[0.14em] font-semibold">TOTAL DISTANCE</span>
              <strong className="text-[#F4F4F2] text-lg font-editorial">{route.surface_distance_km} km</strong>
            </div>
            <div>
              <span className="text-[#8B909A] block text-[10px] uppercase tracking-[0.14em] font-semibold">TOTAL DURATION</span>
              <strong className="text-[#F4F4F2] text-lg font-editorial">{sim.total_duration_hours} h</strong>
            </div>
            <div>
              <span className="text-[#8B909A] block text-[10px] uppercase tracking-[0.14em] font-semibold">MAX INCLINE</span>
              <strong className="text-[#F4F4F2] text-lg font-editorial">{route.max_slope_deg}°</strong>
            </div>
            <div>
              <span className="text-[#8B909A] block text-[10px] uppercase tracking-[0.14em] font-semibold">MAX REACH</span>
              <strong className="text-[#F4F4F2] text-lg font-editorial">{route.max_distance_from_base_m} m</strong>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <strong className="text-[#F4F4F2] block font-mono text-[11px] uppercase tracking-[0.14em] font-semibold">Designated Work Stops ({route.science_stops.length}):</strong>
            {route.science_stops.map((s, i) => (
              <div key={i} className="bg-[#0A0B0E] p-3.5 rounded-[2px] border border-[#181A22] flex items-center justify-between text-xs hover:border-[#C85A32]/40 transition-colors">
                <div>
                  <strong className="text-[#F4F4F2] font-medium font-editorial tracking-wide">{i + 1}. {s.name}</strong>
                  <span className="text-[#8B909A] block text-[11px] mt-0.5 font-sans">{s.science_rationale}</span>
                </div>
                <span className="font-mono text-[#C85A32] text-[11px] shrink-0 ml-3 font-semibold">
                  {s.planned_work_time_min} MIN
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Life Support Safety Feasibility */}
        <section className="space-y-3.5 border-b border-[#181A22] pb-7">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold block">Section 04</span>
          <h3 className="text-base font-semibold text-[#F4F4F2] tracking-wide uppercase font-editorial">Life Support & Safe Return Evaluation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-[#0A0B0E] p-4 rounded-[2px] border border-[#181A22]">
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.14em] font-semibold">Oxygen Usage</span>
              <strong className="text-[#F4F4F2] text-lg block mt-0.5 font-editorial">{sim.oxygen_used_liters} L</strong>
              <span className="text-[#4E9A68] block text-[10px] font-mono mt-0.5 font-semibold">
                {sim.oxygen_margin_percent}% Remaining Reserve
              </span>
            </div>
            <div className="bg-[#0A0B0E] p-4 rounded-[2px] border border-[#181A22]">
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.14em] font-semibold">Power Drain</span>
              <strong className="text-[#F4F4F2] text-lg block mt-0.5 font-editorial">{sim.battery_used_wh} Wh</strong>
              <span className="text-[#4E9A68] block text-[10px] font-mono mt-0.5 font-semibold">
                {sim.battery_margin_percent}% Battery SoC
              </span>
            </div>
            <div className="bg-[#0A0B0E] p-4 rounded-[2px] border border-[#181A22]">
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.14em] font-semibold">Critical Turn-Back</span>
              <strong className="text-[#D4A359] text-lg block mt-0.5 font-editorial">{sim.turn_back_elapsed_min} min</strong>
              <span className="text-[#8B909A] block text-[10px] font-mono mt-0.5">
                At {sim.turn_back_distance_km} km traverse mark
              </span>
            </div>
          </div>
        </section>

        {/* Section 5: Scientific Limitations */}
        <section className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#D4A359] font-semibold block">Section 05</span>
          <h3 className="text-base font-semibold text-[#F4F4F2] tracking-wide uppercase font-editorial">Scientific Uncertainties & Limitations</h3>
          <ul className="list-disc list-inside space-y-1 text-[#8B909A] leading-relaxed font-sans">
            {site.limitations.map((l, i) => (
              <li key={`site-lim-${i}`}>{l}</li>
            ))}
            {route.limitations.map((l, i) => (
              <li key={`route-lim-${i}`}>{l}</li>
            ))}
            <li>Orbital DTM products cannot resolve sub-meter rocks or regolith load-bearing firmness.</li>
          </ul>
        </section>
      </article>
    </div>
  );
};
