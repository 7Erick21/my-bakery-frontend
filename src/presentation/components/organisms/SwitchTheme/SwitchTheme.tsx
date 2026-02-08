'use client';

import { useTheme } from 'next-themes';
import type { FC } from 'react';

import { Button } from '@/components/atoms';
import MoonIcon from '@/icons/moon.svg';
import SunIcon from '@/icons/sun.svg';
import { ETheme } from '@/shared/enums';

export const SwitchTheme: FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  // resolvedTheme is undefined until next-themes resolves on the client.
  // Default to dark (matches defaultTheme in providers) to avoid icon flash.
  const isDark = resolvedTheme ? resolvedTheme === ETheme.DARK : true;

  const handleChangeColor = () => {
    if (isDark) setTheme(ETheme.LIGHT);
    else setTheme(ETheme.DARK);
  };

  return (
    <Button
      variant='ghost'
      onClick={handleChangeColor}
      className='w-10 h-10 flex items-center justify-center group rounded-md'
      aria-label='Cambiar tema'
    >
      {isDark ? (
        <SunIcon className='w-5 h-5 fill-amber-300 group-hover:rotate-180 transition-all duration-300 ease-in-out' />
      ) : (
        <MoonIcon className='w-5 h-5 fill-amber-900 group-hover:fill-yellow group-hover:rotate-12 transition-all duration-300 ease-in-out' />
      )}
    </Button>
  );
};
