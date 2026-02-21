import { getCmsContentBySection } from '@/server/queries/cms';
import { getAllLanguagesAdmin } from '@/server/queries/landing';
import { ContentSectionEditor } from '@/views/Dashboard/Content';

export default async function ContentSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const [content, languages] = await Promise.all([
    getCmsContentBySection(section),
    getAllLanguagesAdmin()
  ]);

  const langOptions = languages.map(l => ({
    code: l.code,
    name: l.name
  }));

  return <ContentSectionEditor section={section} content={content} languages={langOptions} />;
}
