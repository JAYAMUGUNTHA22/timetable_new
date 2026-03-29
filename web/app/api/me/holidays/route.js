export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const { authRequired } = require('@/lib/auth-api');
const selfController = require('@/lib/controllers/selfController');

export async function GET(request) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  return selfController.listHolidaysAuth();
}
