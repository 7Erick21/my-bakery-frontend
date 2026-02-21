'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect } from 'react';

import { ToastProvider } from '@/components/atoms';
import { ETheme } from '@/shared/enums';
import { useLangStore } from '@/shared/stores';

export function Providers({ children }: { children: React.ReactNode }) {
  const lang = useLangStore(s => s.lang);

  // Sync <html lang> attribute and preferred_language cookie with Zustand store
  useEffect(() => {
    document.documentElement.lang = lang;
    document.cookie = `preferred_language=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  }, [lang]);

  return (
    <NextThemesProvider attribute='class' defaultTheme={ETheme.LIGHT} enableSystem>
      {children}
      <ToastProvider />
    </NextThemesProvider>
  );
}
