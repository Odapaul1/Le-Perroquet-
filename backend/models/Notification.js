import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['assignment', 'grade', 'announcement', 'achievement', 'system'],
    default: 'announcement'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
