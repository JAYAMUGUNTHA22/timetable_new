const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const academicConfigRoutes = require('./routes/academicConfig');
const departmentRoutes = require('./routes/departments');
const subjectRoutes = require('./routes/subjects');
const facultyRoutes = require('./routes/faculty');
const timetableRoutes = require('./routes/timetables');
const authRoutes = require('./routes/auth');
const selfRoutes = require('./routes/self');
const publicRoutes = require('./routes/public');

function createApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/me', selfRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/config', academicConfigRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/subjects', subjectRoutes);
  app.use('/api/faculty', facultyRoutes);
  app.use('/api/timetables', timetableRoutes);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  return app;
}

module.exports = createApp;
