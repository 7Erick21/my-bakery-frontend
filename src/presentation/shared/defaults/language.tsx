import { ELanguage } from '../enums';
// import EnglishIcon from '@/icons/english.svg';
// import SpanishIcon from '@/icons/spanish.svg';
import { LanguageOption } from '../interface';

export const LanguageOptions: LanguageOption[] = [
  {
    code: ELanguage.ES,
    label: 'Español',
    Icon: () => (
      <svg
        className='w-4 h-4'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 2a15.35 15.35 0 0 1 8 10 15.35 15.35 0 0 1-8 10 15.35 15.35 0 0 1-8-10 15.35 15.35 0 0 1 8-10z' />
        <circle cx='12' cy='12' r='3' />
      </svg>
    )
  },
  {
    code: ELanguage.EN,
    label: 'English',
    Icon: () => (
      <svg
        className='w-4 h-4'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M22.75 6.13a3 3 0 0 0-2.82-2.5l-7.25.6A3 3 0 0 0 12 4.41v.17l-.6-7.25A3 3 0 0 0 4.41 1.5H.17a3 3 0 0 0-2.82 2.5L3.13 9.25a3 3 0 0 0 2.5 2.82l7.25-.6A3 3 0 0 0 20 19.59V18.41l7.25.6a3 3 0 0 0 2.82-2.5z' />
      </svg>
    )
  },
  {
    code: ELanguage.CA,
    label: 'Català',
    Icon: () => (
      <svg
        className='w-4 h-4'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 2a15.35 15.35 0 0 1 8 10 15.35 15.35 0 0 1-8 10 15.35 15.35 0 0 1-8-10 15.35 15.35 0 0 1 8-10z' />
        <circle cx='12' cy='12' r='3' />
      </svg>
    )
  }
];
