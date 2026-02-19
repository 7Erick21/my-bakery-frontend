/**
 * Feature flags driven by environment variables.
 *
 * NEXT_PUBLIC_SALES_ENABLED (default: true)
 *   Set to "false" to hide cart, checkout, and ordering UI.
 *   Products and prices remain visible — only the purchase flow is hidden.
 */
export const SALES_ENABLED = process.env.NEXT_PUBLIC_SALES_ENABLED !== 'false';
