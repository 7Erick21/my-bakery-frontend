import type { LandingCmsSection } from '@/lib/supabase/models';
import { Layout } from '@/presentation/layout/Layout';
import {
  getLandingBusinessInfo,
  getLandingCmsContent,
  getLandingFeatureCards,
  getLandingSocialLinks,
  getLandingTimelineEvents
} from '@/server/queries/landing';
import { getFeaturedProducts } from '@/server/queries/products';
import { getLatestReviews } from '@/server/queries/reviews';
import { About } from '@/views/HomePage/About';
import { Contact } from '@/views/HomePage/Contact';
import { Home } from '@/views/HomePage/Home';
import { Products } from '@/views/HomePage/Products';
import { Reviews } from '@/views/HomePage/Reviews';

export default async function RootPage() {
  const [
    reviews,
    landingProducts,
    cmsContent,
    timelineEvents,
    featureCards,
    businessInfo,
    socialLinks
  ] = await Promise.all([
    getLatestReviews(6),
    getFeaturedProducts(),
    getLandingCmsContent(),
    getLandingTimelineEvents(),
    getLandingFeatureCards(),
    getLandingBusinessInfo(),
    getLandingSocialLinks()
  ]);

  const cms = Object.fromEntries(
    cmsContent.map((c: LandingCmsSection) => [c.section, c])
  ) as Record<string, LandingCmsSection>;

  return (
    <Layout footerContent={cms.footer} businessInfo={businessInfo} socialLinks={socialLinks}>
      <Home heroContent={cms.hero} businessInfo={businessInfo} />
      <Products products={landingProducts} introContent={cms.products_intro} />
      <Reviews reviews={reviews} />
      <About
        introContent={cms.about_intro}
        footerContent={cms.about_footer}
        timelineEvents={timelineEvents}
        featureCards={featureCards}
      />
      <Contact introContent={cms.contact_intro} businessInfo={businessInfo} />
    </Layout>
  );
}
