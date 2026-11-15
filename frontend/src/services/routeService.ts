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

export const routeService = new RouteService();
