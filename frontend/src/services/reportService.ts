import type {
  RegionInfo,
  CandidateSite,
  TraverseRoute,
  EvaSimulationResult,
  EvaSimulationConfig,
} from '../types/models';

export interface MissionBriefing {
  title: string;
  generated_at: string;
  disclaimer: string;
  region: RegionInfo;
  site: CandidateSite;
  route: TraverseRoute;
  simulation: EvaSimulationResult;
  config: EvaSimulationConfig;
  markdown: string;
}

export class ReportService {
  generateBriefing(
    region: RegionInfo,
    site: CandidateSite,
    route: TraverseRoute,
    simulation: EvaSimulationResult,
    config: EvaSimulationConfig
  ): MissionBriefing {
    const timestamp = new Date().toISOString();
    const disclaimer =
      '> [!IMPORTANT]\n' +
      '> **SCIENTIFIC PLANNING PROTOTYPE — NOT A CERTIFIED ASTRONAUT SAFETY SYSTEM.**\n' +
      '> Calculations represent deterministic terrain analysis and scenario-based EVA models derived from orbital remote sensing.\n' +
      '> Ground truth verification and human-rating certification are required before operational surface deployment.';

    const md = `# AresNav — Martian Surface Intelligence & Mission Briefing
**NASA Space Apps Challenge 2026**
*Generated: ${timestamp}*

${disclaimer}

---

## 1. Executive Mission Summary
- **Exploration Region:** ${region.name} (${region.sub_heading})
- **Primary Objective:** ${region.science_objective}
- **Target Candidate Site:** ${site.name} (Suitability Score: **${site.suitability_score.toFixed(1)}/100**)
- **Selected Route Profile:** ${route.name} (${route.objective})
- **Overall Safety Feasibility:** **${simulation.overall_status}**

---

## 2. Candidate Exploration Site Intelligence
- **Coordinates:** ${site.point.lat.toFixed(4)}° Lat, ${site.point.lon.toFixed(4)}° Lon (Planetocentric, East-Positive)
- **Primary Feature:** ${site.primary_feature}
- **Geological Setting:** ${site.geological_context}
- **Criteria Scoring Breakdown:**
  - Terrain Traversability: **${site.criterion_scores.terrain}%** (30% weight)
  - Human Safety Margin: **${site.criterion_scores.human_safety}%** (25% weight)
  - Scientific Value: **${site.criterion_scores.science}%** (20% weight)
  - Resource Evidence: **${site.criterion_scores.resources}%** (15% weight)
  - Operational Accessibility: **${site.criterion_scores.accessibility}%** (10% weight)

### Supporting Scientific Evidence
${site.evidence
  .map(
    (e) =>
      `- **[${e.dataset_id}] (${e.instrument}):** ${e.finding} *(Data class: ${e.data_class})*`
  )
  .join('\n')}

---

## 3. Human Traverse Route Analysis
- **Total Surface Distance:** ${route.surface_distance_km} km (Planar: ${route.total_distance_km} km)
- **Modeled EVA Duration:** ${simulation.total_duration_hours} hours (Walking: ${route.walking_time_hours}h | Work Stops: ${route.science_time_hours}h)
- **Maximum Incline:** ${route.max_slope_deg}° (Average: ${route.average_slope_deg}°)
- **Elevation Gain / Loss:** +${route.ascent_m}m / -${route.descent_m}m
- **Max Radius from Habitat:** ${route.max_distance_from_base_m} m

### Designated Science Work Stops
${route.science_stops
  .map(
    (s, i) =>
      `${i + 1}. **${s.name}** (${s.planned_work_time_min} min, Priority: ${s.priority})\n   - Rationale: ${s.science_rationale}\n   - Tools: ${s.sampling_tools.join(', ')}`
  )
  .join('\n')}

---

## 4. Life-Support Simulation & Safety Constraints
- **Crew Size:** ${config.crew_size} Astronauts
- **Oxygen Consumed:** ${simulation.oxygen_used_liters} L (Remaining Margin: **${simulation.oxygen_margin_percent}%**)
- **Power Consumed:** ${simulation.battery_used_wh} Wh (State of Charge: **${simulation.battery_margin_percent}%**)
- **Water Sublimation:** ${simulation.water_used_liters} L
- **Critical Turn-Back Point:** Elapsed Sol Time **${simulation.turn_back_elapsed_min} min** at **${simulation.turn_back_distance_km} km**
- **Walk-Back Safe Envelope Radius:** **${simulation.walkback_radius_m} m**

### Safety Constraint Checks
${simulation.checks
  .map(
    (c) =>
      `- [${c.status === 'PASS' ? 'x' : ' '}] **${c.label}:** [${c.status}] — ${c.detail}`
  )
  .join('\n')}

---

## 5. Scientific Limitations & Caveats
${site.limitations.map((l) => `- ${l}`).join('\n')}
${route.limitations.map((l) => `- ${l}`).join('\n')}
- Orbital remote sensing cannot guarantee the absence of sub-meter tire puncture gravel or surface duricrust collapse.
`;

    return {
      title: `Mission Briefing — ${region.name} (${route.name})`,
      generated_at: timestamp,
      disclaimer,
      region,
      site,
      route,
      simulation,
      config,
      markdown: md,
    };
  }
}

export const reportService = new ReportService();
