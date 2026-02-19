import { getAllLanguagesAdmin } from '@/server/queries/landing';
import { CategoryForm } from '@/views/Dashboard/Categories';

export default async function NewCategoryPage() {
  const languages = await getAllLanguagesAdmin();
  const langOptions = languages.map(l => ({ code: l.code, name: l.name }));

  return <CategoryForm languages={langOptions} />;
}
