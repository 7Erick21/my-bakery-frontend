'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type FC, useState } from 'react';
import { Card } from '@/components/atoms';
import { signInWithGoogle } from '@/lib/auth/actions';
import type {
  ProductDetail as ProductDetailType,
  RelatedProduct,
  ReviewWithProfile
} from '@/lib/supabase/models';
import { SALES_ENABLED } from '@/lib/utils/features';
import { formatPrice } from '@/lib/utils/format';
import { useAuth } from '@/shared/hooks/useAuth';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useCartStore } from '@/shared/stores/cartStore';
import { ReviewCard } from '@/views/Reviews/ReviewCard';
import { ReviewForm } from '@/views/Reviews/ReviewForm';

interface ProductDetailProps {
  product: ProductDetailType;
  reviews?: ReviewWithProfile[];
  relatedProducts?: RelatedProduct[];
}

export const ProductDetail: FC<ProductDetailProps> = ({
  product,
  reviews = [],
  relatedProducts = []
}) => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const addItem = useCartStore(s => s.addItem);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartAdded, setCartAdded] = useState(false);

  async function handleLogin() {
    const url = await signInWithGoogle(`/products/${product.slug}`);
    window.location.href = url;
  }

  const translation = product.product_translations?.[0];
  const defaultImage =
    product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const category = product.categories;
  const catTranslation = category?.category_translations?.[0];

  return (
    <div className='min-h-dvh pt-24 pb-16 px-4'>
      <div className='max-w-6xl mx-auto'>
        <Link
          href='/products'
          className='inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-8 transition-colors'
        >
          ← {t('products.backToProducts', 'Volver a productos')}
        </Link>

        <div className='grid md:grid-cols-2 gap-12'>
          {/* Images */}
          <div className='space-y-4'>
            {selectedImage && (
              <Card variant='glass' className='rounded-2xl overflow-hidden'>
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt_text || translation?.name || ''}
                  width={600}
                  height={600}
                  className='w-full h-auto object-cover'
                />
              </Card>
            )}
            {product.product_images?.length > 1 && (
              <div className='grid grid-cols-4 gap-2'>
                {product.product_images.map(img => (
                  <button
                    key={img.id}
                    type='button'
                    onClick={() => setSelectedImage(img)}
                    className={`rounded-lg overflow-hidden cursor-pointer ring-2 transition-all ${
                      selectedImage?.id === img.id
                        ? 'ring-amber-500'
                        : 'ring-transparent hover:ring-amber-300'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt_text || ''}
                      width={150}
                      height={150}
                      className='object-cover w-full h-24'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className='space-y-6'>
            {catTranslation && (
              <span className='inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium'>
                {catTranslation.name}
              </span>
            )}

            <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>
              {translation?.name}
            </h1>

            <div className='flex items-center gap-4'>
              <span className='text-3xl font-bold text-amber-600 dark:text-amber-400'>
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className='text-xl text-gray-400 line-through'>
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Add to cart */}
            {SALES_ENABLED && (
              <div className='flex items-center gap-4'>
                <div className='flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className='px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer'
                  >
                    −
                  </button>
                  <span className='px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium min-w-[3rem] text-center'>
                    {quantity}
                  </span>
                  <button
                    type='button'
                    onClick={() => setQuantity(q => q + 1)}
                    className='px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer'
                  >
                    +
                  </button>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    const primaryImg =
                      product.product_images?.find(img => img.is_primary) ||
                      product.product_images?.[0];
                    for (let i = 0; i < quantity; i++) {
                      addItem({
                        productId: product.id,
                        name: translation?.name || '',
                        price: product.price,
                        imageUrl: primaryImg?.url
                      });
                    }
                    setCartAdded(true);
                    setQuantity(1);
                    setTimeout(() => setCartAdded(false), 1500);
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all cursor-pointer text-lg ${
                    cartAdded
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {cartAdded ? t('cart.added', 'Añadido') : t('cart.add', 'Añadir al carrito')}
                </button>
              </div>
            )}

            {translation?.short_description && (
              <p className='text-lg text-gray-600 dark:text-gray-400'>
                {translation.short_description}
              </p>
            )}

            {translation?.description && (
              <div className='prose dark:prose-invert max-w-none'>
                <p className='text-gray-600 dark:text-gray-400'>{translation.description}</p>
              </div>
            )}

            {/* Product details */}
            <div className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
              {product.preparation_time_minutes && (
                <div>
                  <span className='text-sm text-gray-500'>
                    {t('products.prepTime', 'Tiempo de preparación')}
                  </span>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    {product.preparation_time_minutes} min
                  </p>
                </div>
              )}
              {product.weight_grams && (
                <div>
                  <span className='text-sm text-gray-500'>{t('products.weight', 'Peso')}</span>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    {product.weight_grams}g
                  </p>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {product.ingredients?.length > 0 && (
              <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                  {t('products.ingredients', 'Ingredientes')}
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {product.ingredients
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(ing => (
                      <span
                        key={ing.id}
                        className={`px-3 py-1 rounded-full text-sm ${
                          ing.is_allergen
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {ing.ingredient_translations?.[0]?.name}
                        {ing.is_allergen && ' ⚠️'}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Preparation steps */}
            {product.preparation_steps?.length > 0 && (
              <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                  {t('products.preparationSteps', 'Proceso de elaboración')}
                </h3>
                <div className='space-y-4'>
                  {product.preparation_steps
                    .sort((a, b) => a.step_number - b.step_number)
                    .map(step => (
                      <div key={step.id} className='flex gap-4'>
                        <div className='w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm shrink-0'>
                          {step.step_number}
                        </div>
                        <div>
                          <h4 className='font-medium text-gray-900 dark:text-gray-100'>
                            {step.preparation_step_translations?.[0]?.title}
                          </h4>
                          {step.preparation_step_translations?.[0]?.description && (
                            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                              {step.preparation_step_translations[0].description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className='mt-16 pt-8 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between mb-8'>
            <h2 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
              {t('products.reviews', 'Opiniones')}
            </h2>
            {!authLoading &&
              (user ? (
                <button
                  type='button'
                  onClick={() => setReviewModalOpen(true)}
                  className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors cursor-pointer text-sm'
                >
                  {t('products.addReview', 'Anadir resena')}
                </button>
              ) : (
                <button
                  type='button'
                  onClick={handleLogin}
                  className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors cursor-pointer text-sm'
                >
                  {t('products.loginToReview', 'Inicia sesion para opinar')}
                </button>
              ))}
          </div>
          {reviews.length > 0 ? (
            <div className='grid md:grid-cols-2 gap-6'>
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className='text-gray-500 dark:text-gray-400'>
              {t(
                'products.noReviews',
                'Este producto aun no tiene opiniones. Se el primero en opinar.'
              )}
            </p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className='mt-16 pt-8 border-t border-gray-200 dark:border-gray-700'>
            <h2 className='text-24-32 font-bold text-gray-900 dark:text-gray-100 mb-8'>
              {t('products.relatedProducts', 'Productos similares')}
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {relatedProducts.map(rp => {
                const rpName = rp.product_translations?.[0]?.name;
                const rpImage =
                  rp.product_images?.find(img => img.is_primary) || rp.product_images?.[0];

                return (
                  <Link key={rp.id} href={`/products/${rp.slug}`}>
                    <Card
                      variant='glass'
                      className='rounded-xl overflow-hidden hover:scale-[1.02] transition-transform'
                    >
                      {rpImage && (
                        <Image
                          src={rpImage.url}
                          alt={rpName || ''}
                          width={300}
                          height={300}
                          className='w-full h-48 object-cover'
                        />
                      )}
                      <div className='p-4'>
                        <h3 className='font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2'>
                          {rpName}
                        </h3>
                        <div className='flex items-center gap-1.5 mt-1'>
                          <p className='text-amber-600 dark:text-amber-400 font-bold'>
                            {formatPrice(rp.price)}
                          </p>
                          {rp.compare_at_price && (
                            <span className='text-xs text-gray-400 line-through'>
                              {formatPrice(rp.compare_at_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
            onClick={e => {
              if (e.target === e.currentTarget) setReviewModalOpen(false);
            }}
          >
            <div className='w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl'>
              <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  {t('products.addReview', 'Anadir resena')}
                </h3>
                <button
                  type='button'
                  onClick={() => setReviewModalOpen(false)}
                  className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-500'
                >
                  ✕
                </button>
              </div>
              <div className='p-6'>
                <ReviewForm productId={product.id} onSuccess={() => setReviewModalOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProductDetail.displayName = 'ProductDetail';
