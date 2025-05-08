import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/StudentDashboard';
import StudentProfile from './components/student/StudentProfile';
import EducatorDashboard from './components/educator/EducatorDashboard';
import EducatorProfile from './components/educator/EducatorProfile';
import AdminProfile from './components/admin/AdminProfile';
import AdminDashboard from './components/admin/AdminDashboard';

// Protected Route component
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to role-specific dashboard
    switch (user.role) {
      case 'student':
        return <Navigate to="/student/dashboard" />;
      case 'educator':
        return <Navigate to="/educator/dashboard" />;
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/student"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Educator Routes */}
            <Route
              path="/educator/dashboard"
              element={
                <ProtectedRoute roles={['educator']}>
                  <EducatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/educator"
              element={
                <ProtectedRoute roles={['educator']}>
                  <EducatorProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 