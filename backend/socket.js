import { Server } from 'socket.io';
import inMemoryDB from './db/inMemoryDB.js';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Export io for use in routes
  server.io = io;

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific course room
    socket.on('join_course', async ({ courseId, userId }) => {
      try {
        // Verify enrollment for learners
        const user = await inMemoryDB.User.findById(userId);
        if (user.role === 'learner') {
          const enrollment = await inMemoryDB.Enrollment.findOne({ userId, courseId });
          if (!enrollment) {
            return socket.emit('error', { message: 'Not enrolled in this course' });
          }
        }
        
        socket.join(`course_${courseId}`);
        console.log(`User ${userId} joined room: course_${courseId}`);
      } catch (error) {
        console.error('Socket join error:', error);
      }
    });

    // Handle course messages
    socket.on('send_course_message', async (data) => {
      const { courseId, userId, message, userName } = data;
      
      const chatMessage = {
        id: Date.now().toString(),
        userId,
        userName,
        message,
        timestamp: new Date()
      };

      // In a real app, we'd persist this. For now, just broadcast.
      io.to(`course_${courseId}`).emit('receive_course_message', chatMessage);
    });

    // Join a private room for DMs
    socket.on('join_private', ({ userId }) => {
      socket.join(`user_${userId}`);
      console.log(`User joined private room: user_${userId}`);
    });

    // Handle private messages (DM)
    socket.on('send_private_message', (data) => {
      const { toUserId, fromUserId, fromUserName, message } = data;
      
      const privateMsg = {
        id: Date.now().toString(),
        fromUserId,
        fromUserName,
        message,
        timestamp: new Date()
      };

      io.to(`user_${toUserId}`).emit('receive_private_message', privateMsg);
      // Also send back to sender for their own UI
      socket.emit('receive_private_message', privateMsg);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
