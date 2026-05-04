import express from 'express';
import axios from 'axios';
import inMemoryDB from '../db/inMemoryDB.js';
import { authenticate } from '../middleware/auth-dev.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYMENT_ENABLED = process.env.PAYMENT_ENABLED === 'true';

// @route   POST /api/payments/initialize
// @desc    Initialize Paystack payment
// @access  Private
router.post('/initialize', authenticate, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    if (!PAYMENT_ENABLED) {
      // If payment is disabled, return a mock success to allow direct enrollment
      return res.status(200).json({
        success: true,
        data: { skipPayment: true }
      });
    }

    const course = await inMemoryDB.Course.findById(courseId);
    if (!course) return next(new AppError('Course not found', 404));

    const amount = Math.round(course.price * 100); // Paystack expects kobo/cents
    const reference = `LMS_${Date.now()}_${userId}`;

    // Create pending transaction record
    await inMemoryDB.Transaction.create({
      userId,
      courseId,
      amount: course.price,
      reference,
      status: 'pending',
      provider: 'paystack'
    });

    if (!PAYSTACK_SECRET_KEY) {
      // Development mode without real Paystack key
      return res.status(200).json({
        success: true,
        data: {
          authorization_url: `${process.env.FRONTEND_URL}/payment-mock?reference=${reference}`,
          reference,
          mock: true
        }
      });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/payments/verify/:reference
// @desc    Verify Paystack payment
// @access  Private
router.get('/verify/:reference', authenticate, async (req, res, next) => {
  try {
    const { reference } = req.params;
    const transaction = await inMemoryDB.Transaction.findOne({ reference });

    if (!transaction) return next(new AppError('Transaction not found', 404));
    if (transaction.status === 'success') {
      return res.status(200).json({ success: true, message: 'Already verified' });
    }

    let isSuccessful = false;

    if (!PAYSTACK_SECRET_KEY || reference.startsWith('LMS_MOCK_')) {
      // Simple mock verification for dev
      isSuccessful = true;
    } else {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
          }
        }
      );
      isSuccessful = response.data.data.status === 'success';
    }

    if (isSuccessful) {
      // Update transaction status
      await inMemoryDB.Transaction.findByIdAndUpdate(transaction._id, {
        status: 'success',
        verifiedAt: new Date()
      });

      // TRIGGER ENROLLMENT
      // Check if already enrolled to avoid duplicates
      const existingEnrollment = await inMemoryDB.Enrollment.findOne({ 
        userId: transaction.userId, 
        courseId: transaction.courseId 
      });

      if (!existingEnrollment) {
        await inMemoryDB.Enrollment.create({
          userId: transaction.userId,
          courseId: transaction.courseId
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and enrollment completed'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
