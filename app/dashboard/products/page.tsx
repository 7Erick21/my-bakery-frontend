import { getAllProductsAdmin } from '@/server/queries/products';
import { ProductsList } from '@/views/Dashboard/Products';

export default async function DashboardProductsPage() {
  const products = await getAllProductsAdmin();
  return <ProductsList products={products} />;
}
