import type { Metadata } from 'next';
import './globals.css';
import { appConfig } from '@/lib/app-config';
import { TelemetryProvider } from '@/components/telemetry-provider';

export const metadata: Metadata = {
  title: `${appConfig.codename} | Prediction Markets`,
  description: 'MANTIS prediction markets experience for paper-trading and market resolution testing.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TelemetryProvider>{children}</TelemetryProvider>
      </body>
    </html>
  );
}
