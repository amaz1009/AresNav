import type { DatasetMetadata } from '../types/models';
import { DEMO_DATASETS } from '../mocks/demoData';

export class DatasetService {
  async getDatasets(): Promise<DatasetMetadata[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return DEMO_DATASETS;
  }

  async getDatasetById(datasetId: string): Promise<DatasetMetadata | null> {
    await new Promise((resolve) => setTimeout(resolve, 40));
    return DEMO_DATASETS.find((d) => d.dataset_id === datasetId) ?? null;
  }

  async searchDatasets(query: string, filterType?: string): Promise<DatasetMetadata[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const q = query.toLowerCase();
    return DEMO_DATASETS.filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.dataset_id.toLowerCase().includes(q) ||
        d.instrument.toLowerCase().includes(q) ||
        d.mission.toLowerCase().includes(q);
      const matchesType = !filterType || filterType === 'ALL' || d.data_type === filterType;
      return matchesQuery && matchesType;
    });
  }
}

export const datasetService = new DatasetService();
