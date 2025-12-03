export { initialSync } from './sync/initialSync';
export { incrementalSync } from './sync/incrementalSync';
export { MetaAdScraper } from './core/scraper';
export { AdStorage } from './storage/adStorage';
export type { MetaAd, PageSyncStatus, ScraperConfig } from './core/types';

// Utility function for easy usage
export async function syncAdsLibrary(
    urlOrPageId: string,
    options?: {
        maxAds?: number;
        incremental?: boolean;
        config?: any;
    }
) {
    if (options?.incremental) {
        // Assume it's a pageId for incremental sync
        return incrementalSync(urlOrPageId, options.config);
    } else {
        // Assume it's a URL for initial sync
        return initialSync(urlOrPageId, options?.maxAds, options?.config);
    }
}