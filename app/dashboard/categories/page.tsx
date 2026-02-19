import { getAllCategoriesAdmin } from '@/server/queries/categories';
import { CategoriesList } from '@/views/Dashboard/Categories';

export default async function DashboardCategoriesPage() {
  const categories = await getAllCategoriesAdmin();
  return <CategoriesList categories={categories} />;
}
