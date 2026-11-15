import React, { useState, useEffect, useMemo } from 'react';
import { useMissionStore } from '../../store/missionStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SampleBadge } from '../common/SampleBadge';
import { MarsMap } from '../map/MarsMap';
import type { TraverseRoute } from '../../types/models';
import { GALE_ROUTES } from '../../mocks/demoData';
import {
  calculateMarsDistanceKm,
  calculateMarsBearing,
  createTraverseRouteFromPoints,
  createDynamicTraverseRoutes,
} from '../../services/routeService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Route,
  Box,
  Navigation,
  Target,
  Home,
  Lock,
} from 'lucide-react';

export const TraversePlanner: React.FC = () => {
  const {
    base,
    setBase,
    destination,
    setDestination,
    isBaseLocked,
    setIsBaseLocked,
    isDestinationLocked,
    setIsDestinationLocked,
    setActivePage,
    setSelectedPoint,
    selectedRoute,
    setSelectedRoute,
    routes,
    setRoutes,
    evaConfigParams,
    selectedRegion,
    candidateSites,
  } = useMissionStore();

  // Two tabs: 'base' and 'destination'
  const [activeTab, setActiveTab] = useState<'base' | 'destination'>('base');

  const isBaseEffectivelyLocked = Boolean(base && isBaseLocked);
  const isDestEffectivelyLocked = Boolean(destination && isDestinationLocked);

  // Local coordinate input state for Base tab
  const [baseLatInput, setBaseLatInput] = useState<string>(
    base ? base.lat.toFixed(5) : ''
  );
  const [baseLonInput, setBaseLonInput] = useState<string>(
    base ? base.lon.toFixed(5) : ''
  );
  const [baseError, setBaseError] = useState<string | null>(null);

  // Local coordinate input state for Destination tab
  const [destLatInput, setDestLatInput] = useState<string>(
    destination ? destination.lat.toFixed(5) : ''
  );
  const [destLonInput, setDestLonInput] = useState<string>(
    destination ? destination.lon.toFixed(5) : ''
  );
  const [destError, setDestError] = useState<string | null>(null);

  // Dynamically compute the exact route between Base and Destination if configured
  const plannerRoute = useMemo(() => {
    if (!base || !destination) return null;
    return createTraverseRouteFromPoints(
      base,
      destination,
      selectedRegion?.region_id,
      evaConfigParams?.base_speed_kmh,
      candidateSites
    );
  }, [base, destination, selectedRegion, evaConfigParams, candidateSites]);

  // Whatever path is selected in the traverse planner region, activeRoute tracks it (only when Base and Destination are configured)
  const activeRoute: TraverseRoute | null = useMemo(() => {
    if (!base || !destination) {
      return null;
    }
    if (selectedRoute?.route_id === 'TRAVERSE_PLANNER_ROUTE') {
      return plannerRoute || selectedRoute;
    }
    if (selectedRoute) {
      const matching = routes.find((r) => r.route_id === selectedRoute.route_id);
      return matching || selectedRoute;
    }
    if (plannerRoute) {
      return plannerRoute;
    }
    return routes[1] || routes[0] || null;
  }, [base, destination, selectedRoute, plannerRoute, routes]);

  // Reset lock if coordinates are cleared in store
  useEffect(() => {
    if (!base && isBaseLocked) {
      setIsBaseLocked(false);
    }
  }, [base, isBaseLocked, setIsBaseLocked]);

  useEffect(() => {
    if (!destination && isDestinationLocked) {
      setIsDestinationLocked(false);
    }
  }, [destination, isDestinationLocked, setIsDestinationLocked]);

  // Synchronize inputs when store coordinates change
  useEffect(() => {
    if (base) {
      setBaseLatInput(base.lat.toFixed(5));
      setBaseLonInput(base.lon.toFixed(5));
    } else {
      setBaseLatInput('');
      setBaseLonInput('');
    }
  }, [base]);

  useEffect(() => {
    if (destination) {
      setDestLatInput(destination.lat.toFixed(5));
      setDestLonInput(destination.lon.toFixed(5));
    } else {
      setDestLatInput('');
      setDestLonInput('');
    }
  }, [destination]);

  // Synchronize dynamic Traverse Routes (Alpha, Bravo, Charlie) into store whenever base & destination coordinates change
  useEffect(() => {
    if (base && destination) {
      const dynamicRoutes = createDynamicTraverseRoutes(
        base,
        destination,
        selectedRegion?.region_id,
        evaConfigParams?.base_speed_kmh,
        candidateSites
      );
      setRoutes(dynamicRoutes);

      const currentSelected = useMissionStore.getState().selectedRoute;
      const matching = dynamicRoutes.find((r) => r.route_id === currentSelected?.route_id);
      setSelectedRoute(matching || dynamicRoutes[1] || dynamicRoutes[0]);
    } else {
      setRoutes(GALE_ROUTES);
      setSelectedRoute(null);
    }
  }, [
    base?.lat,
    base?.lon,
    destination?.lat,
    destination?.lon,
    selectedRegion?.region_id,
    evaConfigParams?.base_speed_kmh,
    candidateSites,
    setRoutes,
    setSelectedRoute,
  ]);

  // Handle map clicks according to currently active tab (ignored if that checkpoint is locked)
  const handleMapClick = (lat: number, lon: number) => {
    const roundedLat = Number(lat.toFixed(5));
    const roundedLon = Number(lon.toFixed(5));

    if (activeTab === 'base') {
      if (isBaseEffectivelyLocked) return;
      setBase({ lat: roundedLat, lon: roundedLon });
      setBaseLatInput(roundedLat.toFixed(5));
      setBaseLonInput(roundedLon.toFixed(5));
      setBaseError(null);
    } else {
      if (isDestEffectivelyLocked) return;
      setDestination({ lat: roundedLat, lon: roundedLon });
      setDestLatInput(roundedLat.toFixed(5));
      setDestLonInput(roundedLon.toFixed(5));
      setDestError(null);
    }
    setSelectedPoint({ lat: roundedLat, lon: roundedLon });
  };

  const handleSiteClick = (site: { point: { lat: number; lon: number } }) => {
    handleMapClick(site.point.lat, site.point.lon);
  };

  // Base coordinate submission handler (Locks base checkpoint upon apply)
  const handleApplyBase = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isBaseEffectivelyLocked) return;
    const lat = parseFloat(baseLatInput.trim().replace(',', '.'));
    const lon = parseFloat(baseLonInput.trim().replace(',', '.'));

    if (isNaN(lat) || isNaN(lon)) {
      setBaseError('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setBaseError('Latitude must be between -90.0° and +90.0°.');
      return;
    }
    if (lon < -180 || lon > 360) {
      setBaseError('Longitude must be between -180.0° and +360.0°.');
      return;
    }

    const eastLon = ((lon % 360) + 360) % 360;
    const newBase = { lat: Number(lat.toFixed(5)), lon: Number(eastLon.toFixed(5)) };
    setBase(newBase);
    setIsBaseLocked(true);
    setBaseError(null);

    if (destination) {
      const dynamicRoutes = createDynamicTraverseRoutes(
        newBase,
        destination,
        selectedRegion?.region_id,
        evaConfigParams?.base_speed_kmh,
        candidateSites
      );
      setRoutes(dynamicRoutes);
      setSelectedRoute(dynamicRoutes[1] || dynamicRoutes[0]);
    }
  };

  // Destination coordinate submission handler (Locks destination checkpoint upon apply)
  const handleApplyDestination = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isDestEffectivelyLocked) return;
    const lat = parseFloat(destLatInput.trim().replace(',', '.'));
    const lon = parseFloat(destLonInput.trim().replace(',', '.'));

    if (isNaN(lat) || isNaN(lon)) {
      setDestError('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setDestError('Latitude must be between -90.0° and +90.0°.');
      return;
    }
    if (lon < -180 || lon > 360) {
      setDestError('Longitude must be between -180.0° and +360.0°.');
      return;
    }

    const eastLon = ((lon % 360) + 360) % 360;
    const newDest = { lat: Number(lat.toFixed(5)), lon: Number(eastLon.toFixed(5)) };
    setDestination(newDest);
    setIsDestinationLocked(true);
    setDestError(null);

    if (base) {
      const dynamicRoutes = createDynamicTraverseRoutes(
        base,
        newDest,
        selectedRegion?.region_id,
        evaConfigParams?.base_speed_kmh,
        candidateSites
      );
      setRoutes(dynamicRoutes);
      setSelectedRoute(dynamicRoutes[1] || dynamicRoutes[0]);
    }
  };

  // Clear handlers (Only method to unlock and clear the respective checkpoint)
  const handleClearBase = () => {
    setBase(null);
    setIsBaseLocked(false);
    setBaseLatInput('');
    setBaseLonInput('');
    setBaseError(null);
    setRoutes(GALE_ROUTES);
    setSelectedRoute(null);
  };

  const handleClearDestination = () => {
    setDestination(null);
    setIsDestinationLocked(false);
    setDestLatInput('');
    setDestLonInput('');
    setDestError(null);
    setRoutes(GALE_ROUTES);
    setSelectedRoute(null);
  };

  const handleViewIn3D = () => {
    if (activeRoute) {
      setSelectedRoute(activeRoute);
    }
    setActivePage('terrain-3d');
  };

  // Real-time Traverse Path Analysis
  const distanceKm =
    base && destination
      ? calculateMarsDistanceKm(base.lat, base.lon, destination.lat, destination.lon)
      : null;

  const bearing =
    base && destination
      ? calculateMarsBearing(base.lat, base.lon, destination.lat, destination.lon)
      : null;

  const walkingSpeedKmh = evaConfigParams?.base_speed_kmh || 2.7;
  const estimatedHours = distanceKm !== null ? distanceKm / walkingSpeedKmh : null;
  const walkbackLimitM = 2000;
  const distanceM = distanceKm !== null ? distanceKm * 1000 : 0;
  const isSafeWalkback = distanceM <= walkbackLimitM;

  // Dynamic elevation profile along the active route
  const chartData = useMemo(() => {
    if (activeRoute?.elevation_profile && activeRoute.elevation_profile.length > 0) {
      return activeRoute.elevation_profile.map((p) => ({
        distKm: (p.distance_m / 1000).toFixed(2),
        elevation: Math.round(p.elevation_m),
        slope: p.slope_deg,
      }));
    }
    return [];
  }, [activeRoute]);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1720px] mx-auto w-full select-text font-sans bg-[#111215]">
      {/* Header Panel */}
      <div className="border border-[#282C37] bg-[#17191E] p-6 md:p-8 rounded-[2px] flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2.5">
            <Route className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold">
              HUMAN EVA TRAVERSABILITY & PATHFINDING
            </span>
            <span className="text-[#363B4A]">/</span>
            <SampleBadge label="ROUTING ENGINE" />
          </div>
          <h2 className="text-3xl font-normal text-[#F4F4F2] tracking-wide font-editorial">
            Human Traverse Planner & Coordinate Configurator
          </h2>
          <p className="text-xs text-[#C4C7C5] leading-relaxed font-sans font-light">
            Interactive Martian surface routing station. Configure the mission habitat base and exploration destination via coordinate entry or direct surface map targeting.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleViewIn3D}
            disabled={!base || !destination}
            className={`btn-secondary space-x-2 text-[#E27B54] border-[#C85A32]/50 hover:bg-[#C85A32]/10 ${
              !base || !destination ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={base && destination ? 'Inspect terrain in 3D Viewer' : 'Select Base and Destination first'}
          >
            <Box className="h-3 w-3 text-[#C85A32]" strokeWidth={1.5} />
            <span>VIEW IN 3D</span>
          </button>
          <button
            onClick={() => {
              if (activeRoute) {
                setSelectedRoute(activeRoute);
              }
              setActivePage('explorer');
            }}
            disabled={!base || !destination}
            className={`btn-secondary space-x-2 shrink-0 ${
              !base || !destination ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={base && destination ? 'View selected path on the Explorer map' : 'Select Base and Destination first'}
          >
            <span>VIEW IN EXPLORER</span>
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Two Tabs Navigation Bar: Base Tab and Destination Tab */}
      <div className="flex items-center justify-between border-b border-[#282C37] pb-0">
        <div className="flex items-center space-x-2">
          {/* Base Tab Button */}
          <button
            type="button"
            data-testid="tab-base"
            onClick={() => setActiveTab('base')}
            className={`px-5 py-3 font-mono text-xs tracking-[0.14em] uppercase transition-all flex items-center space-x-2.5 border-b-2 -mb-[2px] ${
              activeTab === 'base'
                ? 'border-[#4E9A68] text-[#F4F4F2] bg-[#17191E] font-semibold'
                : 'border-transparent text-[#8B909A] hover:text-[#C4C7C5] hover:bg-[#14161A]'
            }`}
          >
            <Home
              className={`h-4 w-4 ${
                activeTab === 'base' ? 'text-[#4E9A68]' : 'text-[#8B909A]'
              }`}
              strokeWidth={1.5}
            />
            <span>Base Location Tab</span>
            {base ? (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] flex items-center space-x-1 ${
                  isBaseEffectivelyLocked
                    ? 'bg-[#D4A359]/20 text-[#D4A359] border border-[#D4A359]/40'
                    : 'bg-[#4E9A68]/20 text-[#68D391] border border-[#4E9A68]/40'
                }`}
              >
                {isBaseEffectivelyLocked && <Lock className="h-2.5 w-2.5 mr-1 inline" />}
                <span>{isBaseEffectivelyLocked ? 'LOCKED' : 'SET'}</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#1D2026] text-[#8B909A] border border-[#282C37]">
                UNSET
              </span>
            )}
          </button>

          {/* Destination Tab Button */}
          <button
            type="button"
            data-testid="tab-destination"
            onClick={() => setActiveTab('destination')}
            className={`px-5 py-3 font-mono text-xs tracking-[0.14em] uppercase transition-all flex items-center space-x-2.5 border-b-2 -mb-[2px] ${
              activeTab === 'destination'
                ? 'border-[#EF4444] text-[#F4F4F2] bg-[#17191E] font-semibold'
                : 'border-transparent text-[#8B909A] hover:text-[#C4C7C5] hover:bg-[#14161A]'
            }`}
          >
            <Target
              className={`h-4 w-4 ${
                activeTab === 'destination' ? 'text-[#EF4444]' : 'text-[#8B909A]'
              }`}
              strokeWidth={1.5}
            />
            <span>Destination Tab</span>
            {destination ? (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-[2px] flex items-center space-x-1 ${
                  isDestEffectivelyLocked
                    ? 'bg-[#D4A359]/20 text-[#D4A359] border border-[#D4A359]/40'
                    : 'bg-[#EF4444]/20 text-[#FC8181] border border-[#EF4444]/40'
                }`}
              >
                {isDestEffectivelyLocked && <Lock className="h-2.5 w-2.5 mr-1 inline" />}
                <span>{isDestEffectivelyLocked ? 'LOCKED' : 'SET'}</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#1D2026] text-[#8B909A] border border-[#282C37]">
                UNSET
              </span>
            )}
          </button>
        </div>

        {/* Global Traverse Status Header Readout */}
        <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
          {base && destination ? (
            <div className="flex items-center space-x-2 text-[#4E9A68]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Traverse vector active ({distanceKm?.toFixed(2)} km)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-[#D4A359]">
              <AlertTriangle className="h-4 w-4" />
              <span>Awaiting both Base and Destination points</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Split Layout: Active Tab Controls on Left + Interactive Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Side: Tab Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#17191E] border border-[#282C37] rounded-[2px] p-6 flex flex-col justify-between space-y-6">
          {activeTab === 'base' ? (
            /* ================= BASE TAB CONTENT ================= */
            <div className="space-y-6">
              <div className="border-b border-[#282C37] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4E9A68] shadow-[0_0_8px_#4E9A68]" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#F4F4F2] font-mono">
                      Habitat Base Camp Coordinates
                    </h3>
                  </div>
                  {base && (
                    <button
                      onClick={handleClearBase}
                      className="text-[11px] font-mono text-[#C94D4D] hover:text-[#E57373] uppercase tracking-wider"
                    >
                      Clear Base
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#8B909A] font-sans mt-1.5 leading-relaxed">
                  Type in your habitat base coordinates or click any point directly on the Martian map surface to designate the mission starting location.
                </p>
              </div>

              {/* Coordinate Entry Form */}
              <form onSubmit={handleApplyBase} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#8B909A] font-semibold block">
                      Latitude (°N / Planetocentric)
                    </label>
                    <input
                      type="text"
                      data-testid="input-base-lat"
                      disabled={isBaseEffectivelyLocked}
                      placeholder="e.g. 18.4447"
                      value={baseLatInput}
                      onChange={(e) => setBaseLatInput(e.target.value)}
                      className="w-full bg-[#111215] border border-[#282C37] rounded-[2px] px-3 py-2 text-xs font-mono text-[#F4F4F2] focus:outline-none focus:border-[#4E9A68] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#8B909A] font-semibold block">
                      Longitude (°E / East-Positive)
                    </label>
                    <input
                      type="text"
                      data-testid="input-base-lon"
                      disabled={isBaseEffectivelyLocked}
                      placeholder="e.g. 77.4508"
                      value={baseLonInput}
                      onChange={(e) => setBaseLonInput(e.target.value)}
                      className="w-full bg-[#111215] border border-[#282C37] rounded-[2px] px-3 py-2 text-xs font-mono text-[#F4F4F2] focus:outline-none focus:border-[#4E9A68] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {baseError && (
                  <div className="text-[11px] font-mono text-[#C94D4D] bg-[#291516] border border-[#4F2325] p-2.5 rounded-[2px] flex items-center space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{baseError}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="submit"
                    data-testid="btn-apply-base"
                    disabled={isBaseEffectivelyLocked}
                    className={`btn-primary py-2 px-4 text-xs font-mono tracking-wider flex-1 flex items-center justify-center space-x-2 ${
                      isBaseEffectivelyLocked
                        ? 'bg-[#282C37] text-[#8B909A] border-[#282C37] cursor-not-allowed opacity-75'
                        : 'bg-[#4E9A68] hover:bg-[#3D8555] border-[#4E9A68]'
                    }`}
                  >
                    {isBaseEffectivelyLocked ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-[#D4A359]" />
                        <span>BASE COORDINATES LOCKED</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>APPLY BASE COORDINATES</span>
                      </>
                    )}
                  </button>
                  {base && (
                    <button
                      type="button"
                      onClick={handleClearBase}
                      className="btn-secondary py-2 px-3 text-xs font-mono text-[#8B909A]"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </form>

              {/* Map Interaction Status Banner */}
              <div
                className={`p-3.5 rounded-[2px] bg-[#111215] border ${
                  isBaseEffectivelyLocked ? 'border-[#D4A359]/30' : 'border-[#4E9A68]/40'
                } space-y-1.5`}
              >
                <div
                  className={`flex items-center space-x-2 text-xs font-mono font-semibold ${
                    isBaseEffectivelyLocked ? 'text-[#D4A359]' : 'text-[#4E9A68]'
                  }`}
                >
                  {isBaseEffectivelyLocked ? (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>BASE CHECKPOINT LOCKED</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3.5 w-3.5 animate-pulse" />
                      <span>MAP TARGETING ACTIVE FOR BASE</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#8B909A] font-sans leading-relaxed">
                  {isBaseEffectivelyLocked
                    ? 'Habitat Base location is locked in. Click CLEAR or Clear Base to unlock and edit coordinates or retarget on the map.'
                    : 'Clicking anywhere on the map immediately positions the green Habitat Base marker at that Martian coordinate.'}
                </p>
              </div>

              {/* Quick Preset Coordinates */}
              <div className="space-y-2 pt-2 border-t border-[#282C37]">
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#8B909A] font-semibold block">
                  Quick Landmark Presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Butler Landing', lat: 18.4447, lon: 77.4508 },
                    { label: 'Séítah Base Station', lat: 18.3710, lon: 77.5695 },
                    { label: 'Belva Crater Rim', lat: 18.3980, lon: 77.5950 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isBaseEffectivelyLocked}
                      onClick={() => {
                        if (isBaseEffectivelyLocked) return;
                        setBase({ lat: preset.lat, lon: preset.lon });
                        setBaseLatInput(preset.lat.toFixed(5));
                        setBaseLonInput(preset.lon.toFixed(5));
                        setBaseError(null);
                      }}
                      className="text-left p-2 rounded-[2px] bg-[#14161A] hover:bg-[#1D2026] border border-[#282C37] hover:border-[#4E9A68]/50 transition-colors text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-[#F4F4F2] block font-medium">{preset.label}</span>
                      <span className="text-[10px] text-[#8B909A]">
                        {preset.lat.toFixed(4)}°, {preset.lon.toFixed(4)}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ================= DESTINATION TAB CONTENT ================= */
            <div className="space-y-6">
              <div className="border-b border-[#282C37] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#F4F4F2] font-mono">
                      Traverse Destination Coordinates
                    </h3>
                  </div>
                  {destination && (
                    <button
                      onClick={handleClearDestination}
                      className="text-[11px] font-mono text-[#C94D4D] hover:text-[#E57373] uppercase tracking-wider"
                    >
                      Clear Destination
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#8B909A] font-sans mt-1.5 leading-relaxed">
                  Type in your science or exploration destination coordinates or click any point directly on the Martian map surface to designate the target location.
                </p>
              </div>

              {/* Coordinate Entry Form */}
              <form onSubmit={handleApplyDestination} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#8B909A] font-semibold block">
                      Latitude (°N / Planetocentric)
                    </label>
                    <input
                      type="text"
                      data-testid="input-dest-lat"
                      disabled={isDestEffectivelyLocked}
                      placeholder="e.g. 18.3845"
                      value={destLatInput}
                      onChange={(e) => setDestLatInput(e.target.value)}
                      className="w-full bg-[#111215] border border-[#282C37] rounded-[2px] px-3 py-2 text-xs font-mono text-[#F4F4F2] focus:outline-none focus:border-[#EF4444] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#8B909A] font-semibold block">
                      Longitude (°E / East-Positive)
                    </label>
                    <input
                      type="text"
                      data-testid="input-dest-lon"
                      disabled={isDestEffectivelyLocked}
                      placeholder="e.g. 77.5812"
                      value={destLonInput}
                      onChange={(e) => setDestLonInput(e.target.value)}
                      className="w-full bg-[#111215] border border-[#282C37] rounded-[2px] px-3 py-2 text-xs font-mono text-[#F4F4F2] focus:outline-none focus:border-[#EF4444] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {destError && (
                  <div className="text-[11px] font-mono text-[#C94D4D] bg-[#291516] border border-[#4F2325] p-2.5 rounded-[2px] flex items-center space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{destError}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="submit"
                    data-testid="btn-apply-dest"
                    disabled={isDestEffectivelyLocked}
                    className={`btn-primary py-2 px-4 text-xs font-mono tracking-wider flex-1 flex items-center justify-center space-x-2 ${
                      isDestEffectivelyLocked
                        ? 'bg-[#282C37] text-[#8B909A] border-[#282C37] cursor-not-allowed opacity-75'
                        : 'bg-[#EF4444] hover:bg-[#DC2626] border-[#EF4444]'
                    }`}
                  >
                    {isDestEffectivelyLocked ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-[#D4A359]" />
                        <span>DESTINATION COORDINATES LOCKED</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>APPLY DESTINATION COORDINATES</span>
                      </>
                    )}
                  </button>
                  {destination && (
                    <button
                      type="button"
                      onClick={handleClearDestination}
                      className="btn-secondary py-2 px-3 text-xs font-mono text-[#8B909A]"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </form>

              {/* Map Interaction Status Banner */}
              <div
                className={`p-3.5 rounded-[2px] bg-[#111215] border ${
                  isDestEffectivelyLocked ? 'border-[#D4A359]/30' : 'border-[#EF4444]/40'
                } space-y-1.5`}
              >
                <div
                  className={`flex items-center space-x-2 text-xs font-mono font-semibold ${
                    isDestEffectivelyLocked ? 'text-[#D4A359]' : 'text-[#EF4444]'
                  }`}
                >
                  {isDestEffectivelyLocked ? (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>DESTINATION CHECKPOINT LOCKED</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3.5 w-3.5 animate-pulse" />
                      <span>MAP TARGETING ACTIVE FOR DESTINATION</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#8B909A] font-sans leading-relaxed">
                  {isDestEffectivelyLocked
                    ? 'Destination location is locked in. Click CLEAR or Clear Destination to unlock and edit coordinates or retarget on the map.'
                    : 'Clicking anywhere on the map immediately positions the red Destination marker at that Martian coordinate.'}
                </p>
              </div>

              {/* Quick Preset Coordinates */}
              <div className="space-y-2 pt-2 border-t border-[#282C37]">
                <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#8B909A] font-semibold block">
                  Quick Landmark Presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Delta Scarp Outcrop', lat: 18.3845, lon: 77.5812 },
                    { label: 'Kodiak Butte Isolated Mesa', lat: 18.3620, lon: 77.5510 },
                    { label: 'Neretva Vallis Inflow', lat: 18.4230, lon: 77.5210 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isDestEffectivelyLocked}
                      onClick={() => {
                        if (isDestEffectivelyLocked) return;
                        setDestination({ lat: preset.lat, lon: preset.lon });
                        setDestLatInput(preset.lat.toFixed(5));
                        setDestLonInput(preset.lon.toFixed(5));
                        setDestError(null);
                      }}
                      className="text-left p-2 rounded-[2px] bg-[#14161A] hover:bg-[#1D2026] border border-[#282C37] hover:border-[#EF4444]/50 transition-colors text-xs font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-[#F4F4F2] block font-medium">{preset.label}</span>
                      <span className="text-[10px] text-[#8B909A]">
                        {preset.lat.toFixed(4)}°, {preset.lon.toFixed(4)}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Current Mission Coordinate Readout Bar */}
          <div className="bg-[#111215] border border-[#282C37] p-3.5 rounded-[2px] space-y-2">
            <div className="text-[10px] font-mono text-[#8B909A] uppercase tracking-[0.14em] font-semibold">
              Mission Coordinate Configuration:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-[2px] bg-[#17191E] border border-[#282C37]">
                <div className="flex items-center space-x-1.5 text-[#4E9A68] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#4E9A68]" />
                  <span>BASE:</span>
                </div>
                <div className="text-[#F4F4F2] mt-1 text-[11px]">
                  {base ? `${base.lat.toFixed(4)}°, ${base.lon.toFixed(4)}°` : 'Not Set'}
                </div>
              </div>

              <div className="p-2 rounded-[2px] bg-[#17191E] border border-[#282C37]">
                <div className="flex items-center space-x-1.5 text-[#EF4444] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span>DESTINATION:</span>
                </div>
                <div className="text-[#F4F4F2] mt-1 text-[11px]">
                  {destination
                    ? `${destination.lat.toFixed(4)}°, ${destination.lon.toFixed(4)}°`
                    : 'Not Set'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Mars Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E0F12] border border-[#282C37] rounded-[2px] overflow-hidden relative min-h-[500px] h-full flex flex-col">
          {/* Active Mode Banner */}
          <div className="absolute top-3 left-4 z-[400] bg-[#17191E]/95 border border-[#282C37] rounded-[2px] px-3.5 py-1.5 text-xs font-mono text-[#F4F4F2] flex items-center space-x-2 pointer-events-none shadow-md backdrop-blur-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === 'base'
                  ? isBaseEffectivelyLocked
                    ? 'bg-[#D4A359]'
                    : 'bg-[#4E9A68]'
                  : isDestEffectivelyLocked
                  ? 'bg-[#D4A359]'
                  : 'bg-[#EF4444]'
              }`}
            />
            <span>
              {activeTab === 'base'
                ? isBaseEffectivelyLocked
                  ? 'Base Location Locked (Map clicks ignored // Click Clear Base to unlock)'
                  : 'Base Targeting Mode: Click map to place Habitat Base'
                : isDestEffectivelyLocked
                ? 'Destination Location Locked (Map clicks ignored // Click Clear Destination to unlock)'
                : 'Destination Targeting Mode: Click map to place Target'}
            </span>
          </div>

          <div className="flex-1 w-full h-full relative min-h-[460px]">
            <MarsMap
              center={
                activeTab === 'base' && base
                  ? [base.lat, base.lon]
                  : destination
                  ? [destination.lat, destination.lon]
                  : selectedRegion?.center
                  ? [selectedRegion.center.lat, selectedRegion.center.lon]
                  : [-4.834, 137.296]
              }
              zoom={12}
              onMapClick={handleMapClick}
              onSiteClick={handleSiteClick}
              showCandidateSites={true}
              showRoutes={Boolean(base && destination)}
            />
          </div>

          {/* Map Bottom Legend Strip: Route Colors & Active Targeting */}
          {base && destination ? (
            <div className="bg-[#111215] border-t border-[#282C37] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono">
              <div className="flex items-center space-x-3 text-[#C4C7C5]">
                <span className="text-[#8B909A] font-semibold uppercase">PATHS:</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="text-[#10B981]">
                    Alpha ({routes.find((r) => r.route_id === 'ROUTE_A')?.surface_distance_km ? `${routes.find((r) => r.route_id === 'ROUTE_A')?.surface_distance_km} km` : 'Lowest Risk'})
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[#F59E0B]">
                    Bravo ({routes.find((r) => r.route_id === 'ROUTE_B')?.surface_distance_km ? `${routes.find((r) => r.route_id === 'ROUTE_B')?.surface_distance_km} km` : 'Balanced'})
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-1.5 rounded-full bg-[#A855F7]" />
                  <span className="text-[#A855F7]">
                    Charlie ({routes.find((r) => r.route_id === 'ROUTE_C')?.surface_distance_km ? `${routes.find((r) => r.route_id === 'ROUTE_C')?.surface_distance_km} km` : 'Max Science'})
                  </span>
                </span>
              </div>
              <span className="flex items-center space-x-1.5 text-[#EF4444]">
                <span className="w-2.5 h-0.5 border-t border-dashed border-[#EF4444]" />
                <span>Planner Vector ({distanceKm?.toFixed(2)} km)</span>
              </span>
            </div>
          ) : (
            <div className="bg-[#111215] border-t border-[#282C37] px-4 py-2 text-[10.5px] font-mono text-[#8B909A] flex items-center justify-between">
              <span>AWAITING CHECKPOINTS: Click map or enter coordinates to designate Base and Destination</span>
              <span className="text-[#D4A359]">PATHS UNLOADED</span>
            </div>
          )}
        </div>
      </div>

      {/* Select Traverse Path Ribbon / Cards (Only rendered when Base and Destination are configured) */}
      {base && destination && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#282C37] pb-2">
            <div className="flex items-center space-x-2">
              <Route className="h-4 w-4 text-[#C85A32]" />
              <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] font-semibold">
                Select Traverse Path (for 3D Surface Topography & Simulation)
              </h3>
            </div>
            {activeRoute && (
              <span className="text-[11px] font-mono text-[#8B909A]">
                Selected Path: <strong className="text-[#F4F4F2]">{activeRoute.name}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {plannerRoute && (
              <div
                data-testid="route-card-planner"
                onClick={() => setSelectedRoute(plannerRoute)}
                className={`p-4 rounded-[2px] border cursor-pointer transition-all space-y-2 ${
                  activeRoute?.route_id === 'TRAVERSE_PLANNER_ROUTE'
                    ? 'bg-[#4E9A68]/15 border-[#4E9A68] shadow-[0_0_10px_rgba(78,154,104,0.2)]'
                    : 'bg-[#17191E] border-[#282C37] hover:border-[#4E9A68]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-[#111215] text-[#4E9A68] border border-[#4E9A68]/40 uppercase font-semibold">
                    CUSTOM PLANNER VECTOR
                  </span>
                  <StatusBadge status={plannerRoute.status} size="sm" />
                </div>
                <h4 className="text-xs font-semibold text-[#F4F4F2] font-editorial truncate">
                  Base → Destination Vector
                </h4>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8B909A]">
                  <span>Distance: <strong className="text-[#F4F4F2]">{plannerRoute.surface_distance_km} km</strong></span>
                  <span>Time: <strong className="text-[#F4F4F2]">{plannerRoute.estimated_duration_hours}h</strong></span>
                </div>
              </div>
            )}

            {routes.map((rt) => {
              const isSelected = activeRoute?.route_id === rt.route_id;
              return (
                <div
                  key={rt.route_id}
                  data-testid={`route-card-${rt.route_id}`}
                  onClick={() => setSelectedRoute(rt)}
                  className={`p-4 rounded-[2px] border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-[#1D2026] border-[#C85A32] shadow-[0_0_10px_rgba(200,90,50,0.2)]'
                      : 'bg-[#17191E] border-[#282C37] hover:border-[#363B4A]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-[2px] bg-[#111215] text-[#C85A32] border border-[#282C37] uppercase font-semibold">
                      {rt.objective.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={rt.status} size="sm" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#F4F4F2] font-editorial truncate">
                    {rt.name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8B909A]">
                    <span>Distance: <strong className="text-[#F4F4F2]">{rt.surface_distance_km} km</strong></span>
                    <span>Time: <strong className="text-[#F4F4F2]">{rt.estimated_duration_hours}h</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Traverse Path Telemetry & Analytics Dashboard */}
      {base && destination && distanceKm !== null && (
        <div className="space-y-6">
          {/* Quick Metrics Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#17191E] border border-[#282C37] p-4 rounded-[2px] space-y-1">
              <span className="text-[10px] text-[#8B909A] block uppercase tracking-[0.14em] font-semibold font-mono">
                SURFACE DISTANCE
              </span>
              <div className="text-xl font-mono font-semibold text-[#F4F4F2]">
                {activeRoute ? activeRoute.surface_distance_km.toFixed(2) : distanceKm.toFixed(2)} km
              </div>
              <span className="text-[10px] text-[#8B909A] font-mono">
                ({Math.round((activeRoute ? activeRoute.surface_distance_km : distanceKm) * 1000)} metres)
              </span>
            </div>

            <div className="bg-[#17191E] border border-[#282C37] p-4 rounded-[2px] space-y-1">
              <span className="text-[10px] text-[#8B909A] block uppercase tracking-[0.14em] font-semibold font-mono">
                AZIMUTH BEARING
              </span>
              <div className="text-xl font-mono font-semibold text-[#4B88AB]">
                {bearing?.deg}° {bearing?.cardinal}
              </div>
              <span className="text-[10px] text-[#8B909A] font-mono">From habitat base</span>
            </div>

            <div className="bg-[#17191E] border border-[#282C37] p-4 rounded-[2px] space-y-1">
              <span className="text-[10px] text-[#8B909A] block uppercase tracking-[0.14em] font-semibold font-mono">
                ESTIMATED WALK TIME
              </span>
              <div className="text-xl font-mono font-semibold text-[#C85A32]">
                {activeRoute ? activeRoute.estimated_duration_hours.toFixed(1) : estimatedHours !== null ? estimatedHours.toFixed(1) : '--'} hours
              </div>
              <span className="text-[10px] text-[#8B909A] font-mono">
                @ {walkingSpeedKmh.toFixed(1)} km/h pace
              </span>
            </div>

            <div className="bg-[#17191E] border border-[#282C37] p-4 rounded-[2px] space-y-1">
              <span className="text-[10px] text-[#8B909A] block uppercase tracking-[0.14em] font-semibold font-mono">
                WALK-BACK SAFETY
              </span>
              <div className="flex items-center space-x-2 pt-0.5">
                <StatusBadge status={activeRoute?.return_reserve_feasibility || (isSafeWalkback ? 'PASS' : 'WARNING')} size="md" />
              </div>
              <span className="text-[10px] text-[#8B909A] font-mono">
                Limit: {walkbackLimitM}m from base
              </span>
            </div>
          </div>

          {/* Elevation Profile Chart along the Traverse Vector */}
          <div className="bg-[#17191E] border border-[#282C37] p-6 rounded-[2px] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#282C37] pb-4">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] flex items-center space-x-2 font-semibold">
                  <TrendingUp className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
                  <span>Traverse Surface Cross-Section Elevation & Slope</span>
                </h3>
                <p className="text-[11px] text-[#8B909A] font-mono mt-0.5">
                  {activeRoute?.route_id === 'TRAVERSE_PLANNER_ROUTE' && base && destination
                    ? `Sampled along straight-line vector from Base [${base.lat.toFixed(4)}°, ${base.lon.toFixed(4)}°] to Destination [${destination.lat.toFixed(4)}°, ${destination.lon.toFixed(4)}°]`
                    : `Topographical profile for ${activeRoute?.name || 'EVA Route'} (${activeRoute?.total_distance_km ? `${activeRoute.total_distance_km.toFixed(2)} km` : ''})`}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1.5 text-[#F4F4F2]">
                  <span className="w-2.5 h-2.5 rounded-none bg-[#F4F4F2] inline-block" />
                  <span>Elevation (m)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#C85A32]">
                  <span className="w-2.5 h-2.5 rounded-none bg-[#C85A32] inline-block" />
                  <span>Slope (deg)</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282C37" vertical={false} />
                  <XAxis
                    dataKey="distKm"
                    stroke="#8B909A"
                    tick={{ fontSize: 10, fill: '#8B909A' }}
                    unit=" km"
                  />
                  <YAxis
                    yAxisId="elev"
                    stroke="#8B909A"
                    tick={{ fontSize: 10, fill: '#8B909A' }}
                    domain={['auto', 'auto']}
                    unit="m"
                  />
                  <YAxis
                    yAxisId="slope"
                    orientation="right"
                    stroke="#8B909A"
                    tick={{ fontSize: 10, fill: '#8B909A' }}
                    domain={[0, 20]}
                    unit="°"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17191E',
                      borderColor: '#C85A32',
                      borderRadius: '2px',
                      fontSize: '11px',
                      color: '#F4F4F2',
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any, name: string) => [
                      name === 'elevation' ? `${val} m` : `${val}°`,
                      name === 'elevation' ? 'Elevation' : 'Slope Incline',
                    ]}
                    labelFormatter={(lbl) => `Traverse Distance: ${lbl} km`}
                  />
                  <Area
                    yAxisId="elev"
                    type="monotone"
                    dataKey="elevation"
                    stroke="#F4F4F2"
                    strokeWidth={1.5}
                    fillOpacity={0.06}
                    fill="#F4F4F2"
                  />
                  <Line
                    yAxisId="slope"
                    type="monotone"
                    dataKey="slope"
                    stroke="#C85A32"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Safety & Walk-back Contingency Ledger */}
          <div className="bg-[#17191E] border border-[#282C37] p-6 rounded-[2px] space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] flex items-center space-x-2 font-semibold border-b border-[#282C37] pb-3">
              <ShieldCheck className="h-4 w-4 text-[#4E9A68]" strokeWidth={1.5} />
              <span>Traverse Safety & Walk-back Reserve Verification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
              <div className="p-3.5 bg-[#14161A] rounded-[2px] border border-[#282C37] space-y-1">
                <strong className="text-[#C85A32] block font-mono text-[10px] uppercase tracking-[0.16em]">
                  Walk-Back Distance Limit:
                </strong>
                <p className="text-[#C4C7C5] leading-relaxed">
                  Total distance: <strong className="text-[#F4F4F2]">{Math.round(distanceM)}m</strong>.
                  Standard walk-back limit is {walkbackLimitM}m with 25% consumable return reserve.
                </p>
              </div>

              <div className="p-3.5 bg-[#14161A] rounded-[2px] border border-[#282C37] space-y-1">
                <strong className="text-[#C85A32] block font-mono text-[10px] uppercase tracking-[0.16em]">
                  Suitability Status:
                </strong>
                <p className={isSafeWalkback ? 'text-[#4E9A68]' : 'text-[#D4A359]'}>
                  {isSafeWalkback
                    ? 'Nominal: Target is within safe foot EVA return perimeter.'
                    : 'Warning: Exceeds standard walkback envelope; rover transport recommended.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#14161A] rounded-[2px] border border-[#282C37] space-y-1">
                <strong className="text-[#C85A32] block font-mono text-[10px] uppercase tracking-[0.16em]">
                  Contingency Reserves:
                </strong>
                <p className="text-[#8B909A] leading-relaxed">
                  PLSS emergency return reserves maintain minimum 30-minute metabolic buffer upon arrival at habitat base.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {(!base || !destination) && (
        <div className="p-6 rounded-[2px] bg-[#17191E] border border-dashed border-[#282C37] text-center text-xs text-[#8B909A] space-y-2">
          <Route className="h-6 w-6 mx-auto opacity-40 text-[#C85A32]" />
          <p className="text-[#F4F4F2] font-medium text-sm">Traverse Route Calculation Pending</p>
          <p className="max-w-md mx-auto leading-relaxed">
            Please configure {!base && !destination ? 'both Base and Destination coordinates' : !base ? 'a Base location' : 'a Destination location'} using the tabs above or map clicks to generate real-time Martian surface distance, compass bearing, walking duration, and elevation profiles.
          </p>
        </div>
      )}
    </div>
  );
};
