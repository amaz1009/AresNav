import type {
  RegionInfo,
  MapLayer,
  CandidateSite,
  TraverseRoute,
  DatasetMetadata,
  EvaSimulationConfig,
} from '../types/models';

export const GALE_REGION: RegionInfo = {
  region_id: 'gale_mount_sharp',
  name: 'Gale Crater / Mount Sharp',
  sub_heading: 'Aeolis Mons Lower Layered Mound & Boxwork',
  description:
    'A 154-km diameter impact crater featuring a 5.5-km high central mound of layered sedimentary rocks preserving an environmental transition from clay-bearing to sulfate-rich strata.',
  science_objective:
    'Investigate ancient groundwater networks and boxwork mineral ridges formed in fractured bedrock.',
  center: { lat: -4.83, lon: 137.30 },
  bounds: {
    lat_min: -5.099,
    lat_max: -4.130,
    lon_min: 137.124,
    lon_max: 137.681,
  },
  elevation_range_m: [-4500, -3800],
  primary_features: ['Mount Sharp Boxwork', 'Vera Rubin Ridge', 'Lower Clay Unit', 'Sulfate Unit'],
};

export const JEZERO_REGION: RegionInfo = GALE_REGION;

export const REGIONS: RegionInfo[] = [GALE_REGION];

export const GALE_LAYERS: MapLayer[] = [
  {
    layer_id: 'ortho',
    name: 'HiRISE Visible Surface Imagery (0.25m)',
    kind: 'RASTER',
    data_type: 'OPTICAL',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    native_resolution_m: 0.25,
    dataset_ids: ['HIRISE_ORTHO_GALE_MOUND'],
    legend: {
      colormap: 'gray',
    },
    limitations: ['Single-band RED channel; no multispectral infrared or true color.'],
  },
  {
    layer_id: 'elevation',
    name: 'HiRISE High-Resolution Elevation (1m DTM)',
    kind: 'RASTER',
    data_type: 'ELEVATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    native_resolution_m: 1.0,
    dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
    legend: {
      colormap: 'terrain',
      units: 'm',
      vmin: -4500,
      vmax: -2900,
    },
    limitations: ['Stereo-derived DTM; unverified vertical datum relative to regional MOLA.'],
  },
  {
    layer_id: 'slope',
    name: 'Topographic Slope Gradient (Horn 3x3)',
    kind: 'RASTER',
    data_type: 'SLOPE',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    native_resolution_m: 1.0,
    dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
    legend: {
      colormap: 'magma',
      units: 'deg',
      vmin: 0,
      vmax: 45,
    },
    limitations: ['Calculated from 1m elevation post spacing. Slopes > 15° represent human suit traversal hazards.'],
  },
  {
    layer_id: 'hazard_grid',
    name: 'Traverse Hazard Classification',
    kind: 'RASTER',
    data_type: 'HAZARD',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    native_resolution_m: 1.0,
    dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
    legend: {
      colormap: 'categorical',
      categories: [
        { value: 0, label: 'PASSABLE', color: '#2ecc71' },
        { value: 1, label: 'IMPASSABLE_NODATA', color: '#95a5a6' },
        { value: 2, label: 'IMPASSABLE_SLOPE', color: '#e74c3c' },
        { value: 3, label: 'IMPASSABLE_EXCLUSION', color: '#8e44ad' },
      ],
    },
    limitations: ['Impassable slope threshold default is 15.0 degrees per Peña (2023).'],
  },
  {
    layer_id: 'mola_elevation',
    name: 'Regional MOLA Elevation Baseline',
    kind: 'RASTER',
    data_type: 'ELEVATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    native_resolution_m: 463.0,
    dataset_ids: ['MOLA_MEGDR_GALE'],
    legend: {
      colormap: 'terrain',
      units: 'm',
      vmin: -4500,
      vmax: 0,
    },
    limitations: ['Regional 128 px/deg grid; coarse baseline context.'],
  },
];

export const JEZERO_LAYERS: MapLayer[] = GALE_LAYERS;

export const GALE_CANDIDATE_SITES: CandidateSite[] = [
  {
    site_id: 'SITE_GALE_01',
    name: 'Mount Sharp Boxwork Fracture Ridges (Primary Target)',
    region_id: 'gale_mount_sharp',
    point: { lat: -4.8340, lon: 137.2960 },
    radius_m: 150,
    status: 'PASS',
    suitability_score: 89.2,
    criterion_scores: {
      terrain: 88,
      human_safety: 90,
      science: 94,
      resources: 72,
      accessibility: 92,
    },
    hard_constraint_violations: [],
    primary_feature: 'Interconnected mineralized boxwork fracture ridges formed by paleo-groundwater',
    geological_context: 'Ancient subsurface fracture network cemented by secondary mineral precipitation, recording late-stage groundwater circulation in Mount Sharp.',
    evidence: [
      {
        dataset_id: 'HIRISE_DTM_GALE_MOUND',
        instrument: 'HiRISE',
        finding: 'Gentle 3.8° approach ramp along ridge corridor with minimal boulder scatter.',
        data_class: 'SAMPLE',
      },
      {
        dataset_id: 'HIRISE_ORTHO_GALE_MOUND',
        instrument: 'HiRISE',
        finding: 'Distinct polygonal boxwork blades exposed with firm bedrock contact.',
        data_class: 'SAMPLE',
      },
    ],
    uncertainties: ['Local regolith load-bearing capacity requires in-situ geotechnical check.'],
    limitations: ['HiRISE 1m resolution cannot guarantee absence of sub-meter tire puncture gravel.'],
  },
  {
    site_id: 'SITE_GALE_02',
    name: 'Lower Clay-Bearing Sedimentary Unit',
    region_id: 'gale_mount_sharp',
    point: { lat: -4.7820, lon: 137.2850 },
    radius_m: 200,
    status: 'PASS',
    suitability_score: 82.5,
    criterion_scores: {
      terrain: 84,
      human_safety: 86,
      science: 88,
      resources: 65,
      accessibility: 84,
    },
    hard_constraint_violations: [],
    primary_feature: 'Layered smectite-bearing mudstones and ancient lacustrine shale',
    geological_context: 'Fine-grained sedimentary strata laid down in a habitable lacustrine environment during the early Hesperian transition.',
    evidence: [
      {
        dataset_id: 'HIRISE_ORTHO_GALE_MOUND',
        instrument: 'HiRISE',
        finding: 'Smooth bedrock pavement with verified low roughness and stable traversability.',
        data_class: 'SAMPLE',
      },
    ],
    uncertainties: ['Transverse aeolian ripples (TARs) present minor mobility detours.'],
    limitations: ['Thermal inertia does not distinguish dust mantle thickness under 2 cm.'],
  },
  {
    site_id: 'SITE_GALE_03',
    name: 'Vera Rubin Ridge Iron-Oxide Contact',
    region_id: 'gale_mount_sharp',
    point: { lat: -4.7500, lon: 137.2600 },
    radius_m: 120,
    status: 'WARNING',
    status_reason: 'Elevated slope angle along ridge flank and fractured bedrock pavement (3.8 km traverse).',
    suitability_score: 67.8,
    criterion_scores: {
      terrain: 64,
      human_safety: 60,
      science: 92,
      resources: 58,
      accessibility: 62,
    },
    hard_constraint_violations: [],
    primary_feature: 'Hematite-rich structural ridge and unconformable bedrock contact',
    geological_context: 'Erosion-resistant ridge formed by hydrothermal fluid circulation and groundwater redox boundaries.',
    evidence: [
      {
        dataset_id: 'HIRISE_DTM_GALE_MOUND',
        instrument: 'HiRISE',
        finding: 'Slopes reach 12.4° along north-facing ascent face; requires continuous slope monitoring.',
        data_class: 'SAMPLE',
      },
    ],
    uncertainties: ['Rockfall risk from scarp during diurnal thermal expansion cycles.'],
    limitations: ['Requires rover-assisted deployment; exceeds standalone foot walk-back reserve.'],
  },
  {
    site_id: 'SITE_GALE_04',
    name: 'Upper Mount Sharp Escarpment Scarp',
    region_id: 'gale_mount_sharp',
    point: { lat: -4.8900, lon: 137.3300 },
    radius_m: 100,
    status: 'BLOCKED',
    status_reason: 'Exceeds maximum allowable astronaut spacesuit slope constraint (26.8° > 15.0°).',
    suitability_score: 0.0,
    criterion_scores: {
      terrain: 14,
      human_safety: 10,
      science: 86,
      resources: 38,
      accessibility: 16,
    },
    hard_constraint_violations: [
      'Hard Safety Constraint Violated: Local slope gradient 26.8° strictly exceeds configured astronaut EVA ceiling (15.0°).',
      'Slip/Tumble Hazard: Loose blocky colluvium on steep incline poses catastrophic spacesuit puncture risk.',
    ],
    primary_feature: 'Steep layered sulfate cliff face exposing upper Mount Sharp stratigraphy',
    geological_context: 'Eolian cross-bedded sandstone and sulfate deposit escarpment with sheer cliff drops.',
    evidence: [
      {
        dataset_id: 'HIRISE_DTM_GALE_MOUND',
        instrument: 'HiRISE',
        finding: 'Sustained slope gradient of 26.8° over 350m climb; untraversable on foot.',
        data_class: 'SAMPLE',
      },
    ],
    uncertainties: ['Complete absence of traversable switchback paths in current DTM.'],
    limitations: ['Hard exclusion rule: No science score can override a critical safety constraint.'],
  },
];

export const CANDIDATE_SITES: CandidateSite[] = GALE_CANDIDATE_SITES;
export const JEZERO_CANDIDATE_SITES: CandidateSite[] = GALE_CANDIDATE_SITES;

// Helper to generate realistic elevation profile
function generateDemoProfile(
  startElev: number,
  endElev: number,
  distanceM: number,
  stepCount: number,
  points: { lat: number; lon: number }[]
) {
  const profile = [];
  const distStep = distanceM / stepCount;

  for (let i = 0; i <= stepCount; i++) {
    const frac = i / stepCount;
    // Add natural Martian undulating terrain relief
    const relief = Math.sin(frac * Math.PI * 4) * 18 + Math.cos(frac * Math.PI * 7) * 8;
    const elev = startElev + (endElev - startElev) * frac + relief;
    const slope = Math.min(22, Math.abs(Math.sin(frac * Math.PI * 5) * 10 + 3.2));
    const roughness = 0.08 + Math.abs(Math.sin(frac * Math.PI * 6) * 0.14);

    const lat = points[0].lat + (points[points.length - 1].lat - points[0].lat) * frac;
    const lon = points[0].lon + (points[points.length - 1].lon - points[0].lon) * frac;

    profile.push({
      distance_m: Math.round(i * distStep),
      elevation_m: Math.round(elev * 10) / 10,
      slope_deg: Math.round(slope * 10) / 10,
      roughness_m: Math.round(roughness * 100) / 100,
      point: { lat, lon },
    });
  }
  return profile;
}

export const GALE_ROUTES: TraverseRoute[] = [
  {
    route_id: 'ROUTE_A',
    name: 'Route Alpha: Lowest Risk Contour Traverse',
    region_id: 'gale_mount_sharp',
    objective: 'LOWEST_RISK',
    status: 'PASS',
    total_distance_km: 7.4,
    surface_distance_km: 7.55,
    estimated_duration_hours: 3.3,
    walking_time_hours: 2.7,
    science_time_hours: 0.6,
    ascent_m: 64,
    descent_m: 48,
    max_slope_deg: 7.8,
    average_slope_deg: 3.4,
    fraction_above_warning_slope: 0.0,
    max_distance_from_base_m: 2350,
    return_reserve_feasibility: 'PASS',
    science_stops: [
      {
        stop_id: 'STOP_A1',
        name: 'Boxwork Ridge Fracture Zone',
        point: { lat: -4.830, lon: 137.294 },
        planned_work_time_min: 20,
        priority: 'MEDIUM',
        science_rationale: 'Baseline regolith compaction and grain-size calibration along boxwork veins.',
        sampling_tools: ['Rotary Percussive Drill', 'Core Tube'],
      },
      {
        stop_id: 'STOP_A2',
        name: 'Lower Ridge Slope Contact',
        point: { lat: -4.825, lon: 137.290 },
        planned_work_time_min: 20,
        priority: 'HIGH',
        science_rationale: 'Contact inspection between bedrock sandstones and fractured boxwork veins.',
        sampling_tools: ['Contact Spectrometer', 'Rock Abrasion Tool'],
      },
    ],
    waypoints: [
      { lat: -4.834, lon: 137.296 }, // Base
      { lat: -4.831, lon: 137.295 },
      { lat: -4.828, lon: 137.292 },
      { lat: -4.825, lon: 137.290 },
      { lat: -4.829, lon: 137.294 },
      { lat: -4.834, lon: 137.296 }, // Return
    ],
    elevation_profile: generateDemoProfile(-4450, -4380, 7400, 30, [
      { lat: -4.834, lon: 137.296 },
      { lat: -4.825, lon: 137.290 },
    ]),
    hazard_intersections: [],
    limitations: [
      'Optimized strictly for minimum energy consumption; avoids steeper boulder outcrops.',
    ],
  },
  {
    route_id: 'ROUTE_B',
    name: 'Route Bravo: Balanced Exploration Traverse (Recommended)',
    region_id: 'gale_mount_sharp',
    objective: 'BALANCED',
    status: 'PASS',
    total_distance_km: 9.1,
    surface_distance_km: 9.38,
    estimated_duration_hours: 4.4,
    walking_time_hours: 3.2,
    science_time_hours: 1.2,
    ascent_m: 135,
    descent_m: 110,
    max_slope_deg: 11.6,
    average_slope_deg: 4.9,
    fraction_above_warning_slope: 0.08,
    max_distance_from_base_m: 2980,
    return_reserve_feasibility: 'PASS',
    science_stops: [
      {
        stop_id: 'STOP_B1',
        name: 'Clay-Bearing Mudstone Outcrop',
        point: { lat: -4.810, lon: 137.290 },
        planned_work_time_min: 25,
        priority: 'HIGH',
        science_rationale: 'Investigate smectite-bearing shale formed during neutral pH lacustrine epoch.',
        sampling_tools: ['Raman Spectrometer', 'Core Drill'],
      },
      {
        stop_id: 'STOP_B2',
        name: 'Boxwork Polygonal Blades',
        point: { lat: -4.795, lon: 137.288 },
        planned_work_time_min: 30,
        priority: 'HIGH',
        science_rationale: 'Primary target in mineralized boxwork fracture blades recording paleo-groundwater.',
        sampling_tools: ['Deep UV Fluorescence', 'Gas Chromatography Seal'],
      },
      {
        stop_id: 'STOP_B3',
        name: 'Mount Sharp Base Scree',
        point: { lat: -4.782, lon: 137.285 },
        planned_work_time_min: 15,
        priority: 'MEDIUM',
        science_rationale: 'Sample exotic clasts transported down the northern flank of Aeolis Mons.',
        sampling_tools: ['Geological Hammer', 'X-Ray Fluorescence'],
      },
    ],
    waypoints: [
      { lat: -4.834, lon: 137.296 }, // Base
      { lat: -4.820, lon: 137.293 },
      { lat: -4.805, lon: 137.289 },
      { lat: -4.782, lon: 137.285 },
      { lat: -4.800, lon: 137.287 },
      { lat: -4.822, lon: 137.292 },
      { lat: -4.834, lon: 137.296 },
    ],
    elevation_profile: generateDemoProfile(-4450, -4280, 9100, 35, [
      { lat: -4.834, lon: 137.296 },
      { lat: -4.782, lon: 137.285 },
    ]),
    hazard_intersections: ['Minor sand ripple crossing at km 2.4 (skirted along low-amplitude verge)'],
    limitations: [
      'Slope reaches 11.6° approaching the ridge summit; requires measured walking pace.',
    ],
  },
  {
    route_id: 'ROUTE_C',
    name: 'Route Charlie: Maximum Science Outcrop Survey',
    region_id: 'gale_mount_sharp',
    objective: 'MAX_SCIENCE',
    status: 'WARNING',
    status_reason: 'Duration (5.9h) approaches maximum allowable 6.0h EVA envelope; return reserve is tight (26%).',
    total_distance_km: 12.8,
    surface_distance_km: 13.25,
    estimated_duration_hours: 5.9,
    walking_time_hours: 4.1,
    science_time_hours: 1.8,
    ascent_m: 215,
    descent_m: 195,
    max_slope_deg: 14.4,
    average_slope_deg: 6.2,
    fraction_above_warning_slope: 0.18,
    max_distance_from_base_m: 3850,
    return_reserve_feasibility: 'WARNING',
    science_stops: [
      {
        stop_id: 'STOP_C1',
        name: 'Vera Rubin Ridge Iron-Oxide Contact',
        point: { lat: -4.750, lon: 137.260 },
        planned_work_time_min: 30,
        priority: 'HIGH',
        science_rationale: 'Hematite bedrock contact proving groundwater redox gradient.',
        sampling_tools: ['Long-Range Telephoto Camera', 'Core Drill'],
      },
      {
        stop_id: 'STOP_C2',
        name: 'Upper Boxwork Network',
        point: { lat: -4.790, lon: 137.280 },
        planned_work_time_min: 25,
        priority: 'HIGH',
        science_rationale: 'Inspect ancient fracture infill veins for aqueous mineralization.',
        sampling_tools: ['Core Drill', 'Micro-Imager'],
      },
      {
        stop_id: 'STOP_C3',
        name: 'Sulfate Unit Lower Bench',
        point: { lat: -4.820, lon: 137.310 },
        planned_work_time_min: 30,
        priority: 'HIGH',
        science_rationale: 'Strata preserving the transition into arid Martian climate.',
        sampling_tools: ['Sample Cacher', 'XRF Spectrometer'],
      },
      {
        stop_id: 'STOP_C4',
        name: 'Escarpment Colluvium Splay',
        point: { lat: -4.845, lon: 137.320 },
        planned_work_time_min: 25,
        priority: 'MEDIUM',
        science_rationale: 'Slope deposit assessment on Mount Sharp escarpment.',
        sampling_tools: ['Geological Hammer', 'Magnetic Susceptibility Sensor'],
      },
    ],
    waypoints: [
      { lat: -4.834, lon: 137.296 },
      { lat: -4.810, lon: 137.285 },
      { lat: -4.780, lon: 137.275 },
      { lat: -4.750, lon: 137.260 },
      { lat: -4.790, lon: 137.280 },
      { lat: -4.820, lon: 137.310 },
      { lat: -4.834, lon: 137.296 },
    ],
    elevation_profile: generateDemoProfile(-4450, -4080, 12800, 45, [
      { lat: -4.834, lon: 137.296 },
      { lat: -4.750, lon: 137.260 },
    ]),
    hazard_intersections: [
      'Moderate boulder roughness zone encountered at km 8.1',
      'Climb up ridge flank reaches 14.4° slope angle',
    ],
    limitations: [
      'High fatigue index; leaves minimal buffer for unforeseen suit anomalies or turn-back delays.',
    ],
  },
];

export const ROUTES: TraverseRoute[] = GALE_ROUTES;
export const JEZERO_ROUTES: TraverseRoute[] = GALE_ROUTES;

export const DEFAULT_EVA_CONFIG: EvaSimulationConfig = {
  crew_size: 2,
  base_speed_kmh: 2.7,
  max_eva_hours: 6.0,
  default_work_time_min: 25,
  oxygen_capacity_liters: 1200,
  oxygen_consumption_rate_lpm: 1.65, // Liters per minute per crew
  battery_capacity_wh: 3600,
  battery_drain_rate_w: 420,
  cooling_water_liters: 8.0,
  cooling_water_rate_lph: 0.95,
  return_reserve_fraction: 0.25, // 25% mandatory reserve
  max_slope_deg: 15.0,
  warning_slope_deg: 10.0,
  roughness_warning_m: 0.30,
  time_margin_factor: 1.25,
};

export const DEMO_DATASETS: DatasetMetadata[] = [
  {
    dataset_id: 'HIRISE_DTM_GALE_MOUND',
    name: 'HiRISE Digital Terrain Model (Mount Sharp Mound)',
    mission: 'Mars Reconnaissance Orbiter (MRO)',
    instrument: 'High Resolution Imaging Science Experiment (HiRISE)',
    data_type: 'ELEVATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    spatial_resolution: '1.0 m/pixel',
    coordinate_reference: 'IAU2000:49900 (Planetocentric, East-Positive)',
    temporal_coverage: 'Static (Derived from stereo pair PSP_001488_1750 / PSP_001620_1750)',
    archive_node: 'NASA Planetary Data System (PDS) Geosciences Node / UArizona',
    source_url: 'https://www.uahirise.org/dtm/',
    citation:
      'McEwen, A. S., et al. (2007). Mars Reconnaissance Orbiter’s High Resolution Imaging Science Experiment (HiRISE). Journal of Geophysical Research: Planets, 112(E5).',
    description:
      'Ultra-high-resolution stereo photogrammetric digital terrain model covering the Gale Crater central mound and Mount Sharp boxwork structures.',
    limitations: [
      'Stereo correlation noise occurs on steep, shadowed cliffs and flat, low-contrast dust patches.',
      'Small rocks (<1m diameter) are below spatial resolution limit.',
    ],
  },
  {
    dataset_id: 'HIRISE_ORTHO_GALE_MOUND',
    name: 'HiRISE Orthorectified Color Image Mosaic (Gale Crater)',
    mission: 'Mars Reconnaissance Orbiter (MRO)',
    instrument: 'HiRISE',
    data_type: 'OPTICAL',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    spatial_resolution: '0.25 m/pixel',
    coordinate_reference: 'IAU2000:49900',
    temporal_coverage: 'Static (MRO Primary & Extended Missions)',
    archive_node: 'NASA PDS Geosciences Node',
    source_url: 'https://www.uahirise.org/',
    citation:
      'NASA/JPL-Caltech/University of Arizona HiRISE Experiment Team Archive Data Product.',
    description:
      'Sub-meter resolution optical visible reflectance mosaic showing sediment layers, boulder fields, rover tracks, and bedrock fractures in Gale Crater.',
    limitations: [
      'Acquired at local afternoon lighting; shadow orientation can bias subjective obstacle appraisal.',
    ],
  },
  {
    dataset_id: 'MOLA_MEGDR_GLOBAL',
    name: 'MOLA Mission Experiment Gridded Data Record',
    mission: 'Mars Global Surveyor (MGS)',
    instrument: 'Mars Orbiter Laser Altimeter (MOLA)',
    data_type: 'ELEVATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    spatial_resolution: '463 m/pixel (128 pixels/degree)',
    coordinate_reference: 'IAU2000 Mars Sphere (R=3396190m)',
    temporal_coverage: '1997–2001 (Global Mission)',
    archive_node: 'NASA PDS Geosciences Node / Washington University in St. Louis',
    source_url: 'https://pds-geosciences.wustl.edu/missions/mgs/mola.html',
    citation:
      'Smith, D. E., et al. (2001). Mars Orbiter Laser Altimeter: Experiment overview and performance. Journal of Geophysical Research, 106(E10), 23689–23722.',
    description:
      'Authoritative regional elevation baseline reference used for broad crater relief and datum leveling across Mars.',
    limitations: [
      'Regional scale only. Completely inadequate for obstacle detection or astronaut-level slope planning.',
    ],
  },
  {
    dataset_id: 'THEMIS_NIGHT_IR_GALE',
    name: 'THEMIS Nighttime Infrared Thermal Inertia Grid (Gale Crater)',
    mission: '2001 Mars Odyssey',
    instrument: 'Thermal Emission Imaging System (THEMIS)',
    data_type: 'THERMAL',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    spatial_resolution: '100 m/pixel',
    coordinate_reference: 'IAU2000:49900',
    temporal_coverage: 'Multi-year mission average (Band 9, 12.57 µm)',
    archive_node: 'Arizona State University / NASA PDS',
    source_url: 'https://themis.asu.edu/',
    citation:
      'Christensen, P. R., et al. (2004). The Thermal Emission Imaging System (THEMIS) for the Mars 2001 Odyssey Mission. Space Science Reviews, 110(1), 85–130.',
    description:
      'Nighttime brightness temperature observations mapped to derive thermal inertia, indicating degree of bedrock consolidation vs loose sand/dust.',
    limitations: [
      'Represents orbital radiative temperature; does not indicate microclimate air temperature inside astronaut suit boundary.',
    ],
  },
  {
    dataset_id: 'CRISM_MTRDR_GALE_MOUND',
    name: 'CRISM Targeted Map-Projected Multispectral Surface RDR (Mount Sharp)',
    mission: 'Mars Reconnaissance Orbiter (MRO)',
    instrument: 'Compact Reconnaissance Imaging Spectrometer for Mars (CRISM)',
    data_type: 'MINERALOGY',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    spatial_resolution: '18.0 m/pixel',
    coordinate_reference: 'IAU2000:49900',
    temporal_coverage: 'Targeted Observation FRT0000B204',
    archive_node: 'NASA PDS Geosciences Node / Johns Hopkins APL',
    source_url: 'https://crism.jhuapl.edu/',
    citation:
      'Murchie, S. L., et al. (2007). Compact Reconnaissance Imaging Spectrometer for Mars (CRISM) on Mars Reconnaissance Orbiter (MRO). J. Geophys. Res., 112, E05S03.',
    description:
      'Infrared reflectance cube covering 0.36 to 3.92 µm, showing distinct absorption signatures of smectite clays, sulfates, and hematite on Mount Sharp.',
    limitations: [
      'Atmospheric CO2 and aerosol dust absorption require radiative transfer model correction.',
      'Surface dust mantling can mask bedrock mineral spectral response.',
    ],
  },
  {
    dataset_id: 'USGS_GALE_GEOLOGY_MAP',
    name: 'USGS Astrogeology Gale Crater Geologic Map',
    mission: 'USGS Astrogeology Planetary Mapping Program',
    instrument: 'Synthesized Remote Sensing & Rover Ground Truth',
    data_type: 'GEOLOGY',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    spatial_resolution: '1:5,000 scale vector polygons',
    coordinate_reference: 'IAU2000:49900',
    temporal_coverage: 'Published 2020 / Updated 2024',
    archive_node: 'USGS Astrogeology Science Center / NASA Planetary Geology and Geophysics',
    source_url: 'https://astrogeology.usgs.gov/',
    citation:
      'Grotzinger, J. P., et al. (2014). A Habitable Fluvio-Lacustrine Environment at Yellowknife Bay, Gale Crater, Mars. Science, 343(6169).',
    description:
      'Stratigraphic and lithological classification distinguishing Mount Sharp layered mounds, lacustrine mudstones, boxwork fracture networks, and alluvial fans.',
    limitations: [
      'Photogeologic unit boundaries represent interpretive classification and are subject to sub-surface uncertainty.',
    ],
  },
  {
    dataset_id: 'MSL_RAD_SURFACE_RDR',
    name: 'MSL Radiation Assessment Detector Surface Dose Dataset',
    mission: 'Mars Science Laboratory (MSL Curiosity)',
    instrument: 'Radiation Assessment Detector (RAD)',
    data_type: 'RADIATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    spatial_resolution: 'In-situ point detector at surface',
    coordinate_reference: 'MSL Traverse Sol 0–3500',
    temporal_coverage: 'Continuous daily observations since 2012',
    archive_node: 'NASA PDS Planetary Plasma Interactions (PPI) Node / Southwest Research Institute',
    source_url: 'https://pds-ppi.igpp.ucla.edu/',
    citation:
      'Hassler, D. M., et al. (2014). Mars’ Surface Radiation Environment Measured with the Mars Science Laboratory’s Curiosity Rover. Science, 343(6169), 1244726.',
    description:
      'Ground truth galactic cosmic ray (GCR) and solar energetic particle (SEP) silicon detector dose measurements on the surface of Mars.',
    limitations: [
      'Measured inside Gale Crater at -4.5 km elevation by Curiosity Rover.',
      'Solar proton storm events are unpredictable and require immediate shelter abort.',
    ],
  },
  {
    dataset_id: 'SWIM_GLOBAL_ICE_MAP',
    name: 'Subsurface Water Ice Mapping (SWIM) Radar Index',
    mission: 'Mars Reconnaissance Orbiter (SHARAD) / Mars Odyssey (GRS)',
    instrument: 'Shallow Radar (SHARAD) & Neutron Spectrometer',
    data_type: 'HAZARD',
    data_class: 'SAMPLE',
    status: 'UNAVAILABLE',
    status_reason: 'No detected near-surface water ice signatures at equatorial latitude (18.4° N).',
    spatial_resolution: 'Regional polygon masks',
    coordinate_reference: 'IAU2000:49900',
    temporal_coverage: '2020 Release',
    archive_node: 'Planetary Science Institute (PSI) / NASA PDS',
    source_url: 'https://swim.psi.edu/',
    citation:
      'Morgan, G. A., et al. (2021). Availability of sub-surface water-ice for future human exploration of Mars. Nature Astronomy, 5, 230–236.',
    description:
      'Global compilation of radar, neutron, and thermal evidence for accessible subsurface water ice.',
    limitations: [
      'Equatorial Mars lacks detectable shallow ground ice (<5m depth). Ice resource score must remain UNKNOWN.',
    ],
  },
];
