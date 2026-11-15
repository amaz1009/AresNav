import React from 'react';
import type { components } from '../../types/api.gen';

export type DataClass = components['schemas']['DataClass'];

interface DataClassBadgeProps {
  dataClass: DataClass;
  className?: string;
}

export const DataClassBadge: React.FC<DataClassBadgeProps> = ({ dataClass, className = '' }) => {
  let badgeStyle = 'bg-[#0E1117] text-[#94A3B8] border-[#1C202C]';

  switch (dataClass) {
    case 'SAMPLE':
      badgeStyle = 'bg-[#201808] text-[#E5C378] border-[#4D3A12] font-semibold';
      break;
    case 'MEASURED':
      badgeStyle = 'bg-[#06251B] text-[#10B981] border-[#0F4C38] font-semibold';
      break;
    case 'DERIVED':
      badgeStyle = 'bg-[#141822] text-[#F8FAFC] border-[#2D3548] font-semibold';
      break;
    case 'MODEL':
      badgeStyle = 'bg-[#0E1117] text-[#94A3B8] border-[#1C202C]';
      break;
    case 'REFERENCE':
      badgeStyle = 'bg-[#071F30] text-[#38BDF8] border-[#0E3E61]';
      break;
    case 'ASSUMPTION':
      badgeStyle = 'bg-[#201808] text-[#E5C378] border-[#4D3A12]';
      break;
    case 'AI_INTERPRETATION':
      badgeStyle = 'bg-[#260A0C] text-[#EF4444] border-[#52161A]';
      break;
  }

  return (
    <span
      data-testid={`badge-${dataClass.toLowerCase()}`}
      className={`inline-flex items-center px-1.5 py-0.5 rounded-[1px] text-[9px] font-mono border uppercase tracking-[0.14em] ${badgeStyle} ${className}`}
      title={`Data Classification: ${dataClass}`}
    >
      {dataClass}
    </span>
  );
};
