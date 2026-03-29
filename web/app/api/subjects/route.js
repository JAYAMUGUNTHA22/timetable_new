export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const { authRequired, requireRole } = require('@/lib/auth-api');
const subjectController = require('@/lib/controllers/subjectController');

export async function GET(request) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  const { searchParams } = new URL(request.url);
  return subjectController.getSubjects({
    semester: searchParams.get('semester'),
    department: searchParams.get('department')
  });
}

export async function POST(request) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  const body = await request.json();
  return subjectController.createSubject(body);
}
