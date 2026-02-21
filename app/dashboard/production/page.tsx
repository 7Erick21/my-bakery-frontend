import { getProductionSchedule, getRecurringItemsForProduction } from '@/server/queries/production';
import { getAllProductsAdmin } from '@/server/queries/products';

import { ProductionSchedule } from '@/views/Dashboard/Production';

export default async function DashboardProductionPage() {
  const [schedule, products, recurringItems] = await Promise.all([
    getProductionSchedule(),
    getAllProductsAdmin(),
    getRecurringItemsForProduction()
  ]);

  return (
    <ProductionSchedule schedule={schedule} products={products} recurringItems={recurringItems} />
  );
}
