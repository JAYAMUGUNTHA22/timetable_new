export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const { authRequired, requireRole } = require('@/lib/auth-api');
const subjectFacultyRoomController = require('@/lib/controllers/subjectFacultyRoomController');

export async function GET(request, { params }) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  return subjectFacultyRoomController.getBySubject(params.id);
}

export async function PUT(request, { params }) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  const body = await request.json();
  return subjectFacultyRoomController.setForSubject(params.id, body);
}
