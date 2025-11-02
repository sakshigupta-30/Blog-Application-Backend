import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';
import config from './config';

dotenv.config();

const app: Express = express();
const PORT = Number(config.PORT) || 5000;
const MONGODB_URI = config.MONGODB_URI || '';
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Basic logs (avoid printing entire URI if empty)
console.log('🔧 Server starting');
if (MONGODB_URI) {
  console.log('🔍 MongoDB URI looks present (first 30 chars):',
    MONGODB_URI.length > 30 ? MONGODB_URI.substring(0, 30) + '...' : MONGODB_URI
  );
} else {
  console.warn('⚠️  MONGODB_URI not set in config');
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS: whitelist known frontend origins (can be extended via config.FRONTEND_ORIGINS)
const additionalOrigins = config.FRONTEND_ORIGINS
  ? Array.isArray(config.FRONTEND_ORIGINS)
    ? config.FRONTEND_ORIGINS
    : String(config.FRONTEND_ORIGINS).split(',').map(s => s.trim())
  : [];

const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...additionalOrigins,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// --- Register API routes first ---
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// --- Serve client build and SPA fallback for non-API routes (production) ---
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Fallback: send index.html for any GET that isn't /api/* so client-side routing works on reload
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'), err => {
      if (err) next(err);
    });
  });
} else {
  console.warn(`Client build not found at ${clientDistPath}. SPA fallback disabled.`);
}

// --- Connect to MongoDB and start server ---
async function start() {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB');
    } else {
      console.warn('⚠️  Skipping MongoDB connection (MONGODB_URI not set)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
