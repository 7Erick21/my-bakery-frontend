import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { ETheme } from '@/shared/enums';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute='class' defaultTheme={ETheme.DARK} enableSystem>
      {children}
    </NextThemesProvider>
  );
}
