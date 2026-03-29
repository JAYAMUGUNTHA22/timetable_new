const { NextResponse } = require('next/server');
const AcademicConfig = require('../models/AcademicConfig');

const getConfig = async () => {
  try {
    let config = await AcademicConfig.findOne().sort({ updatedAt: -1 });
    if (!config) {
      config = await AcademicConfig.create({
        workingDays: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        periodsPerDay: 7,
        breakPeriodIndices: []
      });
    }
    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

const updateConfig = async (body) => {
  try {
    const { workingDays, periodsPerDay, breakPeriodIndices } = body;
    let config = await AcademicConfig.findOne().sort({ updatedAt: -1 });
    if (!config) {
      config = new AcademicConfig();
    }
    if (workingDays !== undefined) config.workingDays = workingDays;
    if (periodsPerDay !== undefined) config.periodsPerDay = periodsPerDay;
    if (breakPeriodIndices !== undefined)
      config.breakPeriodIndices = breakPeriodIndices;
    config.updatedAt = new Date();
    await config.save();
    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

module.exports = { getConfig, updateConfig };
