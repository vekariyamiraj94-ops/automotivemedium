import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import serviceCentreRoutes from './routes/serviceCentreRoutes.js';
import servicePackageRoutes from './routes/servicePackageRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();

// Security & Utility Middlewares
app.use(helmet());

// Dynamic CORS configuration (Support Render, localhost, and preview URLs)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, uptime bots)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/service-centres', serviceCentreRoutes);
app.use('/api/service-packages', servicePackageRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);

// Root greeting & status
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Automotivemedium Multi-Brand Car Service Centre API',
    healthCheck: '/api/health',
    version: '1.0.0',
    documentation: 'See README.md for endpoint reference',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening (only if not running under Jest)
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `🚀 Automotivemedium Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        );
      });
    })
    .catch((err) => {
      console.error(`Failed to start server due to database error: ${err.message}`);
    });
}

export default app;
