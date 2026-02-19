'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { type FC, useEffect } from 'react';

import { Button } from '@/components/atoms';
import { formatPrice } from '@/lib/utils/format';
import { useTranslation } from '@/shared/hooks';
import { useCartStore } from '@/shared/stores/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
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
    <div
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}
    >
      {/* Overlay */}
      <button
        type='button'
        className={`absolute inset-0 w-full h-full bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 cursor-default ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label='Cerrar carrito'
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[90vw] max-w-lg bg-gradient-to-b from-white via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-amber-100 dark:border-gray-700/50'>
          <div className='flex items-center gap-3'>
            <svg
              className='w-6 h-6 text-amber-500'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z'
              />
            </svg>
            <h2 className='text-lg font-bold text-gray-900 dark:text-gray-100'>
              {t('cart.title', 'Carrito')}
            </h2>
            {items.length > 0 && (
              <span className='text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'>
                {items.length}
              </span>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-2 -mr-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer'
            aria-label='Cerrar carrito'
          >
            <svg
              className='w-5 h-5'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              aria-hidden='true'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <svg
                className='w-16 h-16 text-gray-200 dark:text-gray-700 mb-4'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z'
                />
              </svg>
              <p className='text-gray-400 dark:text-gray-500 font-medium'>
                {t('cart.empty', 'Tu carrito esta vacio')}
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {items.map(item => (
                <div
                  key={item.productId}
                  className='flex gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/40 shadow-sm'
                >
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className='w-20 h-20 rounded-xl object-cover shrink-0'
                    />
                  )}
                  <div className='flex-1 min-w-0 flex flex-col justify-between py-0.5'>
                    <div>
                      <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight'>
                        {item.name}
                      </h3>
                      <p className='text-amber-600 dark:text-amber-400 font-bold text-sm mt-0.5'>
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className='flex items-center justify-between mt-2'>
                      <div className='flex items-center gap-0 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden'>
                        <button
                          type='button'
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className='w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center text-sm font-medium'
                        >
                          −
                        </button>
                        <span className='w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50'>
                          {item.quantity}
                        </span>
                        <button
                          type='button'
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className='w-8 h-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-center text-sm font-medium'
                        >
                          +
                        </button>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeItem(item.productId)}
                        className='p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer'
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <svg
                          className='w-4 h-4'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          aria-hidden='true'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className='px-6 py-5 border-t border-amber-100 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-base font-semibold text-gray-900 dark:text-gray-100'>
                Total
              </span>
              <span className='text-xl font-bold text-amber-600 dark:text-amber-400'>
                {formatPrice(totalPrice())}
              </span>
            </div>
            <Link href={'/orders/new' as Route} onClick={onClose} className='block'>
              <Button variant='default' className='w-full px-6 py-3 text-white'>
                {t('cart.checkout', 'Realizar pedido')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

CartDrawer.displayName = 'CartDrawer';
