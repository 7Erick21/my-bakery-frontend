'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC, useEffect, useRef } from 'react';

import type { UserRole } from '@/lib/supabase/types';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface SidebarItem {
  key: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

const sidebarItems: SidebarItem[] = [
  { key: 'home', href: '/dashboard', icon: '🏠', roles: ['super_admin', 'admin', 'marketing'] },
  {
    key: 'products',
    href: '/dashboard/products',
    icon: '🍞',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'categories',
    href: '/dashboard/categories',
    icon: '📂',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'orders',
    href: '/dashboard/orders',
    icon: '📦',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'recurring',
    href: '/dashboard/recurring',
    icon: '🔁',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'invoices',
    href: '/dashboard/invoices',
    icon: '🧾',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'inventory',
    href: '/dashboard/inventory',
    icon: '📊',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'production',
    href: '/dashboard/production',
    icon: '🏭',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'reviews',
    href: '/dashboard/reviews',
    icon: '⭐',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'coupons',
    href: '/dashboard/coupons',
    icon: '🎟️',
    roles: ['super_admin', 'admin']
  },
  {
    key: 'content',
    href: '/dashboard/content',
    icon: '📝',
    roles: ['super_admin', 'admin', 'marketing']
  },
  {
    key: 'languages',
    href: '/dashboard/languages',
    icon: '🌐',
    roles: ['super_admin', 'admin', 'marketing']
  },
  {
    key: 'notifications',
    href: '/dashboard/notifications',
    icon: '🔔',
    roles: ['super_admin', 'admin', 'marketing']
  },
  { key: 'audit', href: '/dashboard/audit', icon: '📋', roles: ['super_admin'] },
  { key: 'users', href: '/dashboard/users', icon: '👥', roles: ['super_admin'] }
];

interface DashboardSidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: FC<DashboardSidebarProps> = ({ userRole, isOpen, onClose }) => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const visibleItems = sidebarItems.filter(item => item.roles.includes(userRole));

  // Close sidebar on route change (mobile) — skip initial mount
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 backdrop-blur-sm md:hidden'
          onClick={onClose}
          onKeyDown={e => e.key === 'Escape' && onClose()}
          role='button'
          tabIndex={0}
          aria-label='Cerrar menú'
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-18.25 left-0 z-40 h-[calc(100dvh-4.5625rem)] w-64 flex flex-col
          backdrop-blur-xl border-r border-amber-100/40 dark:border-white/5
          transition-transform duration-300 ease-in-out
          md:sticky md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile close button */}
        <button
          type='button'
          onClick={onClose}
          className='absolute top-6 right-4 md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-amber-50/50 dark:hover:bg-amber-900/15 cursor-pointer'
          aria-label='Cerrar menú'
        >
          <svg
            className='w-4 h-4 text-gray-500 dark:text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            role='img'
          >
            <title>Cerrar</title>
            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
          </svg>
        </button>

        {/* Navigation */}
        <nav className='px-4 py-6 space-y-0.5 flex-1 overflow-y-auto'>
          {visibleItems.map(item => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.key}
                href={item.href as Route}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-100/80 to-amber-50/40 dark:from-amber-900/30 dark:to-amber-800/10 text-amber-700 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/15'
                }`}
              >
                <span className='text-lg'>{item.icon}</span>
                <span>{t(`dashboard.nav.${item.key}`, item.key)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

DashboardSidebar.displayName = 'DashboardSidebar';
