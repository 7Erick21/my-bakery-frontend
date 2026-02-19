import { notFound } from 'next/navigation';

import { getCategoryById } from '@/server/queries/categories';
import { getAllLanguagesAdmin } from '@/server/queries/landing';
import { CategoryForm } from '@/views/Dashboard/Categories';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, languages] = await Promise.all([getCategoryById(id), getAllLanguagesAdmin()]);

  if (!category) notFound();

  const langOptions = languages.map(l => ({ code: l.code, name: l.name }));

  return <CategoryForm category={category} languages={langOptions} />;
}
