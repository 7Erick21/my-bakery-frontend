'use client';

import { FC, useState } from 'react';

import { Button, Card } from '@/components/atoms';
import { useTranslation } from '@/presentation/shared/hooks/useTranslate';
import { useLangStore } from '@/presentation/shared/stores';
import { LanguageOptions } from '@/shared/defaults';
import { ELanguage } from '@/shared/enums';
import { useClickOutside } from '@/shared/hooks';

/**
 * Language selector component
 */
export const SelectLanguage: FC = () => {
  const { t } = useTranslation();
  const dropdownRef = useClickOutside({ callback: () => setIsOpen(false) });

  const { lang, setLang } = useLangStore();

  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LanguageOptions.find(language => language.code === lang)?.label;

  const handleLanguageChange = (newLanguage: ELanguage) => {
    if (Object.values(ELanguage).includes(newLanguage)) {
      setLang(newLanguage);
      setIsOpen(false);
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <Button
        variant='ghost'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-3 py-2 min-w-20 justify-center'
        aria-expanded={isOpen}
        aria-haspopup='true'
        aria-controls='language-menu'
        aria-label={t('language.select')}
      >
        <span className='text-xs leading-tight text-gray-900 dark:text-gray-100 font-medium transition-colors duration-150 ease-in-out text-light_text dark:text-light_gray'>
          {currentLanguage}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          } fill-light_text dark:fill-light_gray transition-colors duration-150 ease-in-out`}
          viewBox='0 0 24 24'
          aria-hidden='true'
          focusable='false'
        >
          <path d='M7 10l5 5 5-5z' className='fill-gray-900 dark:fill-gray-100' />
        </svg>
      </Button>

      <Card
        variant='children'
        id='language-menu'
        className={`transition-all duration-500 overflow-hidden ${
          isOpen ? 'max-h-36 opacity-100' : 'max-h-0 opacity-0'
        } absolute top-full mt-2 right-0 !z-100 min-w-24 overflow-hidden before:absolute before:inset-px before:rounded-[inherit] before:-z-10
        before:transition-all before:duration-150 before:ease-in-out
        before:bg-button-inner-light dark:before:bg-button-inner-dark`}
        role='menu'
      >
        {LanguageOptions.map(({ Icon, ...option }) => (
          <Button
            variant='ghost'
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            className={`relative overflow-hidden w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
            hover:!scale-100 focus:!scale-100 !shadow-none !rounded-none !border-none
            ${
              lang === option.code
                ? 'text-amber-500 !bg-amber-500/20 hover:!bg-gray-300/50 dark:hover:!bg-gray-600/50 font-semibold'
                : 'text-gray-900 dark:text-gray-100'
            }`}
            role='option'
            aria-selected={lang === option.code}
          >
            <span className='relative z-10 flex items-center gap-2'>
              <Icon className='w-4 h-4' />
              <span className='text-xs leading-tight font-medium'>{option.label}</span>
            </span>
          </Button>
        ))}
      </Card>
    </div>
  );
};

SelectLanguage.displayName = 'SelectLanguage';
