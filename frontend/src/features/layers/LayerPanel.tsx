import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { DataClassBadge } from '../common/DataClassBadge';
import { Layers, Sliders, AlertCircle, Info } from 'lucide-react';

export const MVP_LAYER_IDS = ['ortho', 'elevation', 'slope', 'hazard_grid', 'mola_elevation'] as const;

export const getColormapGradient = (colormap?: string) => {
  switch (colormap?.toLowerCase()) {
    case 'terrain':
      // HiRISE/Planetary scientific terrain: Deep blue -> teal/emerald green -> sand/tan -> rust brown -> white peak
      return 'linear-gradient(to right, #2E75B6 0%, #5EBA7D 30%, #E6CC8C 60%, #AA6432 85%, #FAFAFA 100%)';
    case 'magma':
      // Magma slope: black -> dark purple -> magenta -> coral orange -> cream yellow
      return 'linear-gradient(to right, #000004 0%, #51127C 25%, #B63679 50%, #FB8861 75%, #FCFDBF 100%)';
    case 'plasma':
      // Plasma roughness: navy blue -> purple -> magenta -> orange -> bright yellow
      return 'linear-gradient(to right, #0D0887 0%, #7E03A8 25%, #CC4778 50%, #F89540 75%, #F0F921 100%)';
    case 'viridis':
      return 'linear-gradient(to right, #440154 0%, #3B528B 25%, #21918C 50%, #5EC962 75%, #FDE725 100%)';
    case 'gray':
    case 'greyscale':
      return 'linear-gradient(to right, #000000 0%, #ffffff 100%)';
    default:
      return 'linear-gradient(to right, #2E75B6 0%, #5EBA7D 30%, #E6CC8C 60%, #AA6432 85%, #FAFAFA 100%)';
  }
};

interface LayerPanelProps {
  onInspectDataset?: (datasetId: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ onInspectDataset }) => {
  const { layers, activeLayerIds, layerOpacities, toggleLayer, setLayerOpacity } =
    useMissionStore();

  if (!layers || layers.length === 0) {
    return (
      <div className="p-6 text-xs text-[#8B909A] text-center font-sans space-y-2">
        <Layers className="h-6 w-6 mx-auto opacity-40 text-[#8B909A]" strokeWidth={1.5} />
        <p className="font-semibold text-sm tracking-wide text-[#F4F4F2]">No data layers loaded yet.</p>
        <p className="text-[11px] text-[#8B909A] leading-relaxed">
          Layers populate once connected to the regional dataset catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3 p-3.5 overflow-y-auto bg-[#0A0B0E] select-text font-sans">
      <div className="flex items-center justify-between border-b border-[#181A22] pb-2.5">
        <div className="flex items-center space-x-2">
          <Layers className="h-3.5 w-3.5 text-[#C85A32]" strokeWidth={1.5} />
          <h2 className="text-xs font-mono font-medium uppercase tracking-[0.16em] text-[#F4F4F2]">
            Map Layers ({layers.length})
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#C85A32] font-semibold tracking-wider">
          {activeLayerIds.length} ACTIVE
        </span>
      </div>

      <div className="space-y-2.5">
        {layers.map((layer) => {
          const isActive = activeLayerIds.includes(layer.layer_id);
          const isUnavailable = layer.status === 'UNAVAILABLE';
          const opacity = layerOpacities[layer.layer_id] ?? 1.0;

          return (
            <div
              key={layer.layer_id}
              data-testid={`layer-card-${layer.layer_id}`}
              className={`p-3 rounded-[2px] border transition-all duration-200 ${
                isUnavailable
                  ? 'bg-[#050507]/60 border-[#181A22] opacity-50'
                  : isActive
                  ? 'bg-[#0F1015] border-[#C85A32]/60 shadow-[0_2px_8px_rgba(200,90,50,0.08)]'
                  : 'bg-[#050507] border-[#181A22] hover:border-[#2A2E3D]'
              }`}
            >
              {/* Header row: Checkbox, Name, Status */}
              <div className="flex items-start justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isUnavailable}
                    checked={isActive}
                    onChange={() => toggleLayer(layer.layer_id)}
                    className="h-3.5 w-3.5 rounded-[2px] bg-[#050507] border-[#181A22] accent-[#C85A32] focus:ring-0 disabled:cursor-not-allowed cursor-pointer"
                  />
                  <div>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        isUnavailable
                          ? 'text-[#8B909A] line-through'
                          : isActive
                          ? 'text-[#F4F4F2]'
                          : 'text-[#C4C7C5]'
                      }`}
                    >
                      {layer.name}
                    </span>
                    <span className="text-[9px] font-mono text-[#8B909A] ml-1.5 uppercase tracking-wider">
                      [{layer.data_type}]
                    </span>
                    {layer.layer_id === 'mola_elevation' ? (
                      <span className="text-[9px] font-mono text-[#D4A359] ml-1.5 px-1 py-0.5 bg-[#D4A359]/15 border border-[#D4A359]/30 rounded-[2px] uppercase tracking-wider font-semibold" title="Regional scale full crater context">
                        REGIONAL CONTEXT
                      </span>
                    ) : (MVP_LAYER_IDS as readonly string[]).includes(layer.layer_id) ? (
                      <span className="text-[9px] font-mono text-[#4E9A68] ml-1.5 px-1 py-0.5 bg-[#4E9A68]/15 border border-[#4E9A68]/30 rounded-[2px] uppercase tracking-wider font-semibold">
                        MVP
                      </span>
                    ) : null}
                  </div>
                </label>

                <DataClassBadge dataClass={layer.data_class} />
              </div>

              {/* Unavailable Warning */}
              {isUnavailable && (
                <div className="mt-2 text-[11px] text-[#D4A359] flex items-center space-x-1.5 bg-[#282114] px-2 py-1 rounded-[2px] border border-[#4C3B20]">
                  <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                  <span>{layer.status_reason || 'Layer unavailable in this region'}</span>
                </div>
              )}

              {/* Active controls: Opacity slider & Legend */}
              {!isUnavailable && isActive && (
                <div className="mt-2.5 pt-2 border-t border-[#181A22] space-y-2 text-xs">
                  {/* Opacity control */}
                  <div className="flex items-center space-x-2">
                    <Sliders className="h-3 w-3 text-[#8B909A]" strokeWidth={1.5} />
                    <span className="text-[10px] text-[#C85A32] font-mono w-12 font-medium">
                      {Math.round(opacity * 100)}%
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={opacity}
                      onChange={(e) =>
                        setLayerOpacity(layer.layer_id, parseFloat(e.target.value))
                      }
                      className="w-full h-1 bg-[#181A22] rounded-none appearance-none cursor-pointer accent-[#C85A32]"
                    />
                  </div>

                  {/* Legend display */}
                  {layer.legend && (
                    <div className="bg-[#050507] p-2 rounded-[2px] border border-[#181A22] space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#8B909A] font-mono">
                        <span>Colormap: {layer.legend.colormap}</span>
                        {layer.legend.units && (
                          <span className="text-[#C4C7C5]">Unit: {layer.legend.units}</span>
                        )}
                      </div>

                      {/* Continuous color ramp indication */}
                      {layer.legend.vmin !== undefined && layer.legend.vmax !== undefined && (
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8B909A] mt-1">
                          <span>{layer.legend.vmin}</span>
                          <div
                            className="h-1.5 flex-1 mx-2 rounded-[1px] opacity-90 shadow-inner"
                            style={{ background: getColormapGradient(layer.legend.colormap) }}
                            title={`Colormap: ${layer.legend.colormap}`}
                          />
                          <span>{layer.legend.vmax}</span>
                        </div>
                      )}

                      {/* Categorical legend chips */}
                      {layer.legend.categories && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {layer.legend.categories.map((cat, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded-[2px] bg-[#0A0B0E] text-[#8B909A] border border-[#181A22] font-mono"
                            >
                              <span
                                className="w-2 h-2 rounded-[1px] inline-block"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span>{cat.label}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dataset provenance citation links */}
                  {layer.dataset_ids && layer.dataset_ids.length > 0 && (
                    <div className="text-[10px] flex items-center space-x-1 text-[#8B909A]">
                      <Info className="h-3 w-3 text-[#8B909A]" />
                      <span>Source:</span>
                      {layer.dataset_ids.map((dsId) => (
                        <button
                          key={dsId}
                          type="button"
                          onClick={() => onInspectDataset && onInspectDataset(dsId)}
                          className="text-[#C85A32] hover:underline font-mono"
                        >
                          {dsId}
                        </button>
                      ))}
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
