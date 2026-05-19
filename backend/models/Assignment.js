import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: String,
  fileUrl: String,
  grade: Number,
  feedback: String,
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted'
  },
  gradedAt: Date
}, {
  timestamps: true
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: Date,
  points: {
    type: Number,
    default: 100
  },
  submissions: [submissionSchema]
}, {
  timestamps: true
});

export default mongoose.model('Assignment', assignmentSchema);
