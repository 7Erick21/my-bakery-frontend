'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

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
  currentType?: string;
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
  currentType,
  currentHasImages,
  isAuthenticated
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(params: {
    page?: number;
    rating?: number | null;
    type?: string | null;
    images?: boolean | null;
  }) {
    const searchParams = new URLSearchParams();
    const page = params.page ?? currentPage;
    if (page > 1) searchParams.set('page', String(page));

    const rating = params.rating === undefined ? currentRating : params.rating;
    if (rating) searchParams.set('rating', String(rating));

    const type = params.type === undefined ? currentType : params.type;
    if (type) searchParams.set('type', type);

    const images = params.images === undefined ? currentHasImages : params.images;
    if (images) searchParams.set('images', '1');

    const qs = searchParams.toString();
    return `/reviews${qs ? `?${qs}` : ''}` as Route;
  }

  function handleRatingFilter(rating: number | null) {
    router.push(buildUrl({ rating, page: 1 }));
  }

  function handleTypeFilter(type: string | null) {
    router.push(buildUrl({ type, page: 1 }));
  }

  function handleImagesFilter(images: boolean | null) {
    router.push(buildUrl({ images, page: 1 }));
  }

  const filterBtnBase = 'px-3 py-1.5 text-14-16 rounded-lg border transition-colors cursor-pointer';
  const filterBtnActive = 'bg-amber-500 text-white border-amber-500';
  const filterBtnInactive =
    'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';

  return (
    <section className='min-h-dvh pt-24 pb-16'>
      <div className='max-w-4xl mx-auto'>
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
            <button
              type='button'
              onClick={() => handleRatingFilter(null)}
              className={`${filterBtnBase} ${!currentRating ? filterBtnActive : filterBtnInactive}`}
            >
              {t('reviews.filterAll')}
            </button>
            {[5, 4, 3, 2, 1].map(star => (
              <button
                key={star}
                type='button'
                onClick={() => handleRatingFilter(star)}
                className={`${filterBtnBase} ${currentRating === star ? filterBtnActive : filterBtnInactive}`}
              >
                {star} ★
              </button>
            ))}
          </div>

          {/* Type filter + images filter */}
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm font-medium text-gray-500 dark:text-gray-400 mr-1'>
              {t('reviews.filterByType', 'Tipo')}:
            </span>
            <button
              type='button'
              onClick={() => handleTypeFilter(null)}
              className={`${filterBtnBase} ${!currentType ? filterBtnActive : filterBtnInactive}`}
            >
              {t('reviews.filterAll')}
            </button>
            <button
              type='button'
              onClick={() => handleTypeFilter('product')}
              className={`${filterBtnBase} ${currentType === 'product' ? filterBtnActive : filterBtnInactive}`}
            >
              {t('reviews.typeProduct')}
            </button>
            <button
              type='button'
              onClick={() => handleTypeFilter('company')}
              className={`${filterBtnBase} ${currentType === 'company' ? filterBtnActive : filterBtnInactive}`}
            >
              {t('reviews.typeCompany')}
            </button>

            <span className='w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1' />

            <button
              type='button'
              onClick={() => handleImagesFilter(currentHasImages ? null : true)}
              className={`${filterBtnBase} ${currentHasImages ? filterBtnActive : filterBtnInactive}`}
            >
              {t('reviews.withImages')}
            </button>
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
          <p className='text-center text-gray-500 py-12'>{t('reviews.empty')}</p>
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
            <button
              type='button'
              disabled={currentPage <= 1}
              onClick={() => router.push(buildUrl({ page: currentPage - 1 }))}
              className='px-4 py-2 text-14-16 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer'
            >
              {t('reviews.previous')}
            </button>
            <span className='text-14-16 text-gray-600 dark:text-gray-400'>
              {t('reviews.page')} {currentPage} / {totalPages}
            </span>
            <button
              type='button'
              disabled={currentPage >= totalPages}
              onClick={() => router.push(buildUrl({ page: currentPage + 1 }))}
              className='px-4 py-2 text-14-16 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer'
            >
              {t('reviews.next')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

ReviewsPage.displayName = 'ReviewsPage';
