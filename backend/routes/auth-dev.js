import express from 'express';
import { body, validationResult } from 'express-validator';
import inMemoryDB from '../db/inMemoryDB.js';
import { generateTokens, authenticate } from '../middleware/auth-dev.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Helper function to compare passwords
const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['learner', 'instructor', 'admin'])
    .withMessage('Role must be learner, instructor, or admin')
], handleValidationErrors, async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role = 'learner' } = req.body;

    // Check if user already exists
    const existingUser = await inMemoryDB.User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await inMemoryDB.User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isEmailVerified: true, // Auto-verify in development
      isActive: true,
      avatar: null,
      bio: '',
      preferredLanguage: 'en',
      coursesEnrolled: [],
      coursesTeaching: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await inMemoryDB.User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 403));
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email (simulated in development)
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address')
], handleValidationErrors, async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await inMemoryDB.User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // In development, we'll simulate sending an email
    console.log(`📧 Password reset email would be sent to: ${email}`);
    console.log(`🔑 Reset token: reset_token_${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully (simulated)',
      devToken: `reset_token_${user._id}` // For testing in development
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
], handleValidationErrors, async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Extract user ID from development token
    if (!token.startsWith('reset_token_')) {
      return next(new AppError('Invalid reset token format', 400));
    }

    const userId = token.split('_')[2];
    const user = await inMemoryDB.User.findOne({ _id: userId });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Update password
    const hashedPassword = await hashPassword(password);
    await inMemoryDB.User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token required', 400));
    }

    // Extract user ID from development refresh token
    if (!refreshToken.startsWith('dev_refresh_')) {
      return next(new AppError('Invalid refresh token format', 400));
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
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(new AppError('Invalid refresh token', 401));
  }
});

export default router;