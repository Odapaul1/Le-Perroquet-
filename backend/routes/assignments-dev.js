import express from 'express';
import inMemoryDB from '../db/inMemoryDB.js';
import { authenticate, authorize } from '../middleware/auth-dev.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

// @route   POST /api/assignments
// @desc    Create an assignment (Instructor)
// @access  Private (Instructor)
router.post('/', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { courseId, title, description, dueDate } = req.body;
    const assignment = await inMemoryDB.Assignment.create({
      courseId,
      title,
      description,
      dueDate,
      instructorId: req.user._id,
      createdAt: new Date()
    });

    // NOTIFY ALL ENROLLED LEARNERS
    const enrollments = await inMemoryDB.Enrollment.find({ courseId });
    const io = req.app.get('io');

    await Promise.all(enrollments.map(async (e) => {
      const notification = await inMemoryDB.Notification.create({
        userId: e.userId,
        title: 'New Assignment',
        message: `A new assignment "${title}" has been added to your course.`,
        type: 'assignment',
        link: `/lesson/${courseId}`
      });

      if (io) {
        io.to(`user_${e.userId}`).emit('new_notification', notification);
      }
    }));

    res.status(201).json({ success: true, data: { assignment } });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit an assignment (Learner)
// @access  Private (Learner)
router.post('/:id/submit', authenticate, async (req, res, next) => {
  try {
    const { contentUrl, textContent } = req.body;
    const assignment = await inMemoryDB.assignments.get(req.params.id);
    
    const submission = await inMemoryDB.Submission.create({
      assignmentId: req.params.id,
      userId: req.user._id,
      contentUrl,
      textContent,
      status: 'submitted',
      submittedAt: new Date()
    });

    // NOTIFY INSTRUCTOR
    if (assignment) {
      const io = req.app.get('io');
      const notification = await inMemoryDB.Notification.create({
        userId: assignment.instructorId,
        title: 'New Submission',
        message: `${req.user.firstName} submitted "${assignment.title}".`,
        type: 'submission',
        link: '/instructor/grading'
      });

      if (io) {
        io.to(`user_${assignment.instructorId}`).emit('new_notification', notification);
      }
    }

    res.status(201).json({ success: true, data: { submission } });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/submissions/:id/grade
// @desc    Grade a submission (Instructor)
// @access  Private (Instructor)
router.patch('/submissions/:id/grade', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await inMemoryDB.Submission.findByIdAndUpdate(req.params.id, {
      grade,
      feedback,
      status: 'graded',
      gradedAt: new Date(),
      gradedBy: req.user._id
    });

    // NOTIFY LEARNER
    if (submission) {
      const assignment = await inMemoryDB.assignments.get(submission.assignmentId);
      const io = req.app.get('io');
      const notification = await inMemoryDB.Notification.create({
        userId: submission.userId,
        title: 'Assignment Graded',
        message: `Your submission for "${assignment?.title || 'Assignment'}" has been graded.`,
        type: 'grade',
        link: `/lesson/${assignment?.courseId}`
      });

      if (io) {
        io.to(`user_${submission.userId}`).emit('new_notification', notification);
      }

      // Gamification Integration
      // 1. Award points for completing an assignment (100 points + grade-based bonus)
      const bonus = (grade / 100) * 100; // Extra up to 100 points for grade
      const totalPoints = Math.round(100 + bonus);
      
      const user = await inMemoryDB.User.findById(submission.userId);
      const newPoints = (user.points || 0) + totalPoints;
      const newLevel = Math.floor(newPoints / 500) + 1;
      await inMemoryDB.User.findByIdAndUpdate(submission.userId, { points: newPoints, level: newLevel });

      // 2. Check for achievements
      if (grade === 100) {
        await inMemoryDB.Achievement.award(submission.userId, 'perfect_score');
      }
    }

    res.status(200).json({ success: true, data: { submission } });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/assignments/course/:courseId
// @desc    Get assignments for a course
// @access  Private
router.get('/course/:courseId', authenticate, async (req, res, next) => {
  try {
    const assignments = await inMemoryDB.Assignment.find({ courseId: req.params.courseId });
    
    // Enrich with status relative to current user
    const enriched = await Promise.all(assignments.map(async (a) => {
      const submissions = await inMemoryDB.Submission.find({ assignmentId: a._id, userId: req.user._id });
      const submission = submissions[0] || null;
      
      let status = 'ongoing';
      if (submission) {
        status = submission.status === 'graded' ? 'graded' : 'submitted';
      } else if (new Date(a.dueDate) < new Date()) {
        status = 'expired';
      }

      return { ...a, userStatus: status, userSubmission: submission };
    }));

    res.status(200).json({ success: true, data: { assignments: enriched } });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/assignments/instructor/submissions
// @desc    Get all submissions for instructor's courses
// @access  Private (Instructor)
router.get('/instructor/submissions', authenticate, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const courses = await inMemoryDB.Course.find({ instructorId: req.user._id });
    const courseIds = courses.map(c => c._id);
    
    const allAssignments = await inMemoryDB.Assignment.find();
    const instructorAssignments = allAssignments.filter(a => courseIds.includes(a.courseId));
    
    const allSubmissions = await inMemoryDB.Submission.find();
    const enrichedSubmissions = await Promise.all(allSubmissions
      .filter(s => instructorAssignments.some(a => a._id === s.assignmentId))
      .map(async (s) => {
        const user = await inMemoryDB.User.findById(s.userId);
        const assignment = instructorAssignments.find(a => a._id === s.assignmentId);
        return { ...s, user, assignment };
      })
    );

    res.status(200).json({ success: true, data: { submissions: enrichedSubmissions } });
  } catch (error) {
    next(error);
  }
});

export default router;
