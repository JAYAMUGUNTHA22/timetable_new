export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const publicController = require('@/lib/controllers/publicController');

export async function GET() {
  await ensureDbReady();
  return publicController.listDepartmentsPublic();
}
