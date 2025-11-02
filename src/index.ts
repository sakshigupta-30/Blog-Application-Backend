import express, { Express } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';

import config from './config';

const app: Express = express();
const PORT = Number(config.PORT) || 5000;

// Middleware
const MONGODB_URI = config.MONGODB_URI;
const clientDistPath = path.resolve(__dirname, '../../client/dist');

console.log('🔍 Attempting to connect to MongoDB');
console.log('URI:', MONGODB_URI.substring(0, 30) + '...' + MONGODB_URI.substring(MONGODB_URI.length - 20));


 // Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
if (config.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));
}
app.use(
  cors({
    origin: (origin: any, callback: any) => {
      const additional = Array.isArray(config.FRONTEND_ORIGINS)
        ? config.FRONTEND_ORIGINS
        : config.FRONTEND_ORIGINS
        ? [config.FRONTEND_ORIGINS]
        : [];
      const whitelist = [
        'http://localhost:3000',
        'http://localhost:5173',
        ...additional,
      ].filter(Boolean);
      // allow requests with no origin (like mobile apps or curl) and allowed origins
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
   credentials: true,
  })
);

// MongoDB connection
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Timeout after 5 seconds
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});
if (config.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}
