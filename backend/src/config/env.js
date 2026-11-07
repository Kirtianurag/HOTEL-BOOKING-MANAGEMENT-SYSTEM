import dotenv from 'dotenv';

// Load .env file into process.env
dotenv.config();

/**
 * Centralised configuration object.
 * Defaults are provided for development; production values come from env vars.
 */
export const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/stayease',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE, 10) || 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
