import type { Metadata } from 'next';
import { Suspense } from 'react';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { appConfig } from '@/lib/app-config';
import { TelemetryProvider } from '@/components/telemetry-provider';
import { PageTelemetry } from '@/components/page-telemetry';

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin', 'greek'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: `${appConfig.codename} | Prediction Markets`,
  description: 'MANTIS prediction markets experience for paper-trading and market resolution testing.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={ibmPlex.className}>
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
