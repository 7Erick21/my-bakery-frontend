import { getSession } from '@/lib/auth/helpers';
import { Layout } from '@/presentation/layout/Layout';
import { getPaginatedReviews, getReviewStats } from '@/server/queries/reviews';

import { ReviewsPage } from '@/views/Reviews';

export default async function ReviewsRoute({
  searchParams
}: {
  searchParams: Promise<{
    page?: string;
    rating?: string;
    images?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const rating = params.rating ? Number(params.rating) : undefined;
  const hasImages = params.images === '1';

  const [user, { data: reviews, total }, stats] = await Promise.all([
    getSession(),
    getPaginatedReviews({ page, rating, hasImages }),
    getReviewStats()
  ]);

  return (
    <Layout>
      <ReviewsPage
        reviews={reviews}
        total={total}
        stats={stats}
        currentPage={page}
        currentRating={rating}
        currentHasImages={hasImages}
        isAuthenticated={!!user}
      />
    </Layout>
  );
}
