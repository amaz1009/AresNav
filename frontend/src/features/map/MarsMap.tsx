import React, { useEffect } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMissionStore } from '../../store/missionStore';
import { GALE_LAYERS } from '../../mocks/demoData';
import { Compass } from 'lucide-react';

// Custom icons to avoid broken Leaflet default asset paths in Vite
const createIcon = (color: string, size = 12, isCircle = false) =>
  L.divIcon({
    className: 'custom-map-icon',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: ${
      isCircle ? '50%' : '2px'
    }; border: 1.5px solid #F4F4F2; box-shadow: 0 0 8px ${color};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const pointIcon = createIcon('#C85A32', 14);
const targetIcon = createIcon('#4B88AB', 12);
const baseIcon = createIcon('#4E9A68', 14);
const destinationIcon = createIcon('#EF4444', 14);
const siteBlueIcon = createIcon('#2563EB', 13, true);
const selectedSiteBlueIcon = createIcon('#60A5FA', 17, true);

export const ROUTE_PALETTE: Record<string, { color: string; label: string }> = {
  ROUTE_A: { color: '#10B981', label: 'Route Alpha (Lowest Risk)' },   // Emerald Green
  ROUTE_B: { color: '#F59E0B', label: 'Route Bravo (Balanced)' },       // Vibrant Amber / Gold
  ROUTE_C: { color: '#A855F7', label: 'Route Charlie (Max Science)' },  // Vibrant Purple
  TRAVERSE_PLANNER_ROUTE: { color: '#EF4444', label: 'Planner Traverse Vector' },
};

interface MarsMapProps {
  onMapClick?: (lat: number, lon: number) => void;
  onSiteClick?: (site: any) => void;
  center?: [number, number];
  zoom?: number;
  showCandidateSites?: boolean;
  showRoutes?: boolean;
}

function MapViewControllerInternal({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (map && center && typeof map.setView === 'function') {
      map.setView(center, zoom ?? (typeof map.getZoom === 'function' ? map.getZoom() : 10));
      if (typeof map.invalidateSize === 'function') {
        map.invalidateSize();
      }
    }
  }, [center[0], center[1], zoom, map]);
  return null;
}

function MapViewController({
  center,
  zoom,
}: {
  center?: [number, number];
  zoom?: number;
}) {
  if (typeof useMap !== 'function' || !center) {
    return null;
  }
  return <MapViewControllerInternal center={center} zoom={zoom} />;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lon: number) => void;
}) {
  if (typeof useMapEvents === 'function') {
    useMapEvents({
      click(e) {
        if (onMapClick) {
          const lat = Math.max(-90, Math.min(90, e.latlng.lat));
          const lon = ((e.latlng.lng % 360) + 360) % 360;
          onMapClick(lat, lon);
        }
      },
    });
  }
  return null;
}

export const MarsMap: React.FC<MarsMapProps> = ({
  onMapClick,
  onSiteClick,
  center = [-4.83, 137.30],
  zoom = 12,
  showCandidateSites = false,
  showRoutes = false,
}) => {
  const {
    layers,
    activeLayerIds,
    layerOpacities,
    selectedPoint,
    regionDetail,
    base,
    destination,
    plan,
    selected_route_id,
    candidateSites,
    selectedSite,
    setSelectedSite,
    routes,
    selectedRoute,
    setSelectedRoute,
  } = useMissionStore();

  // If layers are not loaded yet in store, fallback to GALE_LAYERS when in candidate sites or routes view
  const availableLayers =
    layers.length > 0
      ? layers
      : showCandidateSites || showRoutes
      ? GALE_LAYERS
      : [];

  const activeLayers = availableLayers.filter(
    (l) => activeLayerIds.includes(l.layer_id) && l.status !== 'UNAVAILABLE'
  );

  const planSelectedRoute = plan?.routes?.find(
    (r) => r.route_id === selected_route_id
  );
  const planRoutePositions: [number, number][] =
    planSelectedRoute?.legs?.flatMap((leg) =>
      leg.path.map((p) => [p.lat, p.lon] as [number, number])
    ) ?? [];

  const shouldRenderSites = Boolean(
    showCandidateSites || activeLayers.length > 0
  ) && (candidateSites?.length ?? 0) > 0;

  const shouldRenderRoutes = Boolean(
    showRoutes && base && destination && (routes?.length ?? 0) > 0
  );

  const hasActiveContent =
    activeLayers.length > 0 ||
    Boolean(selectedPoint) ||
    Boolean(base) ||
    Boolean(destination) ||
    planRoutePositions.length > 0 ||
    shouldRenderRoutes ||
    Boolean(showCandidateSites && (candidateSites?.length ?? 0) > 0);

  return (
    <div className="relative w-full h-full bg-[#0E0F12] overflow-hidden select-none">
      {/* Leaflet Map Surface */}
      <MapContainer
        center={center}
        zoom={zoom}
        crs={L.CRS.EPSG4326}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
      >
        {hasActiveContent ? (
          <>
            <MapViewController center={center} zoom={zoom} />
            {onMapClick && typeof useMapEvents === 'function' && (
              <MapClickHandler onMapClick={onMapClick} />
            )}

            {/* Raster Layer Overlays */}
            {activeLayers.map((layer) => {
              if (layer.kind === 'RASTER' && layer.image_url && layer.bounds) {
                const bounds: L.LatLngBoundsExpression = [
                  [layer.bounds.lat_min, layer.bounds.lon_min],
                  [layer.bounds.lat_max, layer.bounds.lon_max],
                ];
                const opacity = layerOpacities[layer.layer_id] ?? 1.0;
                const zIndexMap: Record<string, number> = {
                  mola_elevation: 5,
                  ortho: 10,
                  elevation: 12,
                  slope: 14,
                  hazard_grid: 16,
                };
                const zIndex = zIndexMap[layer.layer_id] ?? 10;

                return (
                  <ImageOverlay
                    key={layer.layer_id}
                    url={layer.image_url}
                    bounds={bounds}
                    opacity={opacity}
                    zIndex={zIndex}
                  />
                );
              }
              return null;
            })}

            {/* Render Mission Traversal Routes (Alpha, Bravo, Charlie) with Distinct Colors (Only when Base and Destination are configured) */}
            {shouldRenderRoutes &&
              routes.map((rt) => {
                const isSelected = selectedRoute?.route_id === rt.route_id;
                const palette = ROUTE_PALETTE[rt.route_id] || { color: '#C85A32', label: rt.name };
                const routeColor = palette.color;

                const positions: [number, number][] =
                  rt.waypoints && rt.waypoints.length > 0
                    ? rt.waypoints.map((w) => [w.lat, w.lon] as [number, number])
                    : (rt as any).legs?.flatMap((leg: any) =>
                        leg.path.map((p: any) => [p.lat, p.lon] as [number, number])
                      ) ?? [];

                if (positions.length === 0) return null;

                return (
                  <React.Fragment key={rt.route_id}>
                    <Polyline
                      positions={positions}
                      color={routeColor}
                      weight={isSelected ? 5.5 : 3.5}
                      opacity={isSelected ? 1.0 : 0.75}
                      dashArray={isSelected ? undefined : '5, 5'}
                      eventHandlers={{
                        click: () => {
                          setSelectedRoute(rt);
                        },
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 font-mono text-xs space-y-1">
                          <div className="flex items-center space-x-1.5 font-semibold" style={{ color: routeColor }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: routeColor }} />
                            <span>{rt.name}</span>
                          </div>
                          <div className="text-[10px] text-[#8B909A]">
                            Objective: <strong className="text-[#F4F4F2]">{rt.objective}</strong>
                          </div>
                          <div className="text-[10px] text-[#8B909A]">
                            Distance: <strong className="text-[#F4F4F2]">{rt.total_distance_km.toFixed(2)} km</strong>
                          </div>
                          <div className="text-[10px] text-[#8B909A]">
                            Duration: <strong className="text-[#F4F4F2]">{rt.estimated_duration_hours.toFixed(1)} h</strong>
                          </div>
                          <div className="pt-1">
                            <span className="text-[9px] uppercase tracking-wider text-[#C85A32] font-semibold">
                              {isSelected ? '★ ACTIVE ROUTE' : 'Click to select route'}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Polyline>
                  </React.Fragment>
                );
              })}

            {/* Direct Traverse Line between Base and Destination (if configured) */}
            {base && destination && (
              <Polyline
                positions={[
                  [base.lat, base.lon],
                  [destination.lat, destination.lon],
                ]}
                color="#EF4444"
                weight={selectedRoute?.route_id === 'TRAVERSE_PLANNER_ROUTE' ? 5 : 3.5}
                opacity={0.9}
                dashArray="6, 6"
              >
                <Popup>
                  <div className="p-1 font-mono text-xs">
                    <strong className="text-[#EF4444] block">Traverse Planner Vector</strong>
                    <span className="text-[10px] text-[#8B909A]">
                      Direct vector between Habitat Base and Target Destination
                    </span>
                  </div>
                </Popup>
              </Polyline>
            )}

            {/* Fallback Selected Plan Route Polyline (T-FE-01: preserved across layer changes) */}
            {planRoutePositions.length > 0 && (
              <Polyline
                positions={planRoutePositions}
                color="#C85A32"
                weight={3}
                opacity={0.95}
                dashArray="5, 5"
              />
            )}

            {/* Candidate Sites highlighted with blue points */}
            {shouldRenderSites &&
              candidateSites.map((site) => {
                const isSelected = selectedSite?.site_id === site.site_id;
                return (
                  <Marker
                    key={site.site_id}
                    position={[site.point.lat, site.point.lon]}
                    icon={isSelected ? selectedSiteBlueIcon : siteBlueIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedSite(site);
                        if (onSiteClick) {
                          onSiteClick(site);
                        }
                      },
                    }}
                  >
                    <Popup className="mars-popup">
                      <div className="p-1 text-xs font-mono">
                        <strong className="text-[#3B82F6] block font-editorial uppercase">
                          {site.name}
                        </strong>
                        <span className="text-[10px] text-[#8B909A] block">
                          [{site.point.lat.toFixed(4)}°, {site.point.lon.toFixed(4)}°]
                        </span>
                        <span className="text-[10px] text-[#C85A32] block font-semibold">
                          Suitability: {site.suitability_score.toFixed(1)}/100
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* Science Targets from Region */}
            {regionDetail?.science_targets?.map((target) => (
              <Marker
                key={target.target_id}
                position={[target.point.lat, target.point.lon]}
                icon={targetIcon}
              >
                <Popup className="mars-popup">
                  <div className="p-1 text-xs font-mono">
                    <strong className="text-[#4B88AB] block tracking-wider uppercase font-editorial">
                      {target.name}
                    </strong>
                    <span className="text-[10px] text-[#8B909A] block">
                      LAT: {target.point.lat.toFixed(4)}° | LON: {target.point.lon.toFixed(4)}°
                    </span>
                    <p className="mt-1 text-[#C4C7C5] text-[11px] font-sans font-normal leading-relaxed">
                      {target.rationale}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Base Camp Marker */}
            {base && (
              <Marker position={[base.lat, base.lon]} icon={baseIcon}>
                <Popup>
                  <div className="p-1 text-xs font-mono">
                    <strong className="text-[#4E9A68] block">Mission Base</strong>
                    <span className="text-[10px] text-[#8B909A]">
                      [{base.lat.toFixed(4)}°, {base.lon.toFixed(4)}°]
                    </span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Traverse Destination Marker */}
            {destination && (
              <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
                <Popup>
                  <div className="p-1 text-xs font-mono">
                    <strong className="text-[#EF4444] block">Traverse Destination</strong>
                    <span className="text-[10px] text-[#8B909A]">
                      [{destination.lat.toFixed(4)}°, {destination.lon.toFixed(4)}°]
                    </span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Clicked Inspection Point Marker */}
            {selectedPoint && (
              <Marker
                position={[selectedPoint.lat, selectedPoint.lon]}
                icon={pointIcon}
              >
                <Popup>
                  <div className="p-1 text-xs font-mono">
                    <strong className="text-[#C85A32] block font-editorial text-sm">
                      Selected Inspection Point
                    </strong>
                    <span>LAT: {selectedPoint.lat.toFixed(5)}°</span>
                    <br />
                    <span>LON: {selectedPoint.lon.toFixed(5)}°</span>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        ) : null}
      </MapContainer>

      {/* Coordinate & Layer HUD Overlay (Strictly preserves data-testid="map-hud" for unit tests) */}
      <div
        data-testid="map-hud"
        className="absolute top-3 left-4 z-[400] bg-[#17191E]/95 border border-[#282C37] rounded-[2px] px-3.5 py-1.5 text-xs font-mono text-[#F4F4F2] flex items-center space-x-2 pointer-events-none shadow-md backdrop-blur-sm"
      >
        <Compass className="h-3.5 w-3.5 text-[#C85A32]" strokeWidth={1.5} />
        <span className="tracking-wider">
          {activeLayers.length === 0
            ? 'Mars map: no data layers loaded'
            : `Gale Crater | ${activeLayers.length} active layer${
                activeLayers.length > 1 ? 's' : ''
              }`}
        </span>
      </div>
    </div>
  );
};
