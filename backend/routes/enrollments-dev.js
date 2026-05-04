import express from 'express';
import inMemoryDB from '../db/inMemoryDB.js';
import { authenticate } from '../middleware/auth-dev.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll in a course
// @access  Private (Learner)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Check if course exists
    const course = await inMemoryDB.Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Check if already enrolled
    const existingEnrollment = await inMemoryDB.Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        data: { enrollment: existingEnrollment },
        message: 'Already enrolled'
      });
    }

    const enrollment = await inMemoryDB.Enrollment.create({ userId, courseId });
    res.status(201).json({
      success: true,
      data: { enrollment }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/enrollments/me
// @desc    Get my enrollments
// @access  Private
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const enrollments = await inMemoryDB.Enrollment.find({ userId: req.user._id });
    
    // Enrich with course data
    const enrichedEnrollments = await Promise.all(enrollments.map(async (e) => {
      const course = await inMemoryDB.Course.findById(e.courseId);
      return { ...e, course };
    }));

    res.status(200).json({
      success: true,
      data: { enrollments: enrichedEnrollments }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/enrollments/:id/progress
// @desc    Update progress (mark topic complete)
// @access  Private
router.patch('/:id/progress', authenticate, async (req, res, next) => {
  try {
    const { topicId } = req.body;
    const enrollment = await inMemoryDB.Enrollment.find({ _id: req.params.id }); // find returns array in our mock
    const e = enrollment[0]; // Simple mock findById

    if (!e || e.userId !== req.user._id) {
      return next(new AppError('Enrollment not found', 404));
    }

    if (e.completedTopics.includes(topicId)) {
      return res.status(200).json({ success: true, data: { enrollment: e } });
    }

    const completedTopics = [...e.completedTopics, topicId];
    
    // Calculate progress
    const course = await inMemoryDB.Course.findById(e.courseId);
    let totalTopics = 0;
    course.modules.forEach(m => {
      m.subModules.forEach(sm => {
        totalTopics += sm.topics.length;
      });
    });

    const progress = Math.round((completedTopics.length / totalTopics) * 100);
    const status = progress === 100 ? 'completed' : 'enrolled';

    const updated = await inMemoryDB.Enrollment.findByIdAndUpdate(req.params.id, {
      completedTopics,
      progress,
      status,
      completedAt: status === 'completed' ? new Date() : null
    });

    // Gamification Integration
    // 1. Award points for completing a topic (50 points)
    const user = await inMemoryDB.User.findById(req.user._id);
    const newPoints = (user.points || 0) + 50;
    const newLevel = Math.floor(newPoints / 500) + 1;
    await inMemoryDB.User.findByIdAndUpdate(req.user._id, { points: newPoints, level: newLevel });

    // 2. Check for achievements
    if (completedTopics.length === 1) {
      await inMemoryDB.Achievement.award(req.user._id, 'first_lesson');
    }
    
    if (status === 'completed') {
      await inMemoryDB.Achievement.award(req.user._id, 'course_master');
    }

    res.status(200).json({
      success: true,
      data: { enrollment: updated, pointsEarned: 50 }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
