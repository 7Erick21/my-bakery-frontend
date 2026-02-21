'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button, Card } from '@/components/atoms';
import type { LandingCmsSection, ProductListItem } from '@/lib/supabase/models';
import { SALES_ENABLED } from '@/lib/utils/features';
import { formatPrice } from '@/lib/utils/format';
import { getTranslation } from '@/lib/utils/translation';
import { useTranslation } from '@/shared/hooks';
import { useCartStore } from '@/shared/stores/cartStore';

interface ProductsProps {
  products: ProductListItem[];
  introContent?: LandingCmsSection;
}

export function Products({ products, introContent }: ProductsProps) {
  const { lang, t } = useTranslation();

  const intro = getTranslation(introContent?.cms_content_translations, lang);
  const sectionTitle = intro?.title || t('products.title');
  const sectionDescription = intro?.body || t('products.description');
  const addItem = useCartStore(s => s.addItem);
  const [addedId, setAddedId] = useState<string | null>(null);

  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setVisibleCards(prev => [...prev, index]);
          }
        }
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.product-card');
    for (const card of cards) observer.observe(card);

    return () => observer.disconnect();
  }, []);

  function handleAddToCart(e: React.MouseEvent, product: ProductListItem) {
    e.preventDefault();
    e.stopPropagation();
    const translation = product.product_translations?.[0];
    const primaryImage =
      product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
    addItem({
      productId: product.id,
      name: translation?.name || '',
      price: product.price,
      imageUrl: primaryImage?.url
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <section id='products' className='relative min-h-dvh w-full pt-24'>
      {/* Background elements */}
      <div className='absolute -top-1/12 left-1/3 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl' />
      <div className='absolute top-1/4 -right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl' />
      <div className='absolute top-2/3 -left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl' />

      <div className='flex flex-col items-center gap-16 relative z-10 w-full'>
        {/* Header */}
        <div className='text-center items-center flex flex-col gap-4 animate-fade-in'>
          <h2 className='text-60-96 leading-normal font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg'>
            {sectionTitle}
          </h2>
          <p className='text-2xl leading-normal text-gray-600 dark:text-gray-400 max-w-2xl drop-shadow-sm'>
            {sectionDescription}
          </p>
        </div>

        {/* Products Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {products.map((product, index) => {
            const translation = product.product_translations?.[0];
            const primaryImage =
              product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
            const isAdded = addedId === product.id;

            return (
              <Link key={product.id} href={`/products/${product.slug}` as Route}>
                <Card
                  variant='glass'
                  className={`product-card max-w-md group rounded-2xl cursor-pointer transition-[opacity,translate] duration-700 ease-in-out ${
                    visibleCards.includes(index)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  data-index={index}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {primaryImage && (
                    <div className='rounded-2xl overflow-hidden aspect-square'>
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt_text || translation?.name || 'Producto'}
                        width={400}
                        height={400}
                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>
                  )}
                  <div className='flex flex-col gap-4 p-6'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-2xl leading-normal font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 transition-colors duration-300 drop-shadow-sm'>
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
                      <p className='text-base leading-normal text-gray-600 dark:text-gray-400 drop-shadow-sm line-clamp-2'>
                        {translation.short_description}
                      </p>
                    )}
                    {SALES_ENABLED && (
                      <Button
                        variant='primary'
                        onClick={e => handleAddToCart(e, product)}
                        className={`w-full !py-2.5 !text-sm ${
                          isAdded
                            ? '!from-green-500 !to-green-500 !hover:from-green-600 !hover:to-green-600'
                            : ''
                        }`}
                      >
                        {isAdded ? t('cart.added', 'Anadido') : t('cart.add', 'Anadir al carrito')}
                      </Button>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Ver todos button */}
        <Link href={(intro?.cta_url || '/products') as Route}>
          <Button variant='primary'>
            {intro?.cta_text || t('products.viewAll', 'Ver todos los productos')}
          </Button>
        </Link>
      </div>
    </section>
  );
}
