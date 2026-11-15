/**
 * AresNav Domain Models and Interfaces
 * Designed for local-first standalone operation and seamless future FastAPI backend integration.
 */

export type NavPage =
  | 'overview'
  | 'explorer'
  | 'layers'
  | 'sites'
  | 'traverse'
  | 'simulation'
  | 'reports'
  | 'terrain-3d'
  | 'catalogue';

export type SafetyStatus = 'PASS' | 'WARNING' | 'BLOCKED' | 'UNKNOWN';

export type DataClass =
  | 'MEASURED'
  | 'DERIVED'
  | 'MODEL'
  | 'REFERENCE'
  | 'ASSUMPTION'
  | 'SAMPLE'
  | 'AI_INTERPRETATION';

export type RouteObjective = 'LOWEST_RISK' | 'BALANCED' | 'MAX_SCIENCE';

export interface GeoPoint {
  lat: number; // Planetocentric latitude in degrees [-90, 90]
  lon: number; // East-positive longitude in degrees [0, 360)
}

export interface GeoBounds {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
}

export interface RegionInfo {
  region_id: string;
  name: string;
  sub_heading: string;
  description: string;
  science_objective: string;
  center: GeoPoint;
  bounds: GeoBounds;
  elevation_range_m: [number, number];
  primary_features: string[];
}

export interface MapLayer {
  layer_id: string;
  name: string;
  kind: 'RASTER' | 'VECTOR';
  data_type: 'ELEVATION' | 'OPTICAL' | 'SLOPE' | 'THERMAL' | 'GEOLOGY' | 'MINERALOGY' | 'RADIATION' | 'HAZARD';
  data_class: DataClass;
  status: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
  status_reason?: string;
  native_resolution_m?: number;
  dataset_ids: string[];
  bounds?: GeoBounds;
  image_url?: string;
  legend?: {
    colormap: string;
    units?: string;
    vmin?: number;
    vmax?: number;
    categories?: { value: number; label: string; color: string }[];
  };
  limitations: string[];
}

export interface CandidateSite {
  site_id: string;
  name: string;
  region_id: string;
  point: GeoPoint;
  radius_m: number;
  status: SafetyStatus;
  status_reason?: string;
  suitability_score: number; // 0-100
  criterion_scores: {
    terrain: number;       // 30% weight
    human_safety: number;  // 25% weight
    science: number;       // 20% weight
    resources: number;     // 15% weight
    accessibility: number; // 10% weight
  };
  hard_constraint_violations: string[];
  primary_feature: string;
  geological_context: string;
  evidence: {
    dataset_id: string;
    instrument: string;
    finding: string;
    data_class: DataClass;
  }[];
  uncertainties: string[];
  limitations: string[];
}

export interface ProfilePoint {
  distance_m: number;
  elevation_m: number;
  slope_deg: number;
  roughness_m: number;
  point: GeoPoint;
}

export interface ScienceStop {
  stop_id: string;
  name: string;
  point: GeoPoint;
  planned_work_time_min: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  science_rationale: string;
  sampling_tools: string[];
}

export interface TraverseRoute {
  route_id: string;
  name: string;
  region_id: string;
  objective: RouteObjective;
  status: SafetyStatus;
  status_reason?: string;
  total_distance_km: number;
  surface_distance_km: number;
  estimated_duration_hours: number;
  walking_time_hours: number;
  science_time_hours: number;
  ascent_m: number;
  descent_m: number;
  max_slope_deg: number;
  average_slope_deg: number;
  fraction_above_warning_slope: number;
  max_distance_from_base_m: number;
  return_reserve_feasibility: SafetyStatus;
  science_stops: ScienceStop[];
  waypoints: GeoPoint[];
  elevation_profile: ProfilePoint[];
  hazard_intersections: string[];
  limitations: string[];
}

export interface EvaSimulationConfig {
  crew_size: number;
  base_speed_kmh: number;
  max_eva_hours: number;
  default_work_time_min: number;
  oxygen_capacity_liters: number;
  oxygen_consumption_rate_lpm: number; // Liters per min at base rate
  battery_capacity_wh: number;
  battery_drain_rate_w: number;
  cooling_water_liters: number;
  cooling_water_rate_lph: number;
  return_reserve_fraction: number; // default 0.25 (25%)
  max_slope_deg: number;
  warning_slope_deg: number;
  roughness_warning_m: number;
  time_margin_factor: number;
}

export interface SimulationTimelineStep {
  elapsed_min: number;
  distance_km: number;
  elevation_m: number;
  speed_kmh: number;
  metabolic_rate_watts: number;
  oxygen_remaining_percent: number;
  battery_remaining_percent: number;
  water_remaining_percent: number;
  phase: 'OUTBOUND' | 'SCIENCE_STOP' | 'RETURN';
  is_past_turn_back: boolean;
}

export interface EvaSimulationResult {
  total_duration_hours: number;
  oxygen_used_liters: number;
  oxygen_margin_percent: number;
  battery_used_wh: number;
  battery_margin_percent: number;
  water_used_liters: number;
  turn_back_elapsed_min: number;
  turn_back_distance_km: number;
  walkback_radius_m: number;
  overall_status: SafetyStatus;
  checks: {
    id: string;
    label: string;
    status: SafetyStatus;
    detail: string;
  }[];
  timeline: SimulationTimelineStep[];
}

export interface DatasetMetadata {
  dataset_id: string;
  name: string;
  mission: string;
  instrument: string;
  data_type: string;
  data_class: DataClass;
  status: 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE';
  status_reason?: string;
  spatial_resolution: string;
  coordinate_reference: string;
  temporal_coverage: string;
  archive_node: string;
  source_url: string;
  citation: string;
  description: string;
  limitations: string[];
}
