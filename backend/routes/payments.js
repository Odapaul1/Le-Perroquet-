import express from 'express';
import axios from 'axios';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYMENT_ENABLED = process.env.PAYMENT_ENABLED === 'true';

router.post('/initialize', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existingEnrollment) {
      return res.status(200).json({ success: true, data: { skipPayment: true } });
    }

    if (!PAYMENT_ENABLED) return res.status(200).json({ success: true, data: { skipPayment: true } });

    const course = await Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const reference = `LMS_${Date.now()}_${req.user._id}`;
    await Transaction.create({ userId: req.user._id, courseId, amount: course.price, reference, provider: 'paystack' });

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(200).json({
        success: true,
        data: { authorization_url: `${process.env.FRONTEND_URL}/payment-mock?reference=${reference}`, reference, mock: true }
      });
    }

    const response = await axios.post('https://api.paystack.co/transaction/initialize', 
      { email: req.user.email, amount: Math.round(course.price * 100), reference },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    next(error);
  }
});

router.get('/verify/:reference', authenticate, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ reference: req.params.reference });
    if (!transaction) return next(new AppError('Transaction not found', 404));
    if (transaction.status === 'success') return res.status(200).json({ success: true });

    let isSuccessful = !PAYSTACK_SECRET_KEY;
    if (PAYSTACK_SECRET_KEY) {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${req.params.reference}`, 
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
      );
      isSuccessful = response.data.data.status === 'success';
    }

    if (isSuccessful) {
      transaction.status = 'success';
      await transaction.save();
      
      // Use findOneAndUpdate with upsert to prevent duplicate enrollment errors
      await Enrollment.findOneAndUpdate(
        { userId: transaction.userId, courseId: transaction.courseId },
        { userId: transaction.userId, courseId: transaction.courseId },
        { upsert: true }
      );

      res.status(200).json({ success: true, data: { courseId: transaction.courseId } });
    } else {
      res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
