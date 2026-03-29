export const dynamic = 'force-dynamic';

const { NextResponse } = require('next/server');
const { ensureDbReady } = require('@/lib/db');

export async function GET() {
  await ensureDbReady();
  return NextResponse.json({ status: 'ok' });
}
