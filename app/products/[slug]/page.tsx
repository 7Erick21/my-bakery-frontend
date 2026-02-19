import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import type { LandingCmsSection } from '@/lib/supabase/models';
import { Layout } from '@/presentation/layout/Layout';
import {
  getLandingBusinessInfo,
  getLandingCmsContent,
  getLandingSocialLinks
} from '@/server/queries/landing';
import { getProductBySlug, getRelatedProducts } from '@/server/queries/products';
import { getApprovedReviews } from '@/server/queries/reviews';
import { ProductDetail } from '@/views/ProductsPage/ProductDetail';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('preferred_language');
  const lang = langCookie?.value || 'es';

  const product = await getProductBySlug(slug, lang);

  if (!product) notFound();

  const [reviews, relatedProducts, cmsContent, businessInfo, socialLinks] = await Promise.all([
    getApprovedReviews(product.id),
    getRelatedProducts(product.category_id, product.id, lang),
    getLandingCmsContent(),
    getLandingBusinessInfo(),
    getLandingSocialLinks()
  ]);

  const cms = Object.fromEntries(
    cmsContent.map((c: LandingCmsSection) => [c.section, c])
  ) as Record<string, LandingCmsSection>;

  return (
    <Layout footerContent={cms.footer} businessInfo={businessInfo} socialLinks={socialLinks}>
      <ProductDetail product={product} reviews={reviews} relatedProducts={relatedProducts} />
    </Layout>
  );
}
