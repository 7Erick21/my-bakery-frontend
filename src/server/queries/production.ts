import type { ProductionScheduleItem, RecurringProductionItem } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';
import { getTranslation } from '@/lib/utils/translation';

export async function getProductionSchedule(): Promise<ProductionScheduleItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('production_schedule')
    .select(
      `
      id, product_id, day_of_week, base_quantity, is_active,
      products(slug, product_translations(name, language_code))
    `
    )
    .order('day_of_week')
    .order('base_quantity', { ascending: false });

  return (data ?? []) as unknown as ProductionScheduleItem[];
}

export async function getRecurringItemsForProduction(): Promise<RecurringProductionItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('recurring_order_items')
    .select(
      `
      product_id, day_of_week, quantity, is_active,
      recurring_order_schedules(business_name, is_active),
      products(product_translations(name, language_code))
    `
    )
    .eq('is_active', true);

  if (!data || data.length === 0) return [];

  // Filter items whose parent schedule is also active, then aggregate
  const grouped = new Map<string, RecurringProductionItem>();

  for (const row of data) {
    const schedule = row.recurring_order_schedules as unknown as {
      business_name: string;
      is_active: boolean;
    } | null;
    if (!schedule?.is_active) continue;

    const key = `${row.product_id}__${row.day_of_week}`;
    const existing = grouped.get(key);
    const productTranslations = (
      row.products as unknown as {
        product_translations: { name: string; language_code: string }[];
      } | null
    )?.product_translations;
    const productName = getTranslation(productTranslations ?? [], 'es')?.name ?? 'Producto';

    if (existing) {
      existing.total_quantity += row.quantity;
      existing.details.push({
        business_name: schedule.business_name,
        quantity: row.quantity
      });
    } else {
      grouped.set(key, {
        product_id: row.product_id,
        day_of_week: row.day_of_week,
        total_quantity: row.quantity,
        details: [{ business_name: schedule.business_name, quantity: row.quantity }],
        product_name: productName
      });
    }
  }

  return Array.from(grouped.values());
}
