'use client';

import type { FC } from 'react';

import { Button } from '@/components/atoms';
import { useCartStore } from '@/shared/stores/cartStore';

interface CartButtonProps {
  onClick: () => void;
}

export const CartButton: FC<CartButtonProps> = ({ onClick }) => {
  const totalItems = useCartStore(state => state.totalItems());

  return (
    <Button
      variant='ghost'
      onClick={onClick}
      className='relative p-2 !bg-transparent shadow-card-children-light dark:shadow-card-children-dark text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400'
      aria-label='Carrito de compras'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='w-6 h-6'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={2}
        aria-hidden='true'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z'
        />
      </svg>
      {totalItems > 0 && (
        <span className='absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-gray-900'>
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Button>
  );
};

CartButton.displayName = 'CartButton';
