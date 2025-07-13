import type { Metadata } from 'next';
import { Viewport } from 'next';
import { Lobster_Two } from 'next/font/google';

import { Providers } from './providers';

import './globals.css';

const LobsterTwo = Lobster_Two({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'My Bakery - Panadería Artesanal',
  description:
    'Descubre la mejor panadería artesanal en tu ciudad. Panes frescos, pasteles y dulces hechos con amor.',
  keywords: 'panadería, bakery, pan artesanal, pasteles, dulces, repostería',

  // Metaetiquetas Open Graph
  openGraph: {
    title: 'My Bakery - Panadería Artesanal',
    description:
      'Descubre la mejor panadería artesanal en tu ciudad. Panes frescos, pasteles y dulces hechos con amor.',
    url: 'https://my-bakery-frontend-delta.vercel.app/',
    type: 'website',
    locale: 'es_ES',
    siteName: 'My Bakery',
    images: [
      {
        url: '/my-bakery-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'My Bakery - Panadería Artesanal'
      }
    ]
  },

  // Metaetiquetas Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'My Bakery - Panadería Artesanal',
    description:
      'Descubre la mejor panadería artesanal en tu ciudad. Panes frescos, pasteles y dulces hechos con amor.',
    images: [
      {
        url: '/my-bakery-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'My Bakery - Panadería Artesanal'
      }
    ]
  },

  // Metaetiquetas adicionales
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ffffff'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body suppressHydrationWarning className={`${LobsterTwo.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
