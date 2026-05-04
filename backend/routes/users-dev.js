import express from 'express';
import { body, validationResult } from 'express-validator';
import inMemoryDB from '../db/inMemoryDB.js';
import { authenticate, authorize } from '../middleware/auth-dev.js';
import { AppError } from '../utils/AppError.js';

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

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let users = await inMemoryDB.User.find();
    
    // Filter by role
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    // Filter by search
    if (search) {
      users = users.filter(user => 
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Pagination
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or self)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own profile or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    const user = await inMemoryDB.User.findOne({ _id: id });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (Admin or self)
router.put('/:id', authenticate, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please enter a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('preferredLanguage')
    .optional()
    .isIn(['en', 'fr', 'es', 'de'])
    .withMessage('Preferred language must be en, fr, es, or de')
], handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    const updates = {};
    const allowedFields = ['firstName', 'lastName', 'bio', 'phone', 'dateOfBirth', 'preferredLanguage', 'avatar'];
    
    // Filter allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Admin can also update role and isActive
    if (req.user.role === 'admin') {
      if (req.body.role) updates.role = req.body.role;
      if (typeof req.body.isActive === 'boolean') updates.isActive = req.body.isActive;
    }

    const user = await inMemoryDB.User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id/password
// @desc    Update user password
// @access  Private (self)
router.put('/:id/password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Ensure user can only change their own password
    if (req.user._id.toString() !== id) {
      return next(new AppError('Access denied', 403));
    }

    const user = await inMemoryDB.User.findOne({ _id: id });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Note: In a real implementation, you'd compare the current password
    // For development, we'll skip this check since we don't store plain text passwords
    
    // Update password (simulate hashing)
    await inMemoryDB.User.findByIdAndUpdate(id, {
      password: newPassword, // In real implementation, this would be hashed
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await inMemoryDB.User.findOne({ _id: id });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('Cannot delete your own account', 400));
    }

    await inMemoryDB.User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/admin/stats', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const users = await inMemoryDB.User.find();
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    
    // Group by role
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    const usersByRoleArray = Object.entries(usersByRole).map(([role, count]) => ({
      _id: role,
      count
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        usersByRole: usersByRoleArray,
        message: 'Development stats - no monthly data in memory'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;