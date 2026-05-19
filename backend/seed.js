import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Achievement from './models/Achievement.js';
import User from './models/User.js';

dotenv.config();

const courses = [
  {
    title: 'French Café Conversations',
    description: 'Master everyday interactions at French cafes, from ordering coffee to making small talk with locals.',
    level: 'beginner',
    category: 'Conversation',
    price: 49.99,
    thumbnail: '/images/course-1.jpg',
    duration: '45 mins',
    modules: [
      {
        title: 'Introduction to Cafés',
        subModules: [
          {
            title: 'Common Phrases',
            topics: [
              { title: 'Ordering Coffee', type: 'video', duration: '8 mins' },
              { title: 'Asking for the Menu', type: 'video', duration: '6 mins' }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'Wine & Culture of Bordeaux',
    description: 'Explore the rich wine culture of Bordeaux while learning sophisticated French vocabulary and expressions.',
    level: 'intermediate',
    category: 'Culture',
    price: 59.99,
    thumbnail: '/images/course-2.jpg',
    duration: '60 mins',
    modules: []
  },
  {
    title: 'Advanced Grammar Mastery',
    description: 'Conquer subjunctive, conditional, and complex tenses with clear explanations and exercises.',
    level: 'advanced',
    category: 'Grammar',
    price: 79.99,
    thumbnail: '/images/pillar-3.jpg',
    duration: '70 mins',
    modules: []
  }
];

const achievements = [
  { id: 'first_steps', title: 'First Steps', description: 'Complete your first lesson', icon: 'Footprints', points: 100 },
  { id: 'streak_starter', title: 'Streak Starter', description: 'Maintain a 3-day streak', icon: 'Flame', points: 200 },
  { id: 'vocab_builder', title: 'Vocabulary Builder', description: 'Learn 50 words', icon: 'BookOpen', points: 300 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Course.deleteMany({});
    await Achievement.deleteMany({});
    
    // Find or create a default instructor
    let instructor = await User.findOne({ email: 'instructor@example.com' });
    
    if (!instructor) {
      console.log('Creating default instructor...');
      instructor = new User({
        firstName: 'Default',
        lastName: 'Instructor',
        email: 'instructor@example.com',
        password: 'Password123',
        role: 'instructor',
        isEmailVerified: true
      });
      await instructor.save();
    } else {
      console.log('Default instructor already exists, updating password...');
      instructor.password = 'Password123';
      await instructor.save();
    }

    // Add instructorId to courses
    const coursesWithInstructor = courses.map(c => ({ ...c, instructorId: instructor._id }));

    await Course.insertMany(coursesWithInstructor);
    console.log('Courses seeded');

    await Achievement.insertMany(achievements);
    console.log('Achievements seeded');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
