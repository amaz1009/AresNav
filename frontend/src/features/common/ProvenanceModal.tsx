import React from 'react';
import type { DatasetRecord } from '../../services/apiClient';
import { DataClassBadge } from './DataClassBadge';
import { X, BookOpen, AlertTriangle, ExternalLink } from 'lucide-react';

interface ProvenanceModalProps {
  dataset: DatasetRecord | null;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<ProvenanceModalProps> = ({ dataset, onClose }) => {
  if (!dataset) return null;

  return (
    <div
      data-testid="provenance-modal"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 select-text"
      onClick={onClose}
    >
      <div
        className="bg-[#17191E] border border-[#282C37] rounded-[2px] max-w-lg w-full max-h-[85vh] overflow-y-auto p-7 text-[#8B909A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#282C37] pb-4 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-[#C85A32] font-semibold tracking-wider">
                {dataset.dataset_id}
              </span>
              <DataClassBadge dataClass={dataset.data_class} />
            </div>
            <h3 className="text-lg font-semibold text-[#F4F4F2] tracking-tight mt-1.5 font-editorial">{dataset.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B909A] hover:text-[#F4F4F2] p-1.5 rounded-[2px] hover:bg-[#1D2026] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4 text-xs font-sans">
          {/* Mission & Instrument Grid */}
          <div className="grid grid-cols-2 gap-2.5 bg-[#111215] p-3.5 rounded-[2px] border border-[#282C37]">
            <div>
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.16em] font-semibold">Mission</span>
              <span className="text-[#F4F4F2] font-mono font-medium">{dataset.mission}</span>
            </div>
            <div>
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.16em] font-semibold">Instrument</span>
              <span className="text-[#F4F4F2] font-mono font-medium">{dataset.instrument}</span>
            </div>
            <div>
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.16em] font-semibold">Data Type</span>
              <span className="text-[#F4F4F2] font-mono font-medium">{dataset.data_type}</span>
            </div>
            <div>
              <span className="text-[#8B909A] block text-[10px] font-mono uppercase tracking-[0.16em] font-semibold">Resolution</span>
              <span className="text-[#F4F4F2] font-mono font-medium">
                {dataset.native_resolution_m ? `${dataset.native_resolution_m} m/pixel` : 'Regional / Point'}
              </span>
            </div>
          </div>

          {/* Citation */}
          <div>
            <h4 className="text-[10px] font-mono text-[#C85A32] uppercase tracking-[0.16em] flex items-center space-x-1 mb-1 font-semibold">
              <BookOpen className="h-3 w-3 mr-1 text-[#C85A32]" strokeWidth={1.5} /> Scientific Citation & Reference
            </h4>
            <p className="bg-[#111215] p-3.5 rounded-[2px] border border-[#282C37] text-[#C4C7C5] leading-relaxed font-sans text-xs">
              {dataset.citation}
            </p>
          </div>

          {/* Limitations & Caveats */}
          {dataset.limitations && dataset.limitations.length > 0 && (
            <div>
              <h4 className="text-[10px] font-mono text-[#D4A359] uppercase tracking-[0.16em] flex items-center space-x-1 mb-1 font-semibold">
                <AlertTriangle className="h-3 w-3 mr-1 text-[#D4A359]" strokeWidth={1.5} /> Scientific Limitations & Uncertainties
              </h4>
              <ul className="list-disc list-inside space-y-1 bg-[#282114] border border-[#4C3B20] p-3.5 rounded-[2px] text-[#D4A359] text-[11px]">
                {dataset.limitations.map((limit, idx) => (
                  <li key={idx} className="leading-tight">{limit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Access / URL */}
          {dataset.source_url && (
            <div className="pt-3 border-t border-[#282C37] flex justify-end">
              <a
                href={dataset.source_url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary text-[10px] py-2 px-4 space-x-2 tracking-[0.16em]"
              >
                <span>NASA PDS / ARCHIVE PORTAL</span>
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
