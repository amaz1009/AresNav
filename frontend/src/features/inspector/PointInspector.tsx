import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { DataClassBadge } from '../common/DataClassBadge';
import { SampleBadge } from '../common/SampleBadge';
import { Crosshair, AlertTriangle, Activity } from 'lucide-react';

interface PointInspectorProps {
  onInspectDataset?: (datasetId: string) => void;
}

export const PointInspector: React.FC<PointInspectorProps> = ({ onInspectDataset }) => {
  const { selectedPoint, pointInspection, isLoading } = useMissionStore();

  if (!selectedPoint) {
    return (
      <div className="p-6 text-xs text-[#8B909A] text-center font-sans space-y-2">
        <Crosshair className="h-6 w-6 mx-auto opacity-40 text-[#8B909A]" strokeWidth={1.5} />
        <p className="font-semibold text-sm tracking-wide text-[#F4F4F2]">No point selected.</p>
        <p className="text-[11px] text-[#8B909A] leading-relaxed">
          Click any location on the Mars map to inspect elevation, slope, geology, and evidence.
        </p>
      </div>
    );
  }

  const isSampleInspection = pointInspection?.values.some((v) => v.data_class === 'SAMPLE');

  return (
    <div className="flex flex-col h-full space-y-3.5 p-3.5 overflow-y-auto bg-[#0A0B0E] select-text font-sans">
      {/* Header with coordinates */}
      <div className="border-b border-[#181A22] pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crosshair className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
            <h3 className="text-xs font-mono font-medium uppercase tracking-[0.16em] text-[#F4F4F2]">
              Point Inspector
            </h3>
          </div>
          {isSampleInspection && <SampleBadge />}
        </div>

        {/* Selected Coordinates */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 bg-[#050507] p-2.5 rounded-[2px] border border-[#181A22] font-mono text-xs">
          <div>
            <span className="text-[10px] text-[#8B909A] block uppercase tracking-[0.16em] font-semibold">LAT (Planetocentric)</span>
            <span className="text-[#F4F4F2] font-medium">{selectedPoint.lat.toFixed(5)}Â°</span>
          </div>
          <div>
            <span className="text-[10px] text-[#8B909A] block uppercase tracking-[0.16em] font-semibold">LON (East-positive)</span>
            <span className="text-[#F4F4F2] font-medium">{selectedPoint.lon.toFixed(5)}Â°</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-xs text-[#8B909A] space-x-2 font-mono">
          <Activity className="h-4 w-4 animate-spin text-[#C85A32]" strokeWidth={1.5} />
          <span>Sampling Mars surface rasters...</span>
        </div>
      ) : !pointInspection ? (
        <div className="text-xs text-[#8B909A] py-3 text-center font-sans">
          <p className="text-[#F4F4F2] font-medium">Coordinates captured.</p>
          <p className="text-[11px] text-[#8B909A] mt-1">Awaiting raster query response.</p>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          {/* Confidence & Region */}
          <div className="flex items-center justify-between text-[11px] bg-[#0F1015] px-3 py-1.5 rounded-[2px] border border-[#181A22]">
            <span className="text-[#8B909A] font-mono uppercase tracking-[0.14em] text-[10px]">Data Confidence:</span>
            <span
              className={`font-mono font-semibold tracking-wider ${
                pointInspection.data_confidence === 'HIGH'
                  ? 'text-[#4E9A68]'
                  : pointInspection.data_confidence === 'MEDIUM'
                  ? 'text-[#F4F4F2]'
                  : pointInspection.data_confidence === 'LOW'
                  ? 'text-[#D4A359]'
                  : 'text-[#8B909A]'
              }`}
            >
              {pointInspection.data_confidence}
            </span>
          </div>

          {/* Layer Values */}
          <div>
            <h4 className="text-[10px] font-mono text-[#C85A32] uppercase tracking-[0.16em] mb-1.5 font-semibold">
              Sampled Layer Measurements
            </h4>
            <div className="space-y-2">
              {pointInspection.values.map((v, i) => (
                <div
                  key={i}
                  data-testid={`inspection-value-${v.layer_id}`}
                  className="bg-[#050507] p-2.5 rounded-[2px] border border-[#181A22] space-y-1.5 hover:border-[#2A2E3D] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F4F4F2] capitalize text-xs tracking-wide">
                      {v.layer_id.replace(/_/g, ' ')}
                    </span>
                    <DataClassBadge dataClass={v.data_class} />
                  </div>

                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-sm font-semibold text-[#F4F4F2]">
                      {v.status === 'OK' && v.value !== undefined && v.value !== null
                        ? typeof v.value === 'number'
                          ? v.value.toFixed(2)
                          : String(v.value)
                        : v.status}
                      {v.units && v.status === 'OK' && (
                        <span className="text-xs font-normal text-[#8B909A] ml-1">
                          {v.units}
                        </span>
                      )}
                    </span>
                    {v.native_resolution_m && (
                      <span className="text-[10px] text-[#8B909A]">
                        Res: {v.native_resolution_m}m
                      </span>
                    )}
                  </div>

                  {/* Evidence Chain */}
                  {v.dataset_ids && v.dataset_ids.length > 0 && (
                    <div className="pt-1 border-t border-[#181A22] flex items-center justify-between text-[10px]">
                      <span className="text-[#8B909A] font-mono uppercase tracking-wider text-[9px]">Source:</span>
                      <div className="flex flex-wrap gap-1">
                        {v.dataset_ids.map((dsId) => (
                          <button
                            key={dsId}
                            type="button"
                            onClick={() => onInspectDataset && onInspectDataset(dsId)}
                            className="text-[#C85A32] hover:underline font-mono transition-colors"
                            title="Click to view scientific evidence & citation"
                          >
                            {dsId}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Context Indicators (MSL RAD, THEMIS) */}
          {pointInspection.context && pointInspection.context.length > 0 && (
            <div>
              <h4 className="text-[10px] font-mono text-[#C85A32] uppercase tracking-[0.16em] mb-1.5 font-semibold">
                Environmental Context
              </h4>
              <div className="space-y-1.5">
                {pointInspection.context.map((ctx, idx) => (
                  <div
                    key={idx}
                    className="bg-[#050507] p-2.5 rounded-[2px] border border-[#181A22] flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-[#F4F4F2] block">
                        {ctx.indicator_id.replace(/_/g, ' ')}
                      </span>
                      <div className="flex flex-wrap gap-1 text-[10px] text-[#8B909A] font-mono mt-0.5">
                        {ctx.evidence?.map((ev, ei) => (
                          <button
                            key={ei}
                            type="button"
                            onClick={() => onInspectDataset && onInspectDataset(ev.source_id)}
                            className="text-[#8B909A] hover:text-[#F4F4F2] transition-colors"
                          >
                            {ev.source_id}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[#F4F4F2] font-medium">
                        {ctx.value} {ctx.units}
                      </span>
                      <span className="block text-[9px] text-[#8B909A] font-mono">
                        {ctx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scientific Caveats and Limitations */}
          {pointInspection.limitations && pointInspection.limitations.length > 0 && (
            <div className="border border-[#4C3B20] bg-[#282114] p-3 rounded-[2px] text-[11px] text-[#D4A359] space-y-1">
              <div className="flex items-center space-x-1 font-mono uppercase tracking-[0.14em] text-[10px] font-semibold">
                <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                <span>Inspection Caveats</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[#D4A359]/90">
                {pointInspection.limitations.map((limit, i) => (
                  <li key={i}>{limit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
