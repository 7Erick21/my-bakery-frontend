'use client';

import { type FC, useState } from 'react';

import { Button, DashboardCard, StatusBadge, Textarea } from '@/components/atoms';
import type { ReviewAdmin } from '@/lib/supabase/models';
import { formatDate } from '@/lib/utils/format';
import { addAdminResponse, deleteReview, updateReviewStatus } from '@/server/actions/reviews';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { StarRating } from '../../Reviews/StarRating';
import { PageHeader } from '../shared/PageHeader';

const statusVariant: Record<string, 'yellow' | 'green' | 'red'> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red'
};

interface ReviewsModerationProps {
  reviews: ReviewAdmin[];
}

export const ReviewsModeration: FC<ReviewsModerationProps> = ({ reviews }) => {
  const { t } = useTranslation();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  async function handleResponse(reviewId: string) {
    if (!responseText.trim()) return;
    await addAdminResponse(reviewId, responseText);
    setRespondingTo(null);
    setResponseText('');
  }

  return (
    <div>
      <PageHeader title={t('dashboard.nav.reviews', 'Reseñas')} />

      {reviews.length === 0 ? (
        <p className='text-gray-500 py-12 text-center'>No hay reseñas</p>
      ) : (
        <div className='space-y-4'>
          {reviews.map(review => (
            <DashboardCard key={review.id}>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    {review.profiles?.full_name || review.profiles?.email || 'Anónimo'}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {formatDate(review.created_at)} — {review.review_type}
                  </p>
                  {review.products?.product_translations?.[0]?.name && (
                    <p className='text-xs text-amber-600 mt-1'>
                      {review.products.product_translations[0].name}
                    </p>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  <StarRating rating={review.rating} size='sm' />
                  <StatusBadge variant={statusVariant[review.status] || 'gray'}>
                    {review.status}
                  </StatusBadge>
                </div>
              </div>

              <p className='text-gray-700 dark:text-gray-300 text-14-16 mb-4'>{review.comment}</p>

              {review.admin_response && (
                <div className='p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border-l-2 border-amber-400 mb-4'>
                  <p className='text-xs font-medium text-amber-700 dark:text-amber-400 mb-1'>
                    Respuesta admin
                  </p>
                  <p className='text-14-16 text-gray-700 dark:text-gray-300'>
                    {review.admin_response}
                  </p>
                </div>
              )}

              <div className='flex items-center gap-2'>
                {review.status !== 'approved' && (
                  <button
                    type='button'
                    onClick={() => updateReviewStatus(review.id, 'approved')}
                    className='px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium cursor-pointer hover:bg-green-200'
                  >
                    Aprobar
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button
                    type='button'
                    onClick={() => updateReviewStatus(review.id, 'rejected')}
                    className='px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium cursor-pointer hover:bg-red-200'
                  >
                    Rechazar
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => {
                    setRespondingTo(respondingTo === review.id ? null : review.id);
                    setResponseText(review.admin_response || '');
                  }}
                  className='px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium cursor-pointer hover:bg-amber-200'
                >
                  Responder
                </button>
                <button
                  type='button'
                  onClick={() => {
                    if (confirm('¿Eliminar esta reseña?')) deleteReview(review.id);
                  }}
                  className='px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium cursor-pointer hover:bg-gray-200'
                >
                  Eliminar
                </button>
              </div>

              {respondingTo === review.id && (
                <div className='mt-4 flex gap-2'>
                  <Textarea
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    rows={2}
                    className='flex-1'
                    placeholder='Escribe una respuesta...'
                  />
                  <Button
                    variant='primary'
                    className='cursor-pointer self-end'
                    onClick={() => handleResponse(review.id)}
                  >
                    Enviar
                  </Button>
                </div>
              )}
            </DashboardCard>
          ))}
        </div>
      )}
    </div>
  );
};

ReviewsModeration.displayName = 'ReviewsModeration';
