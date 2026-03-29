const jwt = require('jsonwebtoken');
const { NextResponse } = require('next/server');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const COOKIE_NAME = 'token';

const cookieBase = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production'
};

function signUser(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      faculty: user.faculty ? user.faculty.toString() : null,
      department: user.department ? user.department.toString() : null,
      sectionNumber: user.sectionNumber || null,
      email: user.email || null,
      name: user.name || null
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authCookieOptions(maxAgeSec) {
  return maxAgeSec != null
    ? { ...cookieBase, maxAge: maxAgeSec }
    : { ...cookieBase, maxAge: 60 * 60 * 24 * 7 };
}

async function authRequired(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { user: payload };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
}

function requireRole(user, role) {
  if (!user || user.role !== role) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

module.exports = {
  JWT_SECRET,
  COOKIE_NAME,
  cookieBase,
  signUser,
  authCookieOptions,
  authRequired,
  requireRole
};
