import { getAllInventory } from '@/server/queries/inventory';

import { InventoryList } from '@/views/Dashboard/Inventory';

export default async function DashboardInventoryPage() {
  const inventory = await getAllInventory();

  return <InventoryList inventory={inventory} />;
}
