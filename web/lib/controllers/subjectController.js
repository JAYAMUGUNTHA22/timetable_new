const mongoose = require('mongoose');
const { NextResponse } = require('next/server');
const Subject = require('../models/Subject');
const SubjectFacultyRoom = require('../models/SubjectFacultyRoom');

function toObjectId(v) {
  if (v == null) return v;
  if (v instanceof mongoose.Types.ObjectId) return v;
  if (mongoose.Types.ObjectId.isValid(v))
    return new mongoose.Types.ObjectId(v.toString());
  return v;
}

const getSubjects = async ({ semester, department }) => {
  try {
    const filter = {};
    if (semester) filter.semester = Number(semester);
    if (department) filter.department = department;
    const subjects = await Subject.find(filter)
      .populate('department', 'name departmentId')
      .populate('assignedFaculty', 'name facultyId')
      .sort({ semester: 1, name: 1 });
    return NextResponse.json(subjects);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const getSubject = async (id) => {
  try {
    const subject = await Subject.findById(id)
      .populate('department')
      .populate('assignedFaculty');
    if (!subject)
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    return NextResponse.json(subject);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const createSubject = async (body) => {
  try {
    const {
      name,
      semester,
      department,
      periodsPerWeek,
      assignedFaculty,
      code,
      facultyRooms,
      courseType,
      labDuration,
      labSessionsPerWeek
    } = body;
    const doc = {
      name,
      semester: Number(semester),
      department: toObjectId(department) || department,
      periodsPerWeek: Number(periodsPerWeek),
      assignedFaculty:
        toObjectId(assignedFaculty) ||
        (facultyRooms &&
          facultyRooms[0] &&
          facultyRooms[0].faculty
          ? toObjectId(facultyRooms[0].faculty)
          : null) ||
        null,
      courseType: courseType || 'Theory',
      labDuration: Number(labDuration) || 2,
      labSessionsPerWeek: Number(labSessionsPerWeek) || 1
    };
    if (code && String(code).trim()) {
      doc.code = String(code).trim();
    } else {
      doc.code = 'SUB_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }
    const subject = await Subject.create(doc);
    if (Array.isArray(facultyRooms) && facultyRooms.length > 0) {
      const toInsert = facultyRooms
        .filter((fr) => fr.faculty && fr.roomNumber && String(fr.roomNumber).trim())
        .map((fr, i) => ({
          subject: subject._id,
          faculty: fr.faculty,
          roomNumber: String(fr.roomNumber).trim(),
          labRoomNumber: fr.labRoomNumber ? String(fr.labRoomNumber).trim() : undefined,
          order: i
        }));
      if (toInsert.length > 0) await SubjectFacultyRoom.insertMany(toInsert);
    }
    const populated = await Subject.findById(subject._id)
      .populate('department', 'name departmentId')
      .populate('assignedFaculty', 'name facultyId');
    return NextResponse.json(populated || subject, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

const updateSubject = async (id, body) => {
  try {
    const {
      name,
      semester,
      department,
      periodsPerWeek,
      assignedFaculty,
      facultyRooms,
      courseType,
      labDuration,
      labSessionsPerWeek
    } = body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (semester !== undefined) update.semester = Number(semester);
    if (department !== undefined)
      update.department = toObjectId(department) || department;
    if (periodsPerWeek !== undefined)
      update.periodsPerWeek = Number(periodsPerWeek);
    if (assignedFaculty !== undefined) update.assignedFaculty = assignedFaculty;
    if (courseType !== undefined) update.courseType = courseType;
    if (labDuration !== undefined) update.labDuration = Number(labDuration);
    if (labSessionsPerWeek !== undefined)
      update.labSessionsPerWeek = Number(labSessionsPerWeek);

    const subject = await Subject.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    })
      .populate('department', 'name departmentId')
      .populate('assignedFaculty', 'name facultyId');
    if (!subject)
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    if (Array.isArray(facultyRooms)) {
      await SubjectFacultyRoom.deleteMany({ subject: id });
      const toInsert = facultyRooms
        .filter((fr) => fr.faculty && fr.roomNumber && String(fr.roomNumber).trim())
        .map((fr, i) => ({
          subject: id,
          faculty: fr.faculty,
          roomNumber: String(fr.roomNumber).trim(),
          labRoomNumber: fr.labRoomNumber ? String(fr.labRoomNumber).trim() : undefined,
          order: i
        }));
      if (toInsert.length > 0) {
        await SubjectFacultyRoom.insertMany(toInsert);
        await Subject.findByIdAndUpdate(id, { assignedFaculty: toInsert[0].faculty });
      }
    }
    const updated = await Subject.findById(id)
      .populate('department', 'name departmentId')
      .populate('assignedFaculty', 'name facultyId');
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

const deleteSubject = async (id) => {
  try {
    await SubjectFacultyRoom.deleteMany({ subject: id });
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject)
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    return NextResponse.json({ message: 'Subject deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
};
