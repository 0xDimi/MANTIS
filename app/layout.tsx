import type { Metadata } from 'next';
import './globals.css';
import { appConfig } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `${appConfig.name} | Alpha Demo v1`,
  description: 'Server-authoritative alpha rebuild for xyz Labs, with legacy UI kept as reference only.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
