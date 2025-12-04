import puppeteer, { Browser, Page, HTTPResponse } from 'puppeteer';
import { logger } from '../utils/logger';
import { GraphQLResponse, ScraperConfig } from './types';
import { delay } from '../utils/helpers';

export class MetaAdScraper {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private config: ScraperConfig;

    constructor(config: Partial<ScraperConfig> = {}) {
        this.config = {
            headless: 'new',
            timeout: 30000,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            viewport: { width: 1920, height: 1080 },
            maxRetries: 3,
            delayBetweenRequests: 1000,
            ...config
        };
    }

    async initialize(): Promise<void> {
        try {
            this.browser = await puppeteer.launch({
                // headless: this.config.headless,
                headless: "new",   // ✅ use the new headless mode
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920,1080'
                ],
                timeout: this.config.timeout,
            });
            // this.browser = await puppeteer.launch({
            //     headless: "new",   // ✅ use the new headless mode
            //     args: [
            //         "--no-sandbox",
            //         "--disable-setuid-sandbox",
            //     ],
            //     timeout: this.config.timeout,
            // });

            this.page = await this.browser.newPage();
            await this.page.setUserAgent(this.config.userAgent);
            await this.page.setViewport(this.config.viewport);

            // Set up request interception for GraphQL responses
            await this.page.setRequestInterception(true);

            this.page.on('request', (request) => {
                request.continue();
            });

            logger.info('Scraper initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize scraper:', error);
            throw error;
        }
    }

    async scrapeAdsFromUrl(url: string, maxAds?: number): Promise<GraphQLResponse[]> {
        if (!this.page) {
            await this.initialize();
        }

        if (!this.page) {
            throw new Error('Failed to initialize page');
        }

        const responses: GraphQLResponse[] = [];
        let adsCollected = 0;

        try {
            // Navigate to the page
            await this.page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: this.config.timeout
            });

            // Wait for the page to load ads
            await delay(5000);

            // Set up response listener for GraphQL calls
            this.page.on('response', async (response: HTTPResponse) => {
                try {
                    const request = response.request();
                    const url = request.url();

                    if (url.includes('graphql') && request.method() === 'POST') {
                        const postData = request.postData();
                        if (postData && postData.includes('AdsLibraryQuery')) {
                            const responseData = await response.json() as GraphQLResponse;

                            if (responseData?.data?.page?.ads?.edges) {
                                responses.push(responseData);
                                adsCollected += responseData.data.page.ads.edges.length;

                                logger.info(`Collected ${adsCollected} ads so far...`);

                                // Stop if we've reached the max
                                if (maxAds && adsCollected >= maxAds) {
                                    // We'll handle this in the main logic
                                }
                            }
                        }
                    }
                } catch (error) {
                    logger.debug('Error processing response:', error);
                }
            });

            // Scroll to load more ads
            let previousHeight = 0;
            let scrollAttempts = 0;
            const maxScrollAttempts = 50;

            while (scrollAttempts < maxScrollAttempts) {
                if (maxAds && adsCollected >= maxAds) {
                    break;
                }

                // Scroll down
                await this.page?.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                await delay(2000);

                // Check if we've reached the bottom or no new content
                const newHeight = await this.page.evaluate(() => document.body.scrollHeight);

                if (newHeight === previousHeight) {
                    scrollAttempts++;
                    if (scrollAttempts >= 3) {
                        break;
                    }
                } else {
                    scrollAttempts = 0;
                    previousHeight = newHeight;
                }

                // Check for "Show more" button and click it
                const showMoreButton = await this.page.$('div[role="button"][tabindex="0"]');
                if (showMoreButton) {
                    try {
                        await showMoreButton.click();
                        await delay(3000);
                    } catch (error) {
                        logger.debug('Could not click show more button:', error);
                    }
                }
            }

            logger.info(`Finished scraping. Total ads collected: ${adsCollected}`);
            return responses;

        } catch (error) {
            logger.error('Error scraping ads:', error);
            throw error;
        }
    }

    async extractAdsFromResponses(responses: GraphQLResponse[], maxAds?: number): Promise<any[]> {
        const allAds: any[] = [];

        for (const response of responses) {
            if (response?.data?.page?.ads?.edges) {
                for (const edge of response.data.page.ads.edges) {
                    if (maxAds && allAds.length >= maxAds) {
                        break;
                    }
                    allAds.push(edge.node);
                }
            }

            if (maxAds && allAds.length >= maxAds) {
                break;
            }
        }

        return allAds.slice(0, maxAds);
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
            logger.info('Scraper closed');
        }
    }

    async safeScrape<T>(operation: () => Promise<T>, retries = this.config.maxRetries): Promise<T> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                logger.warn(`Attempt ${attempt} failed:`, error);

                if (attempt === retries) {
                    throw error;
                }

                await delay(this.config.delayBetweenRequests * attempt);

                // Reinitialize browser if needed
                if ((error as Error).message.includes('Session closed') ||
                    (error as Error).message.includes('Target closed')) {
                    await this.close();
                    await this.initialize();
                }
            }
        }

        throw new Error('Max retries reached');
    }
}