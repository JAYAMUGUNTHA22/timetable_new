export const dynamic = 'force-dynamic';

const { ensureDbReady } = require('@/lib/db');
const { authRequired, requireRole } = require('@/lib/auth-api');
const departmentController = require('@/lib/controllers/departmentController');

export async function GET(request, { params }) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  return departmentController.getDepartment(params.id);
}

export async function PUT(request, { params }) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  const body = await request.json();
  return departmentController.updateDepartment(params.id, body);
}

export async function DELETE(request, { params }) {
  await ensureDbReady();
  const a = await authRequired(request);
  if (!a.user) return a;
  const deny = requireRole(a.user, 'admin');
  if (deny) return deny;
  return departmentController.deleteDepartment(params.id);
}
