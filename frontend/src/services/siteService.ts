import type { CandidateSite } from '../types/models';
import { GALE_CANDIDATE_SITES } from '../mocks/demoData';

export class SiteService {
  /**
   * Retrieves candidate exploration sites for a given Martian region.
   * Currently served from local validated demonstration provider.
   * Can be configured to call GET /api/v1/sites/analyze when FastAPI is online.
   */
  async getCandidateSites(regionId: string = 'gale_mount_sharp'): Promise<CandidateSite[]> {
    // Simulate brief asynchronous processing
    await new Promise((resolve) => setTimeout(resolve, 80));
    return GALE_CANDIDATE_SITES.filter((s) => s.region_id === regionId);
  }

  async getSiteById(siteId: string): Promise<CandidateSite | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return GALE_CANDIDATE_SITES.find((s) => s.site_id === siteId) ?? null;
  }
}

export const siteService = new SiteService();
