'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type FC, type PropsWithChildren, useCallback, useState } from 'react';
import { Card, IconButton } from '@/components/atoms';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { SwitchTheme } from '@/components/organisms/SwitchTheme';
import { UserMenu } from '@/components/organisms/UserMenu';
import LogoImage from '@/images/logo.avif';
import type { UserRole } from '@/lib/supabase/types';

interface DashboardLayoutProps extends PropsWithChildren {
  userRole: UserRole;
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ userRole, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className='min-h-dvh flex flex-col bg-white bg-linear-to-br from-amber-50/80 via-orange-50/90 to-pink-50/80 dark:bg-gray-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30'>
      {/* Dashboard Header */}
      <Card
        variant='children'
        className='sticky top-0 z-50 h-18.25 shrink-0 flex items-center gap-4 px-6 py-4 border-b bg-gray-300/30 dark:bg-gray-900/30 border-amber-100/40 dark:border-white/5 backdrop-blur-xl rounded-b-2xl! rounded-t-none!'
      >
        {/* Hamburger — mobile only */}
        <IconButton
          aria-label='Abrir menú'
          onClick={() => setSidebarOpen(true)}
          className='md:hidden -ml-1 hover:!bg-amber-50/60 dark:hover:!bg-amber-900/15'
        >
          <svg
            className='w-5 h-5 text-gray-700 dark:text-gray-300'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            role='img'
          >
            <title>Menu</title>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
            />
          </svg>
        </IconButton>

        {/* Logo */}
        <Link href='/' className='flex items-center gap-2.5 group'>
          <Image
            src={LogoImage}
            alt='My Bakery'
            width={28}
            height={28}
            className='rounded-lg transition-transform duration-300 group-hover:rotate-12'
            unoptimized
          />
          <span className='text-14-16 font-bold text-gray-900 dark:text-gray-100 hidden sm:inline'>
            My Bakery
          </span>
        </Link>

        {/* Separator */}
        <div className='hidden md:block h-5 w-px bg-amber-200/50 dark:bg-white/10' />

        {/* Dashboard label */}
        <span className='hidden md:inline text-sm font-medium text-amber-600/80 dark:text-amber-400/70 uppercase tracking-wider'>
          Dashboard
        </span>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Controls */}
        <div className='flex items-center gap-2'>
          <SwitchTheme />
          <UserMenu />
        </div>
      </Card>

      {/* Body: Sidebar + Main */}
      <div className='flex flex-1'>
        <DashboardSidebar userRole={userRole} isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className='relative flex-1 overflow-hidden'>
          <div className='pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl animate-float' />
          <div className='pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange-200/10 blur-3xl animate-float [animation-delay:1.5s]' />
          <div className='relative z-0 p-4 md:p-6'>{children}</div>
        </main>
      </div>
    </div>
  );
};

DashboardLayout.displayName = 'DashboardLayout';
