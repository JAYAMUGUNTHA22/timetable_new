const { NextResponse } = require('next/server');
const Timetable = require('../models/Timetable');
const AcademicConfig = require('../models/AcademicConfig');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');

async function getDepartmentFromFacultyId(facultyIdStr) {
  if (!facultyIdStr || typeof facultyIdStr !== 'string') return null;
  const match = facultyIdStr.trim().match(/^([A-Za-z]+)/i);
  const prefix = match ? match[1].toUpperCase() : '';
  if (!prefix) return null;
  const dept = await Department.findOne({
    $or: [
      { departmentId: { $regex: new RegExp('^' + prefix, 'i') } },
      { name: { $regex: new RegExp('^' + prefix, 'i') } }
    ]
  }).lean();
  return dept ? dept._id : null;
}

const facultySelfTimetable = async (user, semester) => {
  try {
    const facultyId = user.faculty;
    if (!facultyId)
      return NextResponse.json(
        { error: 'Faculty not linked to user.' },
        { status: 400 }
      );
    const sem = Number(semester) || 1;

    const config = await AcademicConfig.findOne().sort({ updatedAt: -1 });
    if (!config)
      return NextResponse.json(
        { error: 'Academic configuration not found.' },
        { status: 400 }
      );
    const workingDays =
      config.workingDays ||
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periodsPerDay = config.periodsPerDay || 7;
    const breakPeriodIndices = config.breakPeriodIndices || [];

    const timetables = await Timetable.find({ semester: sem });

    const grid = [];
    for (let d = 0; d < workingDays.length; d++) {
      const row = [];
      for (let p = 0; p < periodsPerDay; p++) {
        if (breakPeriodIndices.includes(p)) {
          row.push({ status: 'break' });
          continue;
        }
        let found = null;
        for (const tt of timetables) {
          const slotRow = tt.slots && tt.slots[d];
          const slot = slotRow && slotRow[p];
          if (slot && slot.assignments) {
            const assignment = slot.assignments.find(
              (a) => a.faculty && a.faculty.toString() === facultyId
            );
            if (assignment) {
              found = {
                status: 'class',
                subjectName: assignment.subjectName || slot.subjectName,
                department: tt.department,
                sectionNumber: assignment.sectionNumber,
                roomNumber: assignment.roomNumber || ''
              };
              break;
            }
          }
        }
        if (!found) {
          row.push({ status: 'free' });
        } else {
          row.push(found);
        }
      }
      grid.push(row);
    }

    const faculty = await Faculty.findById(facultyId).populate(
      'homeDepartment',
      'name departmentId'
    );

    return NextResponse.json({
      faculty: faculty
        ? {
            name: faculty.name,
            facultyId: faculty.facultyId,
            department: faculty.homeDepartment
          }
        : null,
      workingDays,
      periodsPerDay,
      grid
    });
  } catch (err) {
    console.error('Faculty self timetable error:', err);
    return NextResponse.json({ error: 'Failed to load timetable.' }, { status: 500 });
  }
};

const studentSelfTimetable = async (user, semester) => {
  try {
    const { department, sectionNumber } = user;
    if (!department || !sectionNumber) {
      return NextResponse.json(
        { error: 'Student is not linked to department/section.' },
        { status: 400 }
      );
    }
    const sem = Number(semester) || 1;
    const tt = await Timetable.findOne({ department, semester: sem })
      .populate('department', 'name departmentId')
      .lean();
    if (!tt)
      return NextResponse.json(
        { error: 'Timetable not found for your department.' },
        { status: 404 }
      );

    const studentSlots = [];
    if (tt.slots) {
      for (let d = 0; d < tt.slots.length; d++) {
        const row = [];
        for (let p = 0; p < (tt.slots[d] || []).length; p++) {
          const slot = tt.slots[d][p];
          if (slot && slot.assignments) {
            const assignment = slot.assignments.find(
              (a) => a.sectionNumber === sectionNumber
            );
            if (assignment) {
              row.push({
                subject: assignment.subject || slot.subject,
                subjectName: assignment.subjectName || slot.subjectName,
                faculty: assignment.faculty,
                facultyName: assignment.facultyName,
                roomNumber: assignment.roomNumber,
                type: slot.type
              });
            } else {
              row.push(null);
            }
          } else {
            row.push(null);
          }
        }
        studentSlots.push(row);
      }
    }

    return NextResponse.json({ ...tt, sectionNumber, slots: studentSlots });
  } catch (err) {
    console.error('Student self timetable error:', err);
    return NextResponse.json({ error: 'Failed to load timetable.' }, { status: 500 });
  }
};

const facultyDepartmentTimetables = async (user, semester) => {
  try {
    const facultyId = user.faculty;
    if (!facultyId)
      return NextResponse.json(
        { error: 'Faculty not linked to user.' },
        { status: 400 }
      );
    const faculty = await Faculty.findById(facultyId)
      .populate('homeDepartment', 'name departmentId')
      .lean();
    let departmentId = faculty?.homeDepartment?._id || faculty?.homeDepartment;
    if (!departmentId && faculty?.facultyId) {
      departmentId = await getDepartmentFromFacultyId(faculty.facultyId);
    }
    if (!departmentId) {
      return NextResponse.json(
        {
          error:
            'Faculty department could not be determined. Set home department or use a faculty ID that matches a department (e.g. CS005 for CSE).'
        },
        { status: 400 }
      );
    }

    const sem = Number(semester) || 1;
    const timetables = await Timetable.find({
      department: departmentId,
      semester: sem
    }).populate('department', 'name departmentId');

    return NextResponse.json(timetables);
  } catch (err) {
    console.error('Dept timetables error:', err);
    return NextResponse.json(
      { error: 'Failed to load department timetables.' },
      { status: 500 }
    );
  }
};

const listHolidaysAuth = async () => {
  const holidays = [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-01-15', name: 'Pongal' },
    { date: '2024-01-26', name: 'Republic Day' },
    { date: '2024-03-25', name: 'Holi' },
    { date: '2024-04-10', name: 'Eid al-Fitr' },
    { date: '2024-08-15', name: 'Independence Day' },
    { date: '2024-10-02', name: 'Gandhi Jayanti' },
    { date: '2024-11-01', name: 'Diwali' },
    { date: '2024-12-25', name: 'Christmas Day' }
  ];
  return NextResponse.json(holidays);
};

module.exports = {
  facultySelfTimetable,
  studentSelfTimetable,
  facultyDepartmentTimetables,
  listHolidaysAuth
};
