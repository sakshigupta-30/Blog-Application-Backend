import express, { Express } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import blogRoutes from './routes/blogRoutes';

import config from './config';

const app: Express = express();
const PORT = Number(config.PORT) || 5000;

// Middleware
const MONGODB_URI = config.MONGODB_URI;

console.log('🔍 Attempting to connect to MongoDB');
console.log('URI:', MONGODB_URI.substring(0, 30) + '...' + MONGODB_URI.substring(MONGODB_URI.length - 20));


// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin: config.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:5173'] 
      : config.FRONTEND_ORIGINS,
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
