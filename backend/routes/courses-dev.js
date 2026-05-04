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

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const courses = await inMemoryDB.Course.find();
    
    // Enrich with instructor info
    const enrichedCourses = await Promise.all(courses.map(async (c) => {
      const instructor = await inMemoryDB.User.findById(c.instructorId);
      return {
        ...c,
        instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown'
      };
    }));

    res.status(200).json({
      success: true,
      data: { courses: enrichedCourses }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const course = await inMemoryDB.Course.findById(req.params.id);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    res.status(200).json({
      success: true,
      data: { course }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Admin or Instructor)
router.post('/', authenticate, authorize('admin', 'instructor'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid level')
], handleValidationErrors, async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      instructorId: req.user._id,
      modules: req.body.modules || []
    };
    const course = await inMemoryDB.Course.create(courseData);
    res.status(201).json({
      success: true,
      data: { course }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Admin or Course Instructor)
router.put('/:id', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const course = await inMemoryDB.Course.findById(req.params.id);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Check if user is admin or the instructor who created the course
    if (req.user.role !== 'admin' && course.instructorId !== req.user._id) {
      return next(new AppError('Not authorized to update this course', 403));
    }

    const updatedCourse = await inMemoryDB.Course.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: { course: updatedCourse }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const course = await inMemoryDB.Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
