import type { Metadata } from 'next';
import './globals.css';
import { appConfig } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `${appConfig.name} Alpha`,
  description: 'Operational alpha foundation for the xyz Labs prediction-market build.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
