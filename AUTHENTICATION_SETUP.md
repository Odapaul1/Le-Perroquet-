# French LMS Authentication System

## Overview
This implementation provides role-based authentication with JWT for the French LMS application, supporting three user roles: admin, instructor, and learner.

## Features
- ✅ JWT-based authentication with access and refresh tokens
- ✅ Role-based authorization (admin, instructor, learner)
- ✅ Secure password hashing with bcrypt
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Rate limiting and security middleware
- ✅ Protected routes and authentication context

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file and update with your configuration:
```bash
cp .env.example .env
```

Update the `.env` file with your settings:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A strong secret key for JWT signing
- `EMAIL_USER` & `EMAIL_PASS`: Email credentials for sending verification/reset emails
- `FRONTEND_URL`: Your frontend application URL

### 4. Start the backend server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd app
```

### 2. Install additional dependencies
```bash
npm install axios
```

### 3. Create environment file
Create a `.env` file in the app directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the frontend development server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address

### Users (Admin only)
- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/password` - Update password
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/admin/stats` - Get user statistics

## Frontend Components

### Authentication Context
- `AuthContext.tsx` - Provides authentication state and methods
- `ProtectedRoute.tsx` - Route protection with role-based access

### Pages
- `Login.tsx` - User login page
- `Register.tsx` - User registration page

### Services
- `api.ts` - API service layer with automatic token refresh

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds of 12
   - Password complexity requirements (uppercase, lowercase, numbers)
   - Password reset tokens with 1-hour expiry

2. **JWT Security**
   - Separate access and refresh tokens
   - Access tokens expire in 7 days
   - Refresh tokens expire in 30 days
   - Token validation and user verification

3. **Rate Limiting**
   - 100 requests per 15-minute window per IP
   - Applied to all API endpoints

4. **Input Validation**
   - Express-validator for request validation
   - MongoDB injection prevention
   - XSS protection

5. **Email Security**
   - Email verification required for new accounts
   - Secure password reset flow

## Role-Based Access Control

### Admin
- Full access to all system features
- User management capabilities
- System statistics and analytics

### Instructor
- Create and manage courses
- View enrolled students
- Access teaching materials

### Learner
- Enroll in courses
- Access learning materials
- Track progress

## Usage Examples

### Protecting a Route
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

// Protect route for specific roles
<ProtectedRoute roles={['admin', 'instructor']}>
  <AdminDashboard />
</ProtectedRoute>

// Protect route requiring email verification
<ProtectedRoute requireEmailVerification={true}>
  <CourseContent />
</ProtectedRoute>
```

### Using Authentication Context
```tsx
import { useAuth } from '@/contexts/AuthContext';

const Component = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use authentication methods
};
```

### Making Authenticated API Calls
```tsx
import { authAPI } from '@/services/api';

// API calls automatically include authentication headers
const response = await authAPI.getMe();
```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd app
npm run test
```

## Deployment Considerations

1. **Environment Variables**: Ensure all environment variables are properly set in production
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly for your production frontend URL
4. **Database**: Use a production-ready MongoDB instance
5. **Email Service**: Configure a reliable email service (SendGrid, AWS SES, etc.)
6. **Rate Limiting**: Adjust rate limits based on your traffic patterns

## Troubleshooting

### Common Issues

1. **Email not sending**: Check email credentials and service configuration
2. **JWT errors**: Ensure JWT_SECRET is properly set and consistent
3. **CORS issues**: Verify FRONTEND_URL matches your frontend origin
4. **Database connection**: Check MongoDB URI and network connectivity

### Security Checklist
- [ ] Change default JWT secrets
- [ ] Use strong email credentials
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Use production database
- [ ] Enable security headers
- [ ] Set up proper error handling