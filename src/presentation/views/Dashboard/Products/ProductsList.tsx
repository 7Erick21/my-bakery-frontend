'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import type { ProductAdminListItem } from '@/lib/supabase/models';
import { formatPrice } from '@/lib/utils/format';
import { getTranslation } from '@/lib/utils/translation';
import { deleteProduct, toggleProductVisibility } from '@/server/actions/products';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface ProductsListProps {
  products: ProductAdminListItem[];
}

export const ProductsList: FC<ProductsListProps> = ({ products }) => {
  const { t, lang } = useTranslation();

  const columns = [
    {
      key: 'image',
      header: '',
      className: 'w-16',
      render: (item: ProductAdminListItem) => {
        const primaryImage = item.product_images?.find(img => img.is_primary);
        return primaryImage ? (
          <Image
            src={primaryImage.url}
            alt=''
            width={40}
            height={40}
            className='w-10 h-10 rounded-lg object-cover'
          />
        ) : (
          <div className='w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700' />
        );
      }
    },
    {
      key: 'name',
      header: t('dashboard.products.name', 'Nombre'),
      render: (item: ProductAdminListItem) => {
        const translation = getTranslation(item.product_translations, lang);
        return (
          <Link
            href={`/dashboard/products/${item.id}` as Route}
            className='font-medium text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-400'
          >
            {translation?.name || item.slug}
          </Link>
        );
      }
    },
    {
      key: 'category',
      header: t('dashboard.products.category', 'Categoria'),
      render: (item: ProductAdminListItem) => {
        const catTranslation = getTranslation(item.categories?.category_translations, lang);
        return (
          <span className='text-14-16 text-gray-600 dark:text-gray-400'>
            {catTranslation?.name || item.categories?.slug || '-'}
          </span>
        );
      }
    },
    {
      key: 'price',
      header: t('dashboard.products.price', 'Precio'),
      render: (item: ProductAdminListItem) => (
        <span className='font-mono text-gray-900 dark:text-gray-100'>
          {formatPrice(item.price)}
        </span>
      )
    },
    {
      key: 'stock',
      header: t('dashboard.products.stock', 'Stock'),
      render: (item: ProductAdminListItem) => {
        const inv = item.inventory?.[0];
        if (!inv) return <span className='text-gray-400'>-</span>;
        const isLow = inv.stock <= inv.low_stock_threshold;
        return (
          <span className={isLow ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-400'}>
            {inv.stock}
          </span>
        );
      }
    },
    {
      key: 'visible',
      header: t('dashboard.products.visible', 'Visible'),
      render: (item: ProductAdminListItem) => (
        <button
          type='button'
          onClick={() => toggleProductVisibility(item.id, !item.is_visible)}
          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
            item.is_visible
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
          }`}
        >
          {item.is_visible ? 'Si' : 'No'}
        </button>
      )
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (item: ProductAdminListItem) => (
        <div className='flex gap-2'>
          <Link
            href={`/dashboard/products/${item.id}` as Route}
            className='text-amber-600 hover:text-amber-700 text-sm'
          >
            {t('dashboard.edit', 'Editar')}
          </Link>
          <button
            type='button'
            onClick={async () => {
              if (confirm('¿Eliminar este producto?')) {
                await deleteProduct(item.id);
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
        title={t('dashboard.nav.products', 'Productos')}
        action={
          <Link
            href={'/dashboard/products/new' as Route}
            className='px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm hover:shadow-md hover:shadow-amber-500/20 text-white rounded-lg text-sm font-medium transition-all'
          >
            {t('dashboard.products.create', 'Nuevo producto')}
          </Link>
        }
      />

      <DataTable columns={columns} data={products} emptyMessage='No hay productos' />
    </div>
  );
};

ProductsList.displayName = 'ProductsList';
