'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';
import type { ReviewWithProfile } from '@/lib/supabase/models';
import { useTranslation } from '@/shared/hooks';

import { ReviewCard } from '../../Reviews/ReviewCard';

interface ReviewsProps {
  reviews: ReviewWithProfile[];
}

export function Reviews({ reviews }: ReviewsProps) {
  const { t } = useTranslation();
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setVisibleCards(prev => [...prev, index]);
          }
        }
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.review-card');
    for (const card of cards) observer.observe(card);

    return () => observer.disconnect();
  }, []);

  return (
    <section id='reviews' className='relative w-full pt-24'>
      {/* Background elements */}
      <div className='absolute -top-1/12 right-1/4 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl' />
      <div className='absolute top-1/3 -left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl' />

      <div className='flex flex-col items-center gap-16 relative z-10'>
        {/* Header */}
        <div className='text-center items-center flex flex-col gap-4 animate-fade-in'>
          <h2 className='text-60-96 leading-normal font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg'>
            {t('reviews.title')}
          </h2>
          <p className='text-2xl leading-normal text-gray-600 dark:text-gray-400 max-w-2xl drop-shadow-sm'>
            {t('reviews.description')}
          </p>
        </div>

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
            action={
              <Link href='/reviews'>
                <Button variant='primary'>{t('reviews.writeFirst')}</Button>
              </Link>
            }
          />
        ) : (
          <>
            {/* Reviews Grid */}
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full'>
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`review-card transition-[opacity,translate] duration-700 ease-in-out ${
                    visibleCards.includes(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  data-index={index}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>

            {/* See all button */}
            <Link href='/reviews'>
              <Button variant='primary' className='!px-8 !py-3 !text-lg'>
                {t('reviews.seeAll')}
              </Button>
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
