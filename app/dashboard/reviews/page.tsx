import { getAllReviewsAdmin } from '@/server/queries/reviews';

import { ReviewsModeration } from '@/views/Dashboard/Reviews';

export default async function DashboardReviewsPage() {
  const reviews = await getAllReviewsAdmin();

  return <ReviewsModeration reviews={reviews} />;
}
