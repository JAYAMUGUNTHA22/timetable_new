export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const { authRequired, requireRole } = require('@/lib/auth-api');
const timetableController = require('@/lib/controllers/timetableController');

export async function GET(request) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  const { searchParams } = new URL(request.url);
  return timetableController.getTimetables({
    semester: searchParams.get('semester'),
    department: searchParams.get('department')
  });
}
