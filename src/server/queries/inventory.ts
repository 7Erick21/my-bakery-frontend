import type {
  DailyReportWithItems,
  InventoryItem,
  InventoryMovementItem
} from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getAllInventory(): Promise<InventoryItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('inventory')
    .select(
      `
      id, product_id, stock, low_stock_threshold, updated_at,
      products(slug, product_translations(name, language_code))
    `
    )
    .order('stock', { ascending: true });

  return (data ?? []) as unknown as InventoryItem[];
}

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('inventory')
    .select(
      `
      id, product_id, stock, low_stock_threshold,
      products(slug, product_translations(name, language_code))
    `
    )
    .filter('stock', 'lte', 'low_stock_threshold');

  return (data ?? []) as unknown as InventoryItem[];
}

export async function getInventoryMovements(productId?: string): Promise<InventoryMovementItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from('inventory_movements')
    .select(
      `
      id, product_id, movement_type, quantity, reference_id, notes, created_at,
      products(slug, product_translations(name, language_code)),
      profiles(full_name)
    `
    )
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data } = await query;

  return (data ?? []) as unknown as InventoryMovementItem[];
}

export async function getDailyReport(date: string): Promise<DailyReportWithItems | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('daily_inventory_reports')
    .select(
      `
      id, report_date, notes, created_at,
      profiles(full_name),
      daily_inventory_report_items(
        id, product_id, produced, sold_online, sold_physical, damaged, leftover,
        products(slug, product_translations(name, language_code))
      )
    `
    )
    .eq('report_date', date)
    .single();

  if (!data) return null;

  return data as unknown as DailyReportWithItems;
}

export async function getDailyReportHistory(): Promise<DailyReportWithItems[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('daily_inventory_reports')
    .select(
      `
      id, report_date, notes, created_at,
      profiles(full_name),
      daily_inventory_report_items(
        id, product_id, produced, sold_online, sold_physical, damaged, leftover,
        products(slug, product_translations(name, language_code))
      )
    `
    )
    .order('report_date', { ascending: false });

  return (data ?? []) as unknown as DailyReportWithItems[];
}
