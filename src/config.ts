import dotenv from 'dotenv';

dotenv.config();

const getRequired = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
};

export const PORT = process.env.PORT || '5000';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env.MONGODB_URI || getRequired('MONGODB_URI');
export const JWT_SECRET = process.env.JWT_SECRET || getRequired('JWT_SECRET');

// FRONTEND_ORIGINS can be comma-separated
export const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export default {
  PORT,
  NODE_ENV,
  MONGODB_URI,
  JWT_SECRET,
  FRONTEND_ORIGINS,
};
