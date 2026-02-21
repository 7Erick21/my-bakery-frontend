'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';
import { useState } from 'react';

import { Button, Card, UserAvatar } from '@/components/atoms';
import { signInWithGoogle, signOut } from '@/lib/auth/actions';
import { SALES_ENABLED } from '@/lib/utils/features';
import { useClickOutside, useTranslation } from '@/shared/hooks';
import { useAuth } from '@/shared/hooks/useAuth';

interface UserMenuProps {
  variant?: 'default' | 'mobile';
  onAction?: () => void;
}

export const UserMenu: FC<UserMenuProps> = ({ variant = 'default', onAction }) => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useClickOutside({ callback: () => setIsOpen(false) });

  const isAuthenticated = !loading && !!user;
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0];
  const isStaff = user ? ['super_admin', 'admin', 'marketing'].includes(user.role) : false;

  const isMobile = variant === 'mobile';

  // ─── Loading state ───────────────────────────────────────
  if (loading) {
    if (isMobile) return null;
    return <div className='hidden lg:block w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse' />;
  }

  // ─── Not authenticated: Google sign-in button ──────────
  if (!isAuthenticated) {
    const handleGoogleSignIn = async () => {
      onAction?.();
      const url = await signInWithGoogle();
      window.location.href = url;
    };

    const googleIcon = (
      <svg className='w-5 h-5 shrink-0' viewBox='0 0 24 24' aria-hidden='true'>
        <path
          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z'
          fill='#4285F4'
        />
        <path
          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
          fill='#34A853'
        />
        <path
          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
          fill='#FBBC05'
        />
        <path
          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
          fill='#EA4335'
        />
      </svg>
    );

    if (isMobile) {
      return (
        <Button
          variant='ghost'
          onClick={handleGoogleSignIn}
          className='!w-full !justify-start !gap-3 !px-4 !py-2.5 !text-14-16 !font-medium'
        >
          {googleIcon}
          <span className='text-gray-700 dark:text-gray-200'>
            {t('auth.googleButton', 'Continuar con Google')}
          </span>
        </Button>
      );
    }

    return (
      <div className='hidden lg:block'>
        <Button
          variant='ghost'
          onClick={handleGoogleSignIn}
          className='!h-10 !px-3 !py-0 !gap-2'
        >
          {googleIcon}
          <span className='text-14-16 font-medium text-gray-700 dark:text-gray-200'>
            {t('auth.googleButton', 'Continuar con Google')}
          </span>
        </Button>
      </div>
    );
  }

  // Mobile variant for authenticated users doesn't render anything extra
  if (isMobile) return null;

  // ─── Authenticated: avatar dropdown ──────────────────────
  return (
    <div className='relative' ref={menuRef}>
      <Button
        variant='ghost'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-1.5 py-1 !bg-transparent shadow-card-children-light dark:shadow-card-children-dark'
        aria-label={t('auth.userMenu', 'Menu de usuario')}
      >
        <UserAvatar src={user?.avatarUrl} name={user?.fullName || user?.email} size='xs' />
        <span className='hidden lg:inline text-14-16 font-medium text-gray-900 dark:text-gray-100 max-w-24 truncate'>
          {firstName}
        </span>
        <svg
          className={`hidden lg:block w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox='0 0 20 20'
          fill='currentColor'
          aria-hidden='true'
        >
          <path
            fillRule='evenodd'
            d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
            clipRule='evenodd'
          />
        </svg>
      </Button>

      {isOpen && (
        <Card
          variant='children'
          className='absolute right-0 mt-2 w-60 py-2 z-50 !bg-modal-light dark:!bg-modal-dark'
        >
          {/* User info */}
          <div className='px-4 py-2 border-b border-gray-100 dark:border-gray-700'>
            <div className='flex items-center gap-3'>
              <UserAvatar src={user?.avatarUrl} name={user?.fullName || user?.email} size='md' />
              <div className='min-w-0'>
                <p className='text-14-16 font-medium text-gray-900 dark:text-gray-100 truncate'>
                  {user.fullName || user.email}
                </p>
                <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className='py-1'>
            {SALES_ENABLED && (
              <Link
                href={'/orders' as Route}
                onClick={() => setIsOpen(false)}
                className='flex items-center gap-3 px-4 py-2 text-14-16 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mx-1 transition-colors'
              >
                <svg
                  className='w-4 h-4'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
                  />
                </svg>
                {t('auth.myOrders', 'Mis pedidos')}
              </Link>
            )}

            {isStaff && (
              <Link
                href='/dashboard'
                onClick={() => setIsOpen(false)}
                className='flex items-center gap-3 px-4 py-2 text-14-16 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mx-1 transition-colors'
              >
                <svg
                  className='w-4 h-4'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
                  />
                </svg>
                {t('auth.dashboard', 'Dashboard')}
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className='border-t border-gray-100 dark:border-gray-700 py-1'>
            <form action={signOut}>
              <Button
                variant='ghost'
                type='submit'
                className='flex items-center gap-3 w-full !text-left !px-4 !py-2 !text-14-16 !text-red-600 dark:!text-red-400 !rounded-lg mx-1 !border-0'
              >
                <svg
                  className='w-4 h-4'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75'
                  />
                </svg>
                {t('auth.logout', 'Cerrar sesion')}
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
};

UserMenu.displayName = 'UserMenu';
