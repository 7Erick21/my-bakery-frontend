import { getAllCategoriesAdmin } from '@/server/queries/categories';
import { getAllLanguagesAdmin } from '@/server/queries/landing';
import { ProductForm } from '@/views/Dashboard/Products';

export default async function NewProductPage() {
  const [categories, languages] = await Promise.all([
    getAllCategoriesAdmin(),
    getAllLanguagesAdmin()
  ]);
  const langOptions = languages.map(l => ({ code: l.code, name: l.name }));

  return <ProductForm categories={categories} languages={langOptions} />;
}
