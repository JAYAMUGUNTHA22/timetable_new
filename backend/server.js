require('dotenv').config();
const connectDB = require('./config/db');
const createApp = require('./createApp');
const { ensureDefaultAdmin } = require('./config/seedAdmin');
const Subject = require('./models/Subject');
const Timetable = require('./models/Timetable');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await ensureDefaultAdmin();
  try {
    await Subject.collection.dropIndex('code_1');
    console.log('Dropped old subjects code_1 index (fixes E11000 duplicate key).');
  } catch (e) {
    if (e.code !== 27) console.log('Subjects index note:', e.message);
  }
  try {
    await Timetable.collection.dropIndex('classSection_1');
    console.log('Dropped old timetables classSection_1 index (fixes E11000 duplicate key).');
  } catch (e) {
    if (e.code !== 27) console.log('Timetables index note:', e.message);
  }
  const app = createApp();
  app.listen(PORT, () => console.log('Server running on port ' + PORT));
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
