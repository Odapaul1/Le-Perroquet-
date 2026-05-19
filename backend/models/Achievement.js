import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  points: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('Achievement', achievementSchema);
