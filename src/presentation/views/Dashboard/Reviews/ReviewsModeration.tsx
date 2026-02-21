'use client';

import { type FC, useState } from 'react';

import { Button, DashboardCard, IconButton, StatusBadge, Textarea } from '@/components/atoms';
import { ConfirmDialog, EmptyState } from '@/components/molecules';
import TrashIcon from '@/icons/trash.svg';
import type { ReviewAdmin } from '@/lib/supabase/models';
import { formatDate } from '@/lib/utils/format';
import { addAdminResponse, deleteReview, updateReviewStatus } from '@/server/actions/reviews';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useToastStore } from '@/shared/stores/toastStore';
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
  const addToast = useToastStore(s => s.addToast);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleResponse(reviewId: string) {
    if (!responseText.trim()) return;
    await addAdminResponse(reviewId, responseText);
    setRespondingTo(null);
    setResponseText('');
    addToast({ message: 'Respuesta enviada', type: 'success' });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReview(deleteTarget);
      addToast({ message: 'Resena eliminada', type: 'success' });
    } catch {
      addToast({ message: 'Error al eliminar la resena', type: 'error' });
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  async function handleApprove(reviewId: string) {
    await updateReviewStatus(reviewId, 'approved');
    addToast({ message: 'Resena aprobada', type: 'success' });
  }

  return (
    <div>
      <PageHeader title={t('dashboard.nav.reviews', 'Resenas')} />

      {reviews.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className='w-12 h-12'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1}
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
              />
            </svg>
          }
          title='No hay resenas'
        />
      ) : (
        <div className='space-y-4'>
          {reviews.map(review => (
            <DashboardCard key={review.id}>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    {review.profiles?.full_name || review.profiles?.email || 'Anonimo'}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {formatDate(review.created_at)} — {review.review_type}
                  </p>
                  {review.products?.product_translations?.[0]?.name && (
                    <p className='text-sm text-amber-600 mt-1'>
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

              <p className='text-gray-700 dark:text-gray-300 text-16-20 mb-4'>{review.comment}</p>

              {review.admin_response && (
                <div className='p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border-l-2 border-amber-400 mb-4'>
                  <p className='text-sm font-medium text-amber-700 dark:text-amber-400 mb-1'>
                    Respuesta admin
                  </p>
                  <p className='text-16-20 text-gray-700 dark:text-gray-300'>
                    {review.admin_response}
                  </p>
                </div>
              )}

              <div className='flex items-center gap-2'>
                {review.status !== 'approved' && (
                  <Button
                    variant='ghost'
                    onClick={() => handleApprove(review.id)}
                    className='!px-3 !py-1 !bg-green-100 !text-green-700 !rounded !text-sm !border-0 hover:!bg-green-200'
                  >
                    Aprobar
                  </Button>
                )}
                {review.status !== 'rejected' && (
                  <Button
                    variant='ghost'
                    onClick={() => updateReviewStatus(review.id, 'rejected')}
                    className='!px-3 !py-1 !bg-red-100 !text-red-700 !rounded !text-sm !border-0 hover:!bg-red-200'
                  >
                    Rechazar
                  </Button>
                )}
                <Button
                  variant='ghost'
                  onClick={() => {
                    setRespondingTo(respondingTo === review.id ? null : review.id);
                    setResponseText(review.admin_response || '');
                  }}
                  className='!px-3 !py-1 !bg-amber-100 !text-amber-700 !rounded !text-sm !border-0 hover:!bg-amber-200'
                >
                  Responder
                </Button>
                <IconButton
                  aria-label='Eliminar'
                  variant='danger'
                  size='sm'
                  onClick={() => setDeleteTarget(review.id)}
                >
                  <TrashIcon className='w-3.5 h-3.5' />
                </IconButton>
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

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title='¿Eliminar esta resena?'
        description='Esta accion no se puede deshacer.'
        loading={deleting}
      />
    </div>
  );
};

ReviewsModeration.displayName = 'ReviewsModeration';
