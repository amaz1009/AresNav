import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { jsPDF } from 'jspdf';
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

  /**
   * Export briefing as Markdown (.md) file
   */
  downloadMarkdown(briefing: MissionBriefing): void {
    const filename = `ARESNAV_MISSION_BRIEFING_${briefing.region.region_id.toUpperCase()}.md`;
    const blob = new Blob([briefing.markdown], { type: 'text/markdown;charset=utf-8' });
    this.triggerDownload(blob, filename);
  }

  /**
   * Export briefing as Microsoft Word (.docx) document
   */
  async downloadDocx(briefing: MissionBriefing): Promise<void> {
    const filename = `ARESNAV_MISSION_BRIEFING_${briefing.region.region_id.toUpperCase()}.docx`;

    const doc = new Document({
      title: briefing.title,
      description: 'AresNav Planetary Mission Briefing & Scientific Evidence Dossier',
      creator: 'AresNav Decision Support System',
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch = 1440 twips
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: [
            // Document Title
            new Paragraph({
              text: 'AresNav — Martian Surface Intelligence & Mission Briefing',
              heading: HeadingLevel.TITLE,
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'NASA Space Apps Challenge 2026 • IAU2000:49900 Compliant',
                  color: 'C85A32',
                  bold: true,
                }),
                new TextRun({
                  text: `  |  Generated: ${new Date(briefing.generated_at).toLocaleString()}`,
                  color: '667085',
                }),
              ],
              spacing: { after: 240 },
            }),

            // Disclaimer Box
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 2, color: 'C85A32' },
                        bottom: { style: BorderStyle.SINGLE, size: 2, color: 'C85A32' },
                        left: { style: BorderStyle.SINGLE, size: 6, color: 'C85A32' },
                        right: { style: BorderStyle.SINGLE, size: 2, color: 'C85A32' },
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'IMPORTANT NOTICE: SCIENTIFIC PLANNING PROTOTYPE — NOT A CERTIFIED ASTRONAUT SAFETY SYSTEM.\n',
                              bold: true,
                              color: 'C85A32',
                            }),
                            new TextRun({
                              text: 'Calculations represent deterministic terrain analysis and scenario-based EVA models derived from orbital remote sensing. Ground truth verification and human-rating certification are required before operational surface deployment.',
                              italics: true,
                              color: '475467',
                            }),
                          ],
                          spacing: { before: 80, after: 80 },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: '', spacing: { after: 240 } }),

            // Section 1
            new Paragraph({
              text: '1. Executive Mission Summary',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Exploration Region: ', bold: true }),
                new TextRun(`${briefing.region.name} (${briefing.region.sub_heading})`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Primary Science Objective: ', bold: true }),
                new TextRun(briefing.region.science_objective),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Target Candidate Site: ', bold: true }),
                new TextRun(`${briefing.site.name} (Suitability Score: ${briefing.site.suitability_score.toFixed(1)}/100)`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Selected Route Profile: ', bold: true }),
                new TextRun(`${briefing.route.name} (${briefing.route.objective})`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Overall Safety Feasibility: ', bold: true }),
                new TextRun({
                  text: briefing.simulation.overall_status,
                  bold: true,
                  color: briefing.simulation.overall_status === 'PASS' ? '10B981' : 'EF4444',
                }),
              ],
              spacing: { after: 200 },
            }),

            // Section 2
            new Paragraph({
              text: '2. Candidate Exploration Site Intelligence',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Coordinates: ', bold: true }),
                new TextRun(`${briefing.site.point.lat.toFixed(4)}° Lat, ${briefing.site.point.lon.toFixed(4)}° Lon (Planetocentric, East-Positive)`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Primary Geological Feature: ', bold: true }),
                new TextRun(briefing.site.primary_feature),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Geological Setting: ', bold: true }),
                new TextRun(briefing.site.geological_context),
              ],
              spacing: { after: 140 },
            }),

            new Paragraph({
              text: 'Multi-Criteria Scoring Breakdown:',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 140, after: 80 },
            }),
            new Paragraph({
              bullet: { level: 0 },
              text: `Terrain Traversability (30% weight): ${briefing.site.criterion_scores.terrain}%`,
            }),
            new Paragraph({
              bullet: { level: 0 },
              text: `Human Safety Margin (25% weight): ${briefing.site.criterion_scores.human_safety}%`,
            }),
            new Paragraph({
              bullet: { level: 0 },
              text: `Scientific Value (20% weight): ${briefing.site.criterion_scores.science}%`,
            }),
            new Paragraph({
              bullet: { level: 0 },
              text: `Resource Evidence (15% weight): ${briefing.site.criterion_scores.resources}%`,
            }),
            new Paragraph({
              bullet: { level: 0 },
              text: `Operational Accessibility (10% weight): ${briefing.site.criterion_scores.accessibility}%`,
              spacing: { after: 140 },
            }),

            new Paragraph({
              text: 'Supporting Remote Sensing Evidence:',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 140, after: 80 },
            }),
            ...briefing.site.evidence.map(
              (e) =>
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({ text: `[${e.dataset_id}] (${e.instrument}): `, bold: true }),
                    new TextRun(`${e.finding} `),
                    new TextRun({ text: `(Class: ${e.data_class})`, italics: true, color: '667085' }),
                  ],
                })
            ),

            // Section 3
            new Paragraph({
              text: '3. Human Traverse Route Analysis',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Total Surface Distance: ', bold: true }),
                new TextRun(`${briefing.route.surface_distance_km} km (Planar: ${briefing.route.total_distance_km} km)`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Modeled EVA Duration: ', bold: true }),
                new TextRun(`${briefing.simulation.total_duration_hours} hours (Walking: ${briefing.route.walking_time_hours}h | Work Stops: ${briefing.route.science_time_hours}h)`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Slope & Incline: ', bold: true }),
                new TextRun(`Max: ${briefing.route.max_slope_deg}° | Average: ${briefing.route.average_slope_deg}°`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Elevation Differential: ', bold: true }),
                new TextRun(`Ascent: +${briefing.route.ascent_m}m | Descent: -${briefing.route.descent_m}m`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Max Radius from Habitat: ', bold: true }),
                new TextRun(`${briefing.route.max_distance_from_base_m} meters`),
              ],
              spacing: { after: 140 },
            }),

            new Paragraph({
              text: 'Designated Scientific Work Stops:',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 140, after: 80 },
            }),
            ...briefing.route.science_stops.map(
              (s, i) =>
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({ text: `${i + 1}. ${s.name} `, bold: true }),
                    new TextRun(`(${s.planned_work_time_min} min, Priority: ${s.priority}) — `),
                    new TextRun({ text: `${s.science_rationale}. Tools: ${s.sampling_tools.join(', ')}`, color: '344054' }),
                  ],
                })
            ),

            // Section 4
            new Paragraph({
              text: '4. Life-Support Simulation & Safety Constraints',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Crew Size: ', bold: true }),
                new TextRun(`${briefing.config.crew_size} Astronauts`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Oxygen Consumed: ', bold: true }),
                new TextRun(`${briefing.simulation.oxygen_used_liters} L (Remaining Margin: ${briefing.simulation.oxygen_margin_percent}%)`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Power Consumed: ', bold: true }),
                new TextRun(`${briefing.simulation.battery_used_wh} Wh (State of Charge: ${briefing.simulation.battery_margin_percent}%)`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Water Sublimation: ', bold: true }),
                new TextRun(`${briefing.simulation.water_used_liters} L`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Critical Turn-Back Point: ', bold: true }),
                new TextRun(`Elapsed Sol Time ${briefing.simulation.turn_back_elapsed_min} min at ${briefing.simulation.turn_back_distance_km} km`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Walk-Back Safe Radius: ', bold: true }),
                new TextRun(`${briefing.simulation.walkback_radius_m} meters`),
              ],
              spacing: { after: 140 },
            }),

            new Paragraph({
              text: 'Safety Constraint Check Results:',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 140, after: 80 },
            }),
            ...briefing.simulation.checks.map(
              (c) =>
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({
                      text: `[${c.status}] `,
                      bold: true,
                      color: c.status === 'PASS' ? '10B981' : 'EF4444',
                    }),
                    new TextRun({ text: `${c.label}: `, bold: true }),
                    new TextRun(c.detail),
                  ],
                })
            ),

            // Section 5
            new Paragraph({
              text: '5. Scientific Limitations & Caveats',
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            }),
            ...briefing.site.limitations.map(
              (l) =>
                new Paragraph({
                  bullet: { level: 0 },
                  text: l,
                })
            ),
            ...briefing.route.limitations.map(
              (l) =>
                new Paragraph({
                  bullet: { level: 0 },
                  text: l,
                })
            ),
            new Paragraph({
              bullet: { level: 0 },
              text: 'Orbital remote sensing cannot guarantee the absence of sub-meter tire puncture gravel or surface duricrust collapse.',
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    this.triggerDownload(blob, filename);
  }

  /**
   * Export briefing as high-resolution printable PDF (.pdf) document
   */
  downloadPdf(briefing: MissionBriefing): void {
    const filename = `ARESNAV_MISSION_BRIEFING_${briefing.region.region_id.toUpperCase()}.pdf`;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > 275) {
        doc.addPage();
        y = 20;
        // Running header
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text('AresNav • Martian Surface Intelligence & Mission Briefing', margin, 12);
        doc.text(briefing.region.name, pageWidth - margin, 12, { align: 'right' });
        doc.setDrawColor(210, 215, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, 14, pageWidth - margin, 14);
      }
    };

    // Header Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(200, 90, 50); // Mars rust #C85A32
    doc.text('ARESNAV PLANETARY SURFACE INTELLIGENCE', margin, y);
    y += 6;

    // Document Main Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(24, 28, 36);
    doc.text('Mission Briefing & Scientific Evidence Report', margin, y);
    y += 6;

    // Metadata Bar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 120);
    doc.text(
      `NASA Space Apps 2026 • IAU2000:49900 Compliant • Generated: ${new Date(briefing.generated_at).toLocaleString()}`,
      margin,
      y
    );
    y += 6;

    // Thin separator
    doc.setDrawColor(200, 90, 50);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Disclaimer Box
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(200, 90, 50);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28);
    doc.text('IMPORTANT: SCIENTIFIC PLANNING PROTOTYPE — NOT A CERTIFIED ASTRONAUT SAFETY SYSTEM', margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99);
    const disclaimerLines = doc.splitTextToSize(
      'Calculations represent deterministic terrain analysis and scenario-based EVA models derived from orbital remote sensing products. Ground truth verification and human-rating certification are required before operational deployment.',
      contentWidth - 6
    );
    doc.text(disclaimerLines, margin + 3, y + 9);
    y += 24;

    // Helper for Section Titles
    const renderSectionHeader = (title: string) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(200, 90, 50);
      doc.text(title, margin, y);
      y += 2;
      doc.setDrawColor(220, 225, 230);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    };

    // Helper for Bullet items
    const renderBullet = (label: string, value: string, boldLabel = true) => {
      checkPageBreak(7);
      doc.setFont('helvetica', boldLabel ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 35, 45);
      const prefix = `•  ${label}: `;
      doc.text(prefix, margin + 2, y);

      const prefixWidth = doc.getTextWidth(prefix);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 65, 81);

      const wrappedValue = doc.splitTextToSize(value, contentWidth - prefixWidth - 4);
      if (wrappedValue.length === 1) {
        doc.text(wrappedValue[0], margin + 2 + prefixWidth, y);
        y += 4.5;
      } else {
        doc.text(wrappedValue[0], margin + 2 + prefixWidth, y);
        y += 4.5;
        for (let i = 1; i < wrappedValue.length; i++) {
          checkPageBreak(5);
          doc.text(wrappedValue[i], margin + 8, y);
          y += 4.5;
        }
      }
    };

    // Section 1: Executive Mission Summary
    renderSectionHeader('1. Executive Mission Summary');
    renderBullet('Exploration Region', `${briefing.region.name} (${briefing.region.sub_heading})`);
    renderBullet('Primary Science Objective', briefing.region.science_objective);
    renderBullet('Target Candidate Site', `${briefing.site.name} (Suitability Score: ${briefing.site.suitability_score.toFixed(1)}/100)`);
    renderBullet('Selected Route Profile', `${briefing.route.name} (${briefing.route.objective})`);
    renderBullet('Overall Feasibility Status', briefing.simulation.overall_status);
    y += 3;

    // Section 2: Candidate Exploration Site Intelligence
    renderSectionHeader('2. Candidate Exploration Site Intelligence');
    renderBullet('Coordinates', `${briefing.site.point.lat.toFixed(4)}° Lat, ${briefing.site.point.lon.toFixed(4)}° Lon (Planetocentric, East-Positive)`);
    renderBullet('Primary Feature', briefing.site.primary_feature);
    renderBullet('Geological Context', briefing.site.geological_context);
    renderBullet('MCDA Criteria Breakdown', `Terrain: ${briefing.site.criterion_scores.terrain}% | Human Safety: ${briefing.site.criterion_scores.human_safety}% | Science: ${briefing.site.criterion_scores.science}% | Resources: ${briefing.site.criterion_scores.resources}% | Access: ${briefing.site.criterion_scores.accessibility}%`);
    
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 50, 60);
    doc.text('Supporting Scientific Evidence:', margin + 2, y);
    y += 4.5;

    briefing.site.evidence.forEach((e) => {
      renderBullet(`[${e.dataset_id}] ${e.instrument}`, `${e.finding} (Class: ${e.data_class})`, false);
    });
    y += 3;

    // Section 3: Human Traverse Route Analysis
    renderSectionHeader('3. Human Traverse Route Analysis');
    renderBullet('Surface Distance', `${briefing.route.surface_distance_km} km (Planar Distance: ${briefing.route.total_distance_km} km)`);
    renderBullet('Modeled EVA Duration', `${briefing.simulation.total_duration_hours} hours (Walking: ${briefing.route.walking_time_hours}h | Science Stops: ${briefing.route.science_time_hours}h)`);
    renderBullet('Slope / Incline', `Max Slope: ${briefing.route.max_slope_deg}° | Average Slope: ${briefing.route.average_slope_deg}°`);
    renderBullet('Elevation Profile', `Ascent: +${briefing.route.ascent_m}m | Descent: -${briefing.route.descent_m}m`);
    renderBullet('Max Distance from Habitat', `${briefing.route.max_distance_from_base_m} meters`);

    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 50, 60);
    doc.text('Designated Science Work Stops:', margin + 2, y);
    y += 4.5;

    briefing.route.science_stops.forEach((s, idx) => {
      renderBullet(
        `${idx + 1}. ${s.name}`,
        `${s.planned_work_time_min} min (Priority: ${s.priority}) — ${s.science_rationale} [Tools: ${s.sampling_tools.join(', ')}]`,
        false
      );
    });
    y += 3;

    // Section 4: Life-Support Simulation & Safety Constraints
    renderSectionHeader('4. Life-Support Simulation & Safety Constraints');
    renderBullet('Crew Size', `${briefing.config.crew_size} Astronauts`);
    renderBullet('Oxygen Consumed', `${briefing.simulation.oxygen_used_liters} L (Remaining Margin: ${briefing.simulation.oxygen_margin_percent}%)`);
    renderBullet('Power Consumed', `${briefing.simulation.battery_used_wh} Wh (State of Charge Margin: ${briefing.simulation.battery_margin_percent}%)`);
    renderBullet('Water Sublimation', `${briefing.simulation.water_used_liters} L`);
    renderBullet('Critical Turn-Back Point', `Elapsed Sol Time ${briefing.simulation.turn_back_elapsed_min} min at ${briefing.simulation.turn_back_distance_km} km`);
    renderBullet('Safe Walk-Back Radius', `${briefing.simulation.walkback_radius_m} meters`);

    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 50, 60);
    doc.text('Safety Constraint Audits:', margin + 2, y);
    y += 4.5;

    briefing.simulation.checks.forEach((c) => {
      renderBullet(`[${c.status}] ${c.label}`, c.detail, false);
    });
    y += 3;

    // Section 5: Scientific Limitations & Caveats
    renderSectionHeader('5. Scientific Limitations & Caveats');
    briefing.site.limitations.forEach((l) => renderBullet('Site Caveat', l, false));
    briefing.route.limitations.forEach((l) => renderBullet('Route Caveat', l, false));
    renderBullet('Duricrust & Hazard Notice', 'Orbital remote sensing cannot guarantee the absence of sub-meter tire puncture gravel or surface duricrust collapse.', false);

    // Number all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `AresNav Decision Support Platform • NASA Space Apps 2026 • IAU2000:49900 • Page ${i} of ${totalPages}`,
        105,
        290,
        { align: 'center' }
      );
    }

    doc.save(filename);
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const reportService = new ReportService();
