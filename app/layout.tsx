import type { Metadata } from 'next';
import './globals.css';
import { appConfig } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `${appConfig.name} | Alpha Demo v1`,
  description: 'Polished demo UI with backend alpha wiring for xyz Labs.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
