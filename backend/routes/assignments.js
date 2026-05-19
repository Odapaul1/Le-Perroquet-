import express from 'express';
import Assignment from '../models/Assignment.js';
import Enrollment from '../models/Enrollment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

router.post('/', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { courseId, title, description, deadline } = req.body;
    const course = await Course.findById(courseId);
    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      deadline,
      instructorId: course ? course.instructorId : req.user._id
    });

    const enrollments = await Enrollment.find({ courseId });
    const io = req.app.get('io');

    await Promise.all(enrollments.map(async (e) => {
      const notification = await Notification.create({
        userId: e.userId,
        title: 'New Assignment',
        message: `A new assignment "${title}" has been added.`,
        type: 'assignment'
      });
      if (io) io.to(`user_${e.userId}`).emit('new_notification', notification);
    }));

    res.status(201).json({ success: true, data: { assignment } });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/submit', authenticate, async (req, res, next) => {
  try {
    const { content, fileUrl } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return next(new AppError('Assignment not found', 404));

    assignment.submissions.push({
      userId: req.user._id,
      content,
      fileUrl,
      status: 'submitted'
    });

    await assignment.save();

    const io = req.app.get('io');
    const notification = await Notification.create({
      userId: assignment.instructorId,
      title: 'New Submission',
      message: `${req.user.firstName} submitted "${assignment.title}".`,
      type: 'assignment'
    });
    if (io) io.to(`user_${assignment.instructorId}`).emit('new_notification', notification);

    res.status(201).json({ success: true, message: 'Assignment submitted' });
  } catch (error) {
    next(error);
  }
});

router.patch('/submissions/:submissionId/grade', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findOne({ "submissions._id": req.params.submissionId });
    if (!assignment) return next(new AppError('Submission not found', 404));

    const submission = assignment.submissions.id(req.params.submissionId);
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await assignment.save();

    const io = req.app.get('io');
    const notification = await Notification.create({
      userId: submission.userId,
      title: 'Assignment Graded',
      message: `Your submission for "${assignment.title}" has been graded.`,
      type: 'grade'
    });
    if (io) io.to(`user_${submission.userId}`).emit('new_notification', notification);

    // Gamification
    const user = await User.findById(submission.userId);
    user.points = (user.points || 0) + 100 + (grade || 0);
    user.level = Math.floor(user.points / 500) + 1;
    await user.save();

    res.status(200).json({ success: true, data: { submission } });
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
      return next(new AppError('Access denied. You must be enrolled to view assignments.', 403));
    }

    const assignments = await Assignment.find({ courseId: req.params.courseId });
    const enriched = assignments.map(a => {
      const submission = a.submissions.find(s => s.userId.toString() === req.user._id.toString());
      let status = 'ongoing';
      if (submission) status = submission.status;
      else if (a.deadline && new Date(a.deadline) < new Date()) status = 'expired';
      return { ...a.toObject(), userStatus: status, userSubmission: submission };
    });
    res.status(200).json({ success: true, data: { assignments: enriched } });
  } catch (error) {
    next(error);
  }
});

router.get('/instructor/submissions', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ instructorId: req.user._id }).populate('submissions.userId', 'firstName lastName email');
    const allSubmissions = [];
    assignments.forEach(a => {
      a.submissions.forEach(s => {
        allSubmissions.push({ ...s.toObject(), assignment: { _id: a._id, title: a.title }, user: s.userId });
      });
    });
    res.status(200).json({ success: true, data: { submissions: allSubmissions } });
  } catch (error) {
    next(error);
  }
});

export default router;
