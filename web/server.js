const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const next = require('next');
const express = require('express');
const connectDB = require('../backend/config/db');
const createApiApp = require('../backend/createApp');
const { ensureDefaultAdmin } = require('../backend/config/seedAdmin');
const Subject = require('../backend/models/Subject');
const Timetable = require('../backend/models/Timetable');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const nextApp = next({ dev, dir: __dirname });
const handle = nextApp.getRequestHandler();

async function start() {
  await connectDB();
  await ensureDefaultAdmin();
  try {
    await Subject.collection.dropIndex('code_1');
    console.log('Dropped old subjects code_1 index (if it existed).');
  } catch (e) {
    if (e.code !== 27) console.log('Subjects index note:', e.message);
  }
  try {
    await Timetable.collection.dropIndex('classSection_1');
    console.log('Dropped old timetables classSection_1 index (if it existed).');
  } catch (e) {
    if (e.code !== 27) console.log('Timetables index note:', e.message);
  }

  await nextApp.prepare();
  const apiApp = createApiApp();
  const server = express();
  // Only forward /api/* to Express. Mounting the full app at / makes Express
  // return 404 for / and never reach Next.js.
  server.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return apiApp(req, res, next);
    }
    next();
  });
  server.all('*', (req, res) => handle(req, res));

  server.listen(port, hostname, () => {
    console.log(`Ready on http://${hostname}:${port}`);
  });
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
