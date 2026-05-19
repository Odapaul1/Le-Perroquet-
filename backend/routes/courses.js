import express from 'express';
import { body, validationResult } from 'express-validator';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get('/', async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true }).populate('instructorId', 'firstName lastName');
    const enrichedCourses = courses.map(c => ({
      ...c.toObject(),
      instructorName: c.instructorId ? `${c.instructorId.firstName} ${c.instructorId.lastName}` : 'Unknown'
    }));
    res.status(200).json({ success: true, data: { courses: enrichedCourses } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructorId', 'firstName lastName');
    if (!course) return next(new AppError('Course not found', 404));
    res.status(200).json({ success: true, data: { course } });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('admin', 'instructor'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
], handleValidationErrors, async (req, res, next) => {
  try {
    const instructorId = (req.user.role === 'admin' && req.body.instructorId) ? req.body.instructorId : req.user._id;
    const course = await Course.create({ ...req.body, instructorId });
    res.status(201).json({ success: true, data: { course } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));
    if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }
    
    // Prevent instructors from re-assigning the course to someone else
    if (req.user.role !== 'admin' && req.body.instructorId) {
      delete req.body.instructorId;
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: { course: updated } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return next(new AppError('Course not found', 404));
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
