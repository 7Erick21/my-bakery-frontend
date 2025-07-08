'use client';

import { FC, PropsWithChildren, useEffect, useState } from 'react';

import { Footer, Header } from '@/components/organisms';
import { Loading } from '@/views/Loading';

type LayoutProps = PropsWithChildren;

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Loading />;

  return (
    <main className='relative bg-white flex flex-col items-center min-h-dvh w-full bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80 dark:bg-gray-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'>
      {/* Background with glass effect */}
      {/* <div className='absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'></div> */}
      <div className='absolute top-0 left-1/4 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl'></div>
      {/* Floating background elements */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl animate-float'></div>

      <div
        className='absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-float'
        style={{ animationDelay: '2s' }}
      ></div>

      <Header />
      <article className='flex flex-col grow basis-full shrink max-w-8xl px-24-64 w-full z-0'>
        {children}
      </article>
      <Footer />
    </main>
  );
};

Layout.displayName = 'Layout';
