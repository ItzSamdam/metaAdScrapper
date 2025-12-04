import { MetaAd, PageSyncStatus } from '../core/types';
import { FileManager } from './fileManager';
import { logger } from '../utils/logger';

export class AdStorage {
    private fileManager: FileManager;

    constructor(dataDir?: string) {
        this.fileManager = new FileManager(dataDir);
    }

    async saveAds(ads: MetaAd[]): Promise<void> {
        for (const ad of ads) {
            await this.fileManager.updateAd(ad);
        }
        logger.info(`Saved/updated ${ads.length} ads`);
    }

    async getPageAds(pageId: string): Promise<MetaAd[]> {
        return this.fileManager.getAllAds(pageId);
    }

    async getAd(adId: string, pageId: string): Promise<MetaAd | null> {
        return this.fileManager.getAd(adId, pageId);
    }

    async updateSyncStatus(pageId: string, totalAds: number, lastAdId?: string): Promise<void> {
        const status: PageSyncStatus = {
            pageId: pageId,
            lastSynced: new Date().toISOString(),
            totalAds: totalAds,
            lastAdId: lastAdId
        };

        await this.fileManager.saveSyncStatus(status);
    }

    async getSyncStatus(pageId: string): Promise<PageSyncStatus | null> {
        return this.fileManager.getSyncStatus(pageId);
    }

    async findNewAds(existingAds: MetaAd[], fetchedAds: MetaAd[]): Promise<{
        newAds: MetaAd[];
        updatedAds: MetaAd[];
    }> {
        const existingMap = new Map(existingAds.map(ad => [ad.id, ad]));
        const newAds: MetaAd[] = [];
        const updatedAds: MetaAd[] = [];

        for (const fetchedAd of fetchedAds) {
            const existingAd = existingMap.get(fetchedAd.id);

            if (!existingAd) {
                newAds.push(fetchedAd);
            } else {
                // Check if ad needs to be updated
                if (this.hasAdChanged(existingAd, fetchedAd)) {
                    updatedAds.push(fetchedAd);
                }
            }
        }

        return { newAds, updatedAds };
    }

    // private hasAdChanged(oldAd: MetaAd, newAd: MetaAd): boolean {
    //     // Compare important fields that might change
    //     const fieldsToCompare = [
    //         'is_active',
    //         'ad_delivery_stop_time',
    //         'ad_creative_body',
    //         'spend',
    //         'impressions',
    //         'demographic_data',
    //         'region_data'
    //     ];

    //     return fieldsToCompare.some(field => {
    //         const oldValue = JSON.stringify((oldAd as any)[field]);
    //         const newValue = JSON.stringify((newAd as any)[field]);
    //         return oldValue !== newValue;
    //     });
    // }

    private hasAdChanged(oldAd: MetaAd, newAd: MetaAd): boolean {
        // Compare important fields that might change
        const fieldsToCompare = [
            'is_active',
            'ad_delivery_stop_time',
            'ad_creative_body',
            'ad_creative_link_title',
            'ad_creative_link_description',
            'ad_creative_link_caption',
            'spend',
            'impressions',
            'demographic_data',
            'region_data',
            'funding_entity',
            'byline',
            'last_active_time'
        ];

        for (const field of fieldsToCompare) {
            const oldValue = oldAd[field as keyof MetaAd];
            const newValue = newAd[field as keyof MetaAd];

            // Handle nested objects
            const oldValueStr = oldValue ? JSON.stringify(oldValue) : 'null';
            const newValueStr = newValue ? JSON.stringify(newValue) : 'null';

            if (oldValueStr !== newValueStr) {
                return true;
            }
        }

        return false;
    }
}