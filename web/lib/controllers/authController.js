const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NextResponse } = require('next/server');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const {
  signUser,
  COOKIE_NAME,
  authCookieOptions,
  JWT_SECRET
} = require('../auth-api');

async function getFacultyDepartmentNameFromId(facultyIdStr) {
  if (!facultyIdStr || typeof facultyIdStr !== 'string') return null;
  const match = facultyIdStr.trim().match(/^([A-Za-z]+)/i);
  const prefix = match ? match[1] : '';
  if (!prefix) return null;
  const dept = await Department.findOne({
    $or: [
      { departmentId: new RegExp('^' + prefix, 'i') },
      { name: new RegExp('^' + prefix, 'i') }
    ]
  })
    .select('name')
    .lean();
  return dept ? dept.name : null;
}

async function login(request) {
  try {
    const reqBody = await request.json();

    if (reqBody.google) {
      try {
        const { email, role, name, departmentId, sectionNumber } = reqBody;

        if (!email || !role) {
          return NextResponse.json(
            { error: 'Google login missing data' },
            { status: 400 }
          );
        }

        let user;

        if (role === 'admin') {
          user = await User.findOne({ role: 'admin', email });
          if (!user) {
            user = await User.create({
              role: 'admin',
              email,
              name: name || email.split('@')[0],
              passwordHash: null
            });
          }
        } else if (role === 'faculty') {
          const faculty = await Faculty.findOne({ email });
          if (!faculty) {
            return NextResponse.json(
              { error: 'Faculty email not registered.' },
              { status: 401 }
            );
          }

          user = await User.findOne({ role: 'faculty', faculty: faculty._id });
          if (!user) {
            user = await User.create({
              role: 'faculty',
              faculty: faculty._id,
              email,
              name: faculty.name,
              passwordHash: null
            });
          } else if (user.name !== faculty.name) {
            user.name = faculty.name;
            await user.save();
          }
        } else if (role === 'student') {
          if (!departmentId || !sectionNumber)
            return NextResponse.json(
              { error: 'Select department & section first' },
              { status: 400 }
            );

          const dept = await Department.findById(departmentId);
          if (!dept)
            return NextResponse.json(
              { error: 'Department not found' },
              { status: 400 }
            );

          user = await User.findOne({
            role: 'student',
            email,
            department: dept._id,
            sectionNumber
          });
          if (!user) {
            user = await User.create({
              role: 'student',
              email,
              name: name || email.split('@')[0],
              department: dept._id,
              sectionNumber,
              passwordHash: null
            });
          }
        } else {
          return NextResponse.json(
            { error: 'Google login is only allowed for Admin role.' },
            { status: 403 }
          );
        }

        if (!user)
          return NextResponse.json(
            { error: 'User could not be found or created' },
            { status: 404 }
          );

        const token = signUser(user);
        const userPayload = {
          id: user._id,
          role: user.role,
          email: user.email || null,
          name: user.name || null,
          faculty: user.faculty || null,
          facultyId:
            role === 'faculty'
              ? (await Faculty.findById(user.faculty))?.facultyId
              : null,
          department: user.department || null,
          sectionNumber: user.sectionNumber || null
        };
        if (role === 'faculty' && user.faculty) {
          const fac = await Faculty.findById(user.faculty)
            .populate('homeDepartment', 'name')
            .lean();
          userPayload.departmentName = fac?.homeDepartment?.name || null;
          if (!userPayload.departmentName && userPayload.facultyId) {
            userPayload.departmentName = await getFacultyDepartmentNameFromId(
              userPayload.facultyId
            );
          }
        }
        if (role === 'student' && user.department) {
          const dept = await Department.findById(user.department)
            .select('name')
            .lean();
          userPayload.departmentName = dept?.name || null;
        }
        const response = NextResponse.json({ user: userPayload });
        response.cookies.set(COOKIE_NAME, token, authCookieOptions());
        return response;
      } catch (err) {
        console.error('Google Login error:', err);
        return NextResponse.json({ error: 'Google login failed' }, { status: 500 });
      }
    }

    const { role } = reqBody || {};
    if (!role)
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });

    let user;

    if (role === 'admin') {
      const { email, password } = reqBody;
      if (!email || !password)
        return NextResponse.json(
          { error: 'Email and password are required.' },
          { status: 400 }
        );
      user = await User.findOne({ role: 'admin', email });
      if (!user || !user.passwordHash) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok)
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    } else if (role === 'faculty') {
      const { facultyId, name, password } = reqBody;
      if (!facultyId || !name || !password) {
        return NextResponse.json(
          { error: 'Faculty ID, name and password are required.' },
          { status: 400 }
        );
      }
      if (password !== 'bitsathy') {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
      }
      const faculty = await Faculty.findOne({ facultyId: facultyId.trim() });
      if (
        !faculty ||
        faculty.name.trim().toLowerCase() !== String(name).trim().toLowerCase()
      ) {
        return NextResponse.json(
          { error: 'Faculty not found. Check ID and name.' },
          { status: 401 }
        );
      }
      user = await User.findOne({ role: 'faculty', faculty: faculty._id });
      if (!user) {
        user = await User.create({
          role: 'faculty',
          faculty: faculty._id,
          name: faculty.name,
          email: faculty.email || null,
          passwordHash: null
        });
      } else if (user.name !== faculty.name) {
        user.name = faculty.name;
        await user.save();
      }
    } else if (role === 'student') {
      const { email, departmentId, sectionNumber, password } = reqBody;
      if (!email || !departmentId || !sectionNumber || !password) {
        return NextResponse.json(
          { error: 'Email, department, section and password are required.' },
          { status: 400 }
        );
      }
      if (password !== 'bitsathy') {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
      }
      const dept = await Department.findById(departmentId);
      if (!dept)
        return NextResponse.json({ error: 'Department not found.' }, { status: 400 });
      user = await User.findOne({
        role: 'student',
        email,
        department: dept._id,
        sectionNumber
      });
      if (!user) {
        user = await User.create({
          role: 'student',
          email,
          name: email.split('@')[0],
          department: dept._id,
          sectionNumber,
          passwordHash: null
        });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported role.' }, { status: 400 });
    }

    const token = signUser(user);
    const userPayload = {
      id: user._id,
      role: user.role,
      name: user.name || null,
      email: user.email || null,
      faculty: user.faculty || null,
      facultyId:
        role === 'faculty'
          ? (await Faculty.findById(user.faculty))?.facultyId
          : null,
      department: user.department || null,
      sectionNumber: user.sectionNumber || null
    };
    if (role === 'faculty' && user.faculty) {
      const fac = await Faculty.findById(user.faculty)
        .populate('homeDepartment', 'name')
        .lean();
      userPayload.departmentName = fac?.homeDepartment?.name || null;
      if (!userPayload.departmentName && userPayload.facultyId) {
        userPayload.departmentName = await getFacultyDepartmentNameFromId(
          userPayload.facultyId
        );
      }
    }
    if (role === 'student' && user.department) {
      const dept = await Department.findById(user.department).select('name').lean();
      userPayload.departmentName = dept?.name || null;
    }
    const response = NextResponse.json({ user: userPayload });
    response.cookies.set(COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}

async function me(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token)
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const out = { ...payload };
  if (out.role === 'faculty' && out.faculty) {
    const faculty = await Faculty.findById(out.faculty)
      .populate('homeDepartment', 'name departmentId')
      .lean();
    if (faculty) {
      out.facultyId = faculty.facultyId;
      out.departmentName = faculty.homeDepartment?.name || null;
      out.departmentId = faculty.homeDepartment?._id?.toString() || null;
      if (!out.departmentName && faculty.facultyId) {
        out.departmentName = await getFacultyDepartmentNameFromId(faculty.facultyId);
      }
    }
  }
  if (out.role === 'student' && out.department) {
    const dept = await Department.findById(out.department)
      .select('name departmentId')
      .lean();
    if (dept) {
      out.departmentName = dept.name;
      out.departmentId = dept._id.toString();
    }
  }
  return NextResponse.json({ user: out });
}

function logout() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    ...require('../auth-api').cookieBase,
    maxAge: 0
  });
  return response;
}

module.exports = {
  login,
  me,
  logout
};
