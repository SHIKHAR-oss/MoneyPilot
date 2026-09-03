import mongoose from 'mongoose';

/**
 * MongoDB Connection Manager
 * Gracefully manages MongoDB lifecycle without leaking sensitive credentials
 */

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[Database] MONGODB_URI is not set. Server starting in database-disconnected mode.');
    isConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    // Log safe error summary without exposing sensitive credentials in URI
    console.error(`[Database] MongoDB Connection Failed: ${error.message}`);
    return false;
  }
};

export const disconnectDB = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[Database] MongoDB disconnected cleanly.');
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

export default {
  connectDB,
  disconnectDB,
  isDbConnected,
  getDbStatus
};
