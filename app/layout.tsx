import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Aclonica, Lobster_Two } from 'next/font/google';

import { ServiceWorkerRegister } from '@/components/atoms';
import { getCmsSeoMetadata } from '@/server/queries/cms';

import { Providers } from './providers';

import './globals.css';

const lobsterTwo = Lobster_Two({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap'
});

const aclonica = Aclonica({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-aclonica'
});

const SITE_URL = 'https://my-bakery-frontend-delta.vercel.app';
const FALLBACK_TITLE = 'My Bakery - Panaderia Artesanal';
const FALLBACK_DESCRIPTION =
  'Descubre la mejor panaderia artesanal en tu ciudad. Panes frescos, pasteles y dulces hechos con amor.';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get('preferred_language')?.value || 'es';

  let title = FALLBACK_TITLE;
  let description = FALLBACK_DESCRIPTION;

  try {
    const seo = await getCmsSeoMetadata(lang);
    if (seo.title) title = seo.title;
    if (seo.description) description = seo.description;
  } catch {
    // CMS unavailable — use fallbacks
  }

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: 'panaderia, bakery, pan artesanal, pasteles, dulces, reposteria',
    openGraph: {
      title,
      description,
      url: SITE_URL,
      type: 'website',
      locale: lang === 'ca' ? 'ca_ES' : lang === 'en' ? 'en_US' : 'es_ES',
      siteName: 'My Bakery',
      images: [
        {
          url: '/my-bakery-logo.jpg',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: '/my-bakery-logo.jpg',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    robots: 'index, follow',
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'My Bakery'
    },
    other: {
      'apple-touch-icon': '/icons/apple-touch-icon.png'
    }
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: '#f9e8d2'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('preferred_language')?.value || 'es';

  return (
    <html lang={lang} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${lobsterTwo.className} ${aclonica.variable}`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
