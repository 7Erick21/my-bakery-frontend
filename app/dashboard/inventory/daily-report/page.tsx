import { getTranslation } from '@/lib/utils/translation';
import { getDailyReport } from '@/server/queries/inventory';
import { getProductionSchedule, getRecurringItemsForProduction } from '@/server/queries/production';
import { getAllProductsAdmin } from '@/server/queries/products';
import { DailyReport } from '@/views/Dashboard/Inventory';

export default async function DailyReportPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? new Date().toISOString().split('T')[0];

  const [products, todayReport, schedule, recurringItems] = await Promise.all([
    getAllProductsAdmin(),
    getDailyReport(date),
    getProductionSchedule(),
    getRecurringItemsForProduction()
  ]);

  const productOptions = products.map(p => {
    const tr = getTranslation(p.product_translations, 'es');
    return { id: p.id, name: tr?.name ?? p.slug };
  });

  // Calculate suggested quantities based on the selected date's day of week (0=Sunday..6=Saturday)
  const [year, month, day] = date.split('-').map(Number);
  const todayDow = new Date(year, month - 1, day).getDay();
  const suggestedQuantities: Record<string, number> = {};

  for (const entry of schedule) {
    if (entry.is_active && entry.day_of_week === todayDow) {
      suggestedQuantities[entry.product_id] =
        (suggestedQuantities[entry.product_id] ?? 0) + entry.base_quantity;
    }
  }

  for (const entry of recurringItems) {
    if (entry.day_of_week === todayDow) {
      suggestedQuantities[entry.product_id] =
        (suggestedQuantities[entry.product_id] ?? 0) + entry.total_quantity;
    }
  }

  return (
    <DailyReport
      key={date}
      products={productOptions}
      todayReport={todayReport}
      suggestedQuantities={suggestedQuantities}
      initialDate={date}
    />
  );
}
