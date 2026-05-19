import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) return res.status(200).json({ success: true, data: { enrollment: existing } });

    const enrollment = await Enrollment.create({ userId, courseId });
    res.status(201).json({ success: true, data: { enrollment } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id }).populate('courseId');
    const enriched = enrollments.map(e => ({
      ...e.toObject(),
      course: e.courseId
    }));
    res.status(200).json({ success: true, data: { enrollments: enriched } });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/progress', authenticate, async (req, res, next) => {
  try {
    const { topicId } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment || enrollment.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('Enrollment not found', 404));
    }

    if (enrollment.completedTopics.includes(topicId)) {
      return res.status(200).json({ success: true, data: { enrollment } });
    }

    enrollment.completedTopics.push(topicId);
    
    const course = await Course.findById(enrollment.courseId);
    let totalTopics = 0;
    course.modules.forEach(m => m.subModules.forEach(sm => totalTopics += sm.topics.length));
    
    // Safeguard: If the course has no modules set up yet, treat the single 'Complete' click as 100%
    if (totalTopics === 0) totalTopics = 1;

    enrollment.progress = Math.round((enrollment.completedTopics.length / totalTopics) * 100);
    if (enrollment.progress === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    // Gamification
    const user = await User.findById(req.user._id);
    user.points = (user.points || 0) + 50;
    user.level = Math.floor(user.points / 500) + 1;
    await user.save();

    // Achievements logic can be added here or in a separate helper
    
    res.status(200).json({ success: true, data: { enrollment, pointsEarned: 50 } });
  } catch (error) {
    next(error);
  }
});

export default router;
