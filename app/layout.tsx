import type { Metadata } from 'next';
import './globals.css';
import './korvex-ui.css';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Korvex OS — AI Content Marketing',
    template: '%s'
  },
  description: 'Create, schedule, and grow your content with AI. One workspace for content, media, trends, and analytics.',
  openGraph: {
    title: 'Korvex OS — AI Content Marketing',
    description: 'Create, schedule, and grow your content with AI. One workspace for content, media, trends, and analytics.',
    url: siteUrl,
    siteName: 'Korvex OS',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Korvex OS — AI Content Marketing',
    description: 'Create, schedule, and grow your content with AI.'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
