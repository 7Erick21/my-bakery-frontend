'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/atoms';
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
    <section id='reviews' className='relative min-h-dvh w-full pt-24'>
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
          <div className='text-center py-16'>
            <p className='text-24-36 text-gray-500 dark:text-gray-400 mb-4'>{t('reviews.empty')}</p>
            <Link
              href='/reviews'
              className='px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors text-lg inline-block'
            >
              {t('reviews.writeFirst')}
            </Link>
          </div>
        ) : (
          <>
            {/* Reviews Grid */}
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {reviews.map((review, index) => (
                <Card
                  variant='glass'
                  key={review.id}
                  className={`review-card max-w-md transition-[opacity,translate] duration-700 ease-in-out ${
                    visibleCards.includes(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  data-index={index}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className='p-2'>
                    <ReviewCard review={review} />
                  </div>
                </Card>
              ))}
            </div>

            {/* See all button */}
            <Link
              href='/reviews'
              className='px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors text-lg'
            >
              {t('reviews.seeAll')}
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
