# Meta Ad Library Scraper

A robust Node.js/TypeScript system for fetching, storing, and incrementally syncing ads from the Meta (Facebook) Ads Library. It efficiently scrapes data using Puppeteer and maintains a local JSON database with smart incremental updates.

## Features
- Complete Initial Sync: Fetch all ads (active and inactive) from any Meta Ads Library URL
- Smart Incremental Sync: Only fetch new or updated ads since last sync
- Robust Error Handling: Retry logic, timeout handling, and comprehensive logging
- Type Safety: Full TypeScript implementation with proper interfaces
- Efficient Storage: JSON file-based storage organized by pageId
- Performance Optimized: Configurable delays and memory management
- Comprehensive Testing: Unit tests for data validation and API change detection

## Installation
```bash
git clone https://github.com/ItzSamdam/metaAdScrapper
cd meta-ad-scraper
npm install
npm run build
```


### Test Run
```bash
npm run test
```

### Production Run
```bash
npm run prod
```

### Staging Run
```bash
npm run stage
```
