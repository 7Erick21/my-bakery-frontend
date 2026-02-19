import { notFound } from 'next/navigation';

import { getAllCategoriesAdmin } from '@/server/queries/categories';
import { getAllLanguagesAdmin } from '@/server/queries/landing';
import { getProductById } from '@/server/queries/products';
import { ProductForm } from '@/views/Dashboard/Products';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, languages] = await Promise.all([
    getProductById(id),
    getAllCategoriesAdmin(),
    getAllLanguagesAdmin()
  ]);

  if (!product) notFound();

  const langOptions = languages.map(l => ({ code: l.code, name: l.name }));

  return <ProductForm product={product} categories={categories} languages={langOptions} />;
}
