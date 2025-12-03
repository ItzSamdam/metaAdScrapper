import { MetaAdScraper } from '../core/scraper';
import { AdStorage } from '../storage/adStorage';
import { logger } from '../utils/logger';
import { MetaAd } from '../core/types';
import { extractPageIdFromUrl } from '../utils/helpers';

export async function initialSync(
    url: string,
    maxAds?: number,
    config?: any
): Promise<{
    success: boolean;
    totalAds: number;
    pageId?: string;
    error?: string;
}> {
    const scraper = new MetaAdScraper(config);
    const storage = new AdStorage();

    try {
        logger.info(`Starting initial sync for URL: ${url}`);
        logger.info(`Max ads to fetch: ${maxAds || 'No limit'}`);

        await scraper.initialize();

        // Extract page ID from URL if possible
        const pageId = extractPageIdFromUrl(url);
        if (pageId) {
            logger.info(`Detected page ID: ${pageId}`);
        }

        // Scrape ads
        const responses = await scraper.safeScrape(
            () => scraper.scrapeAdsFromUrl(url, maxAds)
        );

        // Extract ads from responses
        const ads = await scraper.extractAdsFromResponses(responses, maxAds);

        logger.info(`Extracted ${ads.length} ads from responses`);

        // Process and save ads
        const processedAds = processAds(ads, pageId);
        await storage.saveAds(processedAds);

        // Update sync status
        const detectedPageId = processedAds[0]?.page_id || pageId;
        if (detectedPageId) {
            await storage.updateSyncStatus(
                detectedPageId,
                processedAds.length,
                processedAds[0]?.id
            );
        }

        logger.info(`Initial sync completed successfully. Saved ${processedAds.length} ads.`);

        return {
            success: true,
            totalAds: processedAds.length,
            pageId: detectedPageId
        };

    } catch (error) {
        logger.error('Initial sync failed:', error);
        return {
            success: false,
            totalAds: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    } finally {
        await scraper.close();
    }
}

function processAds(ads: any[], detectedPageId?: string): MetaAd[] {
    return ads.map((ad, index) => ({
        id: ad.id || `temp_${Date.now()}_${index}`,
        ad_snapshot_url: ad.ad_snapshot_url || '',
        page_id: ad.page_id || detectedPageId || 'unknown',
        page_name: ad.page_name || 'Unknown Page',
        ad_creative_body: ad.ad_creative_body || '',
        ad_creative_link_caption: ad.ad_creative_link_caption,
        ad_creative_link_description: ad.ad_creative_link_description,
        ad_creative_link_title: ad.ad_creative_link_title,
        ad_delivery_start_time: ad.ad_delivery_start_time || new Date().toISOString(),
        ad_delivery_stop_time: ad.ad_delivery_stop_time,
        ad_snapshot_img_url: ad.ad_snapshot_img_url || '',
        currency: ad.currency,
        spend: ad.spend,
        impressions: ad.impressions,
        demographic_data: ad.demographic_data || [],
        region_data: ad.region_data || [],
        is_active: ad.is_active !== undefined ? ad.is_active : true,
        last_active_time: ad.last_active_time,
        funding_entity: ad.funding_entity,
        byline: ad.byline,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));
}