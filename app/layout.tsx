import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['500', '600', '700'],
  display: 'swap',
});


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
  : new URL('http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: BASE_URL,
  title: {
    default: 'SpendAudit — AI Tool Cost Auditor',
    template: '%s — SpendAudit',
  },
  description:
    'Get an instant breakdown of your AI tool spend. See exactly where you can cut costs across Cursor, Claude, Copilot, and more.',
  openGraph: {
    title: 'SpendAudit — AI Tool Cost Auditor',
    description: 'Get an instant audit of your AI tool spend.',
    url: BASE_URL,
    siteName: 'SpendAudit',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendAudit — AI Tool Cost Auditor',
    description: 'Get an instant audit of your AI tool spend.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b', 
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.variable} ${spaceGrotesk.variable}
          font-sans antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}