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
    <main className='flex flex-col items-center min-h-dvh w-full bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'>
      <Header />
      <article className='flex flex-col grow basis-full shrink max-w-8xl px-24-64 w-full overflow-hidden z-0'>
        {children}
      </article>
      <Footer />
    </main>
  );
};

Layout.displayName = 'Layout';
