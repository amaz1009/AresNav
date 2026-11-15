import React from 'react';
import { X, ExternalLink, ArrowRight, Crosshair, Sparkles } from 'lucide-react';

export interface CertificateSector {
  site_id: string;
  name: string;
  lat: number;
  lon: number;
  elevation_m: number;
  slope_deg: number;
  suitability_score: number;
  geological_unit: string;
  description: string;
}

interface SectorCertificateDrawerProps {
  site: CertificateSector;
  onClose: () => void;
  onPlanTraverse?: (siteId: string) => void;
}

export const SectorCertificateDrawer: React.FC<SectorCertificateDrawerProps> = ({
  site,
  onClose,
  onPlanTraverse,
}) => {
  return (
    <div
      role="dialog"
      aria-label={`star certificate ${site.site_id}`}
      className="absolute right-4 bottom-16 left-4 md:right-8 md:bottom-20 md:left-auto md:w-[480px] z-40 max-h-[82vh] flex flex-col"
    >
      {/* Click-outside helper / background plate */}
      <div className="star-surface pointer-events-auto relative z-0 flex max-h-full flex-col rounded-2xl px-4 md:px-6 py-5 overflow-y-auto border border-white/20 bg-[#080B11]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
        {/* Certificate Header matching Maserati */}
        <header className="flex items-start justify-between gap-2 border-b border-white/20 pb-5">
          <div className="space-y-1.5">
            <h2 className="headline-3 uppercase text-white font-serif font-medium text-[20px] md:text-[24px] tracking-wide leading-tight">
              star certificate <span className="text-[#F8C200]">{site.site_id.toLowerCase()}</span>
            </h2>
            <div className="space-y-0.5">
              <p className="text-[10px] tracking-[0.14em] text-white/70 uppercase font-mono">smart contract</p>
              <p className="text-[11px] font-mono text-gray-300 break-all select-all opacity-90">
                AKtrDbK67Erg2f5xQ4SnnvB3Lph5cd2Hn4KjJLMYFQAV
              </p>
            </div>
          </div>

          {/* Close button with Maserati rotation hover */}
          <button
            type="button"
            aria-label="close"
            onClick={onClose}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-white/20 bg-black/40 text-white/80 hover:text-white hover:border-[#F8C200] hover:rotate-90 transition-all duration-300 shrink-0"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </header>

        {/* Certificate Region Body */}
        <section role="region" aria-label={`star certificate ${site.name}`} className="mt-5 space-y-5">
          {/* Top Dual Media Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left Card: Metallic Certificate Plate */}
            <div className="aspect-[226/164] rounded-xl bg-gradient-to-br from-white/10 via-black/40 to-black/60 border border-white/10 p-3.5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#F8C200]">
                  INAF × MASERATI
                </span>
                <Sparkles className="h-3 w-3 text-[#F8C200]" />
              </div>
              <div className="flex flex-col my-auto text-center">
                <span className="font-serif text-lg uppercase tracking-[0.18em] text-white font-bold">
                  {site.site_id}
                </span>
                <span className="font-mono text-[9px] tracking-widest text-gray-400 mt-1 uppercase">
                  CERTIFIED SECTOR
                </span>
              </div>
              <div className="text-[9px] font-mono text-gray-400 flex justify-between">
                <span>EPOCH J2000</span>
                <span className="text-[#10B981]">OFFICIAL</span>
              </div>
            </div>

            {/* Right Card: Schematic Reticle Diagram */}
            <div className="aspect-[226/164] rounded-xl bg-black/50 border border-white/10 p-3 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Radar Crosshair lines */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#F8C200] to-transparent" />
                <div className="h-full w-px bg-gradient-to-b from-transparent via-[#F8C200] to-transparent absolute" />
                <div className="w-20 h-20 rounded-full border border-dashed border-[#F8C200] absolute" />
              </div>
              <Crosshair className="h-8 w-8 text-[#F8C200] animate-pulse relative z-10" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-gray-300 mt-2 z-10 tracking-wider">
                {site.lat.toFixed(3)}°, {site.lon.toFixed(3)}°
              </span>
            </div>
          </div>

          {/* Narrative Story Card matching Maserati MCXtrema story */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-3">
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#F8C200] font-semibold">
                {site.name.toUpperCase()}
              </p>
              <p className="text-xs text-gray-200 leading-relaxed font-sans font-light">
                {site.description}
              </p>
            </div>

            {/* Primary Action Button */}
            {onPlanTraverse && (
              <button
                type="button"
                onClick={() => onPlanTraverse(site.site_id)}
                className="button--primary w-full py-2.5 text-[11px]"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>PLAN TRAVERSE TO SITE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            )}
          </div>

          {/* Astronomical Specifications Table matching Maserati's exact dl grid */}
          <dl className="grid grid-cols-2 text-xs">
            {/* APP. MAG. / ELEVATION */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 pr-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  APP. MAG. / ELEVATION
                </dt>
                <dd className="font-mono text-sm md:text-base uppercase text-white font-medium">
                  {site.elevation_m.toLocaleString()} M
                </dd>
              </div>
            </div>

            {/* B-V COLOR IND. / SLOPE */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 border-l border-l-dashed pl-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  B-V COLOR / SLOPE
                </dt>
                <dd className="font-mono text-sm md:text-base uppercase text-white font-medium">
                  {site.slope_deg.toFixed(1)}°
                </dd>
              </div>
            </div>

            {/* RA / LATITUDE */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 pr-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  RA / LATITUDE
                </dt>
                <dd className="font-mono text-sm md:text-base uppercase text-white font-medium">
                  {site.lat.toFixed(5)}° S
                </dd>
              </div>
            </div>

            {/* DEC / LONGITUDE */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 border-l border-l-dashed pl-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  DEC / LONGITUDE
                </dt>
                <dd className="font-mono text-sm md:text-base uppercase text-white font-medium">
                  {site.lon.toFixed(5)}° E
                </dd>
              </div>
            </div>

            {/* CONSTELLATION / GEOLOGICAL UNIT */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 pr-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  CONSTELLATION / UNIT
                </dt>
                <dd className="font-mono text-xs uppercase text-gray-200 truncate">
                  {site.geological_unit}
                </dd>
              </div>
            </div>

            {/* STAR CLASSIFICATION / SUITABILITY */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 border-l border-l-dashed pl-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  CLASS / SUITABILITY
                </dt>
                <dd className="font-mono text-sm md:text-base uppercase text-[#F8C200] font-bold">
                  {site.suitability_score} / 100
                </dd>
              </div>
            </div>

            {/* COLOR / THERMAL INERTIA */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 pr-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  COLOR / THERMAL INERTIA
                </dt>
                <dd className="font-mono text-xs uppercase text-white font-medium">
                  312 J m⁻² K⁻¹ s⁻½
                </dd>
              </div>
            </div>

            {/* TEMPERATURE */}
            <div className="py-2.5 border-b border-b-dashed border-white/15 border-l border-l-dashed pl-3">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  TEMPERATURE
                </dt>
                <dd className="font-mono text-xs uppercase text-white font-medium">
                  218 K (-55°C)
                </dd>
              </div>
            </div>

            {/* LIFE SPAN / ESTIMATED AGE */}
            <div className="py-2.5 pr-3 col-span-2">
              <div className="flex flex-col gap-1">
                <dt className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/60">
                  LIFE SPAN / ESTIMATED AGE
                </dt>
                <dd className="font-mono text-xs uppercase text-white font-medium">
                  3.4 BILLION YEARS (HESPERIAN ERA)
                </dd>
              </div>
            </div>
          </dl>

          {/* Bottom discover link */}
          <div className="pt-2">
            <a
              href="https://tridentstars.maserati.com/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-[#F8C200] hover:bg-white/5 transition-all text-xs font-mono uppercase tracking-widest"
            >
              <span>INAF ASTRONOMICAL CATALOGUE</span>
              <ExternalLink className="h-3 w-3 ml-2 text-[#F8C200]" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
