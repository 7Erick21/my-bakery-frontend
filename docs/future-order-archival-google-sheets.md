# Future: Order Archival to Google Sheets

## Concept
Annually archive completed orders from Supabase to Google Sheets to free DB space on the free plan (~500 MB).

## Structure
- One Google Sheet per business
- One tab (sheet page) per year (e.g., "2026", "2027")
- Within each tab, tables organized by month with order data
- Include invoice reference data in the export

## Retention Rules (Spanish Fiscal Law)

### Invoices — Minimum 4 years in DB
- Spanish LGT (Ley General Tributaria) art. 70 requires 4-year retention
- Invoices must remain accessible in the DB for at least 4 years
- After 4+ years, invoices can be deleted from DB (Google Sheets serves as backup)

### Orders — 2 years in DB
- Completed orders older than 2 years can be deleted from DB after archiving to Google Sheets
- The Google Sheet archive serves as the permanent record

## Implementation Approach
1. Use Google Sheets API (service account) from an Edge Function or external script
2. Run annually (January) to archive previous year's completed orders
3. Steps:
   - Query all completed orders for the target year with related data (items, customer, invoice ref)
   - Format into rows and write to the appropriate sheet tab
   - Verify write success
   - Delete archived orders from Supabase (only after successful write)
4. Invoice deletion is a separate process — only after 4+ years

## Capacity Context
- Current model: ~28,000 orders with invoices fit in 500 MB (~12-13 KB per complete cycle)
- For a small-medium bakery, this is several years of capacity
- Archival extends this indefinitely
