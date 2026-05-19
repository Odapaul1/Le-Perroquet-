import express from 'express';
import RecordedSession from '../models/RecordedSession.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

router.post('/', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, description, courseId, videoUrl, duration } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    if (req.user.role !== 'admin' && course.instructorId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    const session = await RecordedSession.create({ title, description, courseId, videoUrl, duration, instructorId: course.instructorId });
    res.status(201).json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
});

router.get('/course/:courseId', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId });
    const course = await Course.findById(courseId);

    if (!enrollment && req.user.role !== 'admin' && course?.instructorId.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403));
    }

    const sessions = await RecordedSession.find({ courseId });
    res.status(200).json({ success: true, data: { sessions } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const session = await RecordedSession.findById(req.params.id);
    if (!session) return next(new AppError('Session not found', 404));
    if (req.user.role !== 'admin' && session.instructorId.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }
    await RecordedSession.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
