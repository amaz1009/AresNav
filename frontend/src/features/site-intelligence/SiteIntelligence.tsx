import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import type { CandidateSite } from '../../types/models';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CoordinateView } from '../../components/common/CoordinateView';
import { SampleBadge } from '../common/SampleBadge';
import { MarsMap } from '../map/MarsMap';
import {
  MapPin,
  AlertTriangle,
  XOctagon,
  Scale,
  BookOpen,
  Sparkles,
  X,
  Target,
} from 'lucide-react';

export const SiteIntelligence: React.FC = () => {
  const {
    candidateSites,
    selectedSite,
    setSelectedSite,
    setActivePage,
    setSelectedPoint,
  } = useMissionStore();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredSites = candidateSites.filter(
    (s) => filterStatus === 'ALL' || s.status === filterStatus
  );

  // Strictly dynamic: Only set when user clicks a site or blue pointer on map
  const activeSite = selectedSite;

  const handleSelectOnMap = (site: CandidateSite) => {
    setSelectedSite(site);
    setSelectedPoint({ lat: site.point.lat, lon: site.point.lon });
    setActivePage('explorer');
  };

  const handleSiteClick = (site: CandidateSite) => {
    setSelectedSite(site);
    setSelectedPoint({ lat: site.point.lat, lon: site.point.lon });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#111215] select-text font-sans">
      {/* Top Filter and Actions Bar */}
      <div className="h-11 bg-[#17191E] border-b border-[#282C37] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
          <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] font-semibold">
            Candidate Site Intelligence & Ranking ({candidateSites.length} Sites Evaluated)
          </h2>
          <span className="text-[#363B4A]">/</span>
          <SampleBadge label="EVALUATION MODEL" />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {activeSite && (
            <div className="hidden md:flex items-center space-x-2 font-mono text-[11px] bg-[#1D2026] px-2.5 py-1 rounded-[2px] border border-[#282C37]">
              <span className="text-[#8B909A] uppercase tracking-wider text-[10px]">SELECTED:</span>
              <span className="text-[#60A5FA] font-medium">{activeSite.name}</span>
              <button
                onClick={() => setSelectedSite(null)}
                className="text-[#8B909A] hover:text-[#F4F4F2] ml-1 p-0.5"
                title="Deselect site"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-[#8B909A] font-mono text-[10px] uppercase tracking-[0.14em] font-semibold">
              FILTER:
            </span>
            {['ALL', 'PASS', 'WARNING', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-0.5 rounded-[2px] font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
                  filterStatus === st
                    ? 'bg-[#C85A32]/20 text-[#E27B54] border border-[#C85A32]/50 font-semibold'
                    : 'bg-transparent text-[#8B909A] hover:text-[#F4F4F2]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Content: 3-column workstation (Ledger | Map | Details Slot) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Ranked Site Cards */}
        <div className="w-full lg:w-80 xl:w-88 border-r border-[#282C37] bg-[#17191E] flex flex-col overflow-y-auto p-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-[#C85A32] uppercase tracking-[0.18em] font-semibold">
              Candidate Sites Ledger
            </span>
            <span className="text-[10px] font-mono text-[#8B909A]">
              {filteredSites.length} of {candidateSites.length}
            </span>
          </div>

          {filteredSites.map((site, index) => {
            const isSelected = activeSite?.site_id === site.site_id;
            return (
              <div
                key={site.site_id}
                data-testid={`site-card-${site.site_id}`}
                onClick={() => handleSiteClick(site)}
                className={`p-3.5 rounded-[2px] border cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? 'bg-[#1D2026] border-[#3B82F6] shadow-md shadow-[#2563EB]/10'
                    : 'bg-[#14161A] border-[#282C37] hover:border-[#363B4A]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`h-5 w-5 rounded-[2px] font-mono text-[10px] flex items-center justify-center font-bold border ${
                        isSelected
                          ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                          : 'bg-[#17191E] text-[#C85A32] border-[#282C37]'
                      }`}
                    >
                      0{index + 1}
                    </span>
                    <h3 className="text-xs font-semibold text-[#F4F4F2] tracking-wide font-editorial">
                      {site.name}
                    </h3>
                  </div>
                  <StatusBadge status={site.status} size="sm" />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#8B909A] text-[10px] tracking-wider uppercase font-semibold">
                      SCORE:
                    </span>
                    <span
                      className={`font-semibold text-sm ${
                        site.suitability_score >= 80
                          ? 'text-[#C85A32]'
                          : site.suitability_score >= 60
                          ? 'text-[#4B88AB]'
                          : 'text-[#C94D4D]'
                      }`}
                    >
                      {site.suitability_score.toFixed(1)}/100
                    </span>
                  </div>
                  <CoordinateView point={site.point} />
                </div>

                {site.hard_constraint_violations.length > 0 && (
                  <div className="mt-2 text-[10px] font-mono text-[#C94D4D] bg-[#291516] border border-[#4F2325] p-2 rounded-[2px] flex items-center space-x-1">
                    <XOctagon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    <span>Hard Safety Exclusion</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Center: Interactive Mars Map with Candidate Sites Blue Points */}
        <div className="flex-1 relative min-h-[300px] bg-[#0E0F12] border-r border-[#282C37] overflow-hidden flex flex-col">
          <div className="absolute top-3 right-4 z-[400] bg-[#17191E]/90 border border-[#282C37] rounded-[2px] px-3 py-1.5 text-[10px] font-mono text-[#8B909A] pointer-events-none shadow backdrop-blur-sm flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-[0_0_6px_#2563EB] inline-block" />
            <span className="text-[#C4C7C5]">Blue Pointers = Candidate Sites (Click to inspect)</span>
          </div>

          <MarsMap
            center={activeSite ? [activeSite.point.lat, activeSite.point.lon] : [18.38, 77.58]}
            zoom={activeSite ? 11 : 10}
            showCandidateSites={true}
            onSiteClick={handleSiteClick}
          />
        </div>

        {/* Right Side: Site Intelligence Slot */}
        <div
          data-testid="site-intelligence-slot"
          className="w-full lg:w-[460px] xl:w-[520px] overflow-y-auto p-6 space-y-6 bg-[#111215] shrink-0"
        >
          {!activeSite ? (
            /* Empty State: Only shows details when user clicks a site or blue pointer */
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center text-[#8B909A] space-y-4 border border-dashed border-[#282C37] rounded-[2px] bg-[#14161A]/50">
              <div className="w-16 h-16 rounded-full bg-[#1D2026] border border-[#282C37] flex items-center justify-center">
                <Target className="h-8 w-8 text-[#2563EB] animate-pulse" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-semibold text-[#F4F4F2] font-editorial tracking-wide uppercase">
                  Candidate Site Intelligence Slot
                </h3>
                <p className="text-xs text-[#8B909A] leading-relaxed">
                  No candidate site selected. Select a candidate site from the ledger or click any blue point marker on the Martian map to reveal multi-criteria evaluation metrics, geological evidence, and safety constraints.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 text-[10px] font-mono px-3 py-1.5 rounded-[2px] bg-[#17191E] border border-[#282C37] text-[#8B909A]">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] shadow-[0_0_6px_#2563EB] inline-block" />
                <span>Highlighted on map with blue points</span>
              </div>
            </div>
          ) : (
            /* High-Density Site Intelligence Dossier (Displayed ONLY when a site is clicked) */
            <>
              {/* Header Card */}
              <div className="bg-[#17191E] border border-[#282C37] p-5 rounded-[2px] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={activeSite.status} size="md" />
                    <span className="font-mono text-xs text-[#C85A32] tracking-wider uppercase font-semibold">
                      {activeSite.site_id}
                    </span>
                    <span className="text-[#363B4A]">|</span>
                    <span className="font-mono text-xs text-[#8B909A]">
                      RADIUS: {activeSite.radius_m}M
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="text-[#8B909A] hover:text-[#F4F4F2] p-1 rounded hover:bg-[#1D2026] transition-colors"
                    title="Close details"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-normal text-[#F4F4F2] font-editorial tracking-wide">
                    {activeSite.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-mono text-[#8B909A]">
                    <span>LAT: {activeSite.point.lat.toFixed(4)}°</span>
                    <span className="text-[#363B4A]">|</span>
                    <span>LON: {activeSite.point.lon.toFixed(4)}°</span>
                    <span className="text-[#363B4A]">|</span>
                    <span className="text-[#4B88AB]">TARGET: {activeSite.primary_feature}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-[#282C37]">
                  <button
                    onClick={() => handleSelectOnMap(activeSite)}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center space-x-2"
                  >
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    <span>LOCATE IN EXPLORER</span>
                  </button>
                  <button
                    data-testid="btn-deselect-site"
                    onClick={() => setSelectedSite(null)}
                    className="btn-secondary py-1.5 px-3 text-xs text-[#8B909A] hover:text-[#F4F4F2]"
                  >
                    DESELECT
                  </button>
                </div>
              </div>

              {/* Hard Constraint Blocked Alert */}
              {activeSite.hard_constraint_violations.length > 0 && (
                <div className="bg-[#291516] border border-[#4F2325] p-4 rounded-[2px] space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-[#C94D4D] font-mono font-semibold uppercase tracking-wider">
                    <XOctagon className="h-4 w-4" strokeWidth={1.5} />
                    <span>Critical Hard Safety Violations (Cannot Be Overridden by Science Score)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[#E57373] font-sans">
                    {activeSite.hard_constraint_violations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Multi-Criteria Evaluation Grid */}
              <div className="bg-[#17191E] border border-[#282C37] p-5 rounded-[2px] space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] flex items-center space-x-2 font-semibold">
                  <Scale className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
                  <span>Multi-Criteria Evaluation Scores (S = Σ wᵢ × sᵢ)</span>
                </h3>

                <div className="space-y-3">
                  {[
                    { label: 'Terrain Slope & Traversability', score: activeSite.criterion_scores.terrain, weight: '30%', desc: 'Assesses slope gradient, boulder frequency, and wheel slip' },
                    { label: 'Human EVA Safety', score: activeSite.criterion_scores.human_safety, weight: '25%', desc: 'Walkback distance margin, cliff shadows, and communications line of sight' },
                    { label: 'Scientific Sample Value', score: activeSite.criterion_scores.science, weight: '25%', desc: 'Mineral diversity, paleolake clay layers, and biosignature potential' },
                    { label: 'In-Situ Resource Utilization (ISRU)', score: activeSite.criterion_scores.resources, weight: '10%', desc: 'Hydrated mineral reserves and regolith shielding material' },
                    { label: 'Operational Accessibility', score: activeSite.criterion_scores.accessibility, weight: '10%', desc: 'Proximity to primary descent ellipse and flat landing surface' },
                  ].map((crit) => (
                    <div key={crit.label} className="bg-[#1D2026] border border-[#282C37] p-3 rounded-[2px] space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="font-medium text-[#F4F4F2] font-editorial tracking-wide">{crit.label}</span>
                          <span className="text-[#8B909A] text-[10px] ml-2 font-mono">({crit.weight} weight)</span>
                        </div>
                        <span className="font-mono text-[#C85A32] font-semibold">{crit.score}/100</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#111215] rounded-none overflow-hidden border border-[#282C37]">
                        <div
                          className="h-full bg-[#C85A32] transition-all duration-300"
                          style={{ width: `${crit.score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#8B909A] font-sans">{crit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geological Context & Remote Sensing Evidence */}
              <div className="bg-[#17191E] border border-[#282C37] p-5 rounded-[2px] space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] flex items-center space-x-2 font-semibold">
                  <BookOpen className="h-4 w-4 text-[#4B88AB]" strokeWidth={1.5} />
                  <span>Geological Context & Evidence Chain</span>
                </h3>

                <div className="p-3 bg-[#14161A] rounded-[2px] border border-[#282C37] text-xs text-[#C4C7C5] leading-relaxed">
                  <strong className="text-[#C85A32] block mb-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                    Stratigraphic Summary:
                  </strong>
                  {activeSite.geological_context}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-[#8B909A] uppercase tracking-[0.16em] font-semibold block">
                    Supporting Dataset Observations:
                  </span>
                  {activeSite.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="bg-[#14161A] border border-[#282C37] p-2.5 rounded-[2px] text-xs space-y-1 hover:border-[#C85A32]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[#F4F4F2] font-medium">{ev.dataset_id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#1D2026] border border-[#282C37] text-[#C85A32]">
                          {ev.instrument}
                        </span>
                      </div>
                      <p className="text-[#8B909A] leading-relaxed font-sans text-[11px]">{ev.finding}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uncertainties & Caveats */}
              <div className="bg-[#282114] border border-[#4C3B20] p-4 rounded-[2px] space-y-2.5">
                <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#D4A359] flex items-center space-x-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                  <span>Scientific Uncertainties & Limitations</span>
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#D4A359]/90 font-sans">
                  {activeSite.uncertainties.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                  {activeSite.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
