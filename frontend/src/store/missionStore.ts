import { create } from 'zustand';
import type { components } from '../types/api.gen';
import type {
  NavPage,
  RegionInfo,
  CandidateSite,
  TraverseRoute,
  EvaSimulationConfig,
  EvaSimulationResult,
  DatasetMetadata,
} from '../types/models';
import {
  GALE_REGION,
  GALE_CANDIDATE_SITES,
  GALE_ROUTES,
  DEFAULT_EVA_CONFIG,
  DEMO_DATASETS,
} from '../mocks/demoData';
import { simulationService } from '../services/simulationService';

export type MissionStateContract = components['schemas']['MissionState'];
export type HealthResponse = components['schemas']['HealthResponse'];
export type RegionSummary = components['schemas']['RegionSummary'];
export type RegionDetail = components['schemas']['RegionDetail'];
export type LayerInfo = components['schemas']['LayerInfo'];
export type DatasetRecord = components['schemas']['DatasetRecord'];
export type PointInspection = components['schemas']['PointInspection'];
export type RoutePlanResponse = components['schemas']['RoutePlanResponse'];
export type MissionReport = components['schemas']['MissionReport'];
export type EnvelopeResponse = components['schemas']['EnvelopeResponse'];
export type AgentAnalysisResponse = components['schemas']['AgentAnalysisResponse'];
export type GeoPoint = components['schemas']['GeoPoint'];
export type Stop = components['schemas']['Stop'];
export type EvaConfig = components['schemas']['EvaConfig'];

export interface MissionStoreState {
  // --- MissionState Contract Fields (API_CONTRACTS.md §3.7) ---
  mission_id: string | null;
  name: string | null;
  created_at: string | null;
  region_id: string | null;
  objective_text: string | null;
  base: GeoPoint | null;
  destination: GeoPoint | null;
  stops: Stop[];
  eva_config: EvaConfig | null;
  plan: RoutePlanResponse | null;
  selected_route_id: string | null;
  envelope: EnvelopeResponse | null;
  agent_analysis: AgentAnalysisResponse | null;
  notes: string | null;

  // --- UI and Local-First State ---
  activePage: NavPage;
  selectedRegion: RegionInfo;
  candidateSites: CandidateSite[];
  selectedSite: CandidateSite | null;
  routes: TraverseRoute[];
  selectedRoute: TraverseRoute | null;
  evaConfigParams: EvaSimulationConfig;
  simulationResult: EvaSimulationResult | null;
  datasetsMeta: DatasetMetadata[];
  selectedDatasetMeta: DatasetMetadata | null;

  // Compatibility and API Fields
  health: HealthResponse | null;
  isBackendHealthy: boolean;
  regionDetail: RegionDetail | null;
  availableRegions: RegionSummary[];
  layers: LayerInfo[];
  activeLayerIds: string[];
  layerOpacities: Record<string, number>;
  datasets: DatasetRecord[];
  selectedDataset: DatasetRecord | null;
  selectedPoint: GeoPoint | null;
  pointInspection: PointInspection | null;
  report: MissionReport | null;
  isLoading: boolean;
  errorMessage: string | null;
  isBaseLocked: boolean;
  isDestinationLocked: boolean;

  // --- Actions & Setters ---
  setActivePage: (page: NavPage) => void;
  setSelectedRegion: (region: RegionInfo) => void;
  setSelectedSite: (site: CandidateSite | null) => void;
  setSelectedRoute: (route: TraverseRoute | null) => void;
  setIsBaseLocked: (locked: boolean) => void;
  setIsDestinationLocked: (locked: boolean) => void;
  setEvaConfigParams: (params: Partial<EvaSimulationConfig>) => void;
  setSimulationResult: (result: EvaSimulationResult | null) => void;
  setSelectedDatasetMeta: (ds: DatasetMetadata | null) => void;

  setHealth: (health: HealthResponse | null) => void;
  setRegionId: (region_id: string | null) => void;
  setSelectedRegionId: (region_id: string | null) => void;
  setRegionDetail: (detail: RegionDetail | null) => void;
  setAvailableRegions: (regions: RegionSummary[]) => void;
  setLayers: (layers: LayerInfo[]) => void;
  setActiveLayerIds: (ids: string[]) => void;
  toggleLayer: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setDatasets: (datasets: DatasetRecord[]) => void;
  setSelectedDataset: (dataset: DatasetRecord | null) => void;
  setMissionInfo: (info: {
    mission_id?: string | null;
    name?: string | null;
    created_at?: string | null;
    objective_text?: string | null;
    notes?: string | null;
  }) => void;
  setBase: (base: GeoPoint | null) => void;
  setDestination: (destination: GeoPoint | null) => void;
  setStops: (stops: Stop[]) => void;
  setEvaConfig: (eva_config: EvaConfig | null) => void;
  setPlan: (plan: RoutePlanResponse | null) => void;
  setSelectedRouteId: (selected_route_id: string | null) => void;
  setEnvelope: (envelope: EnvelopeResponse | null) => void;
  setAgentAnalysis: (agent_analysis: AgentAnalysisResponse | null) => void;
  setNotes: (notes: string | null) => void;
  setSelectedPoint: (point: GeoPoint | null) => void;
  setPointInspection: (inspection: PointInspection | null) => void;
  setReport: (report: MissionReport | null) => void;
  resetMission: () => void;
  toMissionState: () => MissionStateContract | null;
}

export const useMissionStore = create<MissionStoreState>((set, get) => ({
  // Contract initial values
  mission_id: null,
  name: null,
  created_at: null,
  region_id: 'gale_mount_sharp',
  objective_text: null,
  base: null,
  destination: null,
  stops: [],
  eva_config: null,
  plan: null,
  selected_route_id: null,
  envelope: null,
  agent_analysis: null,
  notes: null,

  // UI state initial values
  activePage: 'explorer',
  selectedRegion: GALE_REGION,
  candidateSites: GALE_CANDIDATE_SITES,
  selectedSite: null,
  routes: GALE_ROUTES,
  selectedRoute: null,
  evaConfigParams: DEFAULT_EVA_CONFIG,
  simulationResult: null,
  datasetsMeta: DEMO_DATASETS,
  selectedDatasetMeta: DEMO_DATASETS[0],

  health: null,
  isBackendHealthy: false,
  regionDetail: null,
  availableRegions: [],
  layers: [],
  activeLayerIds: ['ortho'],
  layerOpacities: {
    ortho: 1.0,
    elevation: 0.75,
    slope: 0.7,
    hazard_grid: 0.8,
  },
  datasets: [],
  selectedDataset: null,
  selectedPoint: null,
  pointInspection: null,
  report: null,
  isLoading: false,
  errorMessage: null,
  isBaseLocked: false,
  isDestinationLocked: false,

  setActivePage: (activePage) => set({ activePage }),
  setSelectedRegion: (selectedRegion) =>
    set({
      selectedRegion,
      region_id: selectedRegion.region_id,
    }),
  setSelectedSite: (selectedSite) => set({ selectedSite }),
  setIsBaseLocked: (isBaseLocked) => set({ isBaseLocked }),
  setIsDestinationLocked: (isDestinationLocked) => set({ isDestinationLocked }),
  setSelectedRoute: (selectedRoute) => {
    if (!selectedRoute) {
      set({ selectedRoute: null, selected_route_id: null, simulationResult: null });
      return;
    }
    const sim = simulationService.simulateEva(selectedRoute, get().evaConfigParams);
    const startWp = selectedRoute.waypoints?.[0];
    const endWp = selectedRoute.waypoints?.[selectedRoute.waypoints.length - 1];
    set({
      selectedRoute,
      selected_route_id: selectedRoute.route_id,
      simulationResult: sim,
      ...(!get().base && startWp ? { base: { lat: startWp.lat, lon: startWp.lon } } : {}),
      ...(!get().destination && endWp ? { destination: { lat: endWp.lat, lon: endWp.lon } } : {}),
    });
  },
  setEvaConfigParams: (params) => {
    const newConfig = { ...get().evaConfigParams, ...params };
    const route = get().selectedRoute;
    const sim = route ? simulationService.simulateEva(route, newConfig) : null;
    set({
      evaConfigParams: newConfig,
      simulationResult: sim,
    });
  },
  setSimulationResult: (simulationResult) => set({ simulationResult }),
  setSelectedDatasetMeta: (selectedDatasetMeta) => set({ selectedDatasetMeta }),

  setHealth: (health) =>
    set({
      health,
      isBackendHealthy: health !== null && health.status === 'ok',
    }),

  setRegionId: (region_id) => set({ region_id }),
  setSelectedRegionId: (region_id) => set({ region_id }),
  setRegionDetail: (regionDetail) => set({ regionDetail }),
  setAvailableRegions: (availableRegions) => set({ availableRegions }),
  setLayers: (layers) =>
    set((state) => {
      const opacities = { ...state.layerOpacities };
      layers.forEach((l) => {
        if (opacities[l.layer_id] === undefined) {
          opacities[l.layer_id] = 1.0;
        }
      });
      return { layers, layerOpacities: opacities };
    }),
  setActiveLayerIds: (activeLayerIds) => set({ activeLayerIds }),
  toggleLayer: (layerId) =>
    set((state) => {
      const exists = state.activeLayerIds.includes(layerId);
      return {
        activeLayerIds: exists
          ? state.activeLayerIds.filter((id) => id !== layerId)
          : [...state.activeLayerIds, layerId],
      };
    }),
  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      layerOpacities: {
        ...state.layerOpacities,
        [layerId]: Math.max(0, Math.min(1, opacity)),
      },
    })),
  setDatasets: (datasets) => set({ datasets }),
  setSelectedDataset: (selectedDataset) => set({ selectedDataset }),

  setMissionInfo: (info) =>
    set((state) => ({
      mission_id: info.mission_id !== undefined ? info.mission_id : state.mission_id,
      name: info.name !== undefined ? info.name : state.name,
      created_at: info.created_at !== undefined ? info.created_at : state.created_at,
      objective_text:
        info.objective_text !== undefined ? info.objective_text : state.objective_text,
      notes: info.notes !== undefined ? info.notes : state.notes,
    })),

  setBase: (base) =>
    set({
      base,
      ...(base === null ? { isBaseLocked: false } : {}),
    }),
  setDestination: (destination) =>
    set({
      destination,
      ...(destination === null ? { isDestinationLocked: false } : {}),
    }),
  setStops: (stops) => set({ stops }),
  setEvaConfig: (eva_config) => set({ eva_config }),
  setPlan: (plan) => set({ plan }),
  setSelectedRouteId: (selected_route_id) => set({ selected_route_id }),
  setEnvelope: (envelope) => set({ envelope }),
  setAgentAnalysis: (agent_analysis) => set({ agent_analysis }),
  setNotes: (notes) => set({ notes }),
  setSelectedPoint: (selectedPoint) => set({ selectedPoint }),
  setPointInspection: (pointInspection) => set({ pointInspection }),
  setReport: (report) => set({ report }),

  resetMission: () =>
    set({
      plan: null,
      selected_route_id: null,
      envelope: null,
      agent_analysis: null,
      report: null,
      selectedPoint: null,
      pointInspection: null,
      errorMessage: null,
    }),

  toMissionState: (): MissionStateContract | null => {
    const state = get();
    if (
      !state.mission_id ||
      !state.created_at ||
      !state.name ||
      !state.region_id ||
      !state.objective_text ||
      !state.eva_config ||
      !Array.isArray(state.stops)
    ) {
      return null;
    }
    return {
      mission_id: state.mission_id,
      created_at: state.created_at,
      name: state.name,
      region_id: state.region_id,
      objective_text: state.objective_text,
      stops: state.stops,
      eva_config: state.eva_config,
      base: state.base,
      destination: state.destination,
      plan: state.plan,
      selected_route_id: state.selected_route_id,
      envelope: state.envelope,
      agent_analysis: state.agent_analysis,
      notes: state.notes,
    };
  },
}));
