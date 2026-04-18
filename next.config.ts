import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
  reactComponentAnnotation: {
    enabled: true
  },
  sourcemaps: {
    deleteSourcemapsAfterUpload: true
  },
  disableLogger: true
});
