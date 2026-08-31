const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Primary connection to ${env.MONGODB_URI} failed: ${err.message}`);
    console.log('[MongoDB] Initializing memory server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const mongoUri = memoryServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`[MongoDB] Memory server connected: ${mongoUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Memory server connection error: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
