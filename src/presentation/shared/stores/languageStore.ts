import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ELanguage } from '../enums';

interface LangState {
  lang: ELanguage;
  setLang: (lang: ELanguage) => void;
}

export const useLangStore = create<LangState>()(
  persist(
    set => ({
      lang: ELanguage.ES,
      setLang: lang => set({ lang })
    }),
    {
      name: 'language-storage'
    }
  )
);
