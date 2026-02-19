'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import { StatusBadge } from '@/components/atoms';
import type { CategoryAdmin } from '@/lib/supabase/models';
import { getErrorMessage } from '@/lib/utils/error';
import { getTranslation } from '@/lib/utils/translation';
import { deleteCategory } from '@/server/actions/categories';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface CategoriesListProps {
  categories: CategoryAdmin[];
}

export const CategoriesList: FC<CategoriesListProps> = ({ categories }) => {
  const { t, lang } = useTranslation();

  const columns = [
    {
      key: 'name',
      header: t('dashboard.categories.name', 'Nombre'),
      render: (item: CategoryAdmin) => {
        const translation = getTranslation(item.category_translations, lang);
        return (
          <Link
            href={`/dashboard/categories/${item.id}` as Route}
            className='font-medium text-gray-900 dark:text-gray-100 hover:text-amber-600'
          >
            {translation?.name || item.slug}
          </Link>
        );
      }
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (item: CategoryAdmin) => (
        <span className='text-gray-600 dark:text-gray-400 font-mono text-xs'>{item.slug}</span>
      )
    },
    {
      key: 'visible',
      header: t('dashboard.products.visible', 'Visible'),
      render: (item: CategoryAdmin) => (
        <StatusBadge variant={item.is_visible ? 'green' : 'gray'}>
          {item.is_visible ? 'Si' : 'No'}
        </StatusBadge>
      )
    },
    {
      key: 'order',
      header: 'Orden',
      render: (item: CategoryAdmin) => (
        <span className='text-gray-600 dark:text-gray-400'>{item.sort_order}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (item: CategoryAdmin) => (
        <div className='flex gap-2'>
          <Link
            href={`/dashboard/categories/${item.id}` as Route}
            className='text-amber-600 hover:text-amber-700 text-sm'
          >
            {t('dashboard.edit', 'Editar')}
          </Link>
          <button
            type='button'
            onClick={async () => {
              if (confirm('¿Eliminar esta categoria?')) {
                try {
                  await deleteCategory(item.id);
                } catch (err: unknown) {
                  alert(getErrorMessage(err));
                }
              }
            }}
            className='text-red-500 hover:text-red-700 text-sm cursor-pointer'
          >
            {t('dashboard.delete', 'Eliminar')}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title={t('dashboard.nav.categories', 'Categorias')}
        action={
          <Link
            href={'/dashboard/categories/new' as Route}
            className='px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm hover:shadow-md hover:shadow-amber-500/20 text-white rounded-lg text-sm font-medium transition-all'
          >
            {t('dashboard.categories.create', 'Nueva categoria')}
          </Link>
        }
      />

      <DataTable columns={columns} data={categories} emptyMessage='No hay categorias' />
    </div>
  );
};

CategoriesList.displayName = 'CategoriesList';
