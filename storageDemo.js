// Demo showing storage features WITHOUT actual Facebook scraping
const { AdStorage } = require('./dist');
const fs = require('fs');
const path = require('path');

class StorageDemo {
    constructor() {
        this.demoPageId = 'demo-page-123';
        this.demoDataDir = path.join(__dirname, 'demo-data');

        console.log('Demo data directory:', this.demoDataDir);

        // Create demo directory if it doesn't exist
        if (!fs.existsSync(this.demoDataDir)) {
            fs.mkdirSync(this.demoDataDir, { recursive: true });
        }

        this.storage = new AdStorage(this.demoDataDir);
        console.log('Storage created:', this.storage);
    }

    async printHeader(title) {
        console.log('\n' + '='.repeat(60));
        console.log(`🎯 ${title}`);
        console.log('='.repeat(60));
    }

    async demoFeature1_AdStorage() {
        await this.printHeader('FEATURE 1: AD STORAGE SYSTEM');

        console.log('\n📁 1.1 - Saving ads to organized JSON files');
        const testAds = [
            {
                id: 'demo-ad-001',
                page_id: this.demoPageId,
                page_name: 'Demo Business Page',
                ad_creative_body: 'This is our latest product ad',
                ad_snapshot_url: 'https://facebook.com/ads/library/?id=demo001',
                ad_delivery_start_time: new Date().toISOString(),
                ad_snapshot_img_url: 'https://example.com/demo1.jpg',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 'demo-ad-002',
                page_id: this.demoPageId,
                page_name: 'Demo Business Page',
                ad_creative_body: 'Limited time offer! 50% off',
                ad_snapshot_url: 'https://facebook.com/ads/library/?id=demo002',
                ad_delivery_start_time: new Date(Date.now() - 86400000).toISOString(),
                ad_snapshot_img_url: 'https://example.com/demo2.jpg',
                is_active: false,
                ad_delivery_stop_time: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        console.log('Test ads:', JSON.stringify(testAds, null, 2));

        await this.storage.saveAds(testAds);
        console.log('✅ Saved 2 demo ads to: demo-data/pages/demo-page-123/');
        console.log('   - Each ad saved as separate JSON file');
        console.log('   - Organized by page_id folder structure');

        console.log('\n📁 1.2 - Retrieving stored ads');
        const retrievedAd = await this.storage.getAd('demo-ad-001', 'demo-page-123');
        console.log(`✅ Retrieved ad: "${retrievedAd?.ad_creative_body?.substring(0, 30)}..."`);
        console.log(`   Status: ${retrievedAd?.is_active ? 'Active' : 'Inactive'}`);

        console.log('\n📁 1.3 - Getting all ads for a page');
        const allAds = await this.storage.getPageAds('demo-page-123');
        console.log(`✅ Found ${allAds.length} ads for demo-page-123`);
        console.log(`   Active: ${allAds.filter(a => a.is_active).length}`);
        console.log(`   Inactive: ${allAds.filter(a => !a.is_active).length}`);

        console.log('\n📁 1.4 - Sync status tracking');
        await this.storage.updateSyncStatus('demo-page-123', allAds.length, 'demo-ad-002');
        const syncStatus = await this.storage.getSyncStatus('demo-page-123');
        console.log('✅ Sync status saved:');
        console.log(`   Last synced: ${new Date(syncStatus?.last_synced).toLocaleTimeString()}`);
        console.log(`   Total ads: ${syncStatus?.total_ads}`);
        console.log(`   Last ad ID: ${syncStatus?.last_ad_id}`);
    }

    async demoFeature2_ChangeDetection() {
        await this.printHeader('FEATURE 2: SMART CHANGE DETECTION');

        const existingAds = await this.storage.getPageAds('demo-page-123');

        const newAds = [
            {
                id: 'demo-ad-003',
                page_id: 'demo-page-123',
                page_name: 'Demo Business Page',
                ad_creative_body: 'Brand new ad campaign',
                ad_snapshot_url: 'https://facebook.com/ads/library/?id=demo003',
                ad_delivery_start_time: new Date().toISOString(),
                ad_snapshot_img_url: 'https://example.com/demo3.jpg',
                is_active: true
            },
            {
                id: 'demo-ad-001',
                page_id: 'demo-page-123',
                page_name: 'Demo Business Page',
                ad_creative_body: 'UPDATED: This is our latest product ad with changes',
                ad_snapshot_url: 'https://facebook.com/ads/library/?id=demo001',
                ad_delivery_start_time: new Date().toISOString(),
                ad_snapshot_img_url: 'https://example.com/demo1.jpg',
                is_active: false,
                ad_delivery_stop_time: new Date().toISOString()
            }
        ];

        const { newAds: detectedNew, updatedAds: detectedUpdated } =
            await this.storage.findNewAds(existingAds, newAds);

        console.log('\n🔍 Detecting changes in ads:');
        console.log(`✅ New ads detected: ${detectedNew.length} (demo-ad-003)`);
        console.log(`✅ Updated ads detected: ${detectedUpdated.length} (demo-ad-001)`);

        if (detectedUpdated.length > 0) {
            console.log('\n📝 Change details for demo-ad-001:');
            console.log('   - Text content was modified');
            console.log('   - Status changed: Active → Inactive');
            console.log('   - Stop time was added');
        }

        await this.storage.saveAds(newAds);
        console.log('\n💾 Changes saved to storage');
    }

    async demoFeature3_ErrorHandling() {
        await this.printHeader('FEATURE 3: FILE SYSTEM ERROR HANDLING');

        console.log('\n🛡️  Testing file system error handling:');
        try {
            const nonExistent = await this.storage.getAd('non-existent', 'non-existent');
            console.log(`✅ Gracefully handled: ${nonExistent === null ? 'Returned null for non-existent ad' : 'Unexpected'}`);
        } catch (error) {
            console.log(`❌ Unexpected error: ${error.message}`);
        }
    }

    async showDataStructure() {
        await this.printHeader('DATA DIRECTORY STRUCTURE');

        console.log('\n📂 Project structure created:');
        console.log('meta-ads-scraper/');
        console.log('├── demo-data/              # Demo storage location');
        console.log('│   ├── pages/             # Ads organized by page');
        console.log('│   │   └── demo-page-123/');
        console.log('│   │       ├── demo-ad-001.json');
        console.log('│   │       ├── demo-ad-002.json');
        console.log('│   │       └── demo-ad-003.json');
        console.log('│   └── sync/              # Sync metadata');
        console.log('│       └── demo-page-123.json');
        console.log('');
        console.log('Production structure:');
        console.log('├── data/                  # Production storage');
        console.log('│   ├── pages/');
        console.log('│   │   └── [page_id]/');
        console.log('│   │       └── [ad_id].json');
        console.log('│   └── sync/');
        console.log('│       └── [page_id].json');
    }

    async runDemo() {
        console.log('🚀 META ADS LIBRARY SCRAPER - STORAGE DEMO');
        console.log('='.repeat(60));
        console.log('\nThis demo showcases storage features only (NO Facebook scraping):');

        try {
            await this.demoFeature1_AdStorage();
            await this.demoFeature2_ChangeDetection();
            await this.demoFeature3_ErrorHandling();
            await this.showDataStructure();

            console.log('\n' + '='.repeat(60));
            console.log('🎉 STORAGE DEMO COMPLETED SUCCESSFULLY!');
            console.log('='.repeat(60));

            console.log('\n📋 FEATURES DEMONSTRATED:');
            console.log('✅ 1. Saving ads to organized JSON files');
            console.log('✅ 2. Retrieving individual ads');
            console.log('✅ 3. Getting all ads for a page');
            console.log('✅ 4. Sync status tracking');
            console.log('✅ 5. Smart change detection');
            console.log('✅ 6. Error handling');

            console.log('\n🚀 Next steps:');
            console.log('1. Check the demo-data/ folder to see created files');
            console.log('2. Run demo-with-facebook.js to test actual scraping');

        } catch (error) {
            console.error('\n❌ Demo failed:', error);
        }
    }
}

// Run the demo
const demo = new StorageDemo();
demo.runDemo().catch(console.error);