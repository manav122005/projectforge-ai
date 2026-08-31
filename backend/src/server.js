const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`===========================================`);
      console.log(`  ProjectForge AI Backend Operational`);
      console.log(`  Environment: ${env.NODE_ENV}`);
      console.log(`  Port:        ${env.PORT}`);
      console.log(`  Health API:  http://localhost:${env.PORT}/api/health`);
      console.log(`===========================================`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection] ${err.message}`);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('[SIGTERM] Shutting down server gracefully...');
      server.close(() => {
        console.log('[Server] Closed active connections.');
      });
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
