export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const { authRequired, requireRole } = require('@/lib/auth-api');
const selfController = require('@/lib/controllers/selfController');

export async function GET(request) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'faculty');
  if (deny) return deny;
  const { searchParams } = new URL(request.url);
  return selfController.facultyDepartmentTimetables(
    a.user,
    searchParams.get('semester')
  );
}
