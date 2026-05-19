import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: {
    type: String,
    enum: ['video', 'pdf', 'text', 'quiz'],
    required: true
  },
  contentUrl: String,
  description: String,
  duration: String
});

const subModuleSchema = new mongoose.Schema({
  id: String,
  title: String,
  topics: [topicSchema]
});

const moduleSchema = new mongoose.Schema({
  id: String,
  title: String,
  subModules: [subModuleSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: String,
  price: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  category: String,
  duration: String,
  modules: [moduleSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);
