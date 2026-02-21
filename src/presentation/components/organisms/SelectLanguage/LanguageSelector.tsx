'use client';

import type { FC } from 'react';

import { Select } from '@/components/atoms';
import { useLangStore } from '@/presentation/shared/stores';
import { LanguageOptions } from '@/shared/defaults';
import type { ELanguage } from '@/shared/enums';

const langOptions = LanguageOptions.map(o => ({ value: o.code, label: o.label }));

interface SelectLanguageProps {
  className?: string;
}

export const SelectLanguage: FC<SelectLanguageProps> = ({ className }) => {
  const { lang, setLang } = useLangStore();

  return (
    <Select
      options={langOptions}
      value={lang}
      onChange={val => setLang(val as ELanguage)}
      className={className ?? '!w-auto !min-w-20 !h-10 !py-0 !px-2.5 !text-xs'}
    />
  );
};

SelectLanguage.displayName = 'SelectLanguage';
