const { NextResponse } = require('next/server');
const Timetable = require('../models/Timetable');
const { generateTimetablesForSemester } = require('../services/timetableGenerator');

async function dropStaleTimetableIndexes() {
  const namesToTry = ['classSection_1', 'classSection'];
  for (const name of namesToTry) {
    try {
      await Timetable.collection.dropIndex(name);
    } catch (e) {
      void e;
    }
  }
  try {
    const cursor = Timetable.collection.listIndexes();
    const list = await cursor.toArray();
    for (const idx of list) {
      if (idx.name && idx.name.toLowerCase().includes('classsection')) {
        await Timetable.collection.dropIndex(idx.name);
      }
    }
  } catch (e) {
    if (e.code !== 27 && e.codeName !== 'IndexNotFound')
      console.log('List/drop timetable indexes:', e.message);
  }
}

const getTimetables = async ({ semester, department }) => {
  try {
    const filter = {};
    if (semester) filter.semester = Number(semester);
    if (department) filter.department = department;
    const timetables = await Timetable.find(filter)
      .populate('department', 'name departmentId')
      .sort({ department: 1 });
    return NextResponse.json(timetables);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const getTimetable = async (id) => {
  try {
    const timetable = await Timetable.findById(id).populate(
      'department',
      'name departmentId'
    );
    if (!timetable)
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    return NextResponse.json(timetable);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const generateTimetables = async (body, searchParams) => {
  try {
    await dropStaleTimetableIndexes();
    const semester =
      Number(
        body && body.semester !== undefined
          ? body.semester
          : searchParams.get('semester')
      ) || 1;
    const replaceExisting = body && body.replaceExisting === true;
    const { timetables, errors, skipped, skippedDepartments } =
      await generateTimetablesForSemester(semester, { replaceExisting });
    const count = timetables ? timetables.length : 0;
    let message = '';
    if (
      count === 0 &&
      (!errors || errors.length === 0) &&
      (!skippedDepartments || skippedDepartments.length === 0)
    ) {
      message =
        'No timetables generated. Set Academic Config, add Departments, Faculty, and Subjects (with Faculty & Room) for this semester, then try again.';
    } else if (count === 0 && errors && errors.length > 0) {
      message =
        (errors[0] || 'Generation failed.') +
        (errors.length > 1 ? ' (' + errors.length + ' issues.)' : '');
    } else {
      message = replaceExisting
        ? `Generated ${count} timetable(s) for semester ${semester} (replaced existing).`
        : `Generated ${count} timetable(s) for semester ${semester}. Existing timetables were left unchanged so faculty schedules stay stable.`;
      if (skipped > 0) message += ` Skipped ${skipped} existing timetable(s).`;
      if (skippedDepartments && skippedDepartments.length > 0) {
        message +=
          ' No timetable for: ' +
          skippedDepartments.map((d) => d.name + ' (' + d.reason + ')').join('; ') +
          '.';
      }
    }
    message += ` [generator=uniform-sections-v3 at ${new Date().toISOString()}]`;
    return NextResponse.json({
      message,
      timetables: timetables || [],
      errors: errors || [],
      skipped: skipped || 0,
      skippedDepartments: skippedDepartments || []
    });
  } catch (err) {
    console.error('Timetable generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Timetable generation failed' },
      { status: 500 }
    );
  }
};

const updateTimetableSlot = async (id, body) => {
  try {
    const { dayIndex, periodIndex, subject, subjectName, assignments, type } =
      body;
    const timetable = await Timetable.findById(id);
    if (!timetable)
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    if (!timetable.slots[dayIndex]) timetable.slots[dayIndex] = [];
    const slotAssignments = (assignments || []).map((a) => ({
      sectionNumber: a.sectionNumber,
      subject: a.subject || null,
      subjectName: a.subjectName || '',
      faculty: a.faculty || null,
      facultyName: a.facultyName || '',
      facultyId: a.facultyId || '',
      roomNumber: a.roomNumber || ''
    }));
    const first = slotAssignments[0];
    timetable.slots[dayIndex][periodIndex] = {
      subject: subject || first?.subject || null,
      subjectName: subjectName || first?.subjectName || '',
      type: type || 'Theory',
      assignments: slotAssignments
    };
    timetable.updatedAt = new Date();
    await timetable.save();
    const updated = await Timetable.findById(id).populate(
      'department',
      'name departmentId'
    );
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

const deleteTimetablesBySemester = async (semester) => {
  try {
    const sem = Number(semester);
    const result = await Timetable.deleteMany({ semester: sem });
    return NextResponse.json({
      message: `Deleted ${result.deletedCount} timetable(s) for semester ${sem}.`
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

module.exports = {
  getTimetables,
  getTimetable,
  generateTimetables,
  updateTimetableSlot,
  deleteTimetablesBySemester
};
