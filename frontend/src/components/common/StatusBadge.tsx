import React from 'react';
import type { SafetyStatus } from '../../types/models';
import { CheckCircle2, AlertTriangle, XOctagon, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: SafetyStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  let style = 'bg-[#10131B] text-[#94A3B8] border-[#1F2535]';
  let icon = <HelpCircle className={iconSize} strokeWidth={1.5} />;

  switch (status) {
    case 'PASS':
      style = 'bg-[#06251B] text-[#10B981] border-[#0F4C38]';
      icon = <CheckCircle2 className={iconSize} strokeWidth={1.5} />;
      break;
    case 'WARNING':
      style = 'bg-[#201808] text-[#E5C378] border-[#4D3A12]';
      icon = <AlertTriangle className={iconSize} strokeWidth={1.5} />;
      break;
    case 'BLOCKED':
      style = 'bg-[#260A0C] text-[#EF4444] border-[#52161A]';
      icon = <XOctagon className={iconSize} strokeWidth={1.5} />;
      break;
    case 'UNKNOWN':
      style = 'bg-[#10131B] text-[#94A3B8] border-[#1F2535]';
      icon = <HelpCircle className={iconSize} strokeWidth={1.5} />;
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]';

  return (
    <span
      data-testid={`status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center space-x-1.5 rounded-[1px] font-mono border uppercase tracking-[0.14em] font-semibold ${padding} ${style} ${className}`}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
};
