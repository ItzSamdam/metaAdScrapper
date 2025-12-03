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
    adSnapShotImgUrl: string;
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

export {
    MetaAd,
    DemographicData,
    RegionData,
    PageSyncStatus
}