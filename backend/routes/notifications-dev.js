import express from 'express';
import inMemoryDB from '../db/inMemoryDB.js';
import { authenticate } from '../middleware/auth-dev.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await inMemoryDB.Notification.find({ userId: req.user._id });
    res.status(200).json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await inMemoryDB.Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    const notifications = await inMemoryDB.Notification.find({ userId: req.user._id });
    await Promise.all(notifications.map(n => 
      inMemoryDB.Notification.findByIdAndUpdate(n._id, { isRead: true })
    ));
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
