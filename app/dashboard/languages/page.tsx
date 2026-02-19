import { getAllLanguagesAdmin } from '@/server/queries/landing';
import { LanguagesList } from '@/views/Dashboard/Languages';

export default async function DashboardLanguagesPage() {
  const languages = await getAllLanguagesAdmin();
  return <LanguagesList languages={languages} />;
}
