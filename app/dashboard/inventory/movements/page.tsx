import { getInventoryMovements } from '@/server/queries/inventory';
import { InventoryMovements } from '@/views/Dashboard/Inventory';

export default async function InventoryMovementsPage() {
  const movements = await getInventoryMovements();

  return <InventoryMovements movements={movements} />;
}
