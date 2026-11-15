import React, { useState } from 'react';
import { useMissionStore } from '../../store/missionStore';
import type { DatasetMetadata } from '../../types/models';
import { DataClassBadge } from '../common/DataClassBadge';
import { SampleBadge } from '../common/SampleBadge';
import { ProvenanceModal } from '../common/ProvenanceModal';
import {
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const DatasetCatalogue: React.FC = () => {
  const {
    datasetsMeta,
    selectedDataset,
    setSelectedDataset,
  } = useMissionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredDatasets = datasetsMeta.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.dataset_id.toLowerCase().includes(q) ||
      d.instrument.toLowerCase().includes(q) ||
      d.mission.toLowerCase().includes(q);
    const matchesType = typeFilter === 'ALL' || d.data_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenModal = (ds: DatasetMetadata) => {
    setSelectedDataset({
      dataset_id: ds.dataset_id,
      name: ds.name,
      mission: ds.mission,
      instrument: ds.instrument,
      data_type: ds.data_type as any,
      data_class: ds.data_class,
      status: ds.status,
      processing_steps: [],
      product_ids: [ds.dataset_id],
      source_archive: ds.archive_node,
      source_conventions: ds.coordinate_reference,
      source_crs: 'IAU2000:49900',
      source_url: ds.source_url,
      temporal_coverage: { description: ds.temporal_coverage },
      citation: ds.citation,
      limitations: ds.limitations,
    });
  };

  const types = ['ALL', 'ELEVATION', 'OPTICAL', 'THERMAL', 'MINERALOGY', 'GEOLOGY', 'RADIATION', 'HAZARD'];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1720px] mx-auto w-full select-text font-sans">
      {/* Top Header Panel */}
      <div className="border border-[#1C202C] bg-[#090B0F] p-7 rounded-[1px] flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2.5 max-w-3xl relative z-10">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              PLANETARY DATA SYSTEM ARCHIVE
            </span>
            <span className="text-[#1C202C]">/</span>
            <SampleBadge label="PROVENANCE REPOSITORY" />
          </div>
          <h2 className="text-3xl font-normal text-white tracking-[0.06em] font-serif">
            NASA Planetary Data System (PDS) Dataset Catalogue
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed font-sans">
            Standardized planetary scientific data products across MGS, Odyssey, MRO, and MSL missions.
            Every dataset maintains documented coordinate references, instruments, and physical limitations.
          </p>
        </div>

        <div className="text-xs font-mono text-[#94A3B8] bg-[#0E1117] px-4 py-2.5 rounded-[1px] border border-[#1C202C] shrink-0">
          <span className="text-[#64748B] uppercase tracking-wider">INDEXED RECORDS: </span>
          <strong className="text-[#D4AF37] font-semibold tracking-wider">{datasetsMeta.length} DATASETS</strong>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#090B0F] p-3.5 rounded-[1px] border border-[#1C202C]">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="h-3.5 w-3.5 text-[#64748B] absolute left-3 top-2.5" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by ID, instrument, or mission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#040507] border border-[#1C202C] rounded-[1px] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#D4AF37] font-mono transition-colors"
          />
        </div>

        {/* Data Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[10px] text-[#64748B] mr-1 flex items-center space-x-1 font-semibold uppercase tracking-[0.14em]">
            <Filter className="h-3 w-3" strokeWidth={1.5} />
            <span>KIND:</span>
          </span>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-[1px] text-[10px] font-mono tracking-[0.14em] uppercase transition-colors ${
                typeFilter === t
                  ? 'bg-[#141822] text-[#E5C378] border border-[#D4AF37]/50 font-semibold'
                  : 'bg-transparent text-[#94A3B8] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDatasets.map((ds) => {
          const isUnavailable = ds.status === 'UNAVAILABLE';
          return (
            <div
              key={ds.dataset_id}
              data-testid={`dataset-card-${ds.dataset_id}`}
              className={`bg-[#090B0F] border rounded-[1px] p-6 flex flex-col justify-between transition-all duration-300 space-y-4 ${
                isUnavailable
                  ? 'border-[#1C202C] opacity-50'
                  : 'border-[#1C202C] hover:border-[#D4AF37]/40 hover:shadow-[0_0_15px_rgba(212,175,55,0.05)]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#D4AF37] block tracking-wider">
                      {ds.dataset_id}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-[0.14em] block mt-0.5">
                      {ds.data_type} • {ds.mission}
                    </span>
                  </div>
                  <DataClassBadge dataClass={ds.data_class} />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white tracking-wide font-serif">{ds.name}</h3>
                  <p className="text-[11px] text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed font-sans">
                    {ds.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono bg-[#040507] p-3.5 rounded-[1px] border border-[#1C202C]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Instrument:</span>
                    <span className="text-[#94A3B8] truncate max-w-[180px]">{ds.instrument}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Resolution:</span>
                    <span className="text-white font-medium">{ds.spatial_resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Archive:</span>
                    <span className="text-[#94A3B8] truncate max-w-[180px]">{ds.archive_node}</span>
                  </div>
                </div>

                {isUnavailable && ds.status_reason && (
                  <div className="text-[10px] text-[#E5C378] flex items-center space-x-1.5 bg-[#201808] px-2.5 py-1.5 rounded-[1px] border border-[#4D3A12]">
                    <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                    <span>{ds.status_reason}</span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-3.5 border-t border-[#1C202C] flex items-center justify-between">
                <button
                  onClick={() => handleOpenModal(ds)}
                  className="flex items-center space-x-1.5 text-xs font-mono text-[#38BDF8] hover:text-[#D4AF37] uppercase tracking-wider transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>CITATION & METADATA</span>
                </button>

                <a
                  href={ds.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#64748B] hover:text-[#D4AF37] p-1 transition-colors"
                  title="NASA Source Portal"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provenance Details Modal */}
      <ProvenanceModal
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
      />
    </div>
  );
};
