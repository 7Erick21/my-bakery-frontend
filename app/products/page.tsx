import { cookies } from 'next/headers';

import type { LandingCmsSection } from '@/lib/supabase/models';
import { Layout } from '@/presentation/layout/Layout';
import { getCategories } from '@/server/queries/categories';
import {
  getLandingBusinessInfo,
  getLandingCmsContent,
  getLandingSocialLinks
} from '@/server/queries/landing';
import { getProducts } from '@/server/queries/products';
import { ProductsPage } from '@/views/ProductsPage';

export default async function Products() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('preferred_language');
  const lang = langCookie?.value || 'es';

  const [products, categories, cmsContent, businessInfo, socialLinks] = await Promise.all([
    getProducts(lang),
    getCategories(lang),
    getLandingCmsContent(),
    getLandingBusinessInfo(),
    getLandingSocialLinks()
  ]);

  const cms = Object.fromEntries(
    cmsContent.map((c: LandingCmsSection) => [c.section, c])
  ) as Record<string, LandingCmsSection>;

  return (
    <Layout footerContent={cms.footer} businessInfo={businessInfo} socialLinks={socialLinks}>
      <ProductsPage products={products} categories={categories} />
    </Layout>
  );
}
