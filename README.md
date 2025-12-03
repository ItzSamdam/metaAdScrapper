Meta Ads Library Scraper
A robust Node.js/TypeScript system for fetching, storing, and incrementally syncing ads from the Meta (Facebook) Ads Library. This system efficiently scrapes ads data using Puppeteer and maintains a local JSON database with smart incremental updates.

Features
Complete Initial Sync: Fetch all ads (active and inactive) from any Meta Ads Library URL

Smart Incremental Sync: Only fetch new or updated ads since last sync

Robust Error Handling: Retry logic, timeout handling, and comprehensive logging

Type Safety: Full TypeScript implementation with proper interfaces

Efficient Storage: JSON file-based storage organized by page_id

Performance Optimized: Configurable delays and memory management

Comprehensive Testing: Unit tests for data validation and API change detection