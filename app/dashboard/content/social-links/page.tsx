import { getLandingSocialLinks } from '@/server/queries/landing';
import { SocialLinksEditor } from '@/views/Dashboard/Content';

export default async function SocialLinksPage() {
  const links = await getLandingSocialLinks();
  return <SocialLinksEditor links={links} />;
}
