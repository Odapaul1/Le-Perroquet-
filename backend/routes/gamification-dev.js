import express from 'express';
import db from '../db/inMemoryDB.js';
import { authenticate } from '../middleware/auth-dev.js';

const router = express.Router();

// Get leaderboard
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const leaderboard = await db.Achievement.getLeaderboard();
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user gamification status
router.get('/status', authenticate, async (req, res) => {
  try {
    const user = await db.User.findById(req.user._id);
    const achievements = await db.Achievement.findUserAchievements(req.user._id);
    
    res.json({
      success: true,
      data: {
        points: user.points || 0,
        level: user.level || 1,
        nextLevelXP: (user.level || 1) * 500,
        achievements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all possible achievements
router.get('/achievements', authenticate, async (req, res) => {
  try {
    const achievements = await db.Achievement.find();
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
