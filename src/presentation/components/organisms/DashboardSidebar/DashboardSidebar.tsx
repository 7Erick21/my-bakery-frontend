'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { IconButton } from '@/components/atoms';
import type { UserRole } from '@/lib/supabase/types';
import { useTranslation } from '@/shared/hooks/useTranslate';

/* ── SVG Icons ── */
const HomeIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
    />
  </svg>
);
const BreadIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z'
    />
  </svg>
);
const FolderIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z'
    />
  </svg>
);
const BoxIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z'
    />
  </svg>
);
const RepeatIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3'
    />
  </svg>
);
const ReceiptIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'
    />
  </svg>
);
const ChartIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z'
    />
  </svg>
);
const FactoryIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z'
    />
  </svg>
);
const StarIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
    />
  </svg>
);
const TicketIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z'
    />
  </svg>
);
const PencilIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10'
    />
  </svg>
);
const GlobeIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.47.353-2.856.978-4.082'
    />
  </svg>
);
const BellIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'
    />
  </svg>
);
const ClipboardIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z'
    />
  </svg>
);
const UsersIcon = (
  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'
    />
  </svg>
);

/* ── Sidebar structure ── */
interface SidebarChild {
  key: string;
  href: string;
  label: string;
}

interface SidebarItem {
  key: string;
  href?: string;
  icon: ReactNode;
  roles: UserRole[];
  children?: SidebarChild[];
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
  {
    label: '',
    items: [
      {
        key: 'home',
        href: '/dashboard',
        icon: HomeIcon,
        roles: ['super_admin', 'admin', 'marketing']
      }
    ]
  },
  {
    label: 'Tienda',
    items: [
      {
        key: 'products',
        href: '/dashboard/products',
        icon: BreadIcon,
        roles: ['super_admin', 'admin']
      },
      {
        key: 'categories',
        href: '/dashboard/categories',
        icon: FolderIcon,
        roles: ['super_admin', 'admin']
      },
      { key: 'orders', href: '/dashboard/orders', icon: BoxIcon, roles: ['super_admin', 'admin'] },
      {
        key: 'recurring',
        href: '/dashboard/recurring',
        icon: RepeatIcon,
        roles: ['super_admin', 'admin']
      },
      {
        key: 'invoices',
        href: '/dashboard/invoices',
        icon: ReceiptIcon,
        roles: ['super_admin', 'admin']
      }
    ]
  },
  {
    label: 'Operaciones',
    items: [
      {
        key: 'inventory',
        icon: ChartIcon,
        roles: ['super_admin', 'admin'],
        children: [
          { key: 'stock', href: '/dashboard/inventory', label: 'Stock' },
          {
            key: 'daily-report',
            href: '/dashboard/inventory/daily-report',
            label: 'Informe Diario'
          },
          {
            key: 'daily-report-history',
            href: '/dashboard/inventory/daily-report/history',
            label: 'Historial'
          },
          { key: 'movements', href: '/dashboard/inventory/movements', label: 'Movimientos' }
        ]
      },
      {
        key: 'production',
        href: '/dashboard/production',
        icon: FactoryIcon,
        roles: ['super_admin', 'admin']
      }
    ]
  },
  {
    label: 'Contenido',
    items: [
      {
        key: 'reviews',
        href: '/dashboard/reviews',
        icon: StarIcon,
        roles: ['super_admin', 'admin']
      },
      {
        key: 'coupons',
        href: '/dashboard/coupons',
        icon: TicketIcon,
        roles: ['super_admin', 'admin']
      },
      {
        key: 'content',
        icon: PencilIcon,
        roles: ['super_admin', 'admin', 'marketing'],
        children: [
          { key: 'hero', href: '/dashboard/content/hero', label: 'Hero / Banner' },
          { key: 'products_intro', href: '/dashboard/content/products_intro', label: 'Productos' },
          { key: 'about_intro', href: '/dashboard/content/about_intro', label: 'Sobre nosotros' },
          { key: 'about_footer', href: '/dashboard/content/about_footer', label: 'Pie de About' },
          { key: 'contact_intro', href: '/dashboard/content/contact_intro', label: 'Contacto' },
          { key: 'footer', href: '/dashboard/content/footer', label: 'Footer' },
          { key: 'seo', href: '/dashboard/content/seo', label: 'SEO / Metadatos' },
          { key: 'timeline', href: '/dashboard/content/timeline', label: 'Timeline' },
          { key: 'features', href: '/dashboard/content/features', label: 'Feature Cards' },
          {
            key: 'business-info',
            href: '/dashboard/content/business-info',
            label: 'Info del Negocio'
          },
          { key: 'social-links', href: '/dashboard/content/social-links', label: 'Redes Sociales' }
        ]
      },
      {
        key: 'languages',
        href: '/dashboard/languages',
        icon: GlobeIcon,
        roles: ['super_admin', 'admin', 'marketing']
      }
    ]
  },
  {
    label: 'Sistema',
    items: [
      {
        key: 'notifications',
        href: '/dashboard/notifications',
        icon: BellIcon,
        roles: ['super_admin', 'admin', 'marketing']
      },
      { key: 'audit', href: '/dashboard/audit', icon: ClipboardIcon, roles: ['super_admin'] },
      { key: 'users', href: '/dashboard/users', icon: UsersIcon, roles: ['super_admin'] }
    ]
  }
];

interface DashboardSidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: FC<DashboardSidebarProps> = ({ userRole, isOpen, onClose }) => {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Auto-expand sections if user is on a child page
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/dashboard/content')) initial.add('content');
      if (path.startsWith('/dashboard/inventory')) initial.add('inventory');
    }
    return initial;
  });

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Close sidebar on route change (mobile) — skip initial mount
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Auto-expand when navigating to expandable section pages
  useEffect(() => {
    const sections = ['content', 'inventory'] as const;
    for (const section of sections) {
      if (pathname.startsWith(`/dashboard/${section}`)) {
        setExpandedItems(prev => {
          if (prev.has(section)) return prev;
          return new Set([...prev, section]);
        });
      }
    }
  }, [pathname]);

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
          aria-label='Cerrar menu'
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
        <div className='absolute top-6 right-4 md:hidden'>
          <IconButton aria-label='Cerrar menu' onClick={onClose} size='md'>
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18 18 6M6 6l12 12' />
            </svg>
          </IconButton>
        </div>

        {/* Navigation */}
        <nav className='px-4 py-6 flex-1 overflow-y-auto'>
          {sidebarSections.map(section => {
            const visibleItems = section.items.filter(item => item.roles.includes(userRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label || 'home'}>
                {section.label && (
                  <p className='mt-6 mb-2 px-3 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                    {section.label}
                  </p>
                )}
                <div className='space-y-0.5'>
                  {visibleItems.map(item => {
                    if (item.children) {
                      const isExpanded = expandedItems.has(item.key);
                      const isChildActive = item.children.some(c => pathname.startsWith(c.href));

                      return (
                        <div key={item.key}>
                          <button
                            type='button'
                            onClick={() => toggleExpand(item.key)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-14-16 font-medium transition-colors duration-200 cursor-pointer ${
                              isChildActive
                                ? 'border-l-3 border-amber-500 bg-gradient-to-r from-amber-100/80 to-amber-50/40 dark:from-amber-900/30 dark:to-amber-800/10 text-amber-700 dark:text-amber-400'
                                : 'border-l-3 border-transparent text-gray-700 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/15'
                            }`}
                          >
                            <span className='flex-shrink-0'>{item.icon}</span>
                            <span className='flex-1 text-left'>
                              {t(`dashboard.nav.${item.key}`, item.key)}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              fill='none'
                              viewBox='0 0 24 24'
                              strokeWidth={2}
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='m19.5 8.25-7.5 7.5-7.5-7.5'
                              />
                            </svg>
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-200 ${
                              isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className='ml-5 pl-3 border-l border-amber-200/50 dark:border-amber-800/30 space-y-0.5 py-1'>
                              {item.children.map(child => {
                                const isActive =
                                  pathname === child.href || pathname.startsWith(`${child.href}/`);
                                return (
                                  <Link
                                    key={child.key}
                                    href={child.href as Route}
                                    className={`block px-3 py-1.5 rounded-md text-14-16 font-medium transition-colors duration-200 ${
                                      isActive
                                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-900/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-900/10'
                                    }`}
                                  >
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const isActive =
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href as string);

                    return (
                      <Link
                        key={item.key}
                        href={item.href as Route}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-14-16 font-medium transition-colors duration-200 ${
                          isActive
                            ? 'border-l-3 border-amber-500 bg-gradient-to-r from-amber-100/80 to-amber-50/40 dark:from-amber-900/30 dark:to-amber-800/10 text-amber-700 dark:text-amber-400'
                            : 'border-l-3 border-transparent text-gray-700 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/15'
                        }`}
                      >
                        <span className='flex-shrink-0'>{item.icon}</span>
                        <span>{t(`dashboard.nav.${item.key}`, item.key)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

DashboardSidebar.displayName = 'DashboardSidebar';
