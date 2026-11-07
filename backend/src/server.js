import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = config.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🏨 StayEase API Server running in ${config.NODE_ENV} mode on port ${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health:   http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

startServer();

