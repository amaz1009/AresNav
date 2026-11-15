import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { GALE_LAYERS } from '../../mocks/demoData';
import { DataClassBadge } from '../common/DataClassBadge';
import { SampleBadge } from '../common/SampleBadge';
import {
  Sliders,
  AlertCircle,
  Info,
  Layers,
} from 'lucide-react';

export const LayerManagerView: React.FC = () => {
  const {
    activeLayerIds,
    toggleLayer,
    layerOpacities,
    setLayerOpacity,
    setSelectedDataset,
    datasetsMeta,
  } = useMissionStore();

  const handleInspectDataset = (datasetId: string) => {
    const ds = datasetsMeta.find((d) => d.dataset_id === datasetId);
    if (ds) {
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
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1720px] mx-auto w-full select-text font-sans">
      {/* Header Panel */}
      <div className="border border-[#181A22] bg-[#0A0B0E] p-7 rounded-[2px] flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2.5 max-w-3xl relative z-10">
          <div className="flex items-center space-x-2.5">
            <Layers className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C85A32] font-semibold">
              PLANETARY DATA REPOSITORY
            </span>
            <span className="text-[#181A22]">/</span>
            <SampleBadge label="LAYER REPOSITORY" />
          </div>
          <h2 className="text-3xl font-semibold text-[#F4F4F2] tracking-tight font-editorial">
            Scientific Planetary Map Layers & Legends
          </h2>
          <p className="text-xs text-[#8B909A] leading-relaxed font-sans">
            Multi-mission raster overlays and vector features georeferenced to IAU2000:49900 Mars coordinate reference system.
            Toggle visibility and adjust compositing opacities across the exploration corridor.
          </p>
        </div>

        <div className="text-xs font-mono text-[#8B909A] bg-[#0F1015] px-4 py-2.5 rounded-[2px] border border-[#181A22] shrink-0">
          <span className="text-[#8B909A] uppercase tracking-wider">ACTIVE OVERLAYS: </span>
          <strong className="text-[#C85A32] font-semibold tracking-wider">{activeLayerIds.length} / {GALE_LAYERS.length}</strong>
        </div>
      </div>

      {/* Layers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GALE_LAYERS.map((layer) => {
          const isActive = activeLayerIds.includes(layer.layer_id);
          const isUnavailable = layer.status === 'UNAVAILABLE';
          const opacity = layerOpacities[layer.layer_id] ?? 1.0;

          return (
            <div
              key={layer.layer_id}
              className={`p-6 rounded-[2px] border transition-all duration-200 space-y-4 ${
                isUnavailable
                  ? 'bg-[#0A0B0E]/50 border-[#181A22] opacity-50'
                  : isActive
                  ? 'bg-[#0F1015] border-[#C85A32]/60 shadow-[0_2px_12px_rgba(200,90,50,0.08)]'
                  : 'bg-[#0A0B0E] border-[#181A22] hover:border-[#2A2E3D]'
              }`}
            >
              <div className="flex items-start justify-between">
                <label className="flex items-center space-x-3.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isUnavailable}
                    checked={isActive}
                    onChange={() => toggleLayer(layer.layer_id)}
                    className="h-4 w-4 rounded-[2px] bg-[#050507] border-[#181A22] accent-[#C85A32] focus:ring-0 disabled:cursor-not-allowed cursor-pointer"
                  />
                  <div>
                    <h3
                      className={`text-sm font-semibold tracking-wide ${
                        isUnavailable ? 'text-[#8B909A] line-through' : 'text-[#F4F4F2]'
                      }`}
                    >
                      {layer.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#8B909A] uppercase tracking-wider block mt-0.5">
                      {layer.data_type} • {layer.native_resolution_m ? `${layer.native_resolution_m}m/px` : 'Vector Layer'}
                    </span>
                  </div>
                </label>

                <DataClassBadge dataClass={layer.data_class} />
              </div>

              {isUnavailable && (
                <div className="text-xs text-[#D4A359] flex items-center space-x-1.5 bg-[#282114] px-3 py-1.5 rounded-[2px] border border-[#4C3B20]">
                  <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>{layer.status_reason || 'Layer unavailable in this region'}</span>
                </div>
              )}

              {/* Controls when active */}
              {!isUnavailable && isActive && (
                <div className="space-y-3.5 pt-3.5 border-t border-[#181A22] text-xs font-sans">
                  {/* Opacity slider */}
                  <div className="flex items-center space-x-3">
                    <Sliders className="h-3.5 w-3.5 text-[#8B909A]" strokeWidth={1.5} />
                    <span className="text-xs text-[#C85A32] font-mono w-16">
                      {Math.round(opacity * 100)}% Opac
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={opacity}
                      onChange={(e) => setLayerOpacity(layer.layer_id, parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#181A22] rounded-none appearance-none cursor-pointer accent-[#C85A32]"
                    />
                  </div>

                  {/* Legend display */}
                  {layer.legend && (
                    <div className="bg-[#050507] p-3 rounded-[2px] border border-[#181A22] space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px] text-[#8B909A]">
                        <span>Colormap: {layer.legend.colormap}</span>
                        {layer.legend.units && (
                          <span className="text-[#C4C7C5]">Unit: {layer.legend.units}</span>
                        )}
                      </div>

                      {/* Continuous color ramp */}
                      {layer.legend.vmin !== undefined && layer.legend.vmax !== undefined && (
                        <div className="flex items-center justify-between text-[10px] text-[#8B909A] pt-1">
                          <span>{layer.legend.vmin}</span>
                          <div className="h-1.5 flex-1 mx-3 rounded-none bg-gradient-to-r from-[#0A0B0E] via-[#C85A32]/60 to-[#F4F4F2] opacity-80" />
                          <span>{layer.legend.vmax}</span>
                        </div>
                      )}

                      {/* Categorical legend chips */}
                      {layer.legend.categories && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {layer.legend.categories.map((cat, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center space-x-1.5 text-[10px] px-2 py-0.5 rounded-[2px] bg-[#0A0B0E] text-[#8B909A] border border-[#181A22]"
                            >
                              <span
                                className="w-2 h-2 rounded-[1px] inline-block shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span>{cat.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Provenance source citation */}
                  {layer.dataset_ids && layer.dataset_ids.length > 0 && (
                    <div className="flex items-center space-x-2 text-[11px] text-[#8B909A]">
                      <Info className="h-3.5 w-3.5 text-[#8B909A]" />
                      <span>Ingestion Source:</span>
                      <div className="flex flex-wrap gap-1.5 font-mono">
                        {layer.dataset_ids.map((dsId) => (
                          <button
                            key={dsId}
                            type="button"
                            onClick={() => handleInspectDataset(dsId)}
                            className="text-[#C85A32] hover:underline"
                          >
                            {dsId}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
