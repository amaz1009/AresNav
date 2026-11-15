import React from 'react';
import { useMissionStore } from '../../store/missionStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SampleBadge } from '../common/SampleBadge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Battery,
  Wind,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Route,
  ArrowRight,
  Compass,
  Mountain,
} from 'lucide-react';

export const MissionSimulation: React.FC = () => {
  const {
    evaConfigParams,
    setEvaConfigParams,
    selectedRoute,
    simulationResult,
    setActivePage,
    base,
    destination,
  } = useMissionStore();

  const isPathConfigured = Boolean((base && destination) || selectedRoute);
  const activeRoute = isPathConfigured ? selectedRoute : null;
  const sim = isPathConfigured ? simulationResult : null;

  // Empty state: No active route planned or selected
  if (!isPathConfigured || !activeRoute || !sim) {
    return (
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1720px] mx-auto w-full select-text font-sans bg-[#050507]">
        {/* Header Panel */}
        <div className="border border-[#181A22] bg-[#0A0B0E] p-6 md:p-8 rounded-[2px] flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2.5">
              <Activity className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold">
                EVA CONSUMABLES & FEASIBILITY (PDF SECTION 9.4)
              </span>
              <span className="text-[#222530]">/</span>
              <SampleBadge label="PHYSIOLOGY MODEL" />
            </div>
            <h2 className="text-3xl font-normal text-[#F4F4F2] tracking-wide font-editorial">
              Human Mission Simulation & Consumables Modeling
            </h2>
            <p className="text-xs text-[#C4C7C5] leading-relaxed font-sans font-light">
              Scenario-based EVA consumables depletion and walk-back feasibility model accounting for
              Martian gravity (3.71 m/s²), spacesuit mass, metabolic slope cost, and abort reserves.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <StatusBadge status="UNKNOWN" />
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="border border-[#181A22] bg-[#0A0B0E] p-10 md:p-14 rounded-[2px] flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center justify-center">
            <Route className="h-7 w-7 text-[#C85A32]" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-normal text-[#F4F4F2] font-editorial tracking-wide">
              No Active Traverse Route Planned
            </h3>
            <p className="text-xs text-[#8B909A] leading-relaxed font-sans font-light">
              Mission life-support simulation, metabolic oxygen consumption, and walk-back return envelopes
              are computed dynamically from the active traverse route. Configure Base and Destination
              coordinates in the Traverse Planner or select a route to evaluate mission feasibility.
            </p>
          </div>
          <button
            onClick={() => setActivePage('traverse')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#D6653C] text-[#F4F4F2] text-xs font-mono font-medium rounded-[2px] transition-colors uppercase tracking-wider"
          >
            <span>Open Traverse Planner</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const startPt = activeRoute.waypoints?.[0];
  const endPt = activeRoute.waypoints?.[activeRoute.waypoints.length - 1];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-[1720px] mx-auto w-full select-text font-sans bg-[#050507]">
      {/* Header Panel */}
      <div className="border border-[#181A22] bg-[#0A0B0E] p-6 md:p-8 rounded-[2px] flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center space-x-2.5">
            <Activity className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C85A32] font-semibold">
              EVA CONSUMABLES & FEASIBILITY (PDF SECTION 9.4)
            </span>
            <span className="text-[#222530]">/</span>
            <SampleBadge label="PHYSIOLOGY MODEL" />
          </div>
          <h2 className="text-3xl font-normal text-[#F4F4F2] tracking-wide font-editorial">
            Human Mission Simulation & Consumables Modeling
          </h2>
          <p className="text-xs text-[#C4C7C5] leading-relaxed font-sans font-light">
            Scenario-based EVA consumables depletion and walk-back feasibility model accounting for
            Martian gravity (3.71 m/s²), spacesuit mass, metabolic slope cost, and abort reserves.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <StatusBadge status={sim.overall_status} />
        </div>
      </div>

      {/* Active Route Context HUD */}
      <div className="border border-[#181A22] bg-[#0A0B0E] p-4 md:p-5 rounded-[2px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <Route className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
            <span className="text-xs font-mono font-semibold text-[#F4F4F2] uppercase tracking-wider">
              {activeRoute.name || activeRoute.route_id}
            </span>
          </div>
          {startPt && endPt && (
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#8B909A]">
              <span>({startPt.lat.toFixed(4)}°, {startPt.lon.toFixed(4)}°)</span>
              <span>→</span>
              <span>({endPt.lat.toFixed(4)}°, {endPt.lon.toFixed(4)}°)</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 bg-[#0A0B0E] border border-[#181A22] rounded-[2px] text-[#F4F4F2] flex items-center space-x-1.5">
            <Compass className="h-3.5 w-3.5 text-[#C85A32]" />
            <span>{(activeRoute.surface_distance_km || activeRoute.total_distance_km).toFixed(2)} km</span>
          </span>
          <span className="px-2.5 py-1 bg-[#0A0B0E] border border-[#181A22] rounded-[2px] text-[#F4F4F2] flex items-center space-x-1.5">
            <Mountain className="h-3.5 w-3.5 text-[#C85A32]" />
            <span>Avg {activeRoute.average_slope_deg.toFixed(1)}° / Max {activeRoute.max_slope_deg.toFixed(1)}°</span>
          </span>
          <button
            onClick={() => setActivePage('traverse')}
            className="text-[11px] font-mono text-[#C85A32] hover:text-[#D6653C] underline flex items-center space-x-1"
          >
            <span>Change in Planner</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 4-Cell Life Support Metric Ledger */}
      <div className="border border-[#181A22] bg-[#0A0B0E] rounded-[2px] divide-y sm:divide-y-0 sm:divide-x divide-[#181A22] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cell 1: Oxygen */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <Wind className="h-3.5 w-3.5 text-[#8B909A]" strokeWidth={1.5} />
              <span>Oxygen Reserve Margin</span>
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                sim.oxygen_margin_percent >= 25
                  ? 'text-[#4E9A68]'
                  : sim.oxygen_margin_percent >= 15
                  ? 'text-[#D4A359]'
                  : 'text-[#C94D4D]'
              }`}
            >
              {sim.oxygen_margin_percent}% Margin
            </span>
          </div>
          <div className="font-mono">
            <span className="text-3xl font-semibold text-[#F4F4F2] tracking-tight font-editorial">
              {sim.oxygen_used_liters}
            </span>
            <span className="text-xs text-[#C85A32] ml-1.5 font-mono">L consumed</span>
          </div>
          <p className="text-[10px] text-[#8B909A] font-mono">
            Total capacity: {evaConfigParams.oxygen_capacity_liters * evaConfigParams.crew_size} L ({evaConfigParams.crew_size} crew)
          </p>
        </div>

        {/* Cell 2: Battery */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <Battery className="h-3.5 w-3.5 text-[#8B909A]" strokeWidth={1.5} />
              <span>Battery Power</span>
            </span>
            <span className="font-mono text-xs font-semibold text-[#4E9A68]">
              {sim.battery_margin_percent}% SoC
            </span>
          </div>
          <div className="font-mono">
            <span className="text-3xl font-semibold text-[#F4F4F2] tracking-tight font-editorial">
              {sim.battery_used_wh}
            </span>
            <span className="text-xs text-[#C85A32] ml-1.5 font-mono">Wh consumed</span>
          </div>
          <p className="text-[10px] text-[#8B909A] font-mono">
            Nominal draw: {evaConfigParams.battery_drain_rate_w}W per suit
          </p>
        </div>

        {/* Cell 3: Turn-Back Point */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <RotateCcw className="h-3.5 w-3.5 text-[#8B909A]" strokeWidth={1.5} />
              <span>Critical Turn-Back</span>
            </span>
            <span className="font-mono text-xs font-semibold text-[#D4A359]">
              {sim.turn_back_elapsed_min} min
            </span>
          </div>
          <div className="font-mono">
            <span className="text-3xl font-semibold text-[#F4F4F2] tracking-tight font-editorial">
              {sim.turn_back_distance_km}
            </span>
            <span className="text-xs text-[#C85A32] ml-1.5 font-mono">km mark</span>
          </div>
          <p className="text-[10px] text-[#8B909A] font-mono">
            Mandatory point of return to base
          </p>
        </div>

        {/* Cell 4: Walk-Back Radius */}
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8B909A]">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold flex items-center space-x-1.5 text-[#8B909A]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#8B909A]" strokeWidth={1.5} />
              <span>Walk-Back Reach</span>
            </span>
            <span className="font-mono text-xs font-semibold text-[#F4F4F2]">
              {sim.walkback_radius_m}m
            </span>
          </div>
          <div className="font-mono">
            <span className="text-3xl font-semibold text-[#F4F4F2] tracking-tight font-editorial">
              {activeRoute.max_distance_from_base_m}
            </span>
            <span className="text-xs text-[#C85A32] ml-1.5 font-mono">m max reach</span>
          </div>
          <p className="text-[10px] text-[#8B909A] font-mono">
            Safe return radius without rover assist
          </p>
        </div>
      </div>

      {/* Main Grid: Depletion Chart & Configuration Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Consumables Depletion Over Time */}
        <div className="lg:col-span-7 bg-[#0A0B0E] border border-[#181A22] p-6 md:p-8 rounded-[2px] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#181A22] pb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] font-semibold">
                Life Support Consumables & Metabolic Expenditure
              </h3>
              <p className="text-[11px] text-[#8B909A] font-mono mt-0.5">
                Simulated over {sim.total_duration_hours}h EVA duration • Turn-back point at {sim.turn_back_elapsed_min} min
              </p>
            </div>

            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="text-[#F4F4F2]">● O₂ %</span>
              <span className="text-[#4E9A68]">● Batt %</span>
              <span className="text-[#D4A359]">● Water %</span>
              <span className="text-[#C85A32]">--- Elevation</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sim.timeline} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#181A22" vertical={false} />
                <XAxis
                  dataKey="elapsed_min"
                  stroke="#8B909A"
                  tick={{ fontSize: 10, fill: '#8B909A' }}
                  unit="m"
                />
                <YAxis
                  yAxisId="pct"
                  stroke="#8B909A"
                  tick={{ fontSize: 10, fill: '#8B909A' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <YAxis
                  yAxisId="elev"
                  orientation="right"
                  stroke="#C85A32"
                  tick={{ fontSize: 10, fill: '#C85A32' }}
                  unit="m"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0B0E',
                    borderColor: '#C85A32',
                    borderRadius: '2px',
                    fontSize: '11px',
                    color: '#F4F4F2',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: any, name: string) => [
                    name === 'elevation_m' ? `${val} m` : `${val}%`,
                    name === 'oxygen_remaining_percent'
                      ? 'Oxygen Remaining'
                      : name === 'battery_remaining_percent'
                      ? 'Battery Remaining'
                      : name === 'water_remaining_percent'
                      ? 'Water Remaining'
                      : 'Surface Elevation',
                  ]}
                  labelFormatter={(lbl) => `Elapsed EVA: ${lbl} min`}
                />
                <ReferenceLine
                  yAxisId="pct"
                  x={sim.turn_back_elapsed_min}
                  stroke="#C85A32"
                  strokeDasharray="4 4"
                  label={{
                    value: 'CRITICAL TURN-BACK',
                    fill: '#E27B54',
                    fontSize: 9,
                    position: 'insideTopLeft',
                  }}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="oxygen_remaining_percent"
                  stroke="#F4F4F2"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="battery_remaining_percent"
                  stroke="#4E9A68"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="water_remaining_percent"
                  stroke="#D4A359"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  yAxisId="elev"
                  type="monotone"
                  dataKey="elevation_m"
                  stroke="#C85A32"
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Parameter Sliders */}
        <div className="lg:col-span-5 bg-[#0A0B0E] border border-[#181A22] p-6 md:p-8 rounded-[2px] space-y-5">
          <div className="flex items-center justify-between border-b border-[#181A22] pb-3.5">
            <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] flex items-center space-x-2 font-semibold">
              <Sliders className="h-4 w-4 text-[#C85A32]" strokeWidth={1.5} />
              <span>EVA Mission Parameters</span>
            </h3>
            <span className="text-[10px] font-mono text-[#C85A32] tracking-wider font-semibold">CONFIGURABLE</span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Crew Count */}
            <div>
              <div className="flex justify-between font-mono">
                <span className="text-[#8B909A]">Crew Size:</span>
                <span className="text-[#F4F4F2] font-medium">{evaConfigParams.crew_size} Astronauts</span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={evaConfigParams.crew_size}
                onChange={(e) => setEvaConfigParams({ crew_size: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#181A22] rounded-none appearance-none cursor-pointer accent-[#C85A32] mt-2"
              />
            </div>

            {/* Base Speed */}
            <div>
              <div className="flex justify-between font-mono">
                <span className="text-[#8B909A]">Base Walking Speed:</span>
                <span className="text-[#F4F4F2] font-medium">{evaConfigParams.base_speed_kmh} km/h</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={4.0}
                step={0.1}
                value={evaConfigParams.base_speed_kmh}
                onChange={(e) => setEvaConfigParams({ base_speed_kmh: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#181A22] rounded-none appearance-none cursor-pointer accent-[#C85A32] mt-2"
              />
            </div>

            {/* Max EVA Duration Ceiling */}
            <div>
              <div className="flex justify-between font-mono">
                <span className="text-[#8B909A]">Max Duration Ceiling:</span>
                <span className="text-[#F4F4F2] font-medium">{evaConfigParams.max_eva_hours} hours</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={8.0}
                step={0.5}
                value={evaConfigParams.max_eva_hours}
                onChange={(e) => setEvaConfigParams({ max_eva_hours: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#181A22] rounded-none appearance-none cursor-pointer accent-[#C85A32] mt-2"
              />
            </div>

            {/* Return Reserve Fraction */}
            <div>
              <div className="flex justify-between font-mono">
                <span className="text-[#8B909A]">Return Safety Reserve:</span>
                <span className="text-[#D4A359] font-semibold">{(evaConfigParams.return_reserve_fraction * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.15}
                max={0.4}
                step={0.05}
                value={evaConfigParams.return_reserve_fraction}
                onChange={(e) => setEvaConfigParams({ return_reserve_fraction: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#181A22] rounded-none appearance-none cursor-pointer accent-[#C85A32] mt-2"
              />
            </div>

            {/* Max Slope Angle */}
            <div>
              <div className="flex justify-between font-mono">
                <span className="text-[#8B909A]">Hard Slope Limit:</span>
                <span className="text-[#C94D4D] font-semibold">{evaConfigParams.max_slope_deg}°</span>
              </div>
              <input
                type="range"
                min={10}
                max={20}
                step={1}
                value={evaConfigParams.max_slope_deg}
                onChange={(e) => setEvaConfigParams({ max_slope_deg: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#181A22] rounded-none appearance-none cursor-pointer accent-[#C85A32] mt-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Safety Constraint Checks Table (7 Backend Safety Checks) */}
      <div className="bg-[#0A0B0E] border border-[#181A22] p-6 md:p-8 rounded-[2px] space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F4F2] flex items-center space-x-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-[#4E9A68]" strokeWidth={1.5} />
          <span>Automated Safety Constraint Checks (7 Backend Criteria)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sim.checks.map((check) => (
            <div
              key={check.id}
              className="bg-[#0A0B0E] border border-[#181A22] p-4 rounded-[2px] flex items-start justify-between text-xs hover:border-[#C85A32]/40 transition-colors"
            >
              <div className="space-y-1 pr-3">
                <strong className="text-[#F4F4F2] block font-editorial tracking-wide text-sm">{check.label}</strong>
                <span className="text-[11px] text-[#8B909A] font-mono leading-relaxed block">{check.detail}</span>
              </div>
              <StatusBadge status={check.status} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Safety Disclaimer Notice */}
      <div className="p-4 bg-[#0A0B0E] border border-[#181A22] rounded-[2px] text-[11px] font-mono text-[#8B909A] leading-relaxed">
        <span className="text-[#C85A32] font-semibold uppercase mr-2">[RESEARCH DISCLAIMER]:</span>
        AresNav is a research and planning prototype. Results are computational estimates based on orbital and
        landing-site datasets and must not be used as the sole basis for flight, surface-operation, or life-safety decisions.
      </div>
    </div>
  );
};
