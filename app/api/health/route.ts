import { NextResponse } from 'next/server';
import { appConfig } from '@/lib/app-config';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      app: appConfig.name,
      codename: appConfig.codename,
      version: appConfig.version,
      alphaScope: appConfig.alphaScope,
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
