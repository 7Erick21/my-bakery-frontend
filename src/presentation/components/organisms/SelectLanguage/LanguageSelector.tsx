'use client';

import { FC, useState } from 'react';

import { Button, Card } from '@/components/atoms';
import { LanguageOptions } from '@/shared/defaults';
import { ELanguage } from '@/shared/enums';
import { useLangStore } from '@/shared/stores';

export const SelectLanguage: FC = () => {
  const { lang, setLang } = useLangStore();

  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LanguageOptions.find(language => language.code === lang)?.label;

  const handleLanguageChange = (newLanguage: ELanguage) => {
    setLang(newLanguage);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-3 py-2 min-w-20 justify-center'
        aria-label='Seleccionar idioma'
      >
        <span className='text-xs text-gray-700 dark:text-gray-200 font-medium transition-colors duration-150 ease-in-out text-light_text dark:text-light_gray'>
          {currentLanguage}
        </span>
        <svg
          className={`w-5 h-w-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          } fill-light_text dark:fill-light_gray transition-colors duration-150 ease-in-out`}
          viewBox='0 0 24 24'
        >
          <path d='M7 10l5 5 5-5z' className='fill-gray-700 dark:fill-gray-200' />
        </svg>
      </Button>

      <Card
        variant='children'
        className={`transition-all duration-500 overflow-hidden ${
          isOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
        } absolute top-full mt-2 right-0 !z-100 min-w-24 overflow-hidden before:absolute before:inset-px before:rounded-[inherit] before:-z-10
        before:transition-all before:duration-150 before:ease-in-out
        before:bg-button-inner-light dark:before:bg-button-inner-dark`}
      >
        {LanguageOptions.map(({ Icon, ...option }) => (
          <Button
            key={option.code}
            onClick={() => handleLanguageChange(option.code as ELanguage)}
            className={`relative overflow-hidden w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
            hover:!scale-100 focus:!scale-100 !shadow-none !rounded-none !border-none
            ${
              lang === option.code
                ? 'text-bakery-500 before:absolute before:inset-0 before:rounded-[inherit] before:z-0 before:opacity-100 before:!bg-[linear-gradient(to_right,_rgba(255,170,120,0.15)_0%,_rgba(255,140,90,0.10)_40%,_rgba(255,110,60,0.05)_75%,_transparent_100%)]'
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            <span className='relative z-10 flex items-center gap-2'>
              <Icon className='w-4 h-4' />
              <span className='text-sm font-medium'>{option.label}</span>
            </span>
          </Button>
        ))}
      </Card>
    </div>
  );
};

SelectLanguage.displayName = 'SelectLanguage';
