'use client';

import type { FC } from 'react';

import { DashboardCard } from '@/components/atoms';
import type { UserRole } from '@/lib/supabase/types';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface DashboardHomeProps {
  role: UserRole;
  email: string;
}

export const DashboardHome: FC<DashboardHomeProps> = ({ role, email }) => {
  const { t } = useTranslation();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>
          {t('dashboard.welcome', 'Bienvenido al Dashboard')}
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-1'>
          {email} &middot;{' '}
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'>
            {role}
          </span>
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {(role === 'admin' || role === 'super_admin') && (
          <>
            <NavCard
              title={t('dashboard.cards.products', 'Productos')}
              description={t('dashboard.cards.productsDesc', 'Gestiona el catálogo de productos')}
              href='/dashboard/products'
              icon='🍞'
            />
            <NavCard
              title={t('dashboard.cards.orders', 'Pedidos')}
              description={t('dashboard.cards.ordersDesc', 'Gestiona pedidos de clientes')}
              href='/dashboard/orders'
              icon='📦'
            />
            <NavCard
              title={t('dashboard.cards.inventory', 'Inventario')}
              description={t('dashboard.cards.inventoryDesc', 'Control de stock y alertas')}
              href='/dashboard/inventory'
              icon='📊'
            />
          </>
        )}

        {(role === 'marketing' || role === 'admin' || role === 'super_admin') && (
          <>
            <NavCard
              title={t('dashboard.cards.content', 'Contenido')}
              description={t('dashboard.cards.contentDesc', 'Edita el contenido de la web')}
              href='/dashboard/content'
              icon='📝'
            />
            <NavCard
              title={t('dashboard.cards.languages', 'Idiomas')}
              description={t('dashboard.cards.languagesDesc', 'Gestiona traducciones')}
              href='/dashboard/languages'
              icon='🌐'
            />
          </>
        )}

        {role === 'super_admin' && (
          <>
            <NavCard
              title={t('dashboard.cards.users', 'Usuarios')}
              description={t('dashboard.cards.usersDesc', 'Gestiona roles de usuarios')}
              href='/dashboard/users'
              icon='👥'
            />
            <NavCard
              title={t('dashboard.cards.audit', 'Auditoría')}
              description={t('dashboard.cards.auditDesc', 'Registro de actividad')}
              href='/dashboard/audit'
              icon='📋'
            />
          </>
        )}
      </div>
    </div>
  );
};

DashboardHome.displayName = 'DashboardHome';

function NavCard({
  title,
  description,
  href,
  icon
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <DashboardCard className='hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group'>
      <a href={href} className='block'>
        <div className='text-3xl mb-3'>{icon}</div>
        <h3 className='text-24-32 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors'>
          {title}
        </h3>
        <p className='text-16-20 text-gray-600 dark:text-gray-400 mt-1'>{description}</p>
      </a>
    </DashboardCard>
  );
}
