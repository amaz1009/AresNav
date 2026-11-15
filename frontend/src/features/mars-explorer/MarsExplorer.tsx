import React, { useState, useEffect } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { MarsMap } from '../map/MarsMap';
import { LayerPanel } from '../layers/LayerPanel';
import { PointInspector } from '../inspector/PointInspector';
import { ProvenanceModal } from '../common/ProvenanceModal';
import { createSampleInspection } from '../mock/sampleData';
import { Search, Plus, Minus, RotateCcw, Box } from 'lucide-react';

export const MarsExplorer: React.FC = () => {
  const {
    selectedRegion,
    setSelectedPoint,
    setPointInspection,
    datasetsMeta,
    selectedDataset,
    setSelectedDataset,
    routes,
    selectedRoute,
    setSelectedRoute,
    setActivePage,
    base,
    destination,
  } = useMissionStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    if (selectedRegion?.center) {
      return [selectedRegion.center.lat, selectedRegion.center.lon];
    }
    return [-4.83, 137.30];
  });
  const [mapZoom, setMapZoom] = useState(12);

  // Sync map center when selected region updates
  useEffect(() => {
    if (selectedRegion?.center) {
      setMapCenter([selectedRegion.center.lat, selectedRegion.center.lon]);
      setMapZoom(12);
    }
  }, [selectedRegion]);

  // Quick landmark shortcuts for Gale Crater / Mount Sharp exploration corridor
  const landmarks = [
    { name: 'Mount Sharp Mound', lat: -4.834, lon: 137.296, zoom: 13 },
    { name: 'Lower Layered Unit', lat: -4.782, lon: 137.285, zoom: 14 },
    { name: 'Boxwork Ridge Structure', lat: -4.870, lon: 137.310, zoom: 14 },
    { name: 'Vera Rubin Ridge', lat: -4.750, lon: 137.260, zoom: 13 },
    { name: 'Gale Central Corridor', lat: -4.810, lon: 137.320, zoom: 13 },
  ];

  const handleMapClick = (lat: number, lon: number) => {
    setSelectedPoint({ lat, lon });
    const inspection = createSampleInspection(lat, lon);
    setPointInspection(inspection);
  };

  const handleJumpToLandmark = (lm: { lat: number; lon: number; zoom: number }) => {
    setMapCenter([lm.lat, lm.lon]);
    setMapZoom(lm.zoom);
    handleMapClick(lm.lat, lm.lon);
  };

  const handleCoordinateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const match = searchQuery.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 360) {
        const eastLon = ((lon % 360) + 360) % 360;
        setMapCenter([lat, eastLon]);
        setMapZoom(13);
        handleMapClick(lat, eastLon);
        return;
      }
    }

    const found = landmarks.find((l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      handleJumpToLandmark(found);
    }
  };

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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative font-sans select-none bg-[#111215]">
      {/* Precision Search & Tactical Landmark Bar */}
      <div className="h-11 bg-[#17191E] border-b border-[#282C37] px-4 flex items-center justify-between z-20 shrink-0 gap-3">
        <form onSubmit={handleCoordinateSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-[#8B909A] absolute left-3 top-2.5" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search coordinates (e.g. -4.83, 137.30) or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111215] border border-[#282C37] rounded-[2px] pl-9 pr-3 py-1 text-xs text-[#F4F4F2] placeholder-[#8B909A] focus:outline-none focus:border-[#C85A32] w-64 md:w-80 font-mono transition-colors"
            />
          </div>
          <button
            type="submit"
            className="btn-secondary py-1 px-3 text-[10px] tracking-[0.14em]"
          >
            LOCATE
          </button>
        </form>

        {/* Quick Regional Landmarks */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs">
          <span className="text-[10px] text-[#8B909A] font-mono uppercase tracking-[0.14em] font-semibold">
            KEY TARGETS:
          </span>
          {landmarks.map((lm) => (
            <button
              key={lm.name}
              onClick={() => handleJumpToLandmark(lm)}
              className="px-2.5 py-0.5 rounded-[2px] bg-[#1D2026] hover:bg-[#252932] border border-[#282C37] text-[#C4C7C5] hover:text-[#C85A32] hover:border-[#C85A32]/50 font-mono text-[10px] tracking-wider transition-colors duration-150"
            >
              {lm.name}
            </button>
          ))}
        </div>

        {/* Active Route Selector Quick Toggle */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-[#8B909A] text-[10px] uppercase tracking-[0.14em] font-semibold hidden sm:inline">
            ACTIVE ROUTE:
          </span>
          <select
            value={selectedRoute?.route_id || ''}
            onChange={(e) => {
              const r = routes.find((rt) => rt.route_id === e.target.value) || null;
              setSelectedRoute(r);
            }}
            className="bg-[#111215] border border-[#282C37] text-[#F4F4F2] px-2.5 py-1 rounded-[2px] text-xs focus:outline-none focus:border-[#C85A32] cursor-pointer"
          >
            <option value="">None (Basemap Only)</option>
            {routes.map((rt) => (
              <option key={rt.route_id} value={rt.route_id}>
                {rt.name.split(':')[0]} ({rt.objective})
              </option>
            ))}
          </select>

          {base && destination && selectedRoute && (
            <button
              onClick={() => setActivePage('terrain-3d')}
              className="px-2.5 py-1 rounded-[2px] bg-[#C85A32]/15 hover:bg-[#C85A32]/30 border border-[#C85A32]/50 text-[#E27B54] font-mono text-[10px] tracking-wider transition-colors flex items-center space-x-1"
              title="Inspect selected route in 3D Surface Topography Viewer"
            >
              <Box className="h-3 w-3" />
              <span>VIEW IN 3D</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace 3-Column Workstation Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Scientific Layer Panel */}
        <aside className="w-72 border-r border-[#282C37] bg-[#17191E] flex flex-col z-10 shrink-0">
          <LayerPanel onInspectDataset={handleInspectDataset} />
        </aside>

        {/* Center: Leaflet Mars Surface Map */}
        <main className="flex-1 relative h-full bg-[#0E0F12] overflow-hidden">
          <MarsMap
            center={mapCenter}
            zoom={mapZoom}
            onMapClick={handleMapClick}
            showCandidateSites={true}
            showRoutes={Boolean(base && destination)}
          />

          {/* Multi-Route Color Legend Overlay (Only rendered when Base and Destination are configured) */}
          {base && destination && (
            <div className="absolute bottom-4 left-4 z-[400] bg-[#17191E]/95 border border-[#282C37] rounded-[2px] p-2.5 shadow-xl backdrop-blur-md text-xs font-mono flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)]">
              <span className="text-[10px] uppercase tracking-wider text-[#8B909A] font-semibold flex items-center space-x-1">
                <span>EXPLORATION PATHS:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedRoute(routes.find((r) => r.route_id === 'ROUTE_A') || null)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                  selectedRoute?.route_id === 'ROUTE_A'
                    ? 'bg-[#10B981]/25 border-[#10B981] text-[#10B981] font-semibold shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-[#111215] border-[#282C37] text-[#C4C7C5] hover:border-[#10B981]/60'
                }`}
                title="Select Route Alpha (Lowest Risk)"
              >
                <span className="w-2.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>
                  Route Alpha ({routes.find((r) => r.route_id === 'ROUTE_A')?.surface_distance_km ? `${routes.find((r) => r.route_id === 'ROUTE_A')?.surface_distance_km} km` : 'Lowest Risk'})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoute(routes.find((r) => r.route_id === 'ROUTE_B') || null)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                  selectedRoute?.route_id === 'ROUTE_B'
                    ? 'bg-[#F59E0B]/25 border-[#F59E0B] text-[#F59E0B] font-semibold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                    : 'bg-[#111215] border-[#282C37] text-[#C4C7C5] hover:border-[#F59E0B]/60'
                }`}
                title="Select Route Bravo (Balanced)"
              >
                <span className="w-2.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span>
                  Route Bravo ({routes.find((r) => r.route_id === 'ROUTE_B')?.surface_distance_km ? `${routes.find((r) => r.route_id === 'ROUTE_B')?.surface_distance_km} km` : 'Balanced'})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoute(routes.find((r) => r.route_id === 'ROUTE_C') || null)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[2px] border transition-colors cursor-pointer ${
                  selectedRoute?.route_id === 'ROUTE_C'
                    ? 'bg-[#A855F7]/25 border-[#A855F7] text-[#A855F7] font-semibold shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                    : 'bg-[#111215] border-[#282C37] text-[#C4C7C5] hover:border-[#A855F7]/60'
                }`}
                title="Select Route Charlie (Max Science)"
              >
                <span className="w-2.5 h-1.5 rounded-full bg-[#A855F7]" />
                <span>
                  Route Charlie ({routes.find((r) => r.route_id === 'ROUTE_C')?.surface_distance_km ? `${routes.find((r) => r.route_id === 'ROUTE_C')?.surface_distance_km} km` : 'Max Science'})
                </span>
              </button>
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[2px] bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444]">
                <span className="w-2.5 h-0.5 border-t border-dashed border-[#EF4444]" />
                <span>Planner Vector</span>
              </span>
            </div>
          )}

          {/* Floating Zoom Controls in Top Right */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.min(18, z + 1))}
              aria-label="Zoom in"
              className="button-icon-circle h-8 w-8"
              title="Zoom in"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setMapZoom((z) => Math.max(4, z - 1))}
              aria-label="Zoom out"
              className="button-icon-circle h-8 w-8"
              title="Zoom out"
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedRegion?.center) {
                  setMapCenter([selectedRegion.center.lat, selectedRegion.center.lon]);
                } else {
                  setMapCenter([-4.83, 137.30]);
                }
                setMapZoom(12);
              }}
              aria-label="Reset view"
              className="button-icon-circle h-8 w-8"
              title="Center map on region"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        </main>

        {/* Right Side: High-Density Point Inspector */}
        <aside className="w-80 border-l border-[#282C37] bg-[#17191E] flex flex-col z-10 shrink-0">
          <PointInspector onInspectDataset={handleInspectDataset} />
        </aside>
      </div>

      {/* Provenance Inspection Modal */}
      <ProvenanceModal
        dataset={selectedDataset}
        onClose={() => setSelectedDataset(null)}
      />
    </div>
  );
};
