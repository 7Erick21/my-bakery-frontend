import { ELanguage } from '../enums';

import EnglishIcon from '@/icons/english.svg';
import SpanishIcon from '@/icons/spanish.svg';

export const LanguageOptions = [
  {
    code: ELanguage.ES,
    label: 'ES',
    Icon: SpanishIcon
  },
  {
    code: ELanguage.EN,
    label: 'EN',
    Icon: EnglishIcon
  }
];
