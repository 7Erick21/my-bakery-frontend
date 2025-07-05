import { FC } from 'react';
import Link from 'next/link';

import { OvenAnimate } from '@/components/molecules';

export const NotFound: FC = () => {
  return (
    <div className='flex w-dwh h-dvh items-center justify-center bg-main-light relative overflow-hidden dark:bg-main-dark'>
      {/* Background animated elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-bakery-200/30 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-32 right-32 w-40 h-40 bg-cream-200/30 rounded-full blur-2xl animate-float' />
        <div className='absolute top-1/2 left-1/3 w-24 h-24 bg-bakery-300/20 rounded-full blur-xl animate-pulse' />
      </div>

      <div className='text-center z-10 px-4 max-w-2xl mx-auto'>
        {/* Animated SVG Illustration */}
        <div className='mb-8 relative'>
          <OvenAnimate />
          {/* 404 Numbers */}
          <p className='font-bold text-5xl text-amber-500 animate-bounce'>404</p>
        </div>

        <div className='animate-slide-in'>
          <h1 className='text-6xl font-bold mb-4 text-gradient'>¡Oops!</h1>
          <h2 className='text-2xl font-semibold mb-4 text-foreground'>
            La página que buscas no existe
          </h2>
          <p className='text-lg text-muted-foreground mb-8 leading-relaxed'>
            Parece que esta página se ha horneado demasiado y ya no está disponible. Pero no te
            preocupes, tenemos muchas otras delicias esperándote.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/'
              className='bg-bakery-600 hover:bg-bakery-700 text-white px-8 py-3 rounded-full transition-all duration-300 transform animate-pulse hover:scale-105'
            >
              🏠 Volver al Inicio
            </Link>
            <button
              // onClick={() => window.history.back()}
              className='border border-bakery-600 text-bakery-600 cursor-pointer hover:bg-bakery-50 dark:hover:bg-bakery-900/20 px-8 py-3 rounded-full transition-all duration-300 transform animate-pulse hover:scale-105'
            >
              ← Página Anterior
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
