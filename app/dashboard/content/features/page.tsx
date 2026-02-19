import { getAllFeatureCardsAdmin, getAllLanguagesAdmin } from '@/server/queries/landing';
import { FeatureCardsEditor } from '@/views/Dashboard/Content';

export default async function FeaturesPage() {
  const [cards, languages] = await Promise.all([getAllFeatureCardsAdmin(), getAllLanguagesAdmin()]);

  const langOptions = languages.map(l => ({ code: l.code, name: l.name }));

  return <FeatureCardsEditor cards={cards} languages={langOptions} />;
}
