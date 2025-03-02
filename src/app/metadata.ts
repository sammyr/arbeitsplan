import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dienstplan Manager',
  description: 'Effiziente Verwaltung von Arbeitszeiten und Schichten',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};
