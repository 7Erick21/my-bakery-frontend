import { Suspense } from 'react';

import { getAllProductsAdmin } from '@/server/queries/products';
import { ProductsList } from '@/views/Dashboard/Products';
import { TableSkeleton } from '@/views/Dashboard/shared/TableSkeleton';

async function ProductsContent() {
  const products = await getAllProductsAdmin();
  return <ProductsList products={products} />;
}

export default function DashboardProductsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
      <ProductsContent />
    </Suspense>
  );
}
