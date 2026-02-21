'use client';

import Link from 'next/link';
import { type FC, useMemo, useState } from 'react';

import { Button } from '@/components/atoms';
import { ProductCard } from '@/components/molecules';
import type { CategoryListItem, ProductListItem } from '@/lib/supabase/models';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface ProductsPageProps {
  products: ProductListItem[];
  categories: CategoryListItem[];
}

export const ProductsPage: FC<ProductsPageProps> = ({ products, categories }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter(p => p.category_id === selectedCategory);
    }
    if (selectedSeason) {
      result = result.filter(p => p.season_tags?.includes(selectedSeason));
    }
    return result;
  }, [products, selectedCategory, selectedSeason]);

  return (
    <section className='pt-24 pb-16'>
      <div className='flex flex-col gap-12'>
        {/* Back button */}
        <Link
          href='/#products'
          className='inline-flex items-center gap-2 text-base text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors group'
        >
          <svg
            className='w-4 h-4 transition-transform group-hover:-translate-x-0.5'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5 8.25 12l7.5-7.5' />
          </svg>
          {t('products.backToHome', 'Volver')}
        </Link>

        {/* Header */}
        <div className='text-center'>
          <h1 className='text-60-96 font-bold text-gray-900 dark:text-gray-100'>
            {t('products.title')}
          </h1>
          <p className='text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto'>
            {t('products.description')}
          </p>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap gap-3 justify-center'>
          <Button
            variant={!selectedCategory ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(null)}
            className='!rounded-full !px-4 !py-2 !text-sm'
          >
            {t('products.allCategories', 'Todos')}
          </Button>
          {categories.map(cat => {
            const catName = cat.category_translations?.[0]?.name || cat.slug;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
                onClick={() => setSelectedCategory(cat.id)}
                className='!rounded-full !px-4 !py-2 !text-sm'
              >
                {catName}
              </Button>
            );
          })}
        </div>

        {/* Products grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className='text-center text-gray-500 dark:text-gray-400 py-12'>
            {t('products.noProducts', 'No se encontraron productos')}
          </p>
        )}
      </div>
    </section>
  );
};

ProductsPage.displayName = 'ProductsPage';
