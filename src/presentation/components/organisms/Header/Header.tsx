'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type FC, useRef, useState } from 'react';
import { Button, Card } from '@/components/atoms';
import LogoImage from '@/images/logo.avif';
import { useTranslation } from '@/presentation/shared/hooks/useTranslate';
import { menusItems } from '@/shared/defaults';
import { SelectLanguage } from '../SelectLanguage';
import { SwitchTheme } from '../SwitchTheme';

/**
 * Header component
 */
export const Header: FC = () => {
  const { t } = useTranslation();

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <Card
      variant='children'
      className='fixed bg-gray-300/30 dark:bg-gray-900/30 w-full !rounded-b-2xl !rounded-t-none z-20'
    >
      <div className='max-w-8xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='relative flex cursor-pointer items-center gap-4 group'>
            <div className='absolute inset-0 w-full bg-amber-400 rounded-full blur-lg dark:blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300' />
            <Image
              src={LogoImage}
              alt='Logo de la panadería'
              width={32}
              height={32}
              className='w-10 h-10 rounded-full text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:rotate-12'
            />
            <span className='text-16-24 leading-tight font-bold bg-gradient-to-r from-gray-900 to-gray-900 dark:from-gray-200 dark:to-gray-200 bg-clip-text text-transparent'>
              {t('header.logo')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className='hidden md:flex items-center gap-8'
            aria-label={t('header.navigation.main')}
          >
            {menusItems.map(item => (
              <Link
                key={item.key}
                href={{ hash: item.href }}
                aria-label={item.ariaLabel}
                className='text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400 text-xl leading-tight font-medium transition-colors duration-300 relative group'
              >
                {t(`${item.ariaLabel}`)}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-700 group-hover:w-full'></span>
              </Link>
            ))}
          </nav>

          {/* Controls */}
          <div className='flex items-center gap-4'>
            <SelectLanguage />
            <SwitchTheme />
            <Button
              variant='ghost'
              className='md:hidden p-1.5'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={t('header.toggleMenu')}
            >
              <div className='relative flex items-center justify-center w-6 h-6'>
                <span
                  className={`absolute top-1/2 w-2/3 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-[5px]'
                  }`}
                />
                <span
                  className={`absolute top-1/2 w-2/3 h-0.5 bg-current transition-opacity duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute top-1/2 w-2/3 h-0.5 bg-current transform transition duration-300 ease-in-out ${
                    isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-[5px]'
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden z-10 transition-all duration-500 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
          onClick={handleMenuClick}
          ref={mobileMenuRef}
        >
          <nav className='flex flex-col gap-4 py-4' aria-label={t('header.navigation.mobile')}>
            {menusItems.map(item => (
              <Link
                key={item.key}
                href={{ hash: item.href }}
                aria-label={item.ariaLabel}
                className='text-gray-900 w-fit dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400 text-base leading-tight font-medium transition-colors duration-300 relative group'
                onClick={handleMenuClick}
              >
                {t(`${item.ariaLabel}`)}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full'></span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </Card>
  );
};

Header.displayName = 'Header';
