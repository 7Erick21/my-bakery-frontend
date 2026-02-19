'use client';

import Image from 'next/image';
import type { FC } from 'react';

import { UserAvatar } from '@/components/atoms';
import type { ReviewWithProfile } from '@/lib/supabase/models';
import { formatDate } from '@/lib/utils/format';
import { getTranslation } from '@/lib/utils/translation';
import { useTranslation } from '@/shared/hooks/useTranslate';

import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: ReviewWithProfile;
}

export const ReviewCard: FC<ReviewCardProps> = ({ review }) => {
  const { t, lang } = useTranslation();

  const productName = getTranslation(review.products?.product_translations, lang)?.name || null;

  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-3'>
          <UserAvatar
            src={review.profiles?.avatar_url}
            name={review.profiles?.full_name}
            size='md'
          />
          <div>
            <p className='font-medium text-gray-900 dark:text-gray-100'>
              {review.profiles?.full_name || t('reviews.anonymous')}
            </p>
            <p className='text-xs text-gray-500'>{formatDate(review.created_at)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size='sm' />
      </div>

      {productName && (
        <p className='text-xs text-amber-600 dark:text-amber-400 font-medium mb-2'>{productName}</p>
      )}

      <p className='text-gray-700 dark:text-gray-300 text-sm'>{review.comment}</p>

      {review.review_images?.length > 0 && (
        <div className='flex gap-2 mt-3'>
          {review.review_images.map((img, i) => (
            <Image
              key={img.url || i}
              src={img.url}
              alt='Review image'
              width={80}
              height={80}
              className='w-20 h-20 rounded-lg object-cover'
            />
          ))}
        </div>
      )}

      {review.admin_response && (
        <div className='mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border-l-2 border-amber-400'>
          <p className='text-xs font-medium text-amber-700 dark:text-amber-400 mb-1'>
            {t('reviews.adminResponse')}
          </p>
          <p className='text-sm text-gray-700 dark:text-gray-300'>{review.admin_response}</p>
        </div>
      )}
    </div>
  );
};

ReviewCard.displayName = 'ReviewCard';
