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
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= rating;
        return (
          <button
            key={star}
            type='button'
            disabled={!onChange}
            onClick={() => onChange?.(star)}
            className={`bg-transparent border-0 p-0 ${onChange ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              className={`${sizeClass} ${
                filled
                  ? 'fill-amber-400 stroke-amber-500'
                  : 'fill-transparent stroke-gray-300 dark:stroke-gray-600'
              }`}
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

StarRating.displayName = 'StarRating';
