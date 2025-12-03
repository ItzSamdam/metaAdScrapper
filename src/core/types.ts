interface MetaAd {
    id: string;
    adSnapShotUrl: string;
    pageId: string;
    pageName: string;
    adCreativeBody: string;
    adCreativeLinkCaption?: string;
    adCreativeLinkDescription?: string;
    adCreativeLinkTitle?: string;
    adDeliveryStartTime: string;
    adDeliveryStopTime?: string;
    adSnapShotImgUrl?: string;
    currency?: string;
    spend?: {
        lowerBound: string;
        upperBound: string;
    };
    impressions?: {
        lowerBound: string;
        upperBound: string;
    };
    demographics?: DemographicData[];
    regionData?: RegionData[];
    isActive: boolean;
    lastActiveTime?: string;
    fundingEntity?: string;
    byline?: string;
    createdAt: string;
    updatedAt: string;
}

interface DemographicData {
    age: string;
    gender: string;
    percentage: number;
}

interface RegionData {
    region: string;
    percentage: number;
}

interface PageSyncStatus {
    pageId: string;
    lastSynced: string;
    totalAds: number;
    lastAdId?: string;
    syncToken?: string;
}

interface ScraperConfig {
    headless: boolean | 'new';
    timeout: number;
    userAgent: string;
    viewport: {
        width: number;
        height: number
    };
    maxRetries: number;
    delayBetweenRequests: number;
    executablePath?: string;
}

interface GraphQLResponse {
    data: {
        page: {
            ads: {
                edges: Array<{
                    node: MetaAd;
                    cursor: string;
                }>;
                page_info: {
                    has_next_page: boolean;
                    end_cursor: string;
                };
            };
        };
    };
}

export {
    MetaAd,
    DemographicData,
    RegionData,
    PageSyncStatus,
    ScraperConfig,
    GraphQLResponse
}