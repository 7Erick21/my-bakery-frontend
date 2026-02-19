import { getAllBusinessInfoAdmin, getAllLanguagesAdmin } from '@/server/queries/landing';
import { BusinessInfoEditor } from '@/views/Dashboard/Content';

export default async function BusinessInfoPage() {
  const [items, languages] = await Promise.all([getAllBusinessInfoAdmin(), getAllLanguagesAdmin()]);

  const langOptions = languages.map(l => ({ code: l.code, name: l.name }));

  return <BusinessInfoEditor items={items} languages={langOptions} />;
}
