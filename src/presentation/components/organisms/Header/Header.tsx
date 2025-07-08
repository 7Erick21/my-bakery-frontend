'use client';

import { FC, useState } from 'react';
import Link from 'next/link';

import { SelectLanguage } from '../SelectLanguage';
import { SwitchTheme } from '../SwitchTheme';

import { Button, Card } from '@/components/atoms';
import CoffeeIcon from '@/icons/coffe.svg';

export const Header: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navigationItems = [
    { key: 'Home', href: '#home' },
    { key: 'About', href: '#about' },
    { key: 'Products', href: '#products' },
    { key: 'Contact', href: '#contact' }
  ];

  return (
    <Card
      variant='children'
      className='fixed bg-gray-300/30 dark:bg-gray-900/30 w-full !rounded-b-2xl !rounded-t-none z-10'
    >
      <div className='px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='relative flex cursor-pointer items-center gap-2 group'>
            <div className='absolute inset-0 w-full bg-amber-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300'></div>
            <CoffeeIcon className='w-16-24 h-16-24 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:rotate-12' />
            <span className='text-16-24 font-bold bg-gradient-to-r from-amber-600 to-amber-600 dark:from-amber-400 dark:to-amber-400 bg-clip-text text-transparent'>
              My Bakery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            {navigationItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                className='text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 text-base font-medium transition-colors duration-300 relative group'
              >
                {item.key}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full'></span>
              </a>
            ))}
          </nav>

          {/* Controls */}
          <div className='flex items-center gap-4'>
            {/* Language Selector */}
            <SelectLanguage />

            {/* Theme Toggle */}
            <SwitchTheme />

            {/* Mobile Menu Button */}
            <Button
              className='md:hidden p-1.5'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label='Toggle menu'
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

        {/* <div className='md:hidden mt-4 glass dark:glass-dark rounded-lg p-4 animate-fade-in'> */}
        <div
          className={`md:hidden z-10 transition-all duration-500 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className='flex flex-col gap-4 py-4'>
            {navigationItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                className='text-gray-700 w-fit dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 text-base font-medium transition-colors duration-200 relative group'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.key}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-150 group-hover:w-full'></span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </Card>
  );
};

Header.displayName = 'Header';
