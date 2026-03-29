export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const authController = require('@/lib/controllers/authController');

export async function GET(request) {
  await ensureDbReady();
  return authController.me(request);
}
