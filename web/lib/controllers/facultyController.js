const { NextResponse } = require('next/server');
const Faculty = require('../models/Faculty');

const getFaculty = async () => {
  try {
    const faculty = await Faculty.find()
      .populate('homeDepartment', 'name departmentId')
      .populate('subjectsHandled', 'name semester')
      .sort({ facultyId: 1 });
    return NextResponse.json(faculty);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const getFacultyById = async (id) => {
  try {
    const faculty = await Faculty.findById(id)
      .populate('homeDepartment')
      .populate('subjectsHandled');
    if (!faculty)
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    return NextResponse.json(faculty);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const createFaculty = async (body) => {
  try {
    const {
      facultyId,
      name,
      email,
      homeDepartment,
      subjectsHandled,
      maxPeriodsPerDay,
      maxPeriodsPerWeek
    } = body;
    const faculty = await Faculty.create({
      facultyId,
      name,
      email,
      homeDepartment,
      subjectsHandled: subjectsHandled || [],
      maxPeriodsPerDay: Number(maxPeriodsPerDay) || 6,
      maxPeriodsPerWeek: Number(maxPeriodsPerWeek) || 30
    });
    const populated = await Faculty.findById(faculty._id)
      .populate('homeDepartment', 'name departmentId')
      .populate('subjectsHandled', 'name semester');
    return NextResponse.json(populated || faculty, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

const updateFaculty = async (id, body) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    })
      .populate('homeDepartment', 'name departmentId')
      .populate('subjectsHandled', 'name semester');
    if (!faculty)
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    return NextResponse.json(faculty);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

const deleteFaculty = async (id) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(id);
    if (!faculty)
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    return NextResponse.json({ message: 'Faculty deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
};
