import type { components } from '../../types/api.gen';

export type LayerInfo = components['schemas']['LayerInfo'];
export type DatasetRecord = components['schemas']['DatasetRecord'];
export type RegionDetail = components['schemas']['RegionDetail'];
export type PointInspection = components['schemas']['PointInspection'];

export const SAMPLE_DATASETS: DatasetRecord[] = [
  {
    dataset_id: 'HIRISE_DTM_GALE_MOUND',
    name: 'HiRISE Digital Terrain Model (Mount Sharp)',
    mission: 'Mars Reconnaissance Orbiter',
    instrument: 'High Resolution Imaging Science Experiment (HiRISE)',
    data_type: 'ELEVATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    processing_steps: [],
    product_ids: ['PSP_001488_1750_DTM'],
    source_archive: 'NASA PDS Geosciences Node / UArizona',
    source_conventions: 'planetocentric, east-positive',
    source_crs: 'IAU2000:49900',
    source_url: 'https://www.uahirise.org/dtm/dtm.php?ID=PSP_001488_1750',
    temporal_coverage: {
      description: 'Static orbital terrain baseline',
    },
    units: 'm',
    native_resolution_m: 1.0,
    citation: 'McEwen, A.S., et al. (2007). Mars Reconnaissance Orbiter\'s High Resolution Imaging Science Experiment (HiRISE). J. Geophys. Res., 112, E05S02.',
    limitations: [
      'Coverage limited to the HiRISE stereo pair footprint across Mount Sharp lower mound.',
      'Stereo photogrammetry artifacts may exist along steep, shadowed cliff faces.',
    ],
    coverage_bounds: {
      lat_min: -5.099,
      lat_max: -4.130,
      lon_min: 137.124,
      lon_max: 137.681,
    },
  },
  {
    dataset_id: 'HIRISE_ORTHO_GALE_MOUND',
    name: 'HiRISE Orthorectified Surface Mosaic',
    mission: 'Mars Reconnaissance Orbiter',
    instrument: 'HiRISE',
    data_type: 'OPTICAL',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    processing_steps: [],
    product_ids: ['PSP_001488_1750_RED'],
    source_archive: 'NASA PDS Geosciences Node',
    source_conventions: 'planetocentric, east-positive',
    source_crs: 'IAU2000:49900',
    source_url: 'https://www.uahirise.org/PSP_001488_1750',
    temporal_coverage: {
      description: 'Static optical mosaic baseline',
    },
    native_resolution_m: 0.25,
    citation: 'NASA/JPL-Caltech/UArizona HiRISE orthorectified image product.',
    limitations: [
      'Sub-meter visible features; local shadow variations affect apparent roughness.',
    ],
  },
  {
    dataset_id: 'MOLA_MEGDR_GALE',
    name: 'MOLA Mission Experiment Gridded Data Record',
    mission: 'Mars Global Surveyor',
    instrument: 'Mars Orbiter Laser Altimeter (MOLA)',
    data_type: 'ELEVATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    processing_steps: [],
    product_ids: ['MEGDR_128_GALE'],
    source_archive: 'NASA PDS Geosciences Node',
    source_conventions: 'planetocentric, east-positive',
    source_crs: 'IAU2000:49900',
    source_url: 'https://pds-geosciences.wustl.edu/mgs/mgs-m-mola-5-megdr-l3-v1/mgsl_300x/meg128/',
    temporal_coverage: {
      description: 'Static MOLA MEGDR release',
    },
    units: 'm',
    native_resolution_m: 463.0,
    citation: 'Smith, D.E., et al. (2001). Mars Orbiter Laser Altimeter: Experiment overview and performance. J. Geophys. Res., 106(E10), 23689-23722.',
    limitations: [
      'Regional 128 px/deg grid; not suitable for boulder or metre-scale slope evaluation.',
    ],
  },
  {
    dataset_id: 'THEMIS_DAY_IR_GALE',
    name: 'THEMIS Daytime Infrared Brightness Temperature',
    mission: '2001 Mars Odyssey',
    instrument: 'Thermal Emission Imaging System (THEMIS)',
    data_type: 'THERMAL',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    processing_steps: [],
    product_ids: ['THEMIS_IR_DAY_100M'],
    source_archive: 'Arizona State University / NASA PDS',
    source_conventions: 'planetocentric, east-positive',
    source_crs: 'IAU2000:49900',
    source_url: 'https://themis.asu.edu/',
    temporal_coverage: {
      description: 'Daytime thermal infrared release',
    },
    units: 'K',
    native_resolution_m: 100.0,
    citation: 'Christensen, P.R., et al. (2004). The Thermal Emission Imaging System (THEMIS) for the Mars 2001 Odyssey Mission. Space Sci. Rev. 110, 85-130.',
    limitations: [
      'Orbital brightness temperature, not continuous astronaut suit ambient temperature.',
    ],
  },
  {
    dataset_id: 'MSL_RAD_SURFACE_RDR',
    name: 'Curiosity MSL RAD Surface Radiation Dose Rate',
    mission: 'Mars Science Laboratory',
    instrument: 'Radiation Assessment Detector (RAD)',
    data_type: 'RADIATION',
    data_class: 'SAMPLE',
    status: 'AVAILABLE',
    processing_steps: [],
    product_ids: ['MSL_RAD_RDR_SOL0000_1000'],
    source_archive: 'NASA PDS PPI / SwRI',
    source_conventions: 'planetocentric, east-positive',
    source_crs: 'IAU2000:49900',
    source_url: 'https://pds-ppi.igpp.ucla.edu/',
    temporal_coverage: {
      description: 'Sol 0-1000 surface dose baseline',
    },
    units: 'ÂµGy/day',
    citation: 'Hassler, D.M., et al. (2014). Mars\' Surface Radiation Environment Measured with the Mars Science Laboratory\'s Curiosity Rover. Science, 343(6169).',
    limitations: [
      'Point measurement along Curiosity traverse; local variations depend on atmospheric depth and solar cycle.',
    ],
  },
];

export const SAMPLE_LAYERS: LayerInfo[] = [
  {
    layer_id: 'elevation',
    name: 'HiRISE Surface Elevation',
    kind: 'RASTER',
    data_type: 'ELEVATION',
    status: 'AVAILABLE',
    data_class: 'SAMPLE',
    dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
    native_resolution_m: 1.0,
    legend: {
      colormap: 'terrain',
      units: 'm',
      vmin: -4500,
      vmax: -3800,
    },
    bounds: {
      lat_min: -5.099,
      lat_max: -4.130,
      lon_min: 137.124,
      lon_max: 137.681,
    },
    limitations: ['HiRISE 1m DTM stereo photogrammetry'],
  },
  {
    layer_id: 'ortho',
    name: 'HiRISE Optical Basemap',
    kind: 'RASTER',
    data_type: 'OPTICAL',
    status: 'AVAILABLE',
    data_class: 'SAMPLE',
    dataset_ids: ['HIRISE_ORTHO_GALE_MOUND'],
    native_resolution_m: 0.25,
    legend: {
      colormap: 'gray',
    },
    bounds: {
      lat_min: -5.099,
      lat_max: -4.130,
      lon_min: 137.124,
      lon_max: 137.681,
    },
    limitations: ['Visible optical reflectance'],
  },
  {
    layer_id: 'slope',
    name: 'Horn Slope Gradient',
    kind: 'RASTER',
    data_type: 'DERIVED',
    status: 'AVAILABLE',
    data_class: 'SAMPLE',
    dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
    native_resolution_m: 1.0,
    legend: {
      colormap: 'plasma',
      units: 'deg',
      vmin: 0,
      vmax: 35,
    },
    bounds: {
      lat_min: -5.099,
      lat_max: -4.130,
      lon_min: 137.124,
      lon_max: 137.681,
    },
    limitations: ['3x3 Horn slope kernel derived from HiRISE DTM'],
  },
  {
    layer_id: 'thermal',
    name: 'THEMIS Thermal Inertia',
    kind: 'RASTER',
    data_type: 'THERMAL',
    status: 'AVAILABLE',
    data_class: 'SAMPLE',
    dataset_ids: ['THEMIS_DAY_IR_GALE'],
    native_resolution_m: 100.0,
    legend: {
      colormap: 'magma',
      units: 'K',
      vmin: 210,
      vmax: 275,
    },
    limitations: ['Daytime brightness temperature'],
  },
  {
    layer_id: 'geology_units',
    name: 'USGS Geological Units',
    kind: 'VECTOR',
    data_type: 'GEOLOGY',
    status: 'AVAILABLE',
    data_class: 'SAMPLE',
    dataset_ids: ['USGS_ASTROGEOLOGY_GALE'],
    legend: {
      colormap: 'categorical',
      categories: [
        { value: 1, label: 'Lower Clay-bearing unit', color: '#38bdf8' },
        { value: 2, label: 'Sulfate-bearing unit', color: '#fbbf24' },
        { value: 3, label: 'Boxwork fracture ridge', color: '#f43f5e' },
      ],
    },
    limitations: ['Regional photogeological interpretation'],
  },
  {
    layer_id: 'crism_mineralogy',
    name: 'CRISM Mineral Signatures',
    kind: 'RASTER',
    data_type: 'MINERALOGY',
    status: 'UNAVAILABLE',
    status_reason: 'CRISM targeted observation not yet validated in this sector',
    data_class: 'SAMPLE',
    dataset_ids: [],
    limitations: ['Pending sensor calibration'],
  },
];

export const SAMPLE_REGION_DETAIL: RegionDetail = {
  region_id: 'gale_mount_sharp',
  name: 'Gale Crater / Mount Sharp',
  description: 'Gale Crater exploration corridor focusing on Aeolis Mons (Mount Sharp) lower layered mound and boxwork structures.',
  science_objective: 'Investigate ancient groundwater networks and boxwork mineral ridges formed in fractured bedrock.',
  bounds: {
    lat_min: -5.099,
    lat_max: -4.130,
    lon_min: 137.124,
    lon_max: 137.681,
  },
  analysis: {
    analysis_crs: '+proj=eqc +lat_ts=-4.8 +lon_0=137.3 +x_0=0 +y_0=0 +R=3396190 +units=m +no_defs',
    cell_size_m: 1.0,
    max_grid_cells: 4000000,
    primary_dtm_dataset_id: 'HIRISE_DTM_GALE_MOUND',
  },
  data_status: {
    datasets_available: 5,
    datasets_unavailable: 1,
  },
  layer_ids: ['elevation', 'ortho', 'slope', 'thermal', 'geology_units', 'crism_mineralogy'],
  default_base: {
    lat: -4.750,
    lon: 137.280,
  },
  default_base_basis: 'Smooth local terrain with verified HiRISE DTM and ortho coverage',
  science_targets: [
    {
      target_id: 'BOXWORK_RIDGE_01',
      name: 'Mount Sharp Boxwork Ridge',
      point: {
        lat: -4.780,
        lon: 137.300,
      },
      rationale: 'Prominent boxwork fracture network ridge indicating paleohydrological mineral precipitation.',
      data_class: 'SAMPLE',
      evidence: [
        {
          source_id: 'HIRISE_DTM_GALE_MOUND',
          source_type: 'dataset',
          detail: 'McEwen et al. (2007) / PDS HiRISE',
        },
      ],
    },
    {
      target_id: 'CLAY_SULFATE_TRANSITION',
      name: 'Clay-Sulfate Mineral Transition',
      point: {
        lat: -4.720,
        lon: 137.350,
      },
      rationale: 'Major environmental transition marker recorded in sedimentary strata of Mount Sharp.',
      data_class: 'SAMPLE',
      evidence: [
        {
          source_id: 'CRISM_MTRDR_GALE',
          source_type: 'dataset',
          detail: 'Milliken et al. (2010)',
        },
      ],
    },
  ],
};

export const createSampleInspection = (lat: number, lon: number): PointInspection => {
  const elevation = -4200 + Math.sin(lat * 50) * 180 + Math.cos(lon * 40) * 120;
  const slope = Math.abs(Math.sin(lat * 70) * 14 + Math.cos(lon * 50) * 8);
  const roughness = 0.12 + Math.abs(Math.sin(lat * 90) * 0.18);
  const tempK = 232 + Math.sin(lat * 10) * 15;

  return {
    region_id: 'gale_mount_sharp',
    point: { lat, lon },
    data_confidence: 'HIGH',
    values: [
      {
        layer_id: 'elevation',
        value: Math.round(elevation * 10) / 10,
        units: 'm',
        status: 'OK',
        data_class: 'SAMPLE',
        native_resolution_m: 1.0,
        dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
      },
      {
        layer_id: 'slope',
        value: Math.round(slope * 10) / 10,
        units: 'deg',
        status: 'OK',
        data_class: 'SAMPLE',
        native_resolution_m: 1.0,
        dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
      },
      {
        layer_id: 'roughness',
        value: Math.round(roughness * 100) / 100,
        units: 'm',
        status: 'OK',
        data_class: 'SAMPLE',
        native_resolution_m: 1.0,
        dataset_ids: ['HIRISE_DTM_GALE_MOUND'],
      },
      {
        layer_id: 'thermal_inertia',
        value: Math.round(tempK),
        units: 'K',
        status: 'OK',
        data_class: 'SAMPLE',
        native_resolution_m: 100.0,
        dataset_ids: ['THEMIS_DAY_IR_GALE'],
      },
    ],
    context: [
      {
        indicator_id: 'RADIATION_CONTEXT',
        value: 235,
        units: 'ÂµGy/day',
        data_class: 'SAMPLE',
        status: 'AVAILABLE',
        summary: 'MSL RAD measured surface dose rate context at Gale Crater',
        evidence: [
          {
            source_id: 'MSL_RAD_SURFACE_RDR',
            source_type: 'dataset',
            detail: 'Hassler et al. (2014)',
          },
        ],
        limitations: [
          'Historical point radiation measurement; not a real-time predictive forecast.',
        ],
      },
      {
        indicator_id: 'THERMAL_CONTEXT',
        value: Math.round(tempK),
        units: 'K',
        data_class: 'SAMPLE',
        status: 'AVAILABLE',
        summary: 'THEMIS orbital infrared brightness temperature observation',
        evidence: [
          {
            source_id: 'THEMIS_DAY_IR_GALE',
            source_type: 'dataset',
            detail: 'Christensen et al. (2004)',
          },
        ],
        limitations: [
          'Orbital brightness temperature, not continuous suit ambient environment.',
        ],
      },
    ],
    limitations: [
      'Values derived from HiRISE DTM sample grid; verify against latest regional DTM tiles before operations.',
      'Surface temperature represents orbital daytime acquisition, not diurnal astronaut EVA conditions.',
    ],
  };
};
