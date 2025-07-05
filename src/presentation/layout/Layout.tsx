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
    <main className='flex flex-col items-center bg-main-light min-h-dvh w-full dark:bg-main-dark'>
      <article className='flex flex-col grow basis-full shrink max-w-8xl px-5 w-full'>
        <Header />
        <section className='overflow-hidden mt-28'>{children}</section>
      </article>
      <Footer />
    </main>
  );
};

Layout.displayName = 'Layout';
