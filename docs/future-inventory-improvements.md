# Future: Inventory Flow Improvements

## Current State
- `inventory_movements` table exists with basic movement tracking
- Flow is not 100% complete — missing key UI and functionality

## What's Missing

### Visual Dashboard for Stock
- UI to see entries (restock), exits (sales), and current stock at a glance
- Clear breakdown: what comes in, what goes out (online + physical), what's left

### Physical Sales Registration
- Shop managers need a simple screen to register physical (in-store) sales
- Simple form: select product → enter quantity sold → submit
- This creates `inventory_movements` records of type "sale" (physical)
- Currently only online orders generate movement records

### Reports
- Daily/weekly summary of movements by product
- Low stock alerts based on thresholds
- Comparison: online vs physical sales

## Implementation Notes
- `inventory_movements` records are cleaned up after 1 year by `perform_cleanup()` SQL function
- Consider archiving old movements to Google Sheets before cleanup (similar to order archival)
- The daily report page exists (`/dashboard/inventory/daily-report`) but needs enhancement
