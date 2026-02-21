'use client';

import Link from 'next/link';
import type { FC } from 'react';

import { Button } from '@/components/atoms';
import { OvenAnimate } from '@/components/molecules';
import { useTranslation } from '@/presentation/shared/hooks/useTranslate';

export const NotFound: FC = () => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-center relative min-h-[calc(100dvh-80px)] py-12'>
      <div className='text-center z-10 px-4 max-w-2xl mx-auto'>
        {/* Animated SVG Illustration */}
        <div className='mb-8 relative'>
          <OvenAnimate />
          {/* 404 Numbers */}
          <p className='font-bold text-5xl text-amber-500 animate-bounce'>404</p>
        </div>

        <div className='animate-slide-in'>
          <h1 className='text-6xl font-bold mb-4 text-gradient'>{t('notFound.title')}</h1>
          <h2 className='text-2xl font-semibold mb-4 text-foreground'>{t('notFound.subtitle')}</h2>
          <p className='text-lg text-muted-foreground mb-8 leading-relaxed'>
            {t('notFound.description')}
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href={{ pathname: '/' }} aria-label={t('notFound.homeButton')}>
              <Button variant='default' className='!rounded-full !px-8 !py-3 text-white'>
                {t('notFound.homeButton')}
              </Button>
            </Link>
            <Button
              variant='outline'
              onClick={() => window.history.back()}
              className='!rounded-full !px-8 !py-3'
              aria-label={t('notFound.backButton')}
            >
              {t('notFound.backButton')}
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='absolute top-10 right-10 text-6xl animate-spin-slow opacity-20'>
          &#x1F956;
        </div>
        <div className='absolute bottom-10 left-10 text-5xl animate-bounce opacity-20'>
          &#x1F9C1;
        </div>
        <div className='absolute top-1/4 left-20 text-4xl animate-float opacity-30'>&#x1F35E;</div>
        <div className='absolute bottom-1/3 right-16 text-4xl animate-wiggle opacity-30'>
          &#x1F950;
        </div>
      </div>
    </div>
  );
};

NotFound.displayName = 'NotFound';
