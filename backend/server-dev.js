import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth-dev.js';
import userRoutes from './routes/users-dev.js';
import courseRoutes from './routes/courses-dev.js';
import enrollmentRoutes from './routes/enrollments-dev.js';
import assignmentRoutes from './routes/assignments-dev.js';
import paymentRoutes from './routes/payments-dev.js';
import sessionRoutes from './routes/sessions-dev.js';
import analyticsRoutes from './routes/analytics-dev.js';
import notificationRoutes from './routes/notifications-dev.js';
import gamificationRoutes from './routes/gamification-dev.js';
import { errorHandler } from './middleware/errorHandler.js';
import inMemoryDB from './db/inMemoryDB.js';
import { createServer } from 'http';
import { setupSocket } from './socket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid conflict

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'In-Memory (Development Mode)',
    message: 'Authentication system is running without MongoDB'
  });
});

// Development endpoints
app.get('/api/dev/users', async (req, res) => {
  const users = await inMemoryDB.User.find();
  res.json({
    success: true,
    data: { users },
    message: 'Development endpoint - showing all in-memory users'
  });
});

app.delete('/api/dev/clear-users', async (req, res) => {
  inMemoryDB.clear();
  // Recreate default users
  await inMemoryDB.User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@frenchlms.com',
    password: 'Admin123!',
    role: 'admin',
    isEmailVerified: true
  });
  res.json({
    success: true,
    message: 'Development database cleared and reset'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server with in-memory database
const startServer = async () => {
  try {
    await inMemoryDB.connect();
    const httpServer = createServer(app);
    const io = setupSocket(httpServer);
    
    // Attach io to app for access in routes
    app.set('io', io);
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Development Server running on port ${PORT}`);
      console.log('💡 Using In-Memory Database (No MongoDB Required)');
      console.log('📊 Pre-loaded test users:');
      console.log('   👤 Admin: admin@frenchlms.com / Admin123!');
      console.log('   👨‍🏫 Instructor: instructor@frenchlms.com / Instructor123!');
      console.log('   📚 Learner: learner@frenchlms.com / Learner123!');
      console.log('🔍 Test endpoints:');
      console.log(`   🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`   👥 Users: http://localhost:${PORT}/api/dev/users`);
      console.log(`   🗑️  Clear: http://localhost:${PORT}/api/dev/clear-users`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;