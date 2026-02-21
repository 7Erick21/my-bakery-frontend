'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

import { Button, Card } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';
import type { ReviewWithProfile } from '@/lib/supabase/models';
import { useTranslation } from '@/shared/hooks/useTranslate';

import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { StarRating } from './StarRating';

interface ReviewsPageProps {
  reviews: ReviewWithProfile[];
  total: number;
  stats: { average: string; total: number };
  currentPage: number;
  currentRating?: number;
  currentHasImages?: boolean;
  isAuthenticated: boolean;
}

const PAGE_SIZE = 12;

export const ReviewsPage: FC<ReviewsPageProps> = ({
  reviews,
  total,
  stats,
  currentPage,
  currentRating,
  currentHasImages,
  isAuthenticated
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(params: { page?: number; rating?: number | null; images?: boolean | null }) {
    const searchParams = new URLSearchParams();
    const page = params.page ?? currentPage;
    if (page > 1) searchParams.set('page', String(page));

    const rating = params.rating === undefined ? currentRating : params.rating;
    if (rating) searchParams.set('rating', String(rating));

    const images = params.images === undefined ? currentHasImages : params.images;
    if (images) searchParams.set('images', '1');

    const qs = searchParams.toString();
    return `/reviews${qs ? `?${qs}` : ''}` as Route;
  }

  function handleRatingFilter(rating: number | null) {
    router.push(buildUrl({ rating, page: 1 }));
  }

  function handleImagesFilter(images: boolean | null) {
    router.push(buildUrl({ images, page: 1 }));
  }

  return (
    <section className='pt-24 pb-16'>
      <div className='max-w-4xl mx-auto'>
        <Link
          href='/#reviews'
          className='inline-flex items-center gap-2 text-base text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-6 transition-colors group'
        >
          <svg
            className='w-4 h-4 transition-transform group-hover:-translate-x-0.5'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5 8.25 12l7.5-7.5' />
          </svg>
          {t('reviews.backToHome', 'Volver')}
        </Link>

        <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100 mb-2'>
          {t('reviews.title')}
        </h1>

        {/* Stats bar */}
        {stats.total > 0 && (
          <div className='flex items-center gap-3 mb-8'>
            <StarRating rating={Math.round(Number(stats.average))} size='sm' />
            <span className='text-16-20 text-gray-600 dark:text-gray-400'>
              {stats.average} / 5 — {stats.total} {t('reviews.reviewCount')}
            </span>
          </div>
        )}

        {/* Filters */}
        <div className='space-y-3 mb-8'>
          {/* Rating filter */}
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm font-medium text-gray-500 dark:text-gray-400 mr-1'>
              {t('reviews.filterByRating', 'Puntuacion')}:
            </span>
            <Button
              variant={!currentRating ? 'primary' : 'secondary'}
              onClick={() => handleRatingFilter(null)}
              className='!px-3 !py-1.5 !text-14-16'
            >
              {t('reviews.filterAll')}
            </Button>
            {[5, 4, 3, 2, 1].map(star => (
              <Button
                key={star}
                variant={currentRating === star ? 'primary' : 'secondary'}
                onClick={() => handleRatingFilter(star)}
                className='!px-3 !py-1.5 !text-14-16'
              >
                {star} ★
              </Button>
            ))}
          </div>

          {/* Images filter */}
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              variant={currentHasImages ? 'primary' : 'secondary'}
              onClick={() => handleImagesFilter(currentHasImages ? null : true)}
              className='!px-3 !py-1.5 !text-14-16'
            >
              {t('reviews.withImages')}
            </Button>
          </div>
        </div>

        {/* Review form or login prompt */}
        {isAuthenticated ? (
          <div className='mb-8'>
            <ReviewForm />
          </div>
        ) : (
          <div className='mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center'>
            <Link
              href='/auth'
              className='text-amber-600 dark:text-amber-400 hover:underline font-medium'
            >
              {t('reviews.loginToReview')}
            </Link>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className='w-16 h-16'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1}
                stroke='currentColor'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
                />
              </svg>
            }
            title={t('reviews.empty')}
            description={t('reviews.emptyDescription', 'Se el primero en dejar una resena.')}
          />
        ) : (
          <div className='space-y-4'>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-4 mt-12'>
            <Button
              variant='ghost'
              disabled={currentPage <= 1}
              onClick={() => router.push(buildUrl({ page: currentPage - 1 }))}
              className='!px-4 !py-2 !text-14-16'
            >
              {t('reviews.previous')}
            </Button>
            <span className='text-14-16 text-gray-600 dark:text-gray-400'>
              {t('reviews.page')} {currentPage} / {totalPages}
            </span>
            <Button
              variant='ghost'
              disabled={currentPage >= totalPages}
              onClick={() => router.push(buildUrl({ page: currentPage + 1 }))}
              className='!px-4 !py-2 !text-14-16'
            >
              {t('reviews.next')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

ReviewsPage.displayName = 'ReviewsPage';
