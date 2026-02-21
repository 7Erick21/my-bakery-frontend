'use client';

import Image from 'next/image';
import { type FC, useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md';
}

const sizeMap = {
  xs: { px: 28, className: 'w-7 h-7' },
  sm: { px: 32, className: 'w-8 h-8' },
  md: { px: 40, className: 'w-10 h-10' }
};

export const UserAvatar: FC<UserAvatarProps> = ({ src, name, size = 'sm' }) => {
  const { px, className } = sizeMap[size];
  const initial = (name || '?')[0].toUpperCase();
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt={name || ''}
        width={px}
        height={px}
        className={`${className} rounded-full object-cover`}
        referrerPolicy='no-referrer'
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400`}
    >
      {initial}
    </div>
  );
};

UserAvatar.displayName = 'UserAvatar';
