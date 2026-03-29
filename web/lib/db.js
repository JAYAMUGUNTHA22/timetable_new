const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/college_timetable';

let cached = global.__mongoose_cache;
if (!cached) {
  cached = global.__mongoose_cache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

let startupPromise;
async function ensureDbReady() {
  await connectDB();
  if (!startupPromise) {
    startupPromise = (async () => {
      const { ensureDefaultAdmin } = require('./config/seedAdmin');
      const Subject = require('./models/Subject');
      const Timetable = require('./models/Timetable');
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
    })();
  }
  await startupPromise;
}

module.exports = { connectDB, ensureDbReady };
