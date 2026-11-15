import React from 'react';
import { Volume2, VolumeX, Sparkles, Compass } from 'lucide-react';

interface MaseratiHeroSplashProps {
  onStart: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const MaseratiHeroSplash: React.FC<MaseratiHeroSplashProps> = ({
  onStart,
  isSoundMuted,
  onToggleSound,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#000000] text-white overflow-hidden select-none">
      {/* Deep Space Background with Atmospheric Horizon Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Distant Starfield & Nebula Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#38BDF8]/10 via-[#F8C200]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
        
        {/* Constellation Trident Star Lines Silhouette */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="50%" y1="20%" x2="50%" y2="55%" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
          <line x1="50%" y1="55%" x2="35%" y2="35%" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
          <line x1="50%" y1="55%" x2="65%" y2="35%" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
          <line x1="35%" y1="35%" x2="30%" y2="25%" stroke="#F8C200" strokeWidth="1" opacity="0.6" />
          <line x1="50%" y1="20%" x2="50%" y2="12%" stroke="#F8C200" strokeWidth="1.2" opacity="0.7" />
          <line x1="65%" y1="35%" x2="70%" y2="25%" stroke="#F8C200" strokeWidth="1" opacity="0.6" />

          {/* Star Nodes with halos */}
          <circle cx="50%" cy="12%" r="4" fill="#F8C200" className="animate-pulse" />
          <circle cx="50%" cy="12%" r="12" fill="none" stroke="#F8C200" strokeWidth="0.5" opacity="0.5" />

          <circle cx="30%" cy="25%" r="3.5" fill="#ffffff" />
          <circle cx="30%" cy="25%" r="10" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />

          <circle cx="70%" cy="25%" r="3.5" fill="#ffffff" />
          <circle cx="70%" cy="25%" r="10" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />

          <circle cx="50%" cy="55%" r="4.5" fill="#F8C200" />
          <circle cx="50%" cy="55%" r="14" fill="none" stroke="#F8C200" strokeWidth="0.5" opacity="0.5" />
        </svg>

        {/* Luminous Curved Planet Horizon at the Bottom */}
        <div className="absolute -bottom-[350px] left-1/2 -translate-x-1/2 w-[1600px] h-[600px] rounded-[100%] bg-gradient-to-t from-[#02050B] via-[#091528] to-[#38BDF8]/25 border-t border-[#38BDF8]/60 shadow-[0_-20px_90px_rgba(56,189,248,0.25)] pointer-events-none" />
      </div>

      {/* Top Bar matching Maserati's splash screen header */}
      <header className="relative z-10 w-full px-6 py-6 md:px-12 flex items-center justify-between">
        {/* Left: Language button */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="text-xs font-mono uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors py-2 px-3 border border-transparent hover:border-white/20 rounded-full"
          >
            EN
          </button>
        </div>

        {/* Center: Maserati-inspired Trident & Brand */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2.5">
            {/* Precision Trident Logo SVG */}
            <svg
              viewBox="0 0 60 57"
              className="h-8 w-auto text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M24.958 56.5048H17.6104V53.1875H24.958V56.5048ZM27.1104 52.081H15.457V49.9394H27.1104V52.081ZM27.0371 43.9921C25.4759 45.2093 24.9655 47.0038 24.958 48.833H17.6104C17.6029 46.9969 17.0923 45.2093 15.5311 43.9921C11.5818 40.9169 7.74797 34.8778 7.74797 25.1328C7.74797 22.8465 8.16733 20.3168 8.87783 17.6896C7.57948 20.1504 5.39003 24.3059 4.31649 26.3533L1.08594 24.656C2.52309 21.9192 6.64936 14.1565 10.6385 6.64335L13.8691 8.34063C13.2505 9.51654 12.6394 10.7495 12.043 12.0319C14.7369 8.27116 18.2367 5.17643 21.2842 4.96783V0.5H21.2842L29.9863 11.2323L38.6883 0.5V4.96783C41.7358 5.17643 45.2356 8.27116 47.9295 12.0319C47.3331 10.7495 46.722 9.51654 46.1034 8.34063L49.334 6.64335C53.3231 14.1565 57.4494 21.9192 58.8865 24.656L55.656 26.3533C54.5824 24.3059 52.393 20.1504 51.0946 17.6896C51.8051 20.3168 52.2245 22.8465 52.2245 25.1328C52.2245 34.8778 48.3907 40.9169 44.4414 43.9921C42.8802 45.2093 42.3696 46.9969 42.3621 48.833H35.0145C35.007 47.0038 34.4966 45.2093 32.9354 43.9921C30.9575 42.4496 28.9871 40.0634 27.0371 36.8373C25.0871 40.0634 23.1167 42.4496 21.1388 43.9921" />
            </svg>
            <span className="font-serif text-sm tracking-[0.25em] uppercase font-semibold text-white">
              TRIDENT STARS
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#F8C200] mt-1">
            AresNav • PLANETARY SURFACE INTELLIGENCE
          </span>
        </div>

        {/* Right: Sound toggle button */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={isSoundMuted ? 'sound on' : 'sound off'}
            className="button-icon-circle text-white/80 hover:text-white"
            title={isSoundMuted ? 'Turn Sound On' : 'Turn Sound Off'}
          >
            {isSoundMuted ? (
              <VolumeX className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-4 w-4 text-[#F8C200]" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto py-12">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="h-4 w-4 text-[#F8C200]" />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F8C200]">
            INAF ASTRONOMICAL OBSERVATORY & AresNav SYSTEM
          </span>
          <Sparkles className="h-4 w-4 text-[#F8C200]" />
        </div>

        {/* Grand Maserati 2-Tier Typography */}
        <h1 className="font-serif uppercase font-normal tracking-[0.14em] text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-white max-w-4xl drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
          <span className="block text-white">100 YEARS OF THE TRIDENT</span>
          <span className="block text-white/90 font-light italic font-editorial mt-1">
            100 STARS BEHIND ITS LEGEND
          </span>
        </h1>

        <p className="mt-8 text-sm md:text-base font-sans text-gray-300 max-w-2xl font-light tracking-wide leading-relaxed">
          Traverse the celestial constellation of 100 scientifically classified landing sectors
          across the Gale Crater and Mount Sharp exploration corridor. Inspect terrain hazards, evaluate resource potential,
          and chart human exploration paths.
        </p>

        {/* Signature Maserati Primary CTA Button */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            className="button--primary min-w-[260px] py-4 text-xs font-semibold"
          >
            <span className="flex items-center justify-center space-x-3">
              <span>START THE EXPERIENCE</span>
              <Compass className="h-4 w-4" strokeWidth={2} />
            </span>
          </button>

          <button
            type="button"
            onClick={onStart}
            className="button--secondary min-w-[200px] py-3.5 text-xs font-medium"
          >
            <span>DIRECT WORKSTATION</span>
          </button>
        </div>

        {/* Ambient hint at bottom */}
        <div className="mt-12 flex items-center space-x-3 text-[11px] font-mono text-[#64748B] tracking-widest uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-ping" />
          <span>CELESTIAL SPHERE SYNCHRONIZED • J2000.0</span>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="relative z-10 w-full px-6 py-4 md:px-12 flex items-center justify-between text-[10px] font-mono text-[#475569] border-t border-white/5">
        <span>© 2026 AresNav × MASERATI CELESTIAL EXPERIENCE</span>
        <span>EQUIDISTANT CYLINDRICAL / PLANETOCENTRIC</span>
      </footer>
    </div>
  );
};
