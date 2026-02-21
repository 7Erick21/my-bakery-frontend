'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type FC, useState } from 'react';
import { Button, Card, IconButton, Modal } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';
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
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);

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
          className='inline-flex items-center gap-2 text-base text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-8 transition-colors group'
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
          {t('products.backToProducts', 'Volver a productos')}
        </Link>

        <div className='grid md:grid-cols-2 gap-12'>
          {/* Images — sticky so it follows scroll */}
          <div className='space-y-4 md:sticky md:top-24 md:self-start'>
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
                  <IconButton
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label='Menos'
                    className='!rounded-none !w-10 !h-10'
                  >
                    −
                  </IconButton>
                  <span className='px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium min-w-[3rem] text-center'>
                    {quantity}
                  </span>
                  <IconButton
                    onClick={() => setQuantity(q => q + 1)}
                    aria-label='Mas'
                    className='!rounded-none !w-10 !h-10'
                  >
                    +
                  </IconButton>
                </div>
                <Button
                  variant='default'
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
                  className={`flex-1 !py-3 !text-lg text-white ${
                    cartAdded ? '!from-green-500 !via-green-500 !to-green-500' : ''
                  }`}
                >
                  {cartAdded ? t('cart.added', 'Añadido') : t('cart.add', 'Añadir al carrito')}
                </Button>
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
          </div>
        </div>

        {/* Ingredients & Preparation — collapsible, full width below the grid */}
        {(product.ingredients?.length > 0 || product.preparation_steps?.length > 0) && (
          <div className='mt-12 space-y-6'>
            {/* Ingredients — collapsible with badge pills */}
            {product.ingredients?.length > 0 && (
              <Card variant='glass' className='rounded-2xl p-6'>
                <button
                  type='button'
                  onClick={() => setIngredientsOpen(!ingredientsOpen)}
                  className='flex items-center justify-between w-full cursor-pointer'
                >
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                    {t('products.ingredients', 'Ingredientes')}{' '}
                    <span className='text-sm font-normal text-gray-500'>
                      ({product.ingredients.length})
                    </span>
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${ingredientsOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
                {ingredientsOpen && (
                  <div className='flex flex-wrap gap-2 mt-4'>
                    {product.ingredients
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(ing => (
                        <span
                          key={ing.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                            ing.is_allergen
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {ing.is_allergen && (
                            <svg
                              className='w-3.5 h-3.5'
                              fill='none'
                              viewBox='0 0 24 24'
                              strokeWidth={2}
                              stroke='currentColor'
                              aria-hidden='true'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
                              />
                            </svg>
                          )}
                          {ing.ingredient_translations?.[0]?.name}
                        </span>
                      ))}
                  </div>
                )}
              </Card>
            )}

            {/* Preparation steps — collapsible */}
            {product.preparation_steps?.length > 0 && (
              <Card variant='glass' className='rounded-2xl p-6'>
                <button
                  type='button'
                  onClick={() => setStepsOpen(!stepsOpen)}
                  className='flex items-center justify-between w-full cursor-pointer'
                >
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                    {t('products.preparationSteps', 'Proceso de elaboracion')}{' '}
                    <span className='text-sm font-normal text-gray-500'>
                      ({product.preparation_steps.length})
                    </span>
                  </h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${stepsOpen ? 'rotate-180' : ''}`}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
                {stepsOpen && (
                  <div className='space-y-4 mt-4'>
                    {product.preparation_steps
                      .sort((a, b) => a.step_number - b.step_number)
                      .map(step => (
                        <div key={step.id} className='flex gap-3'>
                          <div className='w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xs shrink-0 mt-0.5'>
                            {step.step_number}
                          </div>
                          <div className='min-w-0'>
                            <h4 className='font-medium text-sm text-gray-900 dark:text-gray-100'>
                              {step.preparation_step_translations?.[0]?.title}
                            </h4>
                            {step.preparation_step_translations?.[0]?.description && (
                              <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                                {step.preparation_step_translations[0].description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className='mt-16 pt-8 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between mb-8'>
            <h2 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
              {t('products.reviews', 'Opiniones')}
            </h2>
            {!authLoading &&
              (user ? (
                <Button
                  variant='primary'
                  onClick={() => setReviewModalOpen(true)}
                  className='!text-sm'
                >
                  {t('products.addReview', 'Anadir resena')}
                </Button>
              ) : (
                <Button variant='primary' onClick={handleLogin} className='!text-sm'>
                  {t('products.loginToReview', 'Inicia sesion para opinar')}
                </Button>
              ))}
          </div>
          {reviews.length > 0 ? (
            <div className='grid md:grid-cols-2 gap-6'>
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={
                <svg
                  className='w-14 h-14'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1}
                  stroke='currentColor'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
                  />
                </svg>
              }
              title={t('products.noReviews', 'Aun no tiene opiniones')}
              description={t(
                'products.noReviewsDescription',
                'Se el primero en opinar sobre este producto.'
              )}
            />
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
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={t('products.addReview', 'Anadir resena')}
          size='lg'
        >
          <ReviewForm productId={product.id} onSuccess={() => setReviewModalOpen(false)} embedded />
        </Modal>
      </div>
    </div>
  );
};

ProductDetail.displayName = 'ProductDetail';
