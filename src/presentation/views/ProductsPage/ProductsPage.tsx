'use client';

import { type FC, useMemo, useState } from 'react';

import { ProductCard } from '@/components/molecules';
import type { CategoryListItem, ProductListItem } from '@/lib/supabase/models';
import { Layout } from '@/presentation/layout/Layout';
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
    <Layout>
      <section className='min-h-dvh pt-24 pb-16'>
        <div className='flex flex-col gap-12'>
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
            <button
              type='button'
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t('products.allCategories', 'Todos')}
            </button>
            {categories.map(cat => {
              const catName = cat.category_translations?.[0]?.name || cat.slug;
              return (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {catName}
                </button>
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
    </Layout>
  );
};

ProductsPage.displayName = 'ProductsPage';
