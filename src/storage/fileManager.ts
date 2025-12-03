import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { MetaAd, PageSyncStatus } from '../core/types';

export class FileManager {
    private dataDir: string;

    constructor(dataDir = 'data') {
        this.dataDir = dataDir;
    }

    async ensureDirectory(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            logger.error(`Error creating directory ${dirPath}:`, error);
            throw error;
        }
    }

    async saveAd(ad: MetaAd): Promise<void> {
        try {
            const pageDir = path.join(this.dataDir, 'pages', ad.pageId);
            await this.ensureDirectory(pageDir);

            const filePath = path.join(pageDir, `${ad.id}.json`);
            const adData = {
                ...ad,
                _synced_at: new Date().toISOString()
            };

            await fs.writeFile(filePath, JSON.stringify(adData, null, 2), 'utf-8');
            logger.debug(`Saved ad ${ad.id} to ${filePath}`);
        } catch (error) {
            logger.error(`Error saving ad ${ad.id}:`, error);
            throw error;
        }
    }

    async getAd(adId: string, pageId: string): Promise<MetaAd | null> {
        try {
            const filePath = path.join(this.dataDir, 'pages', pageId, `${adId}.json`);
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    async getAllAds(pageId: string): Promise<MetaAd[]> {
        try {
            const pageDir = path.join(this.dataDir, 'pages', pageId);

            try {
                await fs.access(pageDir);
            } catch {
                return [];
            }

            const files = await fs.readdir(pageDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            const ads: MetaAd[] = [];
            for (const file of jsonFiles) {
                try {
                    const data = await fs.readFile(path.join(pageDir, file), 'utf-8');
                    ads.push(JSON.parse(data));
                } catch (error) {
                    logger.warn(`Error reading ad file ${file}:`, error);
                }
            }

            return ads;
        } catch (error) {
            logger.error(`Error getting ads for page ${pageId}:`, error);
            throw error;
        }
    }

    async saveSyncStatus(status: PageSyncStatus): Promise<void> {
        try {
            await this.ensureDirectory(path.join(this.dataDir, 'sync'));

            const filePath = path.join(this.dataDir, 'sync', `${status.pageId}.json`);
            await fs.writeFile(filePath, JSON.stringify(status, null, 2), 'utf-8');
        } catch (error) {
            logger.error(`Error saving sync status for ${status.pageId}:`, error);
            throw error;
        }
    }

    async getSyncStatus(pageId: string): Promise<PageSyncStatus | null> {
        try {
            const filePath = path.join(this.dataDir, 'sync', `${pageId}.json`);
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    async updateAd(ad: MetaAd): Promise<void> {
        const existingAd = await this.getAd(ad.id, ad.pageId);

        if (existingAd) {
            // Merge with existing data, preserving some fields
            const updatedAd = {
                ...existingAd,
                ...ad,
                created_at: existingAd.createdAt, // Preserve original creation date
                updated_at: new Date().toISOString()
            };

            await this.saveAd(updatedAd);
        } else {
            await this.saveAd({
                ...ad,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    }

    async deleteAd(adId: string, pageId: string): Promise<void> {
        try {
            const filePath = path.join(this.dataDir, 'pages', pageId, `${adId}.json`);
            await fs.unlink(filePath);
            logger.info(`Deleted ad ${adId}`);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }
}