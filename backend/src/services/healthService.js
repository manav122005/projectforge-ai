const mongoose = require('mongoose');

const getHealthStatus = async () => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  return {
    status: isHealthy ? 'ok' : 'degraded',
    version: '1.0.1',
    engine: 'deterministic-v2',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStateMap[dbState] || 'unknown',
      connected: isHealthy
    }
  };
};

module.exports = { getHealthStatus };
