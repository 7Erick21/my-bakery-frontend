'use client';

import Link from 'next/link';
import type { FC } from 'react';
import { OvenAnimate } from '@/components/molecules';
import { SelectLanguage, SwitchTheme } from '@/components/organisms';
import { useTranslation } from '@/presentation/shared/hooks/useTranslate';

export const NotFound: FC = () => {
  const { t } = useTranslation();

  return (
    <div className='flex w-dwh h-dvh items-center justify-center relative overflow-hidden bg-white bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80 dark:bg-gray-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'>
      {/* Background animated elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-32 right-32 w-40 h-40 bg-cream-200/30 rounded-full blur-2xl animate-float' />
        <div className='absolute top-1/2 left-1/3 w-24 h-24 bg-amber-300/20 rounded-full blur-xl animate-pulse' />
      </div>

      <div className='absolute max-w-8xl w-full justify-end top-0 mx-auto px-6 py-4 flex items-center gap-4'>
        <SelectLanguage />
        <SwitchTheme />
      </div>

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
            <Link
              href={{ pathname: '/' }}
              className='bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full transition-all duration-300 transform animate-pulse hover:scale-105'
              aria-label={t('notFound.homeButton')}
            >
              🏠 {t('notFound.homeButton')}
            </Link>
            <button
              onClick={() => window.history.back()}
              className='border border-amber-600 text-amber-600 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 px-8 py-3 rounded-full transition-all duration-300 transform animate-pulse hover:scale-105'
              aria-label={t('notFound.backButton')}
            >
              ← {t('notFound.backButton')}
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='absolute top-10 right-10 text-6xl animate-spin-slow opacity-20'>🥖</div>
        <div className='absolute bottom-10 left-10 text-5xl animate-bounce opacity-20'>🧁</div>
        <div className='absolute top-1/4 left-20 text-4xl animate-float opacity-30'>🍞</div>
        <div className='absolute bottom-1/3 right-16 text-4xl animate-wiggle opacity-30'>🥐</div>
      </div>
    </div>
  );
};

NotFound.displayName = 'NotFound';
