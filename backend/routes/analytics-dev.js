import express from 'express';
import inMemoryDB from '../db/inMemoryDB.js';
import { authenticate, authorize } from '../middleware/auth-dev.js';

const router = express.Router();

// @route   GET /api/analytics/admin/stats
// @desc    Get aggregated admin stats
// @access  Private (Admin)
router.get('/admin/stats', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const courses = await inMemoryDB.Course.find();
    const enrollments = await inMemoryDB.Enrollment.find();
    const transactions = Array.from(inMemoryDB.transactions.values()); // Directly from map for speed
    const users = await inMemoryDB.User.find();

    // 1. Enrollment Stats
    const totalEnrollments = enrollments.length;
    const enrollmentsByCourse = courses.map(c => ({
      title: c.title,
      count: enrollments.filter(e => e.courseId === c._id).length
    }));

    // 2. Revenue Stats
    const totalRevenue = transactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const revenueByMonth = [
      { name: 'Jan', amount: 450 },
      { name: 'Feb', amount: 890 },
      { name: 'Mar', amount: 1200 },
      { name: 'Apr', amount: totalRevenue } // Just mock the history
    ];

    // 3. Learner Progress Trends
    const averageProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
      : 0;

    const progressDistribution = [
      { name: '0-25%', count: enrollments.filter(e => e.progress <= 25).length },
      { name: '26-50%', count: enrollments.filter(e => e.progress > 25 && e.progress <= 50).length },
      { name: '51-75%', count: enrollments.filter(e => e.progress > 50 && e.progress <= 75).length },
      { name: '76-100%', count: enrollments.filter(e => e.progress > 75).length },
    ];

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers: users.length,
          totalCourses: courses.length,
          totalEnrollments,
          totalRevenue: totalRevenue.toFixed(2)
        },
        enrollmentsByCourse,
        revenueHistory: revenueByMonth,
        progressStats: {
          average: Math.round(averageProgress),
          distribution: progressDistribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
