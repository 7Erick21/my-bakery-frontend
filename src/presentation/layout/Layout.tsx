'use client';

import { type FC, type PropsWithChildren, useEffect } from 'react';

import { Footer, Header } from '@/components/organisms';

type LayoutProps = PropsWithChildren;

export const Layout: FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    document.addEventListener('contextmenu', e => e.preventDefault());
    return () => {
      document.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, []);

  return (
    <main className='relative bg-white flex flex-col items-center min-h-dvh w-full bg-linear-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80 dark:bg-gray-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'>
      {/* Background with glass effect */}
      <div className='absolute top-0 left-1/4 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl' />

      {/* Floating background elements */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl animate-float' />

      <div
        className='absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-float'
        style={{ animationDelay: '2s' }}
      />

      <Header />
      <article className='flex flex-col grow basis-full shrink max-w-8xl px-24-64 w-full z-0'>
        {children}
      </article>
      <Footer />
    </main>
  );
};

Layout.displayName = 'Layout';
