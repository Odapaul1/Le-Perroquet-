import { Routes, Route } from 'react-router';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Vocabulary from './pages/Vocabulary';
import Lesson from './pages/Lesson';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminStats from './pages/admin/AdminStats';
import AdminUsers from './pages/admin/AdminUsers';
import SessionManager from './pages/instructor/SessionManager';
import AssignmentManager from './pages/instructor/AssignmentManager';
import GradingCenter from './pages/instructor/GradingCenter';
import PaymentMock from './pages/PaymentMock';
import Checkout from './pages/Checkout';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/library" 
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vocabulary" 
            element={
              <ProtectedRoute>
                <Vocabulary />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lesson/:courseId" 
            element={
              <ProtectedRoute>
                <Lesson />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/dashboard" 
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/sessions" 
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <SessionManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/assignments" 
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <AssignmentManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/grading" 
            element={
              <ProtectedRoute roles={['instructor', 'admin']}>
                <GradingCenter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment-mock" 
            element={
              <ProtectedRoute>
                <PaymentMock />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout/:courseId" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/stats" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminStats />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </LanguageProvider>
    </AuthProvider>
  );
}