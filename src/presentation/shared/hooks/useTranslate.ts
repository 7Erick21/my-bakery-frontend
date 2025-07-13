import { ELanguage } from '../enums';
import ca from '../language/ca/common.json';
import en from '../language/en/common.json';
import es from '../language/es/common.json';
import { useLangStore } from '../stores';

/**
 * Translation store type
 */
type TranslationStore = {
  [key in ELanguage]:
    | string
    | {
        [key: string]:
          | string
          | {
              [key: string]:
                | string
                | {
                    [key: string]: string;
                  };
            };
      };
};

/**
 * Translation configuration
 */
const translations: TranslationStore = {
  en: en,
  es: es,
  ca: ca
};

/**
 * Hook for internationalization
 * @returns {Object} - Translation function and current language
 */
export const useTranslation = () => {
  const lang = useLangStore(state => state.lang);

  /**
   * Get translation for a key
   * @param key - Translation key
   * @param defaultValue - Default value if translation not found
   * @returns {string} - Translated text
   */
  const t = (key: string, defaultValue?: string): string => {
    // Convertir la clave en un array de segmentos
    const segments = key.split('.');
    let current = translations[lang];

    // Navegar por la estructura de traducciones
    for (const segment of segments) {
      if (typeof current === 'object' && current !== null) {
        current = current[segment];
      } else {
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation for key: ${key} in ${lang}`);
    }
    return defaultValue || `[${key}]`;
  };

  /**
   * Get all translations for a specific language
   * @param lang - Language code
   * @returns {Object} - Translation object
   */
  const getTranslations = (lang: ELanguage) => translations[lang] || {};

  return { t, lang, getTranslations };
};
