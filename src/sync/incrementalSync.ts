import { MetaAdScraper } from '../core/scraper';
import { AdStorage } from '../storage/adStorage';
import { logger } from '../utils/logger';
import { MetaAd } from '../core/types';

export async function incrementalSync(
    pageId: string,
    config?: any
): Promise<{
    success: boolean;
    newAds: number;
    updatedAds: number;
    totalAds: number;
    error?: string;
}> {
    const scraper = new MetaAdScraper(config);
    const storage = new AdStorage();

    try {
        logger.info(`Starting incremental sync for page: ${pageId}`);

        // Get existing ads and sync status
        const existingAds = await storage.getPageAds(pageId);

        logger.info(`Found ${existingAds.length} existing ads for page ${pageId}`);

        // Construct URL for the specific page
        const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&view_all_page_id=${pageId}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped`;

        await scraper.initialize();

        // Scrape ads
        const responses = await scraper.safeScrape(
            () => scraper.scrapeAdsFromUrl(url)
        );

        // Extract ads from responses
        const fetchedAds = await scraper.extractAdsFromResponses(responses);
        const processedAds = processAds(fetchedAds, pageId);

        // Find new and updated ads
        const { newAds, updatedAds } = await storage.findNewAds(existingAds, processedAds);

        logger.info(`Found ${newAds.length} new ads and ${updatedAds.length} updated ads`);

        // Save all fetched ads (this will update existing ones)
        await storage.saveAds(processedAds);

        // Update sync status
        await storage.updateSyncStatus(
            pageId,
            existingAds.length + newAds.length,
            processedAds[0]?.id
        );

        // Check for deactivated ads
        const deactivatedCount = await checkDeactivatedAds(existingAds, processedAds, pageId, storage);

        logger.info(`Incremental sync completed. New: ${newAds.length}, Updated: ${updatedAds.length}, Deactivated: ${deactivatedCount}`);

        return {
            success: true,
            newAds: newAds.length,
            updatedAds: updatedAds.length,
            totalAds: existingAds.length + newAds.length
        };

    } catch (error) {
        logger.error('Incremental sync failed:', error);
        return {
            success: false,
            newAds: 0,
            updatedAds: 0,
            totalAds: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    } finally {
        await scraper.close();
    }
}

async function checkDeactivatedAds(
    existingAds: MetaAd[],
    fetchedAds: MetaAd[],
    _pageId: string,
    storage: AdStorage
): Promise<number> {
    const fetchedAdIds = new Set(fetchedAds.map(ad => ad.id));
    let deactivatedCount = 0;

    for (const existingAd of existingAds) {
        if (!fetchedAdIds.has(existingAd.id)) {
            // Ad not in fetched list, might be deactivated
            if (existingAd.isActive) {
                // Mark as inactive and update
                const updatedAd: MetaAd = {
                    ...existingAd,
                    isActive: false,
                    updatedAt: new Date().toISOString()
                };
                await storage.saveAds([updatedAd]);
                deactivatedCount++;
                logger.debug(`Marked ad ${existingAd.id} as inactive`);
            }
        }
    }

    return deactivatedCount;
}

function processAds(ads: any[], pageId: string): MetaAd[] {
    return ads.map(ad => ({
        ...ad,
        page_id: pageId,
        updated_at: new Date().toISOString()
    }));
}