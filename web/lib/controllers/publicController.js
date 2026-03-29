const { NextResponse } = require('next/server');
const Department = require('../models/Department');

const PUBLIC_HOLIDAYS = [
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

const listDepartmentsPublic = async () => {
  try {
    const list = await Department.find()
      .select('_id departmentId name sectionsCount')
      .lean();
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const listHolidaysPublic = async () => {
  return NextResponse.json(PUBLIC_HOLIDAYS);
};

module.exports = { listDepartmentsPublic, listHolidaysPublic, PUBLIC_HOLIDAYS };
