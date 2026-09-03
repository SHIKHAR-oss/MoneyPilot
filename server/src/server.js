import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize HTTP server
const server = app.listen(PORT, async () => {
  console.log(`[MoneyPilot Server] Running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`[MoneyPilot Server] Health check available at http://localhost:${PORT}/api/health`);

  // Attempt database connection gracefully without blocking server startup
  await connectDB();
});

// Graceful shutdown handler
const shutdown = async (signal) => {
  console.log(`[MoneyPilot Server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('[MoneyPilot Server] HTTP server closed.');
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
