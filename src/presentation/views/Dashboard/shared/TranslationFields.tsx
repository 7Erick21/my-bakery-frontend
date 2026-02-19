'use client';

import { type FC, useState } from 'react';

import { Input, Label, Textarea } from '@/components/atoms';

interface TranslationField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  required?: boolean;
}

export interface Translation {
  id?: string;
  language_code: string;
  [key: string]: string | null | undefined;
}

interface TranslationFieldsProps {
  languages: { code: string; name: string }[];
  fields: TranslationField[];
  translations: Translation[];
  onChange: (translations: Translation[]) => void;
}

export const TranslationFields: FC<TranslationFieldsProps> = ({
  languages,
  fields,
  translations,
  onChange
}) => {
  const [activeLang, setActiveLang] = useState(languages[0]?.code || 'es');

  function getTranslation(langCode: string): Translation {
    return (
      translations.find(t => t.language_code === langCode) || {
        language_code: langCode
      }
    );
  }

  function updateTranslation(langCode: string, fieldKey: string, value: string) {
    const updated = [...translations];
    const idx = updated.findIndex(t => t.language_code === langCode);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], [fieldKey]: value };
    } else {
      updated.push({ language_code: langCode, [fieldKey]: value });
    }
    onChange(updated);
  }

  return (
    <div className='space-y-4'>
      {/* Language tabs */}
      <div className='flex gap-1 border-b border-border-card-children-light dark:border-border-card-children-dark'>
        {languages.map(lang => (
          <button
            key={lang.code}
            type='button'
            onClick={() => setActiveLang(lang.code)}
            className={`px-4 py-2 text-14-16 font-medium transition-colors cursor-pointer ${
              activeLang === lang.code
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Fields for active language */}
      <div className='space-y-4'>
        {fields.map(field => {
          const translation = getTranslation(activeLang);
          const value = translation[field.key] || '';

          return (
            <div key={field.key}>
              <Label required={field.required}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={value}
                  onChange={e => updateTranslation(activeLang, field.key, e.target.value)}
                  required={field.required}
                />
              ) : (
                <Input
                  type='text'
                  value={value}
                  onChange={e => updateTranslation(activeLang, field.key, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

TranslationFields.displayName = 'TranslationFields';
