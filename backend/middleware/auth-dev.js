import bcrypt from 'bcryptjs';
import inMemoryDB from '../db/inMemoryDB.js';
import { AppError } from '../utils/AppError.js';

// Simulate JWT functionality for development
export const generateTokens = (userId) => {
  // In development, we'll use simple tokens instead of JWT
  const accessToken = `dev_access_${userId}_${Date.now()}`;
  const refreshToken = `dev_refresh_${userId}_${Date.now()}`;
  
  // Store session in memory
  inMemoryDB.Session.create({
    userId,
    accessToken,
    refreshToken,
    createdAt: new Date()
  });
  
  return { accessToken, refreshToken };
};

// Simulate JWT verification
export const verifyToken = (token) => {
  if (!token || !token.startsWith('dev_access_')) {
    throw new AppError('Invalid token', 401);
  }
  
  // Extract user ID from token
  const userId = token.split('_')[2];
  if (!userId) {
    throw new AppError('Invalid token format', 401);
  }
  
  return { userId };
};

// Authentication middleware for development
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401));
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Get user from in-memory database
    const user = await inMemoryDB.User.findOne({ _id: decoded.userId });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Refresh token middleware for development
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshToken.startsWith('dev_refresh_')) {
      return next(new AppError('Invalid refresh token', 400));
    }

    const userId = refreshToken.split('_')[2];
    const user = await inMemoryDB.User.findOne({ _id: userId });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 403));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user
      }
    });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
};

export default { authenticate, authorize, generateTokens, refreshAccessToken };