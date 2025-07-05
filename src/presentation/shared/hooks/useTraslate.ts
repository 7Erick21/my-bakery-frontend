import { ELanguage } from '../enums';
import en from '../language/en/common.json';
import es from '../language/es/common.json';
import { useLangStore } from '../stores';

const translations: Record<ELanguage, Record<string, string>> = { en, es } as Record<
  ELanguage,
  Record<string, string>
>;

export const useTranslation = () => {
  const lang = useLangStore(state => state.lang);

  const t = (key: string): string => translations[lang]?.[key] || `[${key}]`;

  return { t, lang };
};
