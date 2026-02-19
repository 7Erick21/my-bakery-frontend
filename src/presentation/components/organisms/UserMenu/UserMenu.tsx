'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import type { FC } from 'react';
import { useState } from 'react';

import { Button, Card, UserAvatar } from '@/components/atoms';
import MoonIcon from '@/icons/moon.svg';
import SunIcon from '@/icons/sun.svg';
import { signOut } from '@/lib/auth/actions';
import { SALES_ENABLED } from '@/lib/utils/features';
import { useLangStore } from '@/presentation/shared/stores';
import { LanguageOptions } from '@/shared/defaults';
import { type ELanguage, ETheme } from '@/shared/enums';
import { useClickOutside, useTranslation } from '@/shared/hooks';
import { useAuth } from '@/shared/hooks/useAuth';

export const UserMenu: FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useClickOutside({ callback: () => setIsOpen(false) });

  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme ? resolvedTheme === ETheme.DARK : true;

  const { lang, setLang } = useLangStore();

  const isAuthenticated = !loading && !!user;
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0];
  const isStaff = user ? ['super_admin', 'admin', 'marketing'].includes(user.role) : false;

  const avatar = loading ? (
    <div className='w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse' />
  ) : isAuthenticated ? (
    <UserAvatar src={user?.avatarUrl} name={user?.fullName || user?.email} size='xs' />
  ) : (
    <svg
      className='w-7 h-7 text-gray-600 dark:text-gray-400'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z'
      />
      <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
    </svg>
  );

  return (
    <div className='relative' ref={menuRef}>
      {/* Desktop trigger: avatar + name + chevron (or settings icon if not logged in) */}
      <Button
        variant='ghost'
        onClick={() => setIsOpen(!isOpen)}
        className='hidden lg:flex items-center gap-2 px-3 py-1.5'
        aria-label={t('auth.userMenu', 'Menu de usuario')}
      >
        {avatar}
        {isAuthenticated && (
          <span className='text-sm font-medium text-gray-900 dark:text-gray-100 max-w-24 truncate'>
            {firstName}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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

      {/* Mobile trigger: just the avatar/icon */}
      <Button
        variant='ghost'
        onClick={() => setIsOpen(!isOpen)}
        className='lg:hidden p-1.5'
        aria-label={t('auth.userMenu', 'Menu de usuario')}
      >
        {avatar}
      </Button>

      {isOpen && (
        <Card
          variant='children'
          className='absolute right-0 mt-2 w-60 py-2 z-50 bg-white/95 dark:bg-gray-800/95'
        >
          {/* User info or login link */}
          {isAuthenticated && user ? (
            <>
              <div className='px-4 py-2 border-b border-gray-100 dark:border-gray-700'>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                  {user.fullName || user.email}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{user.email}</p>
              </div>

              {/* Navigation links */}
              <div className='py-1'>
                {SALES_ENABLED && (
                  <Link
                    href={'/orders' as Route}
                    onClick={() => setIsOpen(false)}
                    className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mx-1 transition-colors'
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
                    className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mx-1 transition-colors'
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
            </>
          ) : (
            <div className='py-1'>
              <Link
                href='/auth'
                onClick={() => setIsOpen(false)}
                className='flex items-center gap-3 px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mx-1 transition-colors'
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
                    d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'
                  />
                </svg>
                {t('auth.login', 'Iniciar sesion')}
              </Link>
            </div>
          )}

          {/* Theme toggle — hidden on mobile (shown in header bar instead) */}
          <div className='hidden lg:block border-t border-gray-100 dark:border-gray-700 px-4 py-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                {t('settings.theme', 'Tema')}
              </span>
              <button
                type='button'
                onClick={() => setTheme(isDark ? ETheme.LIGHT : ETheme.DARK)}
                className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer'
              >
                {isDark ? (
                  <>
                    <SunIcon className='w-4 h-4 fill-amber-400' />
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {t('settings.light', 'Claro')}
                    </span>
                  </>
                ) : (
                  <>
                    <MoonIcon className='w-4 h-4 fill-amber-900' />
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      {t('settings.dark', 'Oscuro')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Language selector — hidden on mobile (shown in header bar instead) */}
          <div className='hidden lg:block border-t border-gray-100 dark:border-gray-700 px-4 py-2'>
            <span className='text-sm text-gray-700 dark:text-gray-300 block mb-1.5'>
              {t('settings.language', 'Idioma')}
            </span>
            <div className='flex gap-1'>
              {LanguageOptions.map(option => (
                <button
                  key={option.code}
                  type='button'
                  onClick={() => setLang(option.code as ELanguage)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    lang === option.code
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logout - only for authenticated users */}
          {isAuthenticated && (
            <div className='border-t border-gray-100 dark:border-gray-700 py-1'>
              <form action={signOut}>
                <button
                  type='submit'
                  className='flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mx-1 transition-colors cursor-pointer'
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
                </button>
              </form>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

UserMenu.displayName = 'UserMenu';
