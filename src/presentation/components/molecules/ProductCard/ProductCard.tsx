'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { Card } from '@/components/atoms';
import type { ProductListItem } from '@/lib/supabase/models';
import { SALES_ENABLED } from '@/lib/utils/features';
import { formatPrice } from '@/lib/utils/format';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useCartStore } from '@/shared/stores/cartStore';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

export const ProductCard: FC<ProductCardProps> = ({ product, className = '' }) => {
  const { t } = useTranslation();
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);

  const translation = product.product_translations?.[0];
  const primaryImage =
    product.product_images?.find(img => img.is_primary) || product.product_images?.[0];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: translation?.name || '',
      price: product.price,
      imageUrl: primaryImage?.url
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/products/${product.slug}` as Route}>
      <Card
        variant='glass'
        className={`group rounded-3xl transition-all duration-500 hover:shadow-xl cursor-pointer h-full ${className}`}
      >
        {primaryImage && (
          <div className='rounded-t-3xl overflow-hidden aspect-square'>
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || translation?.name || ''}
              width={400}
              height={400}
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
            />
          </div>
        )}
        <div className='flex flex-col gap-3 p-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 transition-colors'>
              {translation?.name}
            </h3>
            <div className='flex items-center gap-1.5'>
              <span className='text-lg font-bold text-amber-600 dark:text-amber-400'>
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className='text-sm text-gray-400 line-through'>
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
          </div>
          {translation?.short_description && (
            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
              {translation.short_description}
            </p>
          )}
          {SALES_ENABLED && (
            <button
              type='button'
              onClick={handleAddToCart}
              className={`mt-1 w-full py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                added ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {added ? t('cart.added', 'Añadido') : t('cart.add', 'Añadir al carrito')}
            </button>
          )}
        </div>
      </Card>
    </Link>
  );
};

ProductCard.displayName = 'ProductCard';
