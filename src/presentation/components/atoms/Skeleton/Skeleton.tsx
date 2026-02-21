'use client';

import type { FC } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

const variantClasses = {
  text: 'rounded h-4',
  circular: 'rounded-full',
  rectangular: 'rounded-lg'
};

export const Skeleton: FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}) => {
  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {})
  };

  if (count > 1) {
    return (
      <div className='flex flex-col gap-2'>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

Skeleton.displayName = 'Skeleton';
