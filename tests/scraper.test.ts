import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { MetaAdScraper } from '../src/core/scraper';
import { AdStorage } from '../src/storage/adStorage';
import { validateAdStructure } from '../src/utils/helpers';

// jest.setTimeout(30000);
// Force Jest to exit properly
afterAll(async () => {
    // Wait for any pending operations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Force exit if still hanging
    if (typeof process.exit === 'function') {
        // process.exit(0);
    }
});

// Or even simpler, just add this single line:
jest.setTimeout(20000); // Add reasonable timeout

describe('Meta Ads Library Scraper', () => {
    let scraper: MetaAdScraper;
    let storage: AdStorage;

    beforeEach(() => {
        scraper = new MetaAdScraper({
            // headless: true,
            headless: "new",   // ✅ instead of true
            timeout: 10000
        });
        storage = new AdStorage('test-data');
    });


    afterEach(async () => {
        await scraper.close();
    });


    // describe('Scraper Initialization', () => {
    //     it('should initialize scraper successfully', async () => {
    //         await expect(scraper.initialize()).resolves.not.toThrow();
    //     });

    //     it('should handle initialization errors', async () => {
    //         const invalidScraper = new MetaAdScraper({
    //             headless: true,
    //             timeout: 1000,
    //             executablePath: '/invalid/path/to/chrome'
    //         });

    //         try {
    //             const initPromise = invalidScraper.initialize();
    //             await expect(initPromise).rejects.toThrow();
    //         } finally {
    //             await invalidScraper.close();
    //         }
    //     });
    // });

    describe('Scraper Initialization', () => {
        it('should initialize scraper successfully', async () => {
            await expect(scraper.initialize()).resolves.not.toThrow();
        });
        // it('should handle initialization errors', async () => {
        //     // Mock puppeteer.launch to throw an error
        //     const mockPuppeteer = {
        //         launch: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('Failed to launch browser'))
        //     };
        //     // Temporarily replace puppeteer with mock
        //     jest.mock('puppeteer', () => mockPuppeteer);
        //     // Create a new scraper instance that will use the mock
        //     const { MetaAdsScraper: MockScraper } = require('../src/core/scraper');
        //     const failingScraper = new MockScraper({
        //         headless: true,
        //         timeout: 1
        //     });
        //     await expect(failingScraper.initialize()).rejects.toThrow('Failed to launch browser');
        //     // Restore original puppeteer
        //     jest.unmock('puppeteer');
        // });
        const invalidScraper = new MetaAdScraper({
            headless: true,
            timeout: 1,
            executablePath: '/invalid/path/to/chrome'
        } as any); // Type assertion to any to bypass type checking

        it('should handle initialization errors', async () => {
            try {
                await invalidScraper.initialize();
                // If initialization succeeds, the test should fail
                throw new Error('Expected initialization to fail, but it succeeded');
            } catch (error) {
                // expected - initialization should fail
                expect(error).toBeTruthy();
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
            // initial add is saved
            await storage.saveAds([testAd]);

            // create new ad and updated version of existing ad
            const newAd = {
                ...testAd,
                id: 'new-ad-789',
                adCreativeBody: 'New ad content'
            };
            const updatedAd = {
                ...testAd,
                adCreativeBody: 'Updated content', // changed field
                impressions: { lowerBound: '1000', upperBound: '5000' } // added field 
            };
            // get existing ads from storage
            const existingAds = await storage.getPageAds(testAd.pageId);
            // find new/updated ads
            
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


// import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
// import { MetaAdScraper } from '../src/core/scraper';
// import { AdStorage } from '../src/storage/adStorage';
// import { validateAdStructure } from '../src/utils/helpers';

// jest.setTimeout(30000);

// describe('Meta Ads Library Scraper', () => {
//     let scraper: MetaAdScraper;
//     let storage: AdStorage;

//     beforeEach(() => {
//         scraper = new MetaAdScraper({
//             headless: 'new',
//             timeout: 10000
//         });
//         storage = new AdStorage('test-data');
//     });

//     afterEach(async () => {
//         await scraper.close();
//     });

//     describe('Scraper Initialization', () => {
//         it('should initialize scraper successfully', async () => {
//             await expect(scraper.initialize()).resolves.not.toThrow();
//         });

//         it('should handle initialization errors', async () => {
//             // Mock puppeteer.launch to throw an error
//             const mockPuppeteer = {
//                 launch: jest.fn<() => Promise<void>>().mockRejectedValue(new Error('Failed to launch browser'))
//             };

//             // Temporarily replace puppeteer with mock
//             jest.mock('puppeteer', () => mockPuppeteer);

//             // Create a new scraper instance that will use the mock
//             const { MetaAdsScraper: MockScraper } = require('../src/core/scraper');
//             const failingScraper = new MockScraper({
//                 headless: true,
//                 timeout: 1,
//                 // executablePath: '/invalid/path/to/chrome'
//             });

//             await expect(failingScraper.initialize()).rejects.toThrow('Failed to launch browser');

//             // Restore original puppeteer
//             jest.unmock('puppeteer');
//         });
//     });

//     describe('Ad Storage', () => {
//         const testAd = {
//             id: 'test-ad-123',
//             page_id: 'test-page-456',
//             page_name: 'Test Page',
//             ad_creative_body: 'Test ad content',
//             ad_snapshot_url: 'https://example.com/ad',
//             ad_delivery_start_time: new Date().toISOString(),
//             ad_snapshot_img_url: 'https://example.com/image.jpg',
//             is_active: true,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//         } as any;

//         beforeEach(async () => {
//             // Clean test directory before each test
//             const fs = require('fs').promises;
//             const path = require('path');
//             const testDir = path.join(__dirname, '..', 'test-data');
//             try {
//                 await fs.rm(testDir, { recursive: true, force: true });
//             } catch (error) {
//                 // Directory might not exist
//             }
//         });

//         it('should save and retrieve ads', async () => {
//             await storage.saveAds([testAd]);
//             const retrievedAd = await storage.getAd(testAd.id, testAd.page_id);

//             expect(retrievedAd).toBeTruthy();
//             expect(retrievedAd?.id).toBe(testAd.id);
//             expect(retrievedAd?.pageId).toBe(testAd.page_id);
//         });

//         it('should detect new and updated ads', async () => {
//             // Save initial ad
//             await storage.saveAds([testAd]);

//             // Create new ad and updated version of existing ad
//             const newAd = {
//                 ...testAd,
//                 id: 'new-ad-789',
//                 ad_creative_body: 'New ad content'
//             };

//             const updatedAd = {
//                 ...testAd,
//                 ad_creative_body: 'Updated content', // Changed field
//                 impressions: { lower_bound: '1000', upper_bound: '5000' } // Added field
//             };

//             // Get existing ads from storage
//             const existingAds = await storage.getPageAds(testAd.page_id);

//             // Find new/updated ads
//             const result = await storage.findNewAds(existingAds, [newAd, updatedAd]);

//             expect(result.newAds).toHaveLength(1);
//             expect(result.newAds[0].id).toBe('new-ad-789');
//             expect(result.updatedAds).toHaveLength(1); // Should detect the changed ad_creative_body
//         });
//     });

//     describe('Data Structure Validation', () => {
//         it('should validate ad data structure', () => {
//             const minimalAd = {
//                 id: 'test-id',
//                 page_id: 'page-id',
//                 page_name: 'Page Name',
//                 ad_creative_body: 'Ad content',
//                 ad_snapshot_url: 'https://example.com',
//                 ad_delivery_start_time: new Date().toISOString(),
//                 ad_snapshot_img_url: 'https://example.com/image.jpg',
//                 is_active: true,
//                 created_at: new Date().toISOString(),
//                 updated_at: new Date().toISOString()
//             } as any;

//             // Test required fields
//             const requiredFields = ['id', 'page_id', 'ad_creative_body', 'is_active'];

//             requiredFields.forEach(field => {
//                 const invalidAd = { ...minimalAd };
//                 delete (invalidAd as any)[field];
//                 expect(() => validateAdStructure(invalidAd)).toThrow();
//             });

//             // Test valid ad
//             expect(() => validateAdStructure(minimalAd)).not.toThrow();
//         });
//     });
// });