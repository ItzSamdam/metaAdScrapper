// Demo with ACTUAL Facebook scraping (requires internet connection)
const { initialSync, incrementalSync, MetaAdScraper } = require('./dist');
const path = require('path');

class FacebookScrapingDemo {
    constructor() {
        this.demoPageId = null; // Will be set after first sync
        this.dataDir = path.join(__dirname, 'data'); // Production data directory
    }

    async printHeader(title) {
        console.log('\n' + '='.repeat(60));
        console.log(`🎯 ${title}`);
        console.log('='.repeat(60));
    }

    async demoFeature1_InitialSync() {
        await this.printHeader('FEATURE 1: INITIAL SYNC FROM FACEBOOK');

        // CNN's Facebook page as example
        const facebookUrl = 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&view_all_page_id=282592881929497';

        console.log('\n🌐 Configuration:');
        console.log(`   URL: ${facebookUrl}`);
        console.log('   Max ads to fetch: 5 (for demo purposes)');
        console.log('   Headless mode: true');
        console.log('   Timeout: 30 seconds');

        console.log('\n🚀 Starting initial sync...');
        console.log('   (This may take 10-30 seconds)');

        try {
            const result = await initialSync(facebookUrl, 5, {
                headless: true,
                timeout: 30000,
                maxRetries: 3,
                delayBetweenRequests: 2000
            });

            if (result.success) {
                this.demoPageId = result.pageId;
                console.log('\n✅ Initial sync successful!');
                console.log(`   Page ID: ${result.pageId}`);
                console.log(`   Ads fetched: ${result.totalAds}`);
                console.log(`   Data saved to: data/pages/${result.pageId}/`);
                console.log(`   Sync status: data/sync/${result.pageId}.json`);
            } else {
                console.log(`\n❌ Initial sync failed: ${result.error}`);
            }
        } catch (error) {
            console.error(`\n❌ Error during initial sync:`, error.message);
        }
    }

    async demoFeature2_IncrementalSync() {
        await this.printHeader('FEATURE 2: INCREMENTAL SYNC');

        if (!this.demoPageId) {
            console.log('\n⚠️  Skipping incremental sync - no page ID available');
            console.log('   Run initial sync first to get a page ID');
            return;
        }

        console.log('\n🔄 Purpose:');
        console.log('   - Only fetches new/updated ads since last sync');
        console.log('   - Updates is_active status and end dates');
        console.log('   - Much faster than re-fetching everything');

        console.log(`\n🚀 Running incremental sync for page: ${this.demoPageId}`);
        console.log('   (This may take 10-30 seconds)');

        try {
            const result = await incrementalSync(this.demoPageId, {
                headless: true,
                timeout: 30000,
                maxRetries: 3
            });

            if (result.success) {
                console.log('\n✅ Incremental sync successful!');
                console.log(`   New ads: ${result.newAds}`);
                console.log(`   Updated ads: ${result.updatedAds}`);
                console.log(`   Total ads now: ${result.totalAds}`);
                console.log(`   Last synced: ${new Date(result.lastSynced).toLocaleString()}`);
            } else {
                console.log(`\n❌ Incremental sync failed: ${result.error}`);
            }
        } catch (error) {
            console.error(`\n❌ Error during incremental sync:`, error.message);
        }
    }

    async demoFeature3_ScraperErrorHandling() {
        await this.printHeader('FEATURE 3: SCRAPER ERROR HANDLING');

        console.log('\n🛡️  Testing scraper with invalid URL:');

        const scraper = new MetaAdScraper({
            timeout: 5000,
            maxRetries: 2
        });

        try {
            await scraper.initialize();
            console.log('   Scraper initialized');

            // This should fail gracefully
            const result = await scraper.safeScrape(async () => {
                throw new Error('Simulated network error');
            });

            console.log('   ⚠️  Error was caught and handled gracefully');
        } catch (error) {
            console.log(`   ✅ Error caught: ${error.message}`);
        } finally {
            await scraper.close();
            console.log('   Scraper closed properly');
        }
    }

    async showUsageExamples() {
        await this.printHeader('REAL-WORLD USAGE EXAMPLES');

        console.log('\n📈 Example 1: Monitor a political campaign');
        console.log('```javascript');
        console.log('// Day 1 - Initial setup');
        console.log('const result = await initialSync(campaignPageUrl, 1000);');
        console.log('console.log(`Fetched ${result.totalAds} historical ads`);');
        console.log('');
        console.log('// Daily - Automated updates (via cron job)');
        console.log('setInterval(async () => {');
        console.log('  const updates = await incrementalSync(pageId);');
        console.log('  console.log(`New today: ${updates.newAds} ads`);');
        console.log('}, 24 * 60 * 60 * 1000);');
        console.log('```');

        console.log('\n📊 Example 2: Compare competitor ads');
        console.log('```javascript');
        console.log('// Sync multiple competitors');
        console.log('const competitors = [');
        console.log('  "competitor1_url",');
        console.log('  "competitor2_url",');
        console.log('  "competitor3_url"');
        console.log('];');
        console.log('');
        console.log('for (const url of competitors) {');
        console.log('  await initialSync(url, 100);');
        console.log('}');
        console.log('');
        console.log('// Analyze all stored ads');
        console.log('const storage = new AdStorage();');
        console.log('// Implement your analysis logic');
        console.log('```');

        console.log('\n🔄 Example 3: Scheduled monitoring with Node-Cron');
        console.log('```javascript');
        console.log('const cron = require("node-cron");');
        console.log('');
        console.log('// Run every day at 2 AM');
        console.log('cron.schedule("0 2 * * *", async () => {');
        console.log('  console.log("Starting daily sync...");');
        console.log('  await incrementalSync(pageId);');
        console.log('  console.log("Daily sync completed");');
        console.log('});');
        console.log('```');
    }

    async runDemo() {
        console.log('🚀 META ADS LIBRARY SCRAPER - FACEBOOK SCRAPING DEMO');
        console.log('='.repeat(60));
        console.log('\n⚠️  IMPORTANT: This demo will scrape REAL data from Facebook');
        console.log('   - Requires internet connection');
        console.log('   - May take 10-30 seconds per sync');
        console.log('   - Data will be saved to data/ directory');
        console.log('');

        try {
            await this.demoFeature1_InitialSync();
            await this.demoFeature2_IncrementalSync();
            await this.demoFeature3_ScraperErrorHandling();
            await this.showUsageExamples();

            console.log('\n' + '='.repeat(60));
            console.log('🎉 FACEBOOK SCRAPING DEMO COMPLETED!');
            console.log('='.repeat(60));

            console.log('\n📋 FEATURES DEMONSTRATED:');
            console.log('✅ 1. Initial sync from Facebook Ads Library');
            console.log('✅ 2. Incremental sync for updates');
            console.log('✅ 3. Robust error handling');
            console.log('✅ 4. Real-world usage patterns');

            console.log('\n📁 Check these directories:');
            console.log(`   - data/pages/${this.demoPageId || '[page-id]'}/ - Ad JSON files`);
            console.log(`   - data/sync/${this.demoPageId || '[page-id]'}.json - Sync metadata`);
            console.log('   - logs/ - Detailed scraping logs');

            console.log('\n🔧 Customize the scraper:');
            console.log('1. Change the Facebook URL to any page you want to monitor');
            console.log('2. Adjust maxAds limit (5 for demo, 1000+ for production)');
            console.log('3. Configure timeout and retry settings');
            console.log('4. Set up automated scheduling with cron');

        } catch (error) {
            console.error('\n❌ Demo failed:', error);
        }
    }
}

// Run the demo
console.log('\n⏳ Preparing to scrape Facebook Ads Library...\n');

const demo = new FacebookScrapingDemo();
demo.runDemo().catch(console.error);