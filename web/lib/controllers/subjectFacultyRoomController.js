const { NextResponse } = require('next/server');
const SubjectFacultyRoom = require('../models/SubjectFacultyRoom');

const getBySubject = async (subjectId) => {
  try {
    const list = await SubjectFacultyRoom.find({ subject: subjectId })
      .populate('faculty', 'name facultyId')
      .sort({ order: 1 });
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const setForSubject = async (subjectId, body) => {
  try {
    const { facultyRooms } = body;
    if (!Array.isArray(facultyRooms)) {
      return NextResponse.json(
        { error: 'facultyRooms must be an array' },
        { status: 400 }
      );
    }
    await SubjectFacultyRoom.deleteMany({ subject: subjectId });
    const docs = facultyRooms
      .filter((fr) => fr.faculty && fr.roomNumber && String(fr.roomNumber).trim())
      .map((fr, i) => ({
        subject: subjectId,
        faculty: fr.faculty,
        roomNumber: String(fr.roomNumber).trim(),
        order: i
      }));
    if (docs.length > 0) {
      await SubjectFacultyRoom.insertMany(docs);
    }
    const list = await SubjectFacultyRoom.find({ subject: subjectId })
      .populate('faculty', 'name facultyId')
      .sort({ order: 1 });
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

module.exports = { getBySubject, setForSubject };
