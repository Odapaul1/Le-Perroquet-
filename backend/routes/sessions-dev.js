import express from 'express';
import inMemoryDB from '../db/inMemoryDB.js';
import { authenticate, authorize } from '../middleware/auth-dev.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// @route   POST /api/sessions
// @desc    Upload a new recorded session (Instructor)
// @access  Private (Instructor)
router.post('/', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, description, courseId, videoUrl, duration } = req.body;
    
    // Check if course exists
    const course = await inMemoryDB.Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    // Ensure instructor owns the course or is admin
    if (req.user.role !== 'admin' && course.instructorId !== req.user._id) {
      return next(new AppError('Not authorized to add sessions to this course', 403));
    }

    const session = await inMemoryDB.RecordedSession.create({
      title,
      description,
      courseId,
      videoUrl, // In production, this would be the URL from S3/Firebase
      duration,
      instructorId: req.user._id,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/sessions/course/:courseId
// @desc    Get all recorded sessions for a course
// @access  Private (Enrolled Learner, Instructor of course, or Admin)
router.get('/course/:courseId', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if user is enrolled
    const enrollment = await inMemoryDB.Enrollment.findOne({ userId, courseId });
    const course = await inMemoryDB.Course.findById(courseId);

    const isAuthorized = 
      enrollment || 
      req.user.role === 'admin' || 
      (course && course.instructorId === userId);

    if (!isAuthorized) {
      return next(new AppError('You must be enrolled in this course to access recorded sessions', 403));
    }

    const sessions = await inMemoryDB.RecordedSession.find({ courseId });

    res.status(200).json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/sessions/:id
// @desc    Delete a recorded session
// @access  Private (Instructor who created it or Admin)
router.delete('/:id', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const session = await inMemoryDB.RecordedSession.findById(req.params.id);
    if (!session) return next(new AppError('Session not found', 404));

    if (req.user.role !== 'admin' && session.instructorId !== req.user._id) {
      return next(new AppError('Not authorized to delete this session', 403));
    }

    await inMemoryDB.RecordedSession.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
