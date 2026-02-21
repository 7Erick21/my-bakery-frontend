import { Suspense } from 'react';

import { getAllCategoriesAdmin } from '@/server/queries/categories';
import { CategoriesList } from '@/views/Dashboard/Categories';
import { TableSkeleton } from '@/views/Dashboard/shared/TableSkeleton';

async function CategoriesContent() {
  const categories = await getAllCategoriesAdmin();
  return <CategoriesList categories={categories} />;
}

export default function DashboardCategoriesPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={5} columns={4} />}>
      <CategoriesContent />
    </Suspense>
  );
}
