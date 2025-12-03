import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { MetaAdScraper } from '../src/core/scraper';
import { AdStorage } from '../src/storage/adStorage';
import { validateAdStructure } from '../src/utils/helpers';

jest.setTimeout(30000);

describe('Meta Ads Library Scraper', () => {
    let scraper: MetaAdScraper;
    let storage: AdStorage;

    beforeEach(() => {
        scraper = new MetaAdScraper({
            headless: true,
            timeout: 10000
        });
        storage = new AdStorage('test-data');
    });

    afterEach(async () => {
        await scraper.close();
    });

    describe('Scraper Initialization', () => {
        it('should initialize scraper successfully', async () => {
            await expect(scraper.initialize()).resolves.not.toThrow();
        });

        it('should handle initialization errors', async () => {
            const invalidScraper = new MetaAdScraper({
                headless: true,
                timeout: 1000,
                executablePath: '/invalid/path/to/chrome'
            });

            try {
                const initPromise = invalidScraper.initialize();
                await expect(initPromise).rejects.toThrow();
            } finally {
                await invalidScraper.close();
            }
        });
    });

    describe('Ad Storage', () => {
        const testAd = {
            id: 'test-ad-123',
            pageId: 'test-page-456',
            pageName: 'Test Page',
            adCreativeBody: 'Test ad content',
            adSnapShotUrl: 'https://example.com/ad',
            adDeliveryStartTime: new Date().toISOString(),
            adSnapShotImgUrl: 'https://example.com/image.jpg',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        it('should save and retrieve ads', async () => {
            await storage.saveAds([testAd]);
            const retrievedAd = await storage.getAd(testAd.id, testAd.pageId);

            expect(retrievedAd).toBeTruthy();
            expect(retrievedAd?.id).toBe(testAd.id);
            expect(retrievedAd?.pageId).toBe(testAd.pageId);
        });

        it('should detect new and updated ads', async () => {
            const existingAds = [testAd];
            const newAd = {
                ...testAd,
                id: 'new-ad-789',
                adCreativeBody: 'New ad content'
            };
            const updatedAd = {
                ...testAd,
                adCreativeBody: 'Updated content'
            };

            const result = await storage.findNewAds(existingAds, [newAd, updatedAd]);

            expect(result.newAds).toHaveLength(1);
            expect(result.newAds[0].id).toBe('new-ad-789');
            expect(result.updatedAds).toHaveLength(1);
        });
    });

    describe('Data Structure Validation', () => {
        it('should validate ad data structure', () => {
            const minimalAd = {
                id: 'test-id',
                page_id: 'page-id',
                page_name: 'Page Name',
                ad_creative_body: 'Ad content',
                ad_snapshot_url: 'https://example.com',
                ad_delivery_start_time: new Date().toISOString(),
                ad_snapshot_img_url: 'https://example.com/image.jpg',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as any;

            // Test required fields
            const requiredFields = ['id', 'page_id', 'ad_creative_body', 'is_active'];

            requiredFields.forEach(field => {
                const invalidAd = { ...minimalAd };
                delete (invalidAd as any)[field];
                expect(() => validateAdStructure(invalidAd)).toThrow();
            });

            // Test valid ad
            expect(() => validateAdStructure(minimalAd)).not.toThrow();
        });
    });
});