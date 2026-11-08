import mongoose from 'mongoose';
import { config } from './env.js';

/**
 * Connect to MongoDB using Mongoose.
 * Logs connection success or exits on failure.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      family: 4, // Force IPv4 resolution (required for Node 20/22/24 on Render/cloud containers)
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Log disconnection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB runtime error: ${err.message}`);
});

export { connectDB };
export default connectDB;
