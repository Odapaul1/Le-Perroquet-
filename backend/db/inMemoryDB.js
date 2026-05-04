// In-memory database for development/testing
// This replaces MongoDB for demonstration purposes

class InMemoryDatabase {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.assignments = new Map();
    this.submissions = new Map();
    this.transactions = new Map();
    this.recordedSessions = new Map();
    this.notifications = new Map();
    this.achievements = new Map(); // Global achievement definitions
    this.userAchievements = new Map(); // User-achievement mappings
    this.nextId = 1;

    // Initialize global achievements
    this.initAchievements();
    
    // Create a default admin user for testing
    this.createUser({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@frenchlms.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true
    });
    
    // Create a default instructor user for testing
    this.createUser({
      firstName: 'Instructor',
      lastName: 'User',
      email: 'instructor@frenchlms.com',
      password: 'Instructor123!',
      role: 'instructor',
      isEmailVerified: true
    });
    
    this.createUser({
      firstName: 'Learner',
      lastName: 'User',
      email: 'learner@frenchlms.com',
      password: 'Learner123!',
      role: 'learner',
      isEmailVerified: true,
      points: 1250,
      level: 5
    });

    // Create a sample course
    this.createCourse({
      title: 'French for Beginners',
      description: 'Master the basics of French language and culture.',
      instructorId: '2',
      level: 'beginner',
      thumbnail: '/images/course-1.jpg',
      price: 49.99,
      modules: [
        {
          id: 'm1',
          title: 'Introduction to French',
          subModules: [
            {
              id: 'sm1',
              title: 'Greetings & Basics',
              topics: [
                { id: 't1', title: 'Saying Hello', type: 'video', contentUrl: '/videos/hero-bg.mp4' },
                { id: 't2', title: 'The Alphabet', type: 'pdf', contentUrl: '/files/alphabet.pdf' }
              ]
            }
          ]
        }
      ]
    });

    // Pre-enroll learner in the sample course
    this.createEnrollment({
      userId: '3',
      courseId: '4',
      progress: 65,
      completedTopics: ['t1'],
      status: 'enrolled'
    });

    // Award initial badges to learner
    this.awardAchievement('3', 'first_lesson');
    this.awardAchievement('3', 'quick_learner');
  }
  
  // Simulate MongoDB methods
  
  initAchievements() {
    const achievements = [
      {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        points: 100
      },
      {
        id: 'quick_learner',
        title: 'Quick Learner',
        description: 'Complete 5 topics in one day',
        icon: '⚡',
        points: 250
      },
      {
        id: 'perfect_score',
        title: 'Perfect 10',
        description: 'Get 100% on an assignment',
        icon: '🌟',
        points: 500
      },
      {
        id: 'course_master',
        title: 'Course Master',
        description: 'Complete an entire course',
        icon: '🎓',
        points: 1000
      },
      {
        id: 'consistent_student',
        title: 'Consistent Student',
        description: 'Login 7 days in a row',
        icon: '🔥',
        points: 300
      }
    ];

    achievements.forEach(a => this.achievements.set(a.id, a));
  }

  async awardAchievement(userId, achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return null;

    const userKey = `${userId}-${achievementId}`;
    if (this.userAchievements.has(userKey)) return null;

    const userAchievement = {
      _id: String(this.nextId++),
      userId,
      achievementId,
      earnedAt: new Date()
    };

    this.userAchievements.set(userKey, userAchievement);
    
    // Update user points
    const user = this.users.get(userId);
    if (user) {
      const newPoints = (user.points || 0) + achievement.points;
      const newLevel = Math.floor(newPoints / 500) + 1;
      this.updateUser(userId, { points: newPoints, level: newLevel });
      
      // Create notification
      this.createNotification({
        userId,
        title: 'New Achievement Unlocked!',
        message: `Congratulations! You've earned the "${achievement.title}" badge and ${achievement.points} points.`,
        type: 'achievement'
      });
    }

    return userAchievement;
  }

  async getUserAchievements(userId) {
    const results = [];
    for (const [key, ua] of this.userAchievements.entries()) {
      if (ua.userId === userId) {
        const achievement = this.achievements.get(ua.achievementId);
        results.push({ ...ua, ...achievement });
      }
    }
    return results;
  }

  async getLeaderboard() {
    return Array.from(this.users.values())
      .filter(u => u.role === 'learner')
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map(u => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        points: u.points || 0,
        level: u.level || 1,
        avatar: u.avatar
      }));
  }
  
  async createUser(userData) {
    const user = {
      _id: String(this.nextId++),
      ...userData,
      points: userData.points || 0,
      level: userData.level || 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(user._id, user);
    return user;
  }
  
  async findUser(query) {
    const users = Array.from(this.users.values());
    
    if (query.email) {
      return users.find(user => user.email === query.email) || null;
    }
    
    if (query._id) {
      return this.users.get(query._id) || null;
    }
    
    return null;
  }
  
  async findUsers(query = {}) {
    const users = Array.from(this.users.values());
    
    if (query.role) {
      return users.filter(user => user.role === query.role);
    }
    
    return users;
  }
  
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id) {
    return this.users.delete(id);
  }
  
  async countUsers(query = {}) {
    const users = await this.findUsers(query);
    return users.length;
  }

  // Course management
  async createCourse(courseData) {
    const course = {
      _id: String(this.nextId++),
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.set(course._id, course);
    return course;
  }

  async findCourse(query) {
    const courses = Array.from(this.courses.values());
    if (query._id) return this.courses.get(query._id) || null;
    return null;
  }

  async findCourses(query = {}) {
    let courses = Array.from(this.courses.values());
    if (query.instructorId) {
      courses = courses.filter(c => c.instructorId === query.instructorId);
    }
    return courses;
  }

  async updateCourse(id, updates) {
    const course = this.courses.get(id);
    if (!course) return null;
    const updated = { ...course, ...updates, updatedAt: new Date() };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id) {
    return this.courses.delete(id);
  }

  // Enrollment management
  async createEnrollment(data) {
    const enrollment = {
      _id: String(this.nextId++),
      ...data,
      completedTopics: [],
      progress: 0,
      status: 'enrolled',
      createdAt: new Date()
    };
    this.enrollments.set(enrollment._id, enrollment);
    return enrollment;
  }

  async findEnrollment(query) {
    const enrollments = Array.from(this.enrollments.values());
    if (query.userId && query.courseId) {
      return enrollments.find(e => e.userId === query.userId && e.courseId === query.courseId) || null;
    }
    return null;
  }

  async findEnrollments(query = {}) {
    let enrollments = Array.from(this.enrollments.values());
    if (query.userId) {
      enrollments = enrollments.filter(e => e.userId === query.userId);
    }
    if (query.courseId) {
      enrollments = enrollments.filter(e => e.courseId === query.courseId);
    }
    return enrollments;
  }

  async updateEnrollment(id, updates) {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) return null;
    const updated = { ...enrollment, ...updates, updatedAt: new Date() };
    this.enrollments.set(id, updated);
    return updated;
  }

  // Assignment management
  async createAssignment(data) {
    const assignment = { _id: String(this.nextId++), ...data, createdAt: new Date() };
    this.assignments.set(assignment._id, assignment);
    return assignment;
  }

  async findAssignments(query = {}) {
    let assignments = Array.from(this.assignments.values());
    if (query.courseId) assignments = assignments.filter(a => a.courseId === query.courseId);
    return assignments;
  }

  // Submission management
  async createSubmission(data) {
    const submission = { _id: String(this.nextId++), ...data, createdAt: new Date() };
    this.submissions.set(submission._id, submission);
    return submission;
  }

  async findSubmissions(query = {}) {
    let submissions = Array.from(this.submissions.values());
    if (query.assignmentId) submissions = submissions.filter(s => s.assignmentId === query.assignmentId);
    if (query.userId) submissions = submissions.filter(s => s.userId === query.userId);
    return submissions;
  }

  async updateSubmission(id, updates) {
    const submission = this.submissions.get(id);
    if (!submission) return null;
    const updated = { ...submission, ...updates, updatedAt: new Date() };
    this.submissions.set(id, updated);
    return updated;
  }

  // Transaction management
  async createTransaction(data) {
    const transaction = { _id: String(this.nextId++), ...data, createdAt: new Date() };
    this.transactions.set(transaction._id, transaction);
    return transaction;
  }

  async findTransaction(query) {
    const transactions = Array.from(this.transactions.values());
    if (query.reference) return transactions.find(t => t.reference === query.reference) || null;
    if (query._id) return this.transactions.get(query._id) || null;
    return null;
  }

  async updateTransaction(id, updates) {
    const transaction = this.transactions.get(id);
    if (!transaction) return null;
    const updated = { ...transaction, ...updates, updatedAt: new Date() };
    this.transactions.set(id, updated);
    return updated;
  }

  // Recorded Sessions management
  async createRecordedSession(data) {
    const session = { _id: String(this.nextId++), ...data, createdAt: new Date() };
    this.recordedSessions.set(session._id, session);
    return session;
  }

  async findRecordedSessions(query = {}) {
    let sessions = Array.from(this.recordedSessions.values());
    if (query.courseId) sessions = sessions.filter(s => s.courseId === query.courseId);
    if (query.instructorId) sessions = sessions.filter(s => s.instructorId === query.instructorId);
    return sessions;
  }

  async findRecordedSession(id) {
    return this.recordedSessions.get(id) || null;
  }

  async deleteRecordedSession(id) {
    return this.recordedSessions.delete(id);
  }

  // Notification management
  async createNotification(data) {
    const notification = { 
      _id: String(this.nextId++), 
      isRead: false,
      createdAt: new Date(),
      ...data 
    };
    this.notifications.set(notification._id, notification);
    return notification;
  }

  async findNotifications(query = {}) {
    let notifications = Array.from(this.notifications.values());
    if (query.userId) notifications = notifications.filter(n => n.userId === query.userId);
    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  }

  async updateNotification(id, updates) {
    const notification = this.notifications.get(id);
    if (!notification) return null;
    const updated = { ...notification, ...updates };
    this.notifications.set(id, updated);
    return updated;
  }
  
  // Session management
  async createSession(sessionData) {
    const session = {
      _id: String(this.nextId++),
      ...sessionData,
      createdAt: new Date()
    };
    
    this.sessions.set(session._id, session);
    return session;
  }
  
  async findSession(query) {
    const sessions = Array.from(this.sessions.values());
    
    if (query._id) {
      return this.sessions.get(query._id) || null;
    }
    
    return null;
  }
  
  async deleteSession(id) {
    return this.sessions.delete(id);
  }
  
  // Utility methods
  clear() {
    this.users.clear();
    this.sessions.clear();
    this.nextId = 1;
  }
  
  getAllUsers() {
    return Array.from(this.users.values());
  }
}

// Create singleton instance
const db = new InMemoryDatabase();

// Export as if it were Mongoose models
export default {
  User: {
    findOne: async (query) => db.findUser(query),
    find: async (query) => db.findUsers(query),
    create: async (data) => db.createUser(data),
    findById: async (id) => db.findUser({ _id: id }),
    findByIdAndUpdate: async (id, updates) => db.updateUser(id, updates),
    findByIdAndDelete: async (id) => {
      const user = db.findUser({ _id: id });
      if (user) {
        db.deleteUser(id);
        return user;
      }
      return null;
    },
    countDocuments: async (query) => db.countUsers(query),
    aggregate: async (pipeline) => {
      // Simple aggregation simulation
      const users = db.getAllUsers();
      
      if (pipeline[0]?.$group) {
        const group = pipeline[0].$group;
        if (group._id === '$role') {
          const roleCounts = {};
          users.forEach(user => {
            roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
          });
          return Object.entries(roleCounts).map(([role, count]) => ({ _id: role, count }));
        }
      }
      
      return [];
    }
  },
  
  Session: {
    create: async (data) => db.createSession(data),
    findOne: async (query) => db.findSession(query),
    deleteOne: async (id) => db.deleteSession(id)
  },
  
  Course: {
    create: async (data) => db.createCourse(data),
    find: async (query) => db.findCourses(query),
    findOne: async (query) => db.findCourse(query),
    findById: async (id) => db.findCourse({ _id: id }),
    findByIdAndUpdate: async (id, updates) => db.updateCourse(id, updates),
    findByIdAndDelete: async (id) => {
      const course = db.findCourse({ _id: id });
      if (course) {
        db.deleteCourse(id);
        return course;
      }
      return null;
    }
  },

  Enrollment: {
     create: async (data) => db.createEnrollment(data),
     find: async (query) => db.findEnrollments(query),
     findOne: async (query) => db.findEnrollment(query),
     findByIdAndUpdate: async (id, updates) => db.updateEnrollment(id, updates)
   },

   Assignment: {
     create: async (data) => db.createAssignment(data),
     find: async (query) => db.findAssignments(query)
   },

   Submission: {
     create: async (data) => db.createSubmission(data),
     find: async (query) => db.findSubmissions(query),
    findByIdAndUpdate: async (id, updates) => db.updateSubmission(id, updates)
  },

  Transaction: {
    create: async (data) => db.createTransaction(data),
    findOne: async (query) => db.findTransaction(query),
    findByIdAndUpdate: async (id, updates) => db.updateTransaction(id, updates)
  },

  RecordedSession: {
    create: async (data) => db.createRecordedSession(data),
    find: async (query) => db.findRecordedSessions(query),
    findById: async (id) => db.findRecordedSession(id),
    findByIdAndDelete: async (id) => {
      const session = await db.findRecordedSession(id);
      if (session) {
        await db.deleteRecordedSession(id);
        return session;
      }
      return null;
    }
  },

  Notification: {
    create: async (data) => db.createNotification(data),
    find: async (query) => db.findNotifications(query),
    findByIdAndUpdate: async (id, updates) => db.updateNotification(id, updates)
  },

  Achievement: {
    find: async () => Array.from(db.achievements.values()),
    findUserAchievements: async (userId) => db.getUserAchievements(userId),
    award: async (userId, achievementId) => db.awardAchievement(userId, achievementId),
    getLeaderboard: async () => db.getLeaderboard()
  },
  
  // Add connection simulation
  connect: async (uri) => {
    console.log('🗄️  Connected to In-Memory Database');
    console.log('💡 Using development database - no persistence');
    console.log('📊 Pre-loaded users: admin@frenchlms.com, instructor@frenchlms.com, learner@frenchlms.com');
    console.log('🔑 All test passwords end with "123!"');
    return { connection: { host: 'memory', name: 'french-lms-dev' } };
  },
  
  disconnect: async () => {
    console.log('📴 Disconnected from In-Memory Database');
  }
};