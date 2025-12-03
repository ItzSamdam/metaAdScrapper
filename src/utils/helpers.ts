export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function extractPageIdFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const searchParams = new URLSearchParams(urlObj.search);
        const viewAllParam = searchParams.get('view_all_page_id');
        return viewAllParam || null;
    } catch {
        return null;
    }
}

export function validateAdStructure(ad: any): void {
    const requiredFields = [
        'id', 'page_id', 'page_name', 'ad_creative_body',
        'ad_snapshot_url', 'ad_delivery_start_time',
        'ad_snapshot_img_url', 'is_active'
    ];

    requiredFields.forEach(field => {
        if (!ad[field] && ad[field] !== false) {
            throw new Error(`Missing required field: ${field}`);
        }
    });

    // Type validation
    if (typeof ad.id !== 'string') throw new Error('id must be string');
    if (typeof ad.page_id !== 'string') throw new Error('page_id must be string');
    if (typeof ad.is_active !== 'boolean') throw new Error('is_active must be boolean');
}