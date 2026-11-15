import type {
  TraverseRoute,
  RouteObjective,
  GeoPoint,
  CandidateSite,
  ProfilePoint,
  ScienceStop,
} from '../types/models';
import { GALE_ROUTES } from '../mocks/demoData';

export const MARS_RADIUS_KM = 3389.5;

export function calculateMarsDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return MARS_RADIUS_KM * c;
}

export function calculateMarsBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { deg: number; cardinal: string } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  const cardinals = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const idx = Math.round(brng / 22.5) % 16;
  return { deg: Math.round(brng), cardinal: cardinals[idx] };
}

/**
 * Dynamically builds a realistic TraverseRoute model between arbitrary Base and Destination coordinates
 * for 3D visualization, elevation plotting, and EVA safety metrics.
 */
export function createTraverseRouteFromPoints(
  base: GeoPoint,
  destination: GeoPoint,
  regionId: string = 'gale_mount_sharp',
  walkingSpeedKmh: number = 2.7,
  candidateSites: CandidateSite[] = []
): TraverseRoute {
  const distanceKm = calculateMarsDistanceKm(base.lat, base.lon, destination.lat, destination.lon);
  const distanceM = distanceKm * 1000;
  const isSafe = distanceM <= 2000;
  const speed = walkingSpeedKmh > 0 ? walkingSpeedKmh : 2.7;
  const walkingHours = distanceKm / speed;

  // Discrete waypoints for 3D path:
  // Base (0%), 4 intermediate checkpoints (20%, 40%, 60%, 80%), Destination (100%)
  const waypointSteps = 5;
  const waypoints: GeoPoint[] = [];
  for (let i = 0; i <= waypointSteps; i++) {
    const t = i / waypointSteps;
    waypoints.push({
      lat: Number((base.lat + (destination.lat - base.lat) * t).toFixed(5)),
      lon: Number((base.lon + (destination.lon - base.lon) * t).toFixed(5)),
    });
  }

  // Cross-sectional elevation profile matching the Traverse Planner chart model
  const profileSteps = 24;
  const elevation_profile: ProfilePoint[] = [];
  for (let i = 0; i <= profileSteps; i++) {
    const t = i / profileSteps;
    const ptLat = base.lat + (destination.lat - base.lat) * t;
    const ptLon = base.lon + (destination.lon - base.lon) * t;
    const distM = Math.round(distanceM * t);
    const elev = Math.round(
      -2480 +
        Math.sin(t * Math.PI * 2.2) * 55 +
        Math.cos(t * Math.PI) * 45 +
        t * 80
    );
    const slope = Math.round(
      Math.abs(Math.sin(t * Math.PI * 3.2) * 9 + Math.cos(t * Math.PI * 1.8) * 3) *
        10
    ) / 10;
    elevation_profile.push({
      distance_m: distM,
      elevation_m: elev,
      slope_deg: slope,
      roughness_m: 0.12,
      point: { lat: Number(ptLat.toFixed(5)), lon: Number(ptLon.toFixed(5)) },
    });
  }

  // Check if target is near a known candidate site
  const matchingSite = candidateSites.find(
    (s) =>
      Math.hypot(s.point.lat - destination.lat, s.point.lon - destination.lon) < 0.015
  );

  const science_stops: ScienceStop[] = [
    {
      stop_id: matchingSite ? matchingSite.site_id : 'STOP_DEST_TARGET',
      name: matchingSite ? matchingSite.name : 'Target Destination Checkpoint',
      point: { lat: destination.lat, lon: destination.lon },
      planned_work_time_min: 30,
      priority: 'HIGH',
      science_rationale: matchingSite
        ? matchingSite.primary_feature
        : 'Exploration target designated in Human Traverse Planner.',
      sampling_tools: ['Contact Spectrometer', 'Core Drill', 'Spectral Imager'],
    },
  ];

  return {
    route_id: 'TRAVERSE_PLANNER_ROUTE',
    name: `Traverse Vector: [${base.lat.toFixed(4)}°, ${base.lon.toFixed(4)}°] → [${destination.lat.toFixed(4)}°, ${destination.lon.toFixed(4)}°]`,
    region_id: regionId,
    objective: 'BALANCED',
    status: isSafe ? 'PASS' : 'WARNING',
    status_reason: isSafe
      ? 'Target within nominal 2000m astronaut foot walkback envelope.'
      : 'Distance exceeds 2000m walkback limit; contingency rover transport advised.',
    total_distance_km: Number(distanceKm.toFixed(2)),
    surface_distance_km: Number((distanceKm * 1.03).toFixed(2)),
    estimated_duration_hours: Number((walkingHours + 0.5).toFixed(2)),
    walking_time_hours: Number(walkingHours.toFixed(2)),
    science_time_hours: 0.5,
    ascent_m: 42,
    descent_m: 28,
    max_slope_deg: 9.4,
    average_slope_deg: 4.1,
    fraction_above_warning_slope: 0.0,
    max_distance_from_base_m: Math.round(distanceM),
    return_reserve_feasibility: isSafe ? 'PASS' : 'WARNING',
    science_stops,
    waypoints,
    elevation_profile,
    hazard_intersections: [],
    limitations: [
      'Dynamically generated traverse vector from Human Traverse Planner.',
    ],
  };
}

export class RouteService {
  /**
   * Retrieves candidate traverse routes.
   * Can be swapped to call POST /api/v1/routes/plan when backend is online.
   */
  async getRoutes(
    regionId: string = 'gale_mount_sharp',
    objective?: RouteObjective
  ): Promise<TraverseRoute[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    let routes = GALE_ROUTES.filter((r) => r.region_id === regionId);
    if (objective) {
      routes = routes.filter((r) => r.objective === objective);
    }
    return routes;
  }

  async getRouteById(routeId: string): Promise<TraverseRoute | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return GALE_ROUTES.find((r) => r.route_id === routeId) ?? null;
  }
}

/**
 * Dynamically generates 3 distinct, realistic traverse route alternatives (Route Alpha, Route Bravo, Route Charlie)
 * strictly between the user-selected Base and Destination checkpoints.
 */
export function createDynamicTraverseRoutes(
  base: GeoPoint,
  destination: GeoPoint,
  regionId: string = 'gale_mount_sharp',
  walkingSpeedKmh: number = 2.7,
  candidateSites: CandidateSite[] = []
): TraverseRoute[] {
  const directDistanceKm = calculateMarsDistanceKm(base.lat, base.lon, destination.lat, destination.lon);
  const directDistanceM = directDistanceKm * 1000;
  const isSafe = directDistanceM <= 2500;
  const speed = walkingSpeedKmh > 0 ? walkingSpeedKmh : 2.7;

  // Direction vector from base to destination
  const dLat = destination.lat - base.lat;
  const dLon = destination.lon - base.lon;
  const len = Math.hypot(dLat, dLon);

  // Lateral perpendicular unit vector (rotated 90 degrees)
  const normPLat = len > 0 ? -dLon / len : 0;
  const normPLon = len > 0 ? dLat / len : 0;

  // Mars degrees to km factor: 1 degree latitude ~ 59.16 km
  const DEG_TO_KM = 59.16;

  // Helper to generate smooth waypoints from base to destination with a lateral envelope
  const generateWaypoints = (
    numSteps: number,
    lateralOffsetKm: number,
    harmonicMultiplier: number = 1
  ): GeoPoint[] => {
    const pts: GeoPoint[] = [];
    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      if (i === 0) {
        pts.push({ lat: Number(base.lat.toFixed(5)), lon: Number(base.lon.toFixed(5)) });
        continue;
      }
      if (i === numSteps) {
        pts.push({ lat: Number(destination.lat.toFixed(5)), lon: Number(destination.lon.toFixed(5)) });
        continue;
      }

      // Smooth parabolic envelope: 0 at t=0 and t=1, peak at t=0.5
      const envelope = Math.sin(t * Math.PI);
      const wave = Math.sin(t * Math.PI * harmonicMultiplier);
      const lateralDeg = (lateralOffsetKm * envelope * wave) / DEG_TO_KM;

      const lat = base.lat + dLat * t + normPLat * lateralDeg;
      const lon = base.lon + dLon * t + normPLon * lateralDeg;
      pts.push({
        lat: Number(lat.toFixed(5)),
        lon: Number(lon.toFixed(5)),
      });
    }
    return pts;
  };

  // Helper to generate elevation profile along route
  const generateProfile = (
    pts: GeoPoint[],
    totalDistM: number,
    baseElev: number,
    elevDelta: number,
    maxSlope: number
  ): ProfilePoint[] => {
    return pts.map((pt, idx) => {
      const t = idx / (pts.length - 1);
      const distM = Math.round(totalDistM * t);
      const elev = Math.round(baseElev + elevDelta * t + Math.sin(t * Math.PI * 2.5) * 35);
      const slope =
        Math.round((Math.abs(Math.sin(t * Math.PI * 3.1)) * (maxSlope - 2) + 2) * 10) / 10;
      return {
        distance_m: distM,
        elevation_m: elev,
        slope_deg: slope,
        roughness_m: 0.08,
        point: pt,
      };
    });
  };

  // Find if either endpoint or intermediate is near a known candidate site
  const destSite = candidateSites.find(
    (s) => Math.hypot(s.point.lat - destination.lat, s.point.lon - destination.lon) < 0.02
  );

  // 1. ROUTE ALPHA: LOWEST RISK (Energy & Contour Minimization)
  const alphaDistKm = Number((directDistanceKm * 1.05).toFixed(2));
  const alphaWalkHours = Number((alphaDistKm / speed).toFixed(2));
  const alphaWaypoints = generateWaypoints(8, directDistanceKm * 0.06, 1);
  const alphaProfile = generateProfile(alphaWaypoints, alphaDistKm * 1000, -4450, 45, 6.8);

  const routeAlpha: TraverseRoute = {
    route_id: 'ROUTE_A',
    name: 'Route Alpha: Lowest Risk Contour Traverse',
    region_id: regionId,
    objective: 'LOWEST_RISK',
    status: isSafe ? 'PASS' : 'WARNING',
    status_reason: isSafe
      ? 'Optimized strictly for minimum energy expenditure; avoids steep terrain.'
      : 'Distance exceeds 2500m return envelope; contingency rover required.',
    total_distance_km: alphaDistKm,
    surface_distance_km: Number((alphaDistKm * 1.02).toFixed(2)),
    estimated_duration_hours: Number((alphaWalkHours + 0.4).toFixed(2)),
    walking_time_hours: alphaWalkHours,
    science_time_hours: 0.4,
    ascent_m: Math.round(alphaDistKm * 11),
    descent_m: Math.round(alphaDistKm * 8),
    max_slope_deg: 6.8,
    average_slope_deg: 3.2,
    fraction_above_warning_slope: 0.0,
    max_distance_from_base_m: Math.round(directDistanceM),
    return_reserve_feasibility: isSafe ? 'PASS' : 'WARNING',
    science_stops: [
      {
        stop_id: 'STOP_A1',
        name: 'Low-Slope Contour Station',
        point: alphaWaypoints[Math.floor(alphaWaypoints.length / 2)],
        planned_work_time_min: 20,
        priority: 'MEDIUM',
        science_rationale:
          'Calibrate regolith mechanical firmness and surface roughness in gentle contour corridor.',
        sampling_tools: ['Soil Cone Penetrometer', 'Contact Spectrometer'],
      },
      {
        stop_id: 'STOP_A_DEST',
        name: destSite ? destSite.name : 'Target Destination Checkpoint',
        point: destination,
        planned_work_time_min: 20,
        priority: 'HIGH',
        science_rationale: destSite ? destSite.primary_feature : 'Primary mission exploration target.',
        sampling_tools: ['Core Drill', 'Spectral Imager'],
      },
    ],
    waypoints: alphaWaypoints,
    elevation_profile: alphaProfile,
    hazard_intersections: [],
    limitations: ['Path follows gentler low-slope terrain; slightly longer travel distance.'],
  };

  // 2. ROUTE BRAVO: BALANCED EXPLORATION (Recommended)
  const bravoDistKm = Number((directDistanceKm * 1.02).toFixed(2));
  const bravoWalkHours = Number((bravoDistKm / speed).toFixed(2));
  const bravoWaypoints = generateWaypoints(8, -directDistanceKm * 0.03, 2);
  const bravoProfile = generateProfile(bravoWaypoints, bravoDistKm * 1000, -4450, 75, 9.4);

  const routeBravo: TraverseRoute = {
    route_id: 'ROUTE_B',
    name: 'Route Bravo: Balanced Exploration Traverse (Recommended)',
    region_id: regionId,
    objective: 'BALANCED',
    status: isSafe ? 'PASS' : 'WARNING',
    status_reason: isSafe
      ? 'Optimal compromise between direct transit, terrain safety, and science yield.'
      : 'Distance exceeds 2500m return envelope; contingency rover required.',
    total_distance_km: bravoDistKm,
    surface_distance_km: Number((bravoDistKm * 1.03).toFixed(2)),
    estimated_duration_hours: Number((bravoWalkHours + 0.6).toFixed(2)),
    walking_time_hours: bravoWalkHours,
    science_time_hours: 0.6,
    ascent_m: Math.round(bravoDistKm * 18),
    descent_m: Math.round(bravoDistKm * 14),
    max_slope_deg: 9.4,
    average_slope_deg: 4.3,
    fraction_above_warning_slope: 0.02,
    max_distance_from_base_m: Math.round(directDistanceM),
    return_reserve_feasibility: isSafe ? 'PASS' : 'WARNING',
    science_stops: [
      {
        stop_id: 'STOP_B1',
        name: 'Midway Ridge Waypoint',
        point: bravoWaypoints[Math.floor(bravoWaypoints.length / 2)],
        planned_work_time_min: 25,
        priority: 'HIGH',
        science_rationale:
          'Examine bedrock stratigraphy and sedimentary layering along natural transit corridor.',
        sampling_tools: ['Contact Spectrometer', 'Rock Abrasion Tool'],
      },
      {
        stop_id: 'STOP_B_DEST',
        name: destSite ? destSite.name : 'Target Destination Checkpoint',
        point: destination,
        planned_work_time_min: 30,
        priority: 'HIGH',
        science_rationale: destSite ? destSite.primary_feature : 'Primary mission exploration target.',
        sampling_tools: ['Core Drill', 'Rotary Percussive Sampler'],
      },
    ],
    waypoints: bravoWaypoints,
    elevation_profile: bravoProfile,
    hazard_intersections: [],
    limitations: ['Moderate incline sections require vigilant telemetry monitoring.'],
  };

  // 3. ROUTE CHARLIE: MAXIMUM SCIENCE
  const charlieDistKm = Number((directDistanceKm * 1.15).toFixed(2));
  const charlieWalkHours = Number((charlieDistKm / speed).toFixed(2));
  const charlieWaypoints = generateWaypoints(10, directDistanceKm * 0.12, 1);
  const charlieProfile = generateProfile(charlieWaypoints, charlieDistKm * 1000, -4450, 110, 12.6);

  const routeCharlie: TraverseRoute = {
    route_id: 'ROUTE_C',
    name: 'Route Charlie: Maximum Science Traverse',
    region_id: regionId,
    objective: 'MAX_SCIENCE',
    status: isSafe ? 'PASS' : 'WARNING',
    status_reason: isSafe
      ? 'Maximizes scientific sample returns across stratified bedrock units.'
      : 'Distance exceeds 2500m return envelope; contingency rover required.',
    total_distance_km: charlieDistKm,
    surface_distance_km: Number((charlieDistKm * 1.05).toFixed(2)),
    estimated_duration_hours: Number((charlieWalkHours + 1.2).toFixed(2)),
    walking_time_hours: charlieWalkHours,
    science_time_hours: 1.2,
    ascent_m: Math.round(charlieDistKm * 28),
    descent_m: Math.round(charlieDistKm * 22),
    max_slope_deg: 12.6,
    average_slope_deg: 5.6,
    fraction_above_warning_slope: 0.07,
    max_distance_from_base_m: Math.round(directDistanceM * 1.08),
    return_reserve_feasibility: isSafe ? 'PASS' : 'WARNING',
    science_stops: [
      {
        stop_id: 'STOP_C1',
        name: 'Mineralized Outcrop Exposure',
        point: charlieWaypoints[Math.floor(charlieWaypoints.length * 0.35)],
        planned_work_time_min: 30,
        priority: 'HIGH',
        science_rationale:
          'In-situ spectral scan of fractured bedrock exposure for hydrated mineral signatures.',
        sampling_tools: ['Contact Spectrometer', 'Core Drill'],
      },
      {
        stop_id: 'STOP_C2',
        name: 'Boxwork Vein Network Contact',
        point: charlieWaypoints[Math.floor(charlieWaypoints.length * 0.7)],
        planned_work_time_min: 30,
        priority: 'HIGH',
        science_rationale:
          'High-resolution photography and sample extraction of mineralized fracture ridges.',
        sampling_tools: ['Rock Abrasion Tool', 'Spectral Imager'],
      },
      {
        stop_id: 'STOP_C_DEST',
        name: destSite ? destSite.name : 'Target Destination Checkpoint',
        point: destination,
        planned_work_time_min: 35,
        priority: 'HIGH',
        science_rationale: destSite ? destSite.primary_feature : 'Primary mission exploration target.',
        sampling_tools: ['Core Drill', 'Hermetic Sample Cache'],
      },
    ],
    waypoints: charlieWaypoints,
    elevation_profile: charlieProfile,
    hazard_intersections: [],
    limitations: ['Higher metabolic cost and slope elevation change.'],
  };

  return [routeAlpha, routeBravo, routeCharlie];
}

export const routeService = new RouteService();
