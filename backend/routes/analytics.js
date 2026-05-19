import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin/stats', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const [courses, enrollments, transactions, users] = await Promise.all([
      Course.find(),
      Enrollment.find(),
      Transaction.find({ status: 'success' }),
      User.find({ role: 'learner' })
    ]);

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const enrollmentsByCourse = courses.map(c => ({
      title: c.title,
      count: enrollments.filter(e => e.courseId.toString() === c._id.toString()).length
    }));

    const averageProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers: users.length,
          totalCourses: courses.length,
          totalEnrollments: enrollments.length,
          totalRevenue: totalRevenue.toFixed(2)
        },
        enrollmentsByCourse,
        revenueHistory: [ { name: 'Total', amount: totalRevenue } ],
        progressStats: {
          average: Math.round(averageProgress),
          distribution: [
            { name: '0-25%', count: enrollments.filter(e => e.progress <= 25).length },
            { name: '26-50%', count: enrollments.filter(e => e.progress > 25 && e.progress <= 50).length },
            { name: '51-75%', count: enrollments.filter(e => e.progress > 50 && e.progress <= 75).length },
            { name: '76-100%', count: enrollments.filter(e => e.progress > 75).length },
          ]
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
