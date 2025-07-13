import { FC } from 'react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/atoms';
import MoonIcon from '@/icons/moon.svg';
import SunIcon from '@/icons/sun.svg';
import { ETheme } from '@/shared/enums';

export const SwitchTheme: FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const handleChangeColor = () => {
    if (resolvedTheme === ETheme.DARK) setTheme(ETheme.LIGHT);
    else setTheme(ETheme.DARK);
  };

  return (
    <Button
      variant='ghost'
      onClick={handleChangeColor}
      className='w-10 h-10 flex items-center justify-center group rounded-md'
      aria-label='Cambiar tema'
    >
      {resolvedTheme === ETheme.DARK ? (
        <SunIcon className='w-5 h-5 fill-amber-300 group-hover:rotate-180 transition-all duration-300 ease-in-out' />
      ) : (
        <MoonIcon className='w-5 h-5 fill-amber-900 group-hover:fill-yellow group-hover:rotate-12 transition-all duration-300 ease-in-out' />
      )}
    </Button>
  );
};
