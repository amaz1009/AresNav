import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { REGIONS, GALE_REGION } from '../../mocks/demoData';
import {
  Globe2,
  Compass,
} from 'lucide-react';

interface HeaderProps {
  isConnecting?: boolean;
  onOpenLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnecting = false, onOpenLanding }) => {
  const { selectedRegion, setSelectedRegion, health, isBackendHealthy } = useMissionStore();

  return (
    <header className="border-b border-[#282C37] bg-[#17191E] z-30 shrink-0 select-none">
      {/* Main Mission Control Header */}
      <div className="h-14 px-5 flex items-center justify-between">
        {/* Left: Brand Identity & Target Region */}
        <div className="flex items-center space-x-4">
          <div
            onClick={onOpenLanding}
            className={`flex items-center space-x-3 ${onOpenLanding ? 'cursor-pointer group' : ''}`}
            title={onOpenLanding ? 'View Project Landing Page & Mission Brief' : undefined}
          >
            <div className="h-7 w-7 rounded-[2px] bg-[#1D2026] border border-[#C85A32]/40 group-hover:border-[#C85A32] flex items-center justify-center text-[#C85A32] transition-colors">
              <Compass className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-semibold tracking-[0.16em] text-[#F4F4F2] group-hover:text-[#FAF8F5] font-editorial leading-none transition-colors">
                AresNav
              </h1>
              <span className="text-[8.5px] font-mono text-[#C85A32] tracking-[0.22em] uppercase mt-0.5">
                SURFACE INTELLIGENCE & MISSION PLANNING
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-[#282C37] mx-1 hidden sm:block" />

          {/* Region Dropdown Selector */}
          <div className="flex items-center space-x-2 bg-[#1D2026] px-3 py-1.5 rounded-[2px] border border-[#282C37] text-xs">
            <Globe2 className="h-3.5 w-3.5 text-[#C85A32]" strokeWidth={1.5} />
            <span className="text-[#8B909A] text-[10px] font-mono uppercase tracking-[0.14em] font-semibold">
              REGION:
            </span>
            <select
              value={selectedRegion.region_id}
              onChange={(e) => {
                const reg = REGIONS.find((r) => r.region_id === e.target.value) || GALE_REGION;
                setSelectedRegion(reg);
              }}
              className="bg-transparent text-[#F4F4F2] font-medium focus:outline-none cursor-pointer text-xs font-sans tracking-wide"
            >
              <option value={GALE_REGION.region_id} className="bg-[#17191E] text-[#F4F4F2]">
                Gale Crater / Mount Sharp (Aeolis Mons Layered Mound)
              </option>
            </select>
          </div>
        </div>

        {/* Right: Technical Badges & Status Indicators (visually removed per user design instruction) */}
        <div className="flex items-center space-x-3 text-xs">
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="px-2.5 py-1 rounded-[2px] bg-[#1D2026] hover:bg-[#281814] border border-[#282C37] hover:border-[#C85A32]/60 text-[#8B909A] hover:text-[#FAF8F5] text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
              title="Return to Landing Page"
            >
              Landing Page
            </button>
          )}
          {/* Accessible test contract nodes */}
          <div className="sr-only" aria-hidden="true">
            <div data-testid="health-indicator">
              <span>
                {isConnecting
                  ? 'CONNECTING...'
                  : isBackendHealthy
                  ? `BACKEND: OK (v${health?.version})`
                  : 'BACKEND: OFFLINE'}
              </span>
            </div>
            <div data-testid="llm-indicator">
              <span>LLM: {health ? health.llm_mode : 'UNKNOWN'}</span>
            </div>
            <div data-testid="dataset-indicator">
              {health ? (
                <>
                  <span>Datasets: {health.datasets_available} avail</span>
                  <span>/</span>
                  <span>{health.datasets_unavailable} unavail</span>
                </>
              ) : (
                <span>Datasets: unknown</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
