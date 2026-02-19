'use client';

import type { FC } from 'react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
}

export const StarRating: FC<StarRatingProps> = ({ rating, onChange, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className='flex gap-0.5'>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type='button'
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            className={`${sizeClass} ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 dark:fill-gray-700 text-gray-200 dark:text-gray-700'}`}
          >
            <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
          </svg>
        </button>
      ))}
    </div>
  );
};

StarRating.displayName = 'StarRating';
