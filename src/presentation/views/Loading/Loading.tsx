import type { FC } from 'react';

import { BakeryAnimate } from '@/components/molecules';

export const Loading: FC = () => {
  return (
    <div className='w-dwh h-dvh flex items-center justify-center z-50 bg-white bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80 dark:bg-gray-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'>
      {/* Background animated elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute bottom-32 right-32 w-40 h-40 bg-cream-200/30 rounded-full blur-2xl animate-pulse'
          style={{ animationDelay: '1s' }}
        />
        <div className='absolute top-1/2 left-1/3 w-24 h-24 bg-amber-300/20 rounded-full blur-xl animate-float' />
      </div>

      <div className='text-center z-10'>
        {/* Animated SVG Baker */}
        <div className='mb-8'>
          <BakeryAnimate />
        </div>

        {/* Loading Text */}
        <div className='animate-fade-in'>
          <h2 className='text-3xl leading-normal font-bold mb-4 text-gradient'>Loading ...</h2>
        </div>

        {/* Loading Dots */}
        <div className='flex justify-center space-x-2'>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className='w-3 h-3 bg-amber-500 rounded-full animate-bounce'
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className='mt-8 w-64 mx-auto'>
          <div className='bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden'>
            <div className='bg-gradient-to-r from-amber-500 to-cream-500 h-full rounded-full animate-pulse w-full transition-all duration-1000' />
          </div>
        </div>

        {/* Decorative Elements */}
        <div className='absolute top-10 right-20 text-4xl animate-spin-slow opacity-30'>🍪</div>
        <div className='absolute bottom-20 left-16 text-3xl animate-bounce opacity-40'>🥯</div>
        <div className='absolute top-1/3 right-10 text-2xl animate-float opacity-35'>🧁</div>
      </div>
    </div>
  );
};

Loading.displayName = 'Loading';
