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
        const processedAds = processAds(ads, pageId || undefined);
        await storage.saveAds(processedAds);

        // Update sync status
        const detectedPageId = processedAds[0]?.pageId || pageId;
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
            pageId: detectedPageId || undefined
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
        adSnapShotUrl: ad.ad_snapshot_url || '',
        pageId: ad.page_id || detectedPageId || 'unknown',
        pageName: ad.page_name || 'Unknown Page',
        adCreativeBody: ad.ad_creative_body || '',
        adCreativeLinkCaption: ad.ad_creative_link_caption,
        adCreativeLinkDescription: ad.ad_creative_link_description,
        adCreativeLinkTitle: ad.ad_creative_link_title,
        adDeliveryStartTime: ad.ad_delivery_start_time || new Date().toISOString(),
        adDeliveryStopTime: ad.ad_delivery_stop_time,
        adSnapshotImgUrl: ad.ad_snapshot_img_url || '',
        currency: ad.currency,
        spend: ad.spend,
        impressions: ad.impressions,
        demographicData: ad.demographic_data || [],
        regionData: ad.region_data || [],
        isActive: ad.is_active !== undefined ? ad.is_active : true,
        lastActiveTime: ad.last_active_time,
        fundingEntity: ad.funding_entity,
        byline: ad.byline,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }));
}