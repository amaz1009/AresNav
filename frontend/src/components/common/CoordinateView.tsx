import React from 'react';
import type { GeoPoint } from '../../types/models';

interface CoordinateViewProps {
  point: GeoPoint;
  label?: string;
  className?: string;
}

export const CoordinateView: React.FC<CoordinateViewProps> = ({
  point,
  label,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center space-x-1.5 font-mono text-xs bg-[#0E1117] px-3 py-1 rounded-[1px] border border-[#1C202C] text-white tracking-wider ${className}`}
    >
      {label && <span className="text-[10px] uppercase text-[#D4AF37] font-mono tracking-[0.16em] font-semibold">{label}:</span>}
      <span className="text-white font-medium">
        {point.lat >= 0 ? `${point.lat.toFixed(4)}°N` : `${Math.abs(point.lat).toFixed(4)}°S`}
      </span>
      <span className="text-[#64748B]">,</span>
      <span className="text-white font-medium">
        {point.lon.toFixed(4)}°E
      </span>
    </div>
  );
};
