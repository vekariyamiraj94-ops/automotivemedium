import mongoose from 'mongoose';

/**
 * @desc   Check API server and Database health
 * @route  GET /api/health
 * @access Public (Used by UptimeRobot, Render, and CI)
 */
export const getHealth = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const isHealthy = mongoose.connection.readyState === 1;

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    service: 'Automotivemedium API',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'unknown',
    },
    system: {
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      nodeVersion: process.version,
    },
  };

  // Return HTTP 200 when backend is healthy
  return res.status(isHealthy ? 200 : 503).json(healthData);
};
