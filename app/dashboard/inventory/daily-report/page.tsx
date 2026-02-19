import { getTranslation } from '@/lib/utils/translation';
import { getDailyReport } from '@/server/queries/inventory';
import { getAllProductsAdmin } from '@/server/queries/products';
import { DailyReport } from '@/views/Dashboard/Inventory';

export default async function DailyReportPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? new Date().toISOString().split('T')[0];

  const [products, todayReport] = await Promise.all([getAllProductsAdmin(), getDailyReport(date)]);

  const productOptions = products.map(p => {
    const tr = getTranslation(p.product_translations, 'es');
    return { id: p.id, name: tr?.name ?? p.slug };
  });

  return <DailyReport products={productOptions} todayReport={todayReport} />;
}
