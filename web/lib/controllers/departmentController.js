const { NextResponse } = require('next/server');
const Department = require('../models/Department');

const getDepartments = async () => {
  try {
    const departments = await Department.find().sort({ departmentId: 1 });
    return NextResponse.json(departments);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const getDepartment = async (id) => {
  try {
    const department = await Department.findById(id);
    if (!department)
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    return NextResponse.json(department);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const createDepartment = async (body) => {
  try {
    const { departmentId, name, sectionsCount } = body;
    const department = await Department.create({ departmentId, name, sectionsCount });
    return NextResponse.json(department, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

const updateDepartment = async (id, body) => {
  try {
    const department = await Department.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true
    });
    if (!department)
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    return NextResponse.json(department);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
};

const deleteDepartment = async (id) => {
  try {
    const department = await Department.findByIdAndDelete(id);
    if (!department)
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    return NextResponse.json({ message: 'Department deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
