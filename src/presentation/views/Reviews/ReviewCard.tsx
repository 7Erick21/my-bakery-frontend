'use client';

import Image from 'next/image';
import { type FC, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Card, UserAvatar } from '@/components/atoms';
import EyeIcon from '@/icons/eye.svg';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const productName = getTranslation(review.products?.product_translations, lang)?.name || null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePreview = useCallback(() => setPreviewUrl(null), []);

  useEffect(() => {
    if (!previewUrl) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [previewUrl, closePreview]);

  return (
    <>
      <Card variant='children' className='rounded-xl p-5 h-full'>
        {/* User info */}
        <div className='flex items-center gap-3 mb-2'>
          <UserAvatar
            src={review.profiles?.avatar_url}
            name={review.profiles?.full_name}
            size='md'
          />
          <div className='min-w-0 flex-1'>
            <p className='font-medium text-gray-900 dark:text-gray-100 truncate'>
              {review.profiles?.full_name || t('reviews.anonymous')}
            </p>
            <p className='text-xs text-gray-500'>{formatDate(review.created_at)}</p>
          </div>
        </div>

        {/* Rating */}
        <div className='mb-3'>
          <StarRating rating={review.rating} size='sm' />
        </div>

        {productName && (
          <p className='text-xs text-amber-600 dark:text-amber-400 font-medium mb-2'>
            {productName}
          </p>
        )}

        <p className='text-gray-700 dark:text-gray-300 text-sm'>{review.comment}</p>

        {review.review_images?.length > 0 && (
          <div className='flex gap-2 mt-3'>
            {review.review_images.map((img, i) => (
              <button
                key={img.url || i}
                type='button'
                onClick={() => setPreviewUrl(img.url)}
                className='relative group rounded-lg overflow-hidden cursor-pointer'
              >
                <Image
                  src={img.url}
                  alt='Review image'
                  width={80}
                  height={80}
                  className='w-20 h-20 object-cover transition-transform duration-200 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center'>
                  <EyeIcon className='w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md' />
                </div>
              </button>
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
      </Card>

      {/* Image preview lightbox */}
      {previewUrl &&
        mounted &&
        createPortal(
          <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            onClick={closePreview}
            aria-hidden='true'
          >
            <div className='absolute inset-0 bg-black/60 animate-[fade-in-up_150ms_ease-out]' />
            <Card
              variant='children'
              className='relative rounded-2xl p-2 animate-[scale-in_150ms_ease-out] max-w-[90vw] max-h-[85vh]'
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={previewUrl}
                alt='Review image preview'
                width={600}
                height={600}
                className='max-h-[80vh] w-auto rounded-xl object-contain'
              />
            </Card>
          </div>,
          document.body
        )}
    </>
  );
};

ReviewCard.displayName = 'ReviewCard';
