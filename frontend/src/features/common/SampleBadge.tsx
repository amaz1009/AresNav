import React from 'react';

interface SampleBadgeProps {
  className?: string;
  label?: string;
}

export const SampleBadge: React.FC<SampleBadgeProps> = ({
  className = '',
  label = 'SAMPLE DATA',
}) => {
  return (
    <span
      data-testid="sample-badge"
      className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold uppercase tracking-[0.14em] bg-[#282114] text-[#D4A359] border border-[#4C3B20] ${className}`}
      title="Sample data for demonstration; not certified astronaut measurement"
    >
      <span>{label}</span>
    </span>
  );
};
