import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface SectorNavigationBarProps {
  onPrevious: () => void;
  onNext: () => void;
  currentLabel?: string;
  totalCount?: number;
  currentIndex?: number;
}

export const SectorNavigationBar: React.FC<SectorNavigationBarProps> = ({
  onPrevious,
  onNext,
  currentLabel = 'Navigate among the stars',
  totalCount,
  currentIndex,
}) => {
  return (
    <footer
      role="contentinfo"
      className="star-surface pointer-events-auto flex items-center justify-between gap-3 rounded-full px-4 py-2 md:px-6 md:py-2.5 bg-[#090C12]/90 border border-white/20 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] select-none"
    >
      {/* Previous Button matching Maserati */}
      <button
        type="button"
        aria-label="Previous"
        onClick={onPrevious}
        className="button-icon relative inline-flex items-center justify-center h-10 w-10 md:h-11 md:w-11 rounded-full border border-white/20 hover:border-white/60 bg-black/40 text-white hover:text-[#F8C200] transition-all duration-300 shrink-0 focus:outline-none"
        title="Previous Sector"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>

      {/* Center Label */}
      <div className="grow text-center flex flex-col items-center justify-center px-4">
        <span className="text-[11px] md:text-xs font-serif uppercase tracking-[0.2em] text-white/90 font-medium">
          {currentLabel}
        </span>
        {totalCount !== undefined && currentIndex !== undefined && (
          <span className="text-[9px] font-mono tracking-widest text-[#F8C200] uppercase mt-0.5">
            SECTOR {currentIndex + 1} OF {totalCount}
          </span>
        )}
      </div>

      {/* Next Button with Golden 4-pointed Sparkle matching Maserati */}
      <button
        type="button"
        aria-label="Next"
        onClick={onNext}
        className="button-icon relative inline-flex items-center justify-center h-10 w-10 md:h-11 md:w-11 rounded-full border border-white/20 hover:border-[#F8C200] bg-black/40 text-white hover:text-[#F8C200] transition-all duration-300 shrink-0 focus:outline-none shadow-[0_0_12px_rgba(248,194,0,0.15)]"
        title="Next Sector"
      >
        {/* 4-pointed golden sparkle star icon */}
        <svg
          className="w-4 h-4 text-[#F8C200] drop-shadow-[0_0_8px_rgba(248,194,0,0.8)] animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </button>
    </footer>
  );
};
