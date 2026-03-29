export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const { authRequired, requireRole } = require('@/lib/auth-api');
const facultyController = require('@/lib/controllers/facultyController');

export async function GET(request) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  return facultyController.getFaculty();
}

export async function POST(request) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  const body = await request.json();
  return facultyController.createFaculty(body);
}
