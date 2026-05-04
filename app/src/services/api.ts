import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      const { accessToken } = JSON.parse(tokens);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('authTokens');
        if (tokens) {
          const { refreshToken } = JSON.parse(tokens);
          const response = await authAPI.refreshToken(refreshToken);
          
          localStorage.setItem('authTokens', JSON.stringify(response.data.data));
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('authTokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  // Authentication endpoints
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  getMe: async (token: string) => {
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.user;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, password: newPassword });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};

export const courseAPI = {
  getAll: async () => {
    const response = await api.get('/courses');
    return response.data.data.courses;
  },

  getById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data.data.course;
  },

  create: async (courseData: any) => {
    const response = await api.post('/courses', courseData);
    return response.data.data.course;
  },

  update: async (id: string, courseData: any) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data.data.course;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  }
};

export const enrollmentAPI = {
  enroll: async (courseId: string) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data.data.enrollment;
  },

  getMyEnrollments: async () => {
    const response = await api.get('/enrollments/me');
    return response.data.data.enrollments;
  },

  updateProgress: async (enrollmentId: string, topicId: string) => {
    const response = await api.patch(`/enrollments/${enrollmentId}/progress`, { topicId });
    return response.data.data.enrollment;
  }
};

export const assignmentAPI = {
  create: async (data: any) => {
    const response = await api.post('/assignments', data);
    return response.data.data.assignment;
  },

  submit: async (assignmentId: string, data: any) => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, data);
    return response.data.data.submission;
  },

  grade: async (submissionId: string, data: any) => {
    const response = await api.patch(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data.data.submission;
  },

  getByCourse: async (courseId: string) => {
    const response = await api.get(`/assignments/course/${courseId}`);
    return response.data.data.assignments;
  },

  getInstructorSubmissions: async () => {
    const response = await api.get('/assignments/instructor/submissions');
    return response.data.data.submissions;
  }
};
 
export const paymentAPI = {
  initialize: async (courseId: string) => {
    const response = await api.post('/payments/initialize', { courseId });
    return response.data.data;
  },

  verify: async (reference: string) => {
    const response = await api.get(`/payments/verify/${reference}`);
    return response.data;
  }
};
 
export const sessionAPI = {
  upload: async (sessionData: any) => {
    const response = await api.post('/sessions', sessionData);
    return response.data.data.session;
  },

  getByCourse: async (courseId: string) => {
    const response = await api.get(`/sessions/course/${courseId}`);
    return response.data.data.sessions;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  }
};

export const analyticsAPI = {
  getAdminStats: async () => {
    const response = await api.get('/analytics/admin/stats');
    return response.data.data;
  }
};

export const notificationAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data.data.notifications;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data.notification;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};

export const userAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  getUser: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data.data.user;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, userData: any) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data.data.user;
  },

  updatePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const response = await api.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  },
};

export const gamificationAPI = {
  getLeaderboard: async () => {
    const response = await api.get('/gamification/leaderboard');
    return response.data.data;
  },

  getStatus: async () => {
    const response = await api.get('/gamification/status');
    return response.data.data;
  },

  getAchievements: async () => {
    const response = await api.get('/gamification/achievements');
    return response.data.data;
  }
};

export default api;
