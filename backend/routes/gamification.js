import express from 'express';
import User from '../models/User.js';
import Achievement from '../models/Achievement.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const leaderboard = await User.find({ role: 'learner' })
      .sort({ points: -1 })
      .limit(10)
      .select('firstName lastName points level avatar');
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        points: user.points || 0,
        level: user.level || 1,
        nextLevelXP: (user.level || 1) * 500,
        achievements: user.achievements || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/achievements', authenticate, async (req, res) => {
  try {
    const achievements = await Achievement.find();
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
