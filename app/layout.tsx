import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './tokens.css';
import './globals.css';
import { appConfig } from '@/lib/app-config';
import { TelemetryProvider } from '@/components/telemetry-provider';
import { PageTelemetry } from '@/components/page-telemetry';

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin', 'greek'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-mantis-body'
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mantis-mono'
});

export const metadata: Metadata = {
  title: `${appConfig.codename} | Prediction Markets`,
  description: 'MANTIS prediction markets experience for paper-trading and market resolution testing.'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${ibmPlex.className} ${ibmPlex.variable} ${ibmPlexMono.variable}`}>
        <TelemetryProvider>
          <Suspense fallback={null}>
            <PageTelemetry />
          </Suspense>
          {children}
        </TelemetryProvider>
      </body>
    </html>
  );
}
