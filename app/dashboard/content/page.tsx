import { getAllCmsContentAdmin } from '@/server/queries/cms';
import { ContentList } from '@/views/Dashboard/Content';

export default async function DashboardContentPage() {
  const cmsContent = await getAllCmsContentAdmin();
  return <ContentList cmsContent={cmsContent} />;
}
